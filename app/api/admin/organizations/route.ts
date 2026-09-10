import { NextRequest, NextResponse } from "next/server"
import { AdminService } from "@/lib/admin/admin-service"

export async function GET() {
  try {
    const orgs = await AdminService.getOrganizations()
    return NextResponse.json({ success: true, data: orgs })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { orgId, plan } = body
    if (!orgId || !plan) {
      return NextResponse.json({ success: false, error: "orgId and plan are required" }, { status: 400 })
    }
    const updated = await AdminService.updateOrgPlan(orgId, plan)
    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
