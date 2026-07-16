import { prisma } from "./db";
import nodemailer from "nodemailer";

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
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If credentials are provided in .env, attempt sending a real email via Nodemailer SMTP
  if (host && port && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465, // true for port 465 (SSL), false for other ports (TLS)
        auth: {
          user,
          pass,
        },
        family: 4, // FORCE IPv4 to avoid IPv6 connect ENETUNREACH errors on sandbox networks
      } as unknown as nodemailer.TransportOptions);

      await transporter.sendMail({
        from: `"Skillbridge Support" <${user}>`,
        to: toEmail,
        subject,
        html: htmlBody,
      });

      console.log(`✅ [GENUINE EMAIL DISPATCH] Sent real email to ${toEmail}`);
      return;
    } catch (err) {
      console.error("❌ Failed to send genuine email via SMTP. Falling back to console log:", err);
    }
  }

  // Fallback to console logging
  console.log("\n========================================================");
  console.log(`✉️ [EMAIL DISPATCH FALLBACK LOG]`);
  console.log(`To:      ${toEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`--------------------------------------------------------`);
  console.log(`Content: ${htmlBody}`);
  console.log("========================================================\n");
}
