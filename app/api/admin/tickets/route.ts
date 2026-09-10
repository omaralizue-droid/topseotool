import { NextRequest, NextResponse } from "next/server"
import { AdminService } from "@/lib/admin/admin-service"

export async function GET() {
  try {
    const tickets = await AdminService.getSupportTickets()
    return NextResponse.json({ success: true, data: tickets })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { ticketId, status } = body

    if (!ticketId || !status) {
      return NextResponse.json({ success: false, error: "ticketId and status are required" }, { status: 400 })
    }

    const updated = await AdminService.updateTicketStatus(ticketId, status)
    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
