import assert from "node:assert/strict";
import test from "node:test";
import { handleWebSearch } from "../src/lib/mcp/handlers";

test("handleWebSearch returns placeholder response", async () => {
  const result = await handleWebSearch({
    query: "latest status",
    num_results: 3,
  });
  assert.equal(result.query, "latest status");
  assert.equal(result.message, "Web search coming soon");
  assert.match(result.suggestion, /Tavily/i);
});
