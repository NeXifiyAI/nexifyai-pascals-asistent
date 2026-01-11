// src/lib/email/send.ts
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { emailConfig } from "./config";

const resend = emailConfig.resend.apiKey
  ? new Resend(emailConfig.resend.apiKey)
  : null;

const transporter = emailConfig.smtp.host
  ? nodemailer.createTransport({
      host: emailConfig.smtp.host,
      port: emailConfig.smtp.port,
      secure: emailConfig.smtp.secure,
      auth: emailConfig.smtp.auth,
    })
  : null;

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export async function sendEmail(
  params: SendEmailParams,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const { to, subject, html, text, from, replyTo, cc, bcc } = params;
  const fromAddress =
    from || `${emailConfig.from.name} <${emailConfig.from.email}>`;

  // Try Resend first (easier, no SMTP setup needed)
  if (resend) {
    try {
      const result = await resend.emails.send({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        replyTo,
        cc,
        bcc,
      });
      if (result.error) {
        return { success: false, error: result.error.message };
      }
      return { success: true, id: result.data?.id };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  // Fallback to SMTP
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        html,
        text,
        replyTo,
        cc: cc?.join(", "),
        bcc: bcc?.join(", "),
      });
      return { success: true, id: info.messageId };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  return { success: false, error: "No email provider configured" };
}
