// src/lib/email/config.ts
// Email Configuration for NeXify AI

export const emailConfig = {
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  },
  imap: {
    host: process.env.IMAP_HOST || "",
    port: parseInt(process.env.IMAP_PORT || "993"),
    tls: true,
    auth: {
      user: process.env.IMAP_USER || "",
      pass: process.env.IMAP_PASS || "",
    },
  },
  from: {
    name: "NeXify AI",
    email: process.env.EMAIL_FROM || "info@nexify-automate.com",
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || "",
  },
};

export type EmailConfig = typeof emailConfig;
