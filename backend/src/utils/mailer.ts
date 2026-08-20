const nodemailer = require("nodemailer") as typeof import("nodemailer");

function otpHtml(username: string, otp: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #4a90e2;">Hi ${username},</h2>
      <p style="font-size: 16px;">Use the OTP below to continue with MCQ Battle:</p>
      <p style="font-size: 20px; font-weight: bold; color: #333; margin: 20px 0;">🔐 ${otp}</p>
      <p style="font-size: 14px; color: #555;">This OTP will expire in <b>10 minutes</b>. If you did not initiate this request, you can safely ignore this email.</p>
      <hr style="margin: 30px 0;">
    </div>`;
}

async function sendViaSmtp(email: string, otp: string, username: string) {
  const login = process.env.BREVO_SMTP_LOGIN;
  const smtpKey = process.env.BREVO_SMTP_KEY || process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "MCQ Battle";

  if (!login || !smtpKey || !senderEmail) {
    throw new Error("BREVO_SMTP_LOGIN, BREVO_SMTP_KEY/BREVO_API_KEY, and BREVO_SENDER_EMAIL must be set");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: login,
      pass: smtpKey,
    },
  });

  await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to: email,
    subject: "Your MCQ Battle verification code",
    html: otpHtml(username, otp),
  });
}

async function sendViaApi(email: string, otp: string, username: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "MCQ Battle";

  if (!apiKey || !senderEmail) {
    throw new Error("BREVO_API_KEY and BREVO_SENDER_EMAIL must be set");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email, name: username }],
      subject: "Your MCQ Battle verification code",
      htmlContent: otpHtml(username, otp),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Brevo email send failed:", response.status, errorBody);
    throw new Error("Failed to send OTP email");
  }
}

export async function sendOtpEmail(email: string, otp: string, username: string) {
  const key = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY || "";
  const useSmtp = key.startsWith("xsmtpsib-") || Boolean(process.env.BREVO_SMTP_LOGIN);

  try {
    if (useSmtp) {
      await sendViaSmtp(email, otp, username);
      return;
    }
    await sendViaApi(email, otp, username);
  } catch (error) {
    console.error("Error sending OTP email:", error instanceof Error ? error.message : error);
    throw new Error("Failed to send OTP email");
  }
}
