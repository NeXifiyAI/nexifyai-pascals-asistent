import test from "node:test";
import assert from "node:assert/strict";
import { formatBytes } from "../src/lib/utils";

test("formatBytes converts bytes to default units", () => {
  const output = formatBytes(2048);
  assert.equal(output, "2 KB");
});

test("formatBytes supports accurate IEC units with decimals", () => {
  const output = formatBytes(1536, { decimals: 1, sizeType: "accurate" });
  assert.equal(output, "1.5 KiB");
});
