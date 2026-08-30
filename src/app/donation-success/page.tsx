"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type OrderState = {
  order_id: number;
  transaction_id: string | null;
  payment_method: string;
  status: string;
  payment_status: string;
  total?: string;
  currency?: string;
};

function DonationSuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const orderKey = params.get("key");
  const [order, setOrder] = useState<OrderState | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId || !orderKey) return;
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/checkout/orders/${encodeURIComponent(orderId!)}?key=${encodeURIComponent(orderKey!)}`, { cache: "no-store" });
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.message ?? "Unable to load your order.");
        if (!cancelled) setOrder(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unable to load your order.");
      }
    }
    load();
    return () => { cancelled = true; };
  }, [orderId, orderKey]);

  return (
    <main className="min-h-screen bg-[#f7f8f7] px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#16324F]">Donation payment</h1>
        {!orderId && <p className="mt-4 text-red-700">No WooCommerce order was provided.</p>}
        {orderId && !order && !error && <p className="mt-4 text-gray-600">Checking your payment status…</p>}
        {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {order && (
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Order</span><strong>#{order.order_id}</strong></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span><strong className="capitalize">{order.payment_status}</strong></div>
            <div className="flex justify-between"><span className="text-gray-500">Order status</span><strong className="capitalize">{order.status}</strong></div>
            {order.transaction_id && <div className="flex justify-between gap-4"><span className="text-gray-500">Transaction</span><strong className="break-all text-right">{order.transaction_id}</strong></div>}
            {order.total && <div className="flex justify-between"><span className="text-gray-500">Total</span><strong>{order.currency} {order.total}</strong></div>}
            <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-emerald-800">
              {order.payment_status === "paid" ? "Your payment has been confirmed. Thank you for your donation." : "Your order exists, but payment is not yet confirmed. Do not submit a duplicate donation while the payment is pending."}
            </p>
          </div>
        )}
        <Link href="/donate" className="mt-8 inline-block font-semibold text-emerald-700 hover:underline">Back to campaigns</Link>
      </div>
    </main>
  );
}

export default function DonationSuccessPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#f7f8f7] px-4 py-16">Loading…</main>}><DonationSuccessContent /></Suspense>;
}
