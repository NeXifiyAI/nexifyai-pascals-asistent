/**
 * NeXify AI - Email Send API Route
 * POST /api/email/send
 */

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/smtp-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, text, html, cc, bcc, replyTo } = body;

    // Validation
    if (!to || !subject) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject" },
        { status: 400 },
      );
    }

    const result = await sendEmail({
      to,
      subject,
      text,
      html,
      cc,
      bcc,
      replyTo,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("[API/email/send] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
