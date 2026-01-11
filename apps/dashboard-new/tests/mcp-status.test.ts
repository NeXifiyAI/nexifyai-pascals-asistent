import test from "node:test";
import assert from "node:assert/strict";
import { handleSystemStatus } from "../src/lib/mcp/handlers";

test("handleSystemStatus reports health flags", async () => {
  const result = await handleSystemStatus();

  assert.ok(result, "Result object should exist");
  assert.equal(typeof result.healthy, "boolean", "healthy flag is boolean");

  assert.ok(result.status, "Status payload present");
  assert.equal(
    typeof result.status.openai,
    "boolean",
    "openai flag is boolean",
  );
  assert.equal(
    typeof result.status.supabase,
    "boolean",
    "supabase flag is boolean",
  );
  assert.equal(
    typeof result.status.timestamp,
    "string",
    "timestamp is string formatted",
  );
});
