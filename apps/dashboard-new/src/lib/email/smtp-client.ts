/**
 * ============================================================
 * NEXIFY AI - EMAIL SMTP CLIENT
 * Nodemailer + React Email Integration
 * ============================================================
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

// ============================================================
// CONFIG
// ============================================================

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  replyTo?: string;
}

const defaultConfig: EmailConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  from: process.env.SMTP_FROM || "NeXify AI <info@nexify-automate.com>",
  replyTo: process.env.SMTP_REPLY_TO,
};

// ============================================================
// TYPES
// ============================================================

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: "base64" | "utf-8";
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============================================================
// SMTP CLIENT CLASS
// ============================================================

class SMTPClient {
  private transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;
  private config: EmailConfig;

  constructor(config?: Partial<EmailConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Get or create transporter
   */
  private getTransporter(): Transporter<SMTPTransport.SentMessageInfo> {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
      });
    }
    return this.transporter;
  }

  /**
   * Verify connection
   */
  async verify(): Promise<boolean> {
    try {
      await this.getTransporter().verify();
      return true;
    } catch (error) {
      console.error("[SMTP] Verification failed:", error);
      return false;
    }
  }

  /**
   * Send email
   */
  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      const transporter = this.getTransporter();

      const mailOptions = {
        from: this.config.from,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc
          ? Array.isArray(options.cc)
            ? options.cc.join(", ")
            : options.cc
          : undefined,
        bcc: options.bcc
          ? Array.isArray(options.bcc)
            ? options.bcc.join(", ")
            : options.bcc
          : undefined,
        replyTo: options.replyTo || this.config.replyTo,
        attachments: options.attachments?.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
          encoding: att.encoding,
        })),
        headers: options.headers,
      };

      const result = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("[SMTP] Send failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Send email with React Email template
   */
  async sendWithTemplate(
    options: Omit<SendEmailOptions, "html"> & { template: React.ReactElement },
  ): Promise<SendEmailResult> {
    // Dynamic import to avoid SSR issues
    const { render } = await import("@react-email/components");
    const html = await render(options.template);

    return this.send({
      ...options,
      html,
    });
  }

  /**
   * Close connection
   */
  close(): void {
    if (this.transporter) {
      this.transporter.close();
      this.transporter = null;
    }
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

let smtpClient: SMTPClient | null = null;

export function getSMTPClient(config?: Partial<EmailConfig>): SMTPClient {
  if (!smtpClient) {
    smtpClient = new SMTPClient(config);
  }
  return smtpClient;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Quick send email
 */
export async function sendEmail(
  options: SendEmailOptions,
): Promise<SendEmailResult> {
  return getSMTPClient().send(options);
}

/**
 * Send email with React template
 */
export async function sendTemplateEmail(
  options: Omit<SendEmailOptions, "html"> & { template: React.ReactElement },
): Promise<SendEmailResult> {
  return getSMTPClient().sendWithTemplate(options);
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection(): Promise<boolean> {
  return getSMTPClient().verify();
}

export default SMTPClient;
