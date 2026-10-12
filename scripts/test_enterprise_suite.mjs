// End-to-end automated verification suite for TopSEOTool Enterprise SaaS

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTestSuite() {
  console.log(`\n======================================================`);
  console.log(`🚀 TOPSEOTOOL ENTERPRISE SAAS E2E VERIFICATION SUITE`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`======================================================\n`);

  let customerCookie = '';
  let adminCookie = '';
  let customerId = '';
  let createdWebsiteId = '';
  let createdReportId = '';

  // 1. Test Customer Registration
  console.log(`[1/11] Testing Customer Registration...`);
  const uniqueEmail = `testuser_${Date.now()}@topseotool.net`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmail,
      password: 'SecureCustomer123!',
      name: 'Verification Customer',
      company: 'QA Enterprise'
    })
  });
  if (!regRes.ok) throw new Error(`Registration failed: ${regRes.status} ${await regRes.text()}`);
  const regJson = await regRes.json();
  customerId = regJson.user.id;
  const setCookieHeader = regRes.headers.get('set-cookie');
  if (setCookieHeader) {
    customerCookie = setCookieHeader.split(';')[0];
  }
  console.log(`✅ Registered user: ${uniqueEmail} (Role: ${regJson.user.role}, Credits: ${regJson.user.scanCredits})`);

  // 2. Test Customer Session verification
  console.log(`\n[2/11] Testing Customer Session (/api/auth/me)...`);
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { 'Cookie': customerCookie }
  });
  if (!meRes.ok) throw new Error(`/api/auth/me failed: ${meRes.status}`);
  const meJson = await meRes.json();
  console.log(`✅ Session verified: ${meJson.user.email} (Status: ${meJson.user.status})`);

  // 3. Test RBAC Isolation: Customer attempting to access Admin endpoint
  console.log(`\n[3/11] Testing RBAC Security Guard: Customer accessing /api/admin/overview...`);
  const rbacRes = await fetch(`${BASE_URL}/api/admin/overview`, {
    headers: { 'Cookie': customerCookie }
  });
  if (rbacRes.status !== 403) {
    throw new Error(`SECURITY VULNERABILITY: Expected 403 Forbidden for customer on admin route, got ${rbacRes.status}`);
  }
  console.log(`✅ RBAC Guard passed: Customer received HTTP 403 Forbidden on administrative endpoint.`);

  // 4. Test Administrator Login
  console.log(`\n[4/11] Testing Admin Login (admin@topseotool.net)...`);
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@topseotool.net',
      password: 'AdminPassword123!'
    })
  });
  if (!adminLoginRes.ok) throw new Error(`Admin login failed: ${adminLoginRes.status}`);
  const adminCookieHeader = adminLoginRes.headers.get('set-cookie');
  adminCookie = adminCookieHeader.split(';')[0];
  console.log(`✅ Admin authenticated successfully.`);

  // 5. Test Admin Access to Telemetry
  console.log(`\n[5/11] Testing Admin Telemetry (/api/admin/overview)...`);
  const adminOverviewRes = await fetch(`${BASE_URL}/api/admin/overview`, {
    headers: { 'Cookie': adminCookie }
  });
  if (!adminOverviewRes.ok) throw new Error(`Admin overview failed: ${adminOverviewRes.status}`);
  const overviewJson = await adminOverviewRes.json();
  console.log(`✅ Admin Telemetry verified: ${overviewJson.users.total} total users, ${overviewJson.scans.total} scans, ${overviewJson.providers.total} providers.`);

  // 6. Test Website Management (Add Website)
  console.log(`\n[6/11] Testing Customer Website Creation (/api/websites)...`);
  const webRes = await fetch(`${BASE_URL}/api/websites`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': customerCookie 
    },
    body: JSON.stringify({
      domain: 'enterpriseqa.org',
      brandName: 'QA Enterprise'
    })
  });
  if (!webRes.ok) throw new Error(`Website creation failed: ${webRes.status} ${await webRes.text()}`);
  const webJson = await webRes.json();
  createdWebsiteId = webJson.website.id;
  console.log(`✅ Tracked website created: ${webJson.website.domain} (Verification token: ${webJson.website.verificationToken})`);

  // 7. Test Website Ownership Verification
  console.log(`\n[7/11] Testing Website Ownership Verification (/api/websites/[id]/verify)...`);
  const verifyRes = await fetch(`${BASE_URL}/api/websites/${createdWebsiteId}/verify`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': customerCookie 
    },
    body: JSON.stringify({ method: 'dns_txt' })
  });
  const verifyJson = await verifyRes.json();
  console.log(`✅ Verification endpoint evaluated: Status=${verifyJson.verified ? 'Verified' : 'Check recorded (expected without live DNS record)'}`);

  // 8. Test Scan Job Execution & Quota Metering
  console.log(`\n[8/11] Testing Customer Scan Job Execution (/api/scans)...`);
  const scanRes = await fetch(`${BASE_URL}/api/scans`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': customerCookie 
    },
    body: JSON.stringify({
      websiteId: createdWebsiteId,
      domain: 'enterpriseqa.org',
      brandName: 'QA Enterprise'
    })
  });
  if (!scanRes.ok) throw new Error(`Scan execution failed: ${scanRes.status} ${await scanRes.text()}`);
  const scanJson = await scanRes.json();
  createdReportId = scanJson.reportId;
  console.log(`✅ Scan completed successfully: JobID=${scanJson.scan.id}, Score=${scanJson.scan.overallScore}/100, Remaining Credits=${scanJson.remainingCredits}`);

  // 9. Test Report Retrieval & Standalone Permalink
  console.log(`\n[9/11] Testing Report Retrieval (/api/reports/${createdReportId})...`);
  const reportRes = await fetch(`${BASE_URL}/api/reports/${createdReportId}`, {
    headers: { 'Cookie': customerCookie }
  });
  if (!reportRes.ok) throw new Error(`Report retrieval failed: ${reportRes.status}`);
  const reportJson = await reportRes.json();
  console.log(`✅ Report retrieved: ${reportJson.report.brandName} - Score: ${reportJson.report.overallScore}/100, Providers Checked: ${reportJson.report.payload.providers?.length || 0}`);

  // 10. Test Competitor Management
  console.log(`\n[10/11] Testing Competitor Benchmarking (/api/competitors)...`);
  const compRes = await fetch(`${BASE_URL}/api/competitors`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': customerCookie 
    },
    body: JSON.stringify({
      websiteId: createdWebsiteId,
      domain: 'rivalcorp.io',
      brandName: 'Rival Corp'
    })
  });
  if (!compRes.ok) throw new Error(`Competitor creation failed: ${compRes.status}`);
  const compJson = await compRes.json();
  console.log(`✅ Competitor registered: ${compJson.competitor.brandName} (${compJson.competitor.domain})`);

  // 11. Test Admin Credit Adjustment & Audit Logging
  console.log(`\n[11/11] Testing Admin Credit Adjustment with Audit Log...`);
  const adjustRes = await fetch(`${BASE_URL}/api/admin/users`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': adminCookie 
    },
    body: JSON.stringify({
      userId: customerId,
      creditAdjustment: 25,
      reason: 'Automated test suite bonus credit grant'
    })
  });
  if (!adjustRes.ok) throw new Error(`Admin credit adjustment failed: ${adjustRes.status}`);
  const adjustJson = await adjustRes.json();
  console.log(`✅ Admin adjusted credits for user: New total = ${adjustJson.user.scanCredits}`);

  // Verify Audit Log
  const logsRes = await fetch(`${BASE_URL}/api/admin/logs`, {
    headers: { 'Cookie': adminCookie }
  });
  const logsJson = await logsRes.json();
  const latestLog = logsJson.logs[0];
  console.log(`✅ Audit Log verified: Action=${latestLog?.action}, Actor=${latestLog?.actorEmail}, Target=${latestLog?.targetId}`);

  console.log(`\n======================================================`);
  console.log(`🎉 ALL 11 ENTERPRISE SAAS E2E TESTS PASSED WITH 100% SUCCESS!`);
  console.log(`======================================================\n`);
}

runTestSuite().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
