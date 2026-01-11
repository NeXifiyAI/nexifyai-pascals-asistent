import { NextResponse } from "next/server";
import { handleSystemStatus } from "@/lib/mcp/handlers";

export async function GET() {
  try {
    const status = await handleSystemStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Failed to retrieve MCP system status", error);
    return NextResponse.json(
      {
        error: "Unable to retrieve MCP system status",
      },
      { status: 500 },
    );
  }
}
