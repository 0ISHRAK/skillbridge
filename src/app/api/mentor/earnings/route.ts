import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { authenticateApprovedMentor } from "../../../../lib/auth";

export async function GET() {
  try {
    const user = await authenticateApprovedMentor();
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [confirmedBookings, courses, mentor, payoutRequests] = await Promise.all([
      prisma.booking.findMany({
        where: { mentorId: user.userId, status: { in: ["confirmed", "completed"] } },
      }),
      prisma.course.findMany({
        where: { mentorId: user.userId },
      }),
      prisma.user.findUnique({
        where: { id: user.userId },
        select: { tokenBalance: true, name: true },
      }),
      prisma.payoutRequest.findMany({
        where: { mentorId: user.userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalBookingEarnings = confirmedBookings.reduce((sum, b) => sum + (b.price || 0), 0);

    const courseIds = courses.map((c) => c.id);
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
    });

    let courseEarnings = 0;
    enrollments.forEach((e) => {
      const course = courses.find((c) => c.id === e.courseId);
      if (course) courseEarnings += (course.price || 0);
    });

    const totalRevenue = totalBookingEarnings + courseEarnings;

    const pendingPayouts = payoutRequests
      .filter((p) => p.status === "pending" || p.status === "processing")
      .reduce((sum, p) => sum + p.amount, 0);

    const completedPayouts = payoutRequests
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    const availableBalance = Math.max(0, totalRevenue - pendingPayouts - completedPayouts);

    return NextResponse.json({
      earnings: {
        bookingRevenue: totalBookingEarnings,
        courseRevenue: courseEarnings,
        totalRevenue,
        pendingPayouts,
        completedPayouts,
        availableBalance,
        walletBalance: mentor?.tokenBalance || 0,
        totalBookings: confirmedBookings.length,
        totalStudents: enrollments.length,
      },
      payoutHistory: payoutRequests.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
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
    console.error("Mentor earnings GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateApprovedMentor();
    if (!user || user.role !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const {
      amount,
      method,
      accountNumber,
      accountName,
      bankName,
      branchName,
      routingNumber,
    } = await request.json();

    const payoutAmount = Number(amount);
    if (!payoutAmount || payoutAmount < 500) {
      return NextResponse.json(
        { error: "Minimum cash-out threshold is ৳500 BDT." },
        { status: 400 }
      );
    }

    const normalizedMethod = String(method || "").toLowerCase().trim();
    if (!["bkash", "nagad", "rocket", "bank"].includes(normalizedMethod)) {
      return NextResponse.json(
        { error: "Invalid payout method selected. Choose bKash, Nagad, Rocket, or Bank Transfer." },
        { status: 400 }
      );
    }

    if (!accountNumber || String(accountNumber).trim().length < 4) {
      return NextResponse.json(
        { error: "A valid account or mobile wallet number is required." },
        { status: 400 }
      );
    }

    if (normalizedMethod === "bank" && (!bankName || !accountName)) {
      return NextResponse.json(
        { error: "Bank Name and Account Holder Name are required for bank transfers." },
        { status: 400 }
      );
    }

    // Calculate current available balance
    const [confirmedBookings, courses, payoutRequests] = await Promise.all([
      prisma.booking.findMany({
        where: { mentorId: user.userId, status: { in: ["confirmed", "completed"] } },
      }),
      prisma.course.findMany({
        where: { mentorId: user.userId },
      }),
      prisma.payoutRequest.findMany({
        where: { mentorId: user.userId },
      }),
    ]);

    const totalBookingEarnings = confirmedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const courseIds = courses.map((c) => c.id);
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
    });

    let courseEarnings = 0;
    enrollments.forEach((e) => {
      const course = courses.find((c) => c.id === e.courseId);
      if (course) courseEarnings += (course.price || 0);
    });

    const totalRevenue = totalBookingEarnings + courseEarnings;
    const pendingAndCompleted = payoutRequests
      .filter((p) => p.status !== "rejected")
      .reduce((sum, p) => sum + p.amount, 0);

    const availableBalance = Math.max(0, totalRevenue - pendingAndCompleted);

    if (payoutAmount > availableBalance) {
      return NextResponse.json(
        {
          error: `Insufficient available balance. You have ৳${availableBalance.toLocaleString()} available for cash-out.`,
        },
        { status: 400 }
      );
    }

    // Create payout request and notification in an atomic transaction
    const [newPayout] = await prisma.$transaction([
      prisma.payoutRequest.create({
        data: {
          mentorId: user.userId,
          amount: payoutAmount,
          method: normalizedMethod,
          accountNumber: String(accountNumber).trim(),
          accountName: accountName ? String(accountName).trim() : null,
          bankName: bankName ? String(bankName).trim() : null,
          branchName: branchName ? String(branchName).trim() : null,
          routingNumber: routingNumber ? String(routingNumber).trim() : null,
          status: "pending",
        },
      }),
      prisma.notification.create({
        data: {
          userId: user.userId,
          title: "🪙 Payout Request Submitted",
          content: `Your cash-out request of ৳${payoutAmount.toLocaleString()} via ${normalizedMethod.toUpperCase()} has been received. Admin will process it within 24 hours.`,
          link: "/dashboard/mentor/earnings",
        },
      }),
    ]);

    return NextResponse.json({
      message: "Payout request submitted successfully!",
      payout: newPayout,
      newAvailableBalance: availableBalance - payoutAmount,
    });
  } catch (err) {
    console.error("Mentor earnings POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
