/**
 * NeXify AI - Email Inbox API Route
 * GET /api/email/inbox
 */

import { NextRequest, NextResponse } from "next/server";
import {
  fetchInbox,
  fetchUnreadEmails,
  getUnreadCount,
} from "@/lib/email/imap-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const unreadOnly = searchParams.get("unread") === "true";
    const countOnly = searchParams.get("count") === "true";

    // Return only unread count
    if (countOnly) {
      const count = await getUnreadCount();
      return NextResponse.json({ unreadCount: count });
    }

    // Fetch emails
    const emails = unreadOnly
      ? await fetchUnreadEmails(limit)
      : await fetchInbox(limit);

    return NextResponse.json({
      emails,
      count: emails.length,
    });
  } catch (error) {
    console.error("[API/email/inbox] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
