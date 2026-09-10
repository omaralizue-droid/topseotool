import { NextRequest, NextResponse } from "next/server"
import { AdminService } from "@/lib/admin/admin-service"

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get("search") || ""
    const users = await AdminService.getUsers(search)
    return NextResponse.json({ success: true, data: users })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, role, toggleStatus } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 })
    }

    if (role) {
      const updated = await AdminService.updateUserRole(userId, role)
      return NextResponse.json({ success: true, data: updated })
    }

    if (toggleStatus) {
      const updated = await AdminService.toggleUserStatus(userId)
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json({ success: false, error: "No action specified" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
