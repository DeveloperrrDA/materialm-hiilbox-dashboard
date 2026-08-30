import { NextRequest, NextResponse } from "next/server";
import { wcAuthHeader, wcUrl } from "../../_server";
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const key = request.nextUrl.searchParams.get("key");
    if (!key) return NextResponse.json({ message: "Order key is required." }, { status: 401 });
    const response = await fetch(wcUrl(`/orders/${encodeURIComponent(id)}`), { headers: { Accept: "application/json", Authorization: wcAuthHeader() }, cache: "no-store" });
    const order = await response.json().catch(() => null);
    if (!response.ok) return NextResponse.json({ message: order?.message ?? "Order not found." }, { status: response.status });
    if (!order?.order_key || order.order_key !== key) return NextResponse.json({ message: "Invalid order key." }, { status: 403 });
    return NextResponse.json({
      order_id: order.id, transaction_id: order.transaction_id || null, payment_method: order.payment_method,
      status: order.status, payment_status: ["processing", "completed"].includes(order.status) ? "paid" : order.status === "failed" ? "failed" : order.status === "refunded" ? "refunded" : "pending",
      total: order.total, currency: order.currency,
    });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to load order." }, { status: 500 });
  }
}
