// Regression test suite for /api/reports and /api/reports/[id]

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runRegressionTests() {
  console.log('======================================================');
  console.log('🧪 /api/reports & Data Isolation Regression Test Suite');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
      failed++;
    }
  }

  // 1. Create two test accounts (Customer A and Customer B)
  const userAEmail = `customer_a_${Date.now()}@test.net`;
  const userBEmail = `customer_b_${Date.now()}@test.net`;

  const regARes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userAEmail, password: 'PasswordA123!', name: 'Customer A' })
  });
  const cookieA = regARes.headers.get('set-cookie')?.split(';')[0];

  const regBRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userBEmail, password: 'PasswordB123!', name: 'Customer B' })
  });
  const cookieB = regBRes.headers.get('set-cookie')?.split(';')[0];

  console.log('--- Test Group 1: Unauthenticated Access ---');
  // 1.1 Unauthenticated POST /api/reports
  const unauthPost = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain: 'example.com', payload: {} })
  });
  assert(unauthPost.status === 401, 'Unauthenticated POST /api/reports returns 401');

  // 1.2 Unauthenticated GET /api/reports
  const unauthGet = await fetch(`${BASE_URL}/api/reports`);
  assert(unauthGet.status === 401, 'Unauthenticated GET /api/reports returns 401');

  console.log('\n--- Test Group 2: Missing Required Fields ---');
  // 2.1 Missing domain
  const noDomainRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ brandName: 'NoDomain', payload: { test: true } })
  });
  const noDomainJson = await noDomainRes.json();
  assert(noDomainRes.status === 400 && noDomainJson.error.includes('domain'), 'Missing domain returns 400 with domain error');

  // 2.2 Missing payload and data
  const noDataRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ domain: 'example.com', brandName: 'Example' })
  });
  const noDataJson = await noDataRes.json();
  assert(noDataRes.status === 400 && noDataJson.error.includes('data'), 'Missing data and payload returns 400 with data error');

  console.log('\n--- Test Group 3: Incorrect Field Types / Malformed Payloads ---');
  // 3.1 Non-object body (array)
  const arrayBodyRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify(['not', 'an', 'object'])
  });
  assert(arrayBodyRes.status === 400, 'Array body payload returns 400');

  // 3.2 Non-string domain
  const numDomainRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ domain: 12345, payload: { test: true } })
  });
  assert(numDomainRes.status === 400, 'Non-string domain returns 400');

  // 3.3 Non-object payload (string)
  const stringPayloadRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ domain: 'example.com', payload: 'string-payload' })
  });
  assert(stringPayloadRes.status === 400, 'Primitive payload returns 400');

  console.log('\n--- Test Group 4: Valid Report Request with "payload" (Frontend Contract) ---');
  // 4.1 Valid payload format from app/page.tsx
  const validPayloadRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({
      domain: 'stripe.com',
      brandName: 'Stripe',
      overallScore: 84,
      readinessScore: 92,
      mentionRate: 80,
      citationsCount: 14,
      payload: {
        readiness: { statusCode: 200, robotsTxtAllowed: true, hasJsonLd: true },
        providers: [{ provider: 'ChatGPT', mentioned: true }],
        notes: 'Public scan audit record'
      }
    })
  });
  const validPayloadJson = await validPayloadRes.json();
  assert(
    validPayloadRes.status === 200 && validPayloadJson.ok && validPayloadJson.report?.id,
    'Valid report with "payload" property accepted with 200 OK'
  );
  const createdReportAId = validPayloadJson.report?.id;

  console.log('\n--- Test Group 5: Valid Report Request with legacy "data" Property ---');
  // 5.1 Valid data format
  const validDataRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({
      domain: 'linear.app',
      brandName: 'Linear',
      overallScore: 90,
      readinessScore: 95,
      data: {
        checks: [1, 2, 3],
        probes: [{ mentioned: true }]
      }
    })
  });
  const validDataJson = await validDataRes.json();
  assert(
    validDataRes.status === 200 && validDataJson.ok && validDataJson.report?.id,
    'Valid report with "data" property accepted with 200 OK'
  );

  console.log('\n--- Test Group 6: Listing Reports & Normalization ---');
  // 6.1 Customer A lists their reports
  const listARes = await fetch(`${BASE_URL}/api/reports`, {
    headers: { 'Cookie': cookieA }
  });
  const listAJson = await listARes.json();
  assert(
    listARes.status === 200 &&
    listAJson.reports?.length >= 2 &&
    typeof listAJson.reports[0].overallScore === 'number' &&
    typeof listAJson.reports[0].readinessScore === 'number',
    'Customer A report list returns normalized top-level scores'
  );

  // 6.2 Customer B list should NOT contain Customer A reports (Data Isolation)
  const listBRes = await fetch(`${BASE_URL}/api/reports`, {
    headers: { 'Cookie': cookieB }
  });
  const listBJson = await listBRes.json();
  assert(
    listBRes.status === 200 && listBJson.reports.length === 0,
    "Customer B report list is empty (Customer A's reports are isolated)"
  );

  console.log('\n--- Test Group 7: Customer Access to Another Customer\'s Private Report ---');
  // 7.1 Customer A marks report as private
  const patchPrivateRes = await fetch(`${BASE_URL}/api/reports/${createdReportAId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieA },
    body: JSON.stringify({ isPublic: false })
  });
  assert(patchPrivateRes.status === 200, 'Customer A can update their report privacy to false');

  // 7.2 Customer B attempts to read Customer A\'s private report
  const bReadPrivateRes = await fetch(`${BASE_URL}/api/reports/${createdReportAId}`, {
    headers: { 'Cookie': cookieB }
  });
  assert(
    bReadPrivateRes.status === 403,
    'Customer B received 403 Forbidden when attempting to read Customer A\'s private report'
  );

  // 7.3 Customer B attempts to modify Customer A\'s report
  const bPatchRes = await fetch(`${BASE_URL}/api/reports/${createdReportAId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': cookieB },
    body: JSON.stringify({ isPublic: true })
  });
  assert(
    bPatchRes.status === 403,
    'Customer B received 403 Forbidden when attempting to modify Customer A\'s report'
  );

  // 7.4 Customer B attempts to delete Customer A\'s report
  const bDeleteRes = await fetch(`${BASE_URL}/api/reports/${createdReportAId}`, {
    method: 'DELETE',
    headers: { 'Cookie': cookieB }
  });
  assert(
    bDeleteRes.status === 403,
    'Customer B received 403 Forbidden when attempting to delete Customer A\'s report'
  );

  // 7.5 Customer A deletes their own report
  const aDeleteRes = await fetch(`${BASE_URL}/api/reports/${createdReportAId}`, {
    method: 'DELETE',
    headers: { 'Cookie': cookieA }
  });
  assert(aDeleteRes.status === 200, 'Customer A can delete their own report');

  console.log('\n======================================================');
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
