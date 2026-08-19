import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { authenticate } from "../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticate();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [profile, payments] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.userId }, select: { tokenBalance: true } }),
      prisma.payment.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      tokenBalance: profile?.tokenBalance ?? 0,
      invoices: payments.map((payment) => ({
        id: payment.id,
        date: payment.createdAt.toISOString().split("T")[0],
        item: payment.type === "wallet_topup" ? "Skill Tokens Package" : payment.type,
        method: payment.gatewayTxnId ? payment.gatewayTxnId.split(":")[0] : "Payment gateway",
        amount: payment.amount,
        status: payment.status === "success" ? "paid" : payment.status,
      })),
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
    const paymentGateway = String(gateway || "").trim();
    const transactionId = String(gatewayTxnId || "").trim();

    if (!Number.isInteger(tokenCount) || tokenCount <= 0 || !Number.isInteger(paymentAmount) || paymentAmount <= 0 || !paymentGateway || !transactionId) {
      return NextResponse.json({ error: "Invalid wallet payment details" }, { status: 400 });
    }

    const storedTransactionId = `${paymentGateway}:${transactionId}`;
    const duplicate = await prisma.payment.findFirst({ where: { gatewayTxnId: storedTransactionId } });
    if (duplicate) return NextResponse.json({ error: "This payment has already been processed" }, { status: 409 });

    const [profile] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.userId },
        data: { tokenBalance: { increment: tokenCount } },
        select: { tokenBalance: true },
      }),
      prisma.payment.create({
        data: {
          userId: user.userId,
          amount: paymentAmount,
          type: "wallet_topup",
          status: "success",
          gatewayTxnId: storedTransactionId,
        },
      }),
    ]);

    return NextResponse.json({ message: "Wallet topped up successfully", tokenBalance: profile.tokenBalance });
  } catch (err) {
    console.error("Wallet POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
