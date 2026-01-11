/**
 * Simple MCP status monitor.
 * - Uses MCP_STATUS_URL env var or defaults to local dev server.
 * - Fails (exit 1) if request errors, times out, or `healthy` flag is false.
 */
const statusUrl =
  process.env.MCP_STATUS_URL ?? "http://localhost:3000/api/mcp/status";
const timeoutMs = Number(process.env.MCP_STATUS_TIMEOUT ?? 5000);

async function main() {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const response = await fetch(statusUrl, { signal: abortController.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    if (!payload?.healthy) {
      throw new Error(
        `Endpoint responded but reported unhealthy state: ${JSON.stringify(payload)}`,
      );
    }

    console.log(
      `[MCP STATUS] OK - OpenAI=${payload.status?.openai} | Supabase=${payload.status?.supabase} | ${payload.status?.timestamp}`,
    );
  } catch (error) {
    console.error(`[MCP STATUS] ERROR - ${(error as Error).message}`);
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
  }
}

void main();
