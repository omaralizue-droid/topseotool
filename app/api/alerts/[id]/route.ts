import { NextRequest, NextResponse } from "next/server"
import { AlertStore } from "@/lib/alerts/alert-store"

/**
 * PATCH /api/alerts/[id]
 * Updates alert rule properties (e.g. active toggle) or triggered alert status (ACKNOWLEDGED / RESOLVED)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // 1. Check if updating triggered alert status
    if (body.status && (body.status === "ACKNOWLEDGED" || body.status === "RESOLVED" || body.status === "TRIGGERED")) {
      const updatedAlert = AlertStore.updateAlertStatus(id, body.status)
      if (updatedAlert) {
        return NextResponse.json({ success: true, alert: updatedAlert })
      }
    }

    // 2. Check if updating an alert rule
    const updatedRule = AlertStore.updateRule(id, body)
    if (updatedRule) {
      return NextResponse.json({ success: true, rule: updatedRule })
    }

    return NextResponse.json({ error: "Item not found with provided ID" }, { status: 404 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

/**
 * DELETE /api/alerts/[id]
 * Removes an alert rule
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = AlertStore.deleteRule(id)
    if (!deleted) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Rule deleted successfully" })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
