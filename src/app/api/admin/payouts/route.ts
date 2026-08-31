import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticateAdmin } from "../../../../lib/auth";

export async function GET() {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const payouts = await prisma.payoutRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      payouts: payouts.map((p) => ({
        id: p.id,
        mentorId: p.mentorId,
        mentorName: p.mentor?.name || "Mentor",
        mentorEmail: p.mentor?.email || "",
        amount: p.amount,
        paymentChannel: p.method,
        accountNumber: p.accountNumber,
        accountName: p.accountName,
        bankName: p.bankName,
        branchName: p.branchName,
        routingNumber: p.routingNumber,
        status: p.status,
        trxId: p.trxId,
        notes: p.notes,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Admin GET Payouts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const { payoutId, action, trxId, notes } = await request.json();

    if (!payoutId || !action) {
      return NextResponse.json({ error: "payoutId and action are required" }, { status: 400 });
    }

    const payout = await prisma.payoutRequest.findUnique({
      where: { id: payoutId },
      include: { mentor: true },
    });

    if (!payout) {
      return NextResponse.json({ error: "Payout request not found" }, { status: 404 });
    }

    const newStatus = action === "disburse" || action === "approve" ? "completed" : "rejected";
    const transactionCode = trxId ? String(trxId).trim() : `DISB-${Date.now().toString().slice(-6)}`;

    const updated = await prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: newStatus,
        trxId: newStatus === "completed" ? transactionCode : payout.trxId,
        notes: notes ? String(notes).trim() : payout.notes,
      },
    });

    // Create in-app notification for the mentor
    if (newStatus === "completed") {
      await prisma.notification.create({
        data: {
          userId: payout.mentorId,
          title: "💸 Payout Disbursed Successfully!",
          content: `Your withdrawal request of ৳${payout.amount.toLocaleString()} BDT via ${payout.method} was disbursed. TrxID: ${transactionCode}`,
          link: "/dashboard/mentor/earnings",
        },
      });
    } else if (newStatus === "rejected") {
      await prisma.notification.create({
        data: {
          userId: payout.mentorId,
          title: "⚠️ Payout Request Update",
          content: `Your withdrawal request of ৳${payout.amount.toLocaleString()} BDT was rejected. Reason: ${notes || "Contact support."}`,
          link: "/dashboard/mentor/earnings",
        },
      });
    }

    return NextResponse.json({
      message: `Payout request marked as ${newStatus}`,
      payout: updated,
    });
  } catch (err) {
    console.error("Admin PUT Payouts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
