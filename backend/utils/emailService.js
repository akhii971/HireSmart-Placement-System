import nodemailer from "nodemailer";

// ─── Lazy transporter (created on first use, after .env is loaded) ───
let _transporter = null;
const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return _transporter;
};

// ─── Reusable send function ───
export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠️  Email not configured — skipping email to:", to);
      return;
    }
    await getTransporter().sendMail({
      from: `"HireSmart" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
  }
};

// ═══════════════════════════════════════════
//  PREMIUM HTML EMAIL TEMPLATES
// ═══════════════════════════════════════════

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#10b981,#14b8a6);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                Hire<span style="font-weight:400;">Smart</span>
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} HireSmart. All rights reserved.
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#d1d5db;">
                Smart Internship & Placement Management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Status badge color ───
const statusColors = {
  Pending: "#f59e0b",
  Reviewed: "#3b82f6",
  Shortlisted: "#10b981",
  Rejected: "#ef4444",
  Hired: "#8b5cf6",
};

// 📌 1. Application Status Changed
export const applicationStatusEmail = (studentName, jobTitle, company, newStatus) => {
  const color = statusColors[newStatus] || "#6b7280";
  const emoji = {
    Shortlisted: "🎉",
    Hired: "🏆",
    Rejected: "😔",
    Reviewed: "👀",
    Pending: "⏳",
  }[newStatus] || "📋";

  const subject = `${emoji} Application Update: ${jobTitle} at ${company}`;
  const html = baseTemplate(`
        <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Hi ${studentName},</h2>
        <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">
          Your application status has been updated.
        </p>
        <table width="100%" style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:20px;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Position</p>
              <p style="margin:0 0 12px;font-size:16px;color:#111827;font-weight:600;">${jobTitle}</p>
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Company</p>
              <p style="margin:0 0 12px;font-size:16px;color:#111827;font-weight:600;">${company}</p>
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">New Status</p>
              <span style="display:inline-block;padding:6px 16px;border-radius:20px;background:${color};color:#fff;font-size:14px;font-weight:600;">
                ${newStatus}
              </span>
            </td>
          </tr>
        </table>
        <p style="margin:0;color:#6b7280;font-size:14px;">
          Log in to HireSmart to view full details.
        </p>
    `);
  return { subject, html };
};

// 📌 2. New Application Received (for Recruiter)
export const newApplicationEmail = (recruiterName, studentName, jobTitle) => {
  const subject = `📩 New Application: ${studentName} applied for ${jobTitle}`;
  const html = baseTemplate(`
        <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Hi ${recruiterName},</h2>
        <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">
          A new candidate has applied to your job posting.
        </p>
        <table width="100%" style="background:#f0fdf4;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #bbf7d0;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;text-transform:uppercase;">Candidate</p>
              <p style="margin:0 0 12px;font-size:16px;color:#111827;font-weight:600;">${studentName}</p>
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;text-transform:uppercase;">Position</p>
              <p style="margin:0;font-size:16px;color:#111827;font-weight:600;">${jobTitle}</p>
            </td>
          </tr>
        </table>
        <p style="margin:0;color:#6b7280;font-size:14px;">
          Review the application on your HireSmart dashboard.
        </p>
    `);
  return { subject, html };
};

// 📌 3. Interview Scheduled
export const interviewScheduledEmail = (studentName, jobTitle, company, date, time, mode, link) => {
  const subject = `📅 Interview Scheduled: ${jobTitle} at ${company}`;
  const html = baseTemplate(`
        <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Hi ${studentName},</h2>
        <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">
          Great news! An interview has been scheduled for you.
        </p>
        <table width="100%" style="background:#eff6ff;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #bfdbfe;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;text-transform:uppercase;">Position</p>
              <p style="margin:0 0 12px;font-size:16px;color:#111827;font-weight:600;">${jobTitle}</p>
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;text-transform:uppercase;">Company</p>
              <p style="margin:0 0 12px;font-size:16px;color:#111827;font-weight:600;">${company}</p>
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;text-transform:uppercase;">Date & Time</p>
              <p style="margin:0 0 12px;font-size:16px;color:#111827;font-weight:600;">📅 ${date} at 🕐 ${time}</p>
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;text-transform:uppercase;">Mode</p>
              <p style="margin:0;font-size:16px;color:#111827;font-weight:600;">${mode || "To be confirmed"}</p>
            </td>
          </tr>
        </table>
        ${link ? `<p style="margin:0 0 12px;"><a href="${link}" style="display:inline-block;padding:10px 24px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Join Interview</a></p>` : ""}
        <p style="margin:0;color:#6b7280;font-size:14px;">
          Good luck! Prepare well for your interview.
        </p>
    `);
  return { subject, html };
};

// 📌 4. New Message Notification
export const newMessageEmail = (recipientName, senderName) => {
  const subject = `💬 New message from ${senderName}`;
  const html = baseTemplate(`
        <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Hi ${recipientName},</h2>
        <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">
          You have a new message from <strong>${senderName}</strong>.
        </p>
        <table width="100%" style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:20px;">
          <tr>
            <td style="text-align:center;">
              <p style="margin:0;font-size:40px;">💬</p>
              <p style="margin:8px 0 0;font-size:15px;color:#374151;font-weight:600;">
                ${senderName} sent you a message
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:0;color:#6b7280;font-size:14px;">
          Log in to HireSmart to read and reply.
        </p>
    `);
  return { subject, html };
};

// 📌 5. Password Reset Email
export const passwordResetEmail = (name, resetUrl) => {
  const subject = `🔒 Password Reset Request`;
  const html = baseTemplate(`
        <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Hi ${name},</h2>
        <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">
          You requested to reset your password. Click the button below to set a new password. This link is valid for 1 hour.
        </p>
        <p style="margin:30px 0;text-align:center;">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;box-shadow:0 4px 6px -1px rgba(16, 185, 129, 0.2);">
            Reset Password
          </a>
        </p>
        <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
    `);
  return { subject, html };
};
