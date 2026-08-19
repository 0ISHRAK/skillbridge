import { prisma } from "./db";
import { Resend } from "resend";

export async function createNotification(userId: string, title: string, content: string) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        content,
        read: false,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user && user.email) {
      await sendEmail(user.email, title, content);
    }

    return notification;
  } catch (err) {
    console.error("Failed to create notification/email:", err);
    return null;
  }
}

export async function sendEmail(toEmail: string, subject: string, htmlBody: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Skillbridge <onboarding@resend.dev>";

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from,
        to: toEmail,
        subject,
        html: htmlBody,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log(`✅ [RESEND EMAIL DISPATCH] Sent real email to ${toEmail}`);
      return;
    } catch (err) {
      console.error("❌ Failed to send email via Resend. Falling back to console log:", err);
    }
  }

  console.log("\n========================================================");
  console.log(`✉️ [EMAIL DISPATCH FALLBACK LOG]`);
  console.log(`To:      ${toEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`--------------------------------------------------------`);
  console.log(`Content: ${htmlBody}`);
  console.log("========================================================\n");
}
