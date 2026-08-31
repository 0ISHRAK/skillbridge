"use client";

import { useState, useEffect, useMemo } from "react";

interface Payment {
  id: string;
  userId: string;
  amount: number;
  type: string;
  status: string;
  gatewayTxnId: string;
  createdAt: string;
}

interface PayoutRequestItem {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  amount: number;
  paymentChannel: string;
  accountNumber: string;
  bankName?: string;
  routingNumber?: string;
  status: string;
  trxId?: string;
  notes?: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"inbound" | "payouts">("inbound");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("all");

  // Disbursement Modal
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequestItem | null>(null);
  const [actionType, setActionType] = useState<"disburse" | "reject">("disburse");
  const [trxIdInput, setTrxIdInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch("/api/admin/payments").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/admin/payouts").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([paymentsData, payoutsData]) => {
        if (!isMounted) return;
        if (paymentsData) setPayments(paymentsData.payments || []);
        if (payoutsData) setPayouts(payoutsData.payouts || []);
      })
      .catch((err) => console.error("Failed to load payments:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refetchData = async () => {
    try {
      const [paymentsRes, payoutsRes] = await Promise.all([
        fetch("/api/admin/payments"),
        fetch("/api/admin/payouts"),
      ]);
      if (paymentsRes.ok) {
        const d = await paymentsRes.json();
        setPayments(d.payments || []);
      }
      if (payoutsRes.ok) {
        const d = await payoutsRes.json();
        setPayouts(d.payouts || []);
      }
    } catch (err) {
      console.error("Error refreshing:", err);
    }
  };

  const handleOpenDisburseModal = (p: PayoutRequestItem, action: "disburse" | "reject") => {
    setSelectedPayout(p);
    setActionType(action);
    setTrxIdInput(action === "disburse" ? `MFS-${p.id.slice(0, 6).toUpperCase()}` : "");
    setNotesInput("");
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;

    setSubmittingAction(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: selectedPayout.id,
          action: actionType,
          trxId: trxIdInput.trim(),
          notes: notesInput.trim(),
        }),
      });

      if (res.ok) {
        setSelectedPayout(null);
        void refetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update payout request.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => typeFilter === "all" || p.type === typeFilter);
  }, [payments, typeFilter]);

  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => payoutStatusFilter === "all" || p.status === payoutStatusFilter);
  }, [payouts, payoutStatusFilter]);

  const totalInbound = payments.filter((p) => p.status === "success").reduce((sum, p) => sum + p.amount, 0);
  const totalDisbursed = payouts.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const pendingPayoutsAmount = payouts.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const pendingPayoutsCount = payouts.filter((p) => p.status === "pending").length;

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

  const handleExportCSV = () => {
    if (activeTab === "inbound") {
      const headers = ["Transaction ID", "Date", "Item Type", "Amount BDT", "Gateway Txn", "Status"];
      const rows = payments.map((p) => [
        `TXN-${p.id.slice(0, 8).toUpperCase()}`,
        new Date(p.createdAt).toISOString().split("T")[0],
        p.type,
        p.amount,
        p.gatewayTxnId || "Direct",
        p.status,
      ]);
      downloadCSV(`skillbridge_inbound_payments_${new Date().toISOString().split("T")[0]}.csv`, [headers, ...rows]);
    } else {
      const headers = ["Request ID", "Date", "Mentor Name", "Mentor Email", "Amount BDT", "Channel", "Account Number", "Status", "TrxID"];
      const rows = payouts.map((p) => [
        p.id.slice(0, 8),
        new Date(p.createdAt).toISOString().split("T")[0],
        `"${p.mentorName.replace(/"/g, '""')}"`,
        p.mentorEmail,
        p.amount,
        p.paymentChannel,
        `'${p.accountNumber}`,
        p.status,
        p.trxId || "N/A",
      ]);
      downloadCSV(`skillbridge_mentor_payouts_${new Date().toISOString().split("T")[0]}.csv`, [headers, ...rows]);
    }
  };

  const downloadCSV = (filename: string, data: (string | number)[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," + data.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Payments & Financial Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit inbound learner revenues, review disbursement requests, and execute mentor payouts.
          </p>
        </div>

        {/* Tab switchers + Export CSV */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span>📥</span> Export CSV
          </button>

          <div className="flex bg-muted/60 p-1 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab("inbound")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "inbound"
                  ? "bg-card shadow-xs text-foreground font-black border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              💰 Inbound ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab("payouts")}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "payouts"
                  ? "bg-card shadow-xs text-foreground font-black border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>💸 Mentor Payouts</span>
              {pendingPayoutsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-black animate-pulse">
                {pendingPayoutsCount}
              </span>
            )}
          </button>
        </div>
      </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-card shadow-xs space-y-1">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Gross Inbound Revenue</p>
          <p className="text-2xl font-black text-emerald-400">৳{totalInbound.toLocaleString()} BDT</p>
          <p className="text-[10px] text-muted-foreground">{payments.length} customer charges</p>
        </div>

        <div className="p-5 rounded-2xl border border-blue-500/20 bg-card shadow-xs space-y-1">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Disbursed Payouts</p>
          <p className="text-2xl font-black text-blue-400">৳{totalDisbursed.toLocaleString()} BDT</p>
          <p className="text-[10px] text-muted-foreground">Paid to verified mentors</p>
        </div>

        <div className="p-5 rounded-2xl border border-amber-500/20 bg-card shadow-xs space-y-1">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Pending Mentor Payouts</p>
          <p className="text-2xl font-black text-amber-400">৳{pendingPayoutsAmount.toLocaleString()} BDT</p>
          <p className="text-[10px] text-amber-400 font-semibold">{pendingPayoutsCount} requests pending review</p>
        </div>

        <div className="p-5 rounded-2xl border border-purple-500/20 bg-card shadow-xs space-y-1">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Net Platform Retained</p>
          <p className="text-2xl font-black text-purple-400">৳{(totalInbound - totalDisbursed).toLocaleString()} BDT</p>
          <p className="text-[10px] text-muted-foreground">Operating balance</p>
        </div>
      </div>

      {/* TAB 1: Inbound Payments */}
      {activeTab === "inbound" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Types" },
              { id: "course_enrollment", label: "Course Enrollments" },
              { id: "subscription", label: "All-Access Pass" },
              { id: "wallet_topup", label: "Skill Tokens Top-up" },
              { id: "mentor_booking", label: "Mentorship Bookings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Item Type</th>
                    <th className="p-4">Gateway Reference</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-mono font-bold text-foreground">
                          #TXN-{p.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4 text-foreground font-bold capitalize">
                          {p.type.replace(/_/g, " ")}
                        </td>
                        <td className="p-4 font-mono text-muted-foreground text-[11px]">
                          {p.gatewayTxnId || "Direct Gateway"}
                        </td>
                        <td className="p-4 text-right font-black text-foreground">
                          ৳{p.amount.toLocaleString()} BDT
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              p.status === "success"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Mentor Payout Requests */}
      {activeTab === "payouts" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Requests" },
              { id: "pending", label: "Pending Review" },
              { id: "completed", label: "Disbursed / Completed" },
              { id: "rejected", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPayoutStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  payoutStatusFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Request Date</th>
                    <th className="p-4">Mentor</th>
                    <th className="p-4">Channel / Account</th>
                    <th className="p-4 text-right">Requested Amount</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No mentor payout requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayouts.map((p) => {
                      const isBkash = p.paymentChannel.toLowerCase().includes("bkash");
                      const isNagad = p.paymentChannel.toLowerCase().includes("nagad");
                      const isRocket = p.paymentChannel.toLowerCase().includes("rocket");

                      return (
                        <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-4 text-muted-foreground font-medium">
                            {new Date(p.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>

                          <td className="p-4">
                            <p className="font-bold text-foreground">{p.mentorName}</p>
                            <p className="text-[10px] text-muted-foreground">{p.mentorEmail}</p>
                          </td>

                          <td className="p-4">
                            <div className="space-y-1">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider inline-block ${
                                  isBkash
                                    ? "bg-[#E2136E]/10 text-[#E2136E] border border-[#E2136E]/20"
                                    : isNagad
                                    ? "bg-[#F7941D]/10 text-[#F7941D] border border-[#F7941D]/20"
                                    : isRocket
                                    ? "bg-[#8C3494]/10 text-[#8C3494] border border-[#8C3494]/20"
                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                }`}
                              >
                                {p.paymentChannel}
                              </span>
                              <p className="font-mono text-xs font-semibold text-foreground">{p.accountNumber}</p>
                              {p.bankName && (
                                <p className="text-[10px] text-muted-foreground">
                                  {p.bankName} (Routing: {p.routingNumber || "N/A"})
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="p-4 text-right font-black text-foreground">
                            ৳{p.amount.toLocaleString()} BDT
                          </td>

                          <td className="p-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                p.status === "completed"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : p.status === "pending"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-destructive/10 text-destructive border border-destructive/20"
                              }`}
                            >
                              {p.status}
                            </span>
                            {p.trxId && (
                              <p className="text-[9px] font-mono text-muted-foreground mt-0.5 truncate max-w-[100px] mx-auto">
                                Trx: {p.trxId}
                              </p>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            {p.status === "pending" ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenDisburseModal(p, "disburse")}
                                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer shadow-xs"
                                >
                                  Disburse ✓
                                </button>
                                <button
                                  onClick={() => handleOpenDisburseModal(p, "reject")}
                                  className="px-2 py-1 text-[11px] font-bold rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground font-semibold">Processed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Disbursement Action Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-scale-up space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                {actionType === "disburse" ? "Disburse Mentor Payout" : "Reject Payout Request"}
              </h3>
              <button
                onClick={() => setSelectedPayout(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs space-y-1.5">
              <p>
                <span className="text-muted-foreground">Mentor:</span>{" "}
                <span className="font-bold text-foreground">{selectedPayout.mentorName}</span> ({selectedPayout.mentorEmail})
              </p>
              <p>
                <span className="text-muted-foreground">Amount:</span>{" "}
                <span className="font-black text-emerald-400">৳{selectedPayout.amount.toLocaleString()} BDT</span>
              </p>
              <p>
                <span className="text-muted-foreground">Disbursement Channel:</span>{" "}
                <span className="font-bold text-foreground">{selectedPayout.paymentChannel} - {selectedPayout.accountNumber}</span>
              </p>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-3">
              {actionType === "disburse" ? (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                    MFS / Bank Transaction ID (TrxID)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9J28A749B or BEFTN-182740"
                    value={trxIdInput}
                    onChange={(e) => setTrxIdInput(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Reason for Rejection
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Account number invalid or minimum threshold not met."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className={`flex-1 py-2 text-xs font-black rounded-xl text-white transition-all shadow-md cursor-pointer disabled:opacity-50 ${
                    actionType === "disburse" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submittingAction ? "Processing..." : actionType === "disburse" ? "Confirm Disbursement" : "Reject Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
