import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { authenticate } from "../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [profile, payments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.userId },
        select: { tokenBalance: true, name: true, email: true, role: true },
      }),
      prisma.payment.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const formattedInvoices = payments.map((payment) => {
      let rawMethod = "bKash";
      let trxCode = "";
      if (payment.gatewayTxnId) {
        if (payment.gatewayTxnId.includes(":")) {
          const parts = payment.gatewayTxnId.split(":");
          rawMethod = parts[0] || "bKash";
          trxCode = parts.slice(1).join(":");
        } else if (payment.gatewayTxnId.toLowerCase().includes("bkash")) {
          rawMethod = "bKash";
          trxCode = payment.gatewayTxnId;
        } else if (payment.gatewayTxnId.toLowerCase().includes("nagad")) {
          rawMethod = "Nagad";
          trxCode = payment.gatewayTxnId;
        } else if (payment.gatewayTxnId.toLowerCase().includes("rocket")) {
          rawMethod = "Rocket";
          trxCode = payment.gatewayTxnId;
        } else {
          rawMethod = payment.gatewayTxnId.length > 10 ? "MFS Gateway" : payment.gatewayTxnId;
          trxCode = payment.gatewayTxnId;
        }
      }

      let formattedItem = "Skill Tokens Pack";
      let category = "tokens";
      if (payment.type === "wallet_topup") {
        if (payment.amount === 500) formattedItem = "🪙 50 Skill Tokens Starter Pack";
        else if (payment.amount === 1000) formattedItem = "⚡ 120 Skill Tokens Accelerator Pack";
        else if (payment.amount === 2500) formattedItem = "👑 320 Skill Tokens Pro Pack";
        else formattedItem = `🪙 Skill Tokens Recharge (${payment.amount} BDT)`;
        category = "tokens";
      } else if (payment.type === "subscription") {
        formattedItem = "👑 Course All-Access Pass (Monthly)";
        category = "subscription";
      } else if (payment.type === "course_enrollment") {
        formattedItem = "📘 Course Enrollment & Lifetime Access";
        category = "course";
      } else if (payment.type === "mentor_booking") {
        formattedItem = "🎯 1-on-1 Mentorship Session Booking";
        category = "mentorship";
      } else {
        formattedItem = payment.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        category = "other";
      }

      const shortId = `INV-${payment.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

      return {
        id: payment.id,
        shortId,
        date: payment.createdAt.toISOString().split("T")[0],
        fullDate: payment.createdAt.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawType: payment.type,
        category,
        item: formattedItem,
        method: rawMethod,
        trxId: trxCode || payment.id.slice(0, 12).toUpperCase(),
        amount: payment.amount,
        status: payment.status === "success" ? "paid" : payment.status,
        customerName: profile?.name || "SkillBridge Learner",
        customerEmail: profile?.email || user.email,
      };
    });

    return NextResponse.json({
      tokenBalance: profile?.tokenBalance ?? 0,
      user: {
        name: profile?.name || "SkillBridge Learner",
        email: profile?.email || user.email,
        role: profile?.role,
      },
      invoices: formattedInvoices,
    });
  } catch (err) {
    console.error("Wallet GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { tokens, amount, gateway, gatewayTxnId } = await request.json();
    const tokenCount = Number(tokens);
    const paymentAmount = Number(amount);
    const paymentGateway = String(gateway || "").trim() || "bKash";
    const transactionId = String(gatewayTxnId || "").trim();

    if (
      !Number.isInteger(tokenCount) ||
      tokenCount <= 0 ||
      !Number.isInteger(paymentAmount) ||
      paymentAmount <= 0 ||
      !paymentGateway ||
      !transactionId
    ) {
      return NextResponse.json({ error: "Invalid wallet payment details" }, { status: 400 });
    }

    const storedTransactionId = `${paymentGateway}:${transactionId}`;
    const duplicate = await prisma.payment.findFirst({ where: { gatewayTxnId: storedTransactionId } });
    if (duplicate) return NextResponse.json({ error: "This payment has already been processed" }, { status: 409 });

    const [profile] = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.userId },
        data: { tokenBalance: { increment: tokenCount } },
        select: { tokenBalance: true, name: true, email: true },
      });

      await tx.payment.create({
        data: {
          userId: user.userId,
          amount: paymentAmount,
          type: "wallet_topup",
          status: "success",
          gatewayTxnId: storedTransactionId,
        },
      });

      await tx.tokenTransaction.create({
        data: {
          userId: user.userId,
          amount: tokenCount,
          type: "wallet_topup",
          title: `Purchased ${tokenCount} Skill Tokens Pack`,
          description: `Topped up ৳${paymentAmount.toLocaleString()} BDT via ${paymentGateway} (TrxID: ${transactionId})`,
          referenceId: transactionId,
          balanceAfter: updatedUser.tokenBalance,
        },
      });

      await tx.notification.create({
        data: {
          userId: user.userId,
          title: `🪙 +${tokenCount} Skill Tokens Added!`,
          content: `Recharge of ৳${paymentAmount.toLocaleString()} BDT via ${paymentGateway} was successful. New balance: ${updatedUser.tokenBalance} Tokens.`,
          link: "/dashboard/billing",
        },
      });

      return [updatedUser];
    });

    return NextResponse.json({
      message: "Wallet topped up successfully",
      tokenBalance: profile.tokenBalance,
    });
  } catch (err) {
    console.error("Wallet POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
