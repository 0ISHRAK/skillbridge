"use client";

import { useState, useEffect } from "react";

interface Payment {
  id: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
  gatewayTxnId: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/admin/payments");
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter((p) => typeFilter === "all" || p.type === typeFilter);

  const totalRevenue = payments.filter((p) => p.status === "success").reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = payments.filter((p) => p.status === "refunded").reduce((sum, p) => sum + p.amount, 0);

  const statusColors: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-500",
    failed: "bg-red-500/10 text-red-500",
    refunded: "bg-amber-500/10 text-amber-500",
  };

  const typeLabels: Record<string, string> = {
    course_enrollment: "Course Enrollment",
    consultation_booking: "Consultation",
    wallet_topup: "Wallet Top-up",
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Payment History</h1>
        <p className="text-xs text-muted-foreground mt-1">{payments.length} total transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-card">
          <p className="text-[10px] text-muted-foreground font-medium">Total Revenue</p>
          <p className="text-2xl font-extrabold text-emerald-500 mt-1">৳{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl border border-amber-500/20 bg-card">
          <p className="text-[10px] text-muted-foreground font-medium">Total Refunded</p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">৳{totalRefunded.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl border border-blue-500/20 bg-card">
          <p className="text-[10px] text-muted-foreground font-medium">Net Revenue</p>
          <p className="text-2xl font-extrabold text-blue-500 mt-1">৳{(totalRevenue - totalRefunded).toLocaleString()}</p>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        {["all", "course_enrollment", "consultation_booking", "wallet_topup"].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              typeFilter === type
                ? "bg-red-500 text-white"
                : "border border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            {type === "all" ? "All Types" : typeLabels[type] || type}
          </button>
        ))}
      </div>

      {/* Payment Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-3 font-semibold">Transaction ID</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => (
                <tr key={payment.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono font-bold">{payment.gatewayTxnId}</p>
                    <p className="text-[10px] text-muted-foreground">User: {payment.userId.slice(0, 8)}...</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-500">
                      {typeLabels[payment.type] || payment.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">৳{payment.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusColors[payment.status] || ""}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
