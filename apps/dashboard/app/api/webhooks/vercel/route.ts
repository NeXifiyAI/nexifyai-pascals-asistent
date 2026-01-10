import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Vercel Webhook Secret - muss in Vercel Environment Variables gesetzt werden
const WEBHOOK_SECRET =
  process.env.VERCEL_WEBHOOK_SECRET || "WahphdJNfwuUYaqGG3DwMVQd";

// Webhook Event Types
type VercelWebhookEvent = {
  id: string;
  type: string;
  createdAt: number;
  payload: Record<string, unknown>;
  region?: string;
};

// Verify Vercel Webhook Signature
function verifySignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn("VERCEL_WEBHOOK_SECRET not set - skipping verification");
    return true; // In development, allow without secret
  }

  const hmac = crypto.createHmac("sha1", WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Log event to console (kann später zu DB/externe Services erweitert werden)
async function processWebhookEvent(event: VercelWebhookEvent) {
  const timestamp = new Date(event.createdAt).toISOString();

  console.log("=".repeat(60));
  console.log(`[VERCEL WEBHOOK] ${event.type}`);
  console.log(`ID: ${event.id}`);
  console.log(`Time: ${timestamp}`);
  console.log(`Region: ${event.region || "unknown"}`);
  console.log("Payload:", JSON.stringify(event.payload, null, 2));
  console.log("=".repeat(60));

  // Event-spezifische Aktionen
  switch (event.type) {
    case "deployment.succeeded":
      console.log("[SUCCESS] Deployment erfolgreich!");
      // Hier könnte eine Benachrichtigung gesendet werden
      break;

    case "deployment.error":
      console.log("[ERROR] Deployment fehlgeschlagen!");
      // Hier könnte ein Alert gesendet werden
      break;

    case "deployment.created":
      console.log("[INFO] Neues Deployment gestartet");
      break;

    case "alerts.triggered":
      console.log("[ALERT] Vercel Alert ausgelöst!");
      break;

    case "firewall.attack":
      console.log("[SECURITY] Firewall-Angriff erkannt!");
      break;

    default:
      console.log(`[EVENT] ${event.type} empfangen`);
  }

  // TODO: Hier können weitere Aktionen hinzugefügt werden:
  // - Events in Datenbank speichern
  // - Benachrichtigungen an Slack/Discord senden
  // - Metrics aktualisieren
  // - AI-Assistent benachrichtigen
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-vercel-signature") || "";
    const body = await req.text();

    // Verify webhook signature
    if (WEBHOOK_SECRET && !verifySignature(body, signature)) {
      console.error("[WEBHOOK] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: VercelWebhookEvent = JSON.parse(body);

    // Process the webhook event
    await processWebhookEvent(event);

    return NextResponse.json({
      received: true,
      eventId: event.id,
      eventType: event.type,
    });
  } catch (error) {
    console.error("[WEBHOOK] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "Vercel Webhook Receiver",
    configured: !!WEBHOOK_SECRET,
    timestamp: new Date().toISOString(),
  });
}
