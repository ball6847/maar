import { assertEquals } from "@std/assert";
import { formatError, formatSuccess, formatSummary, formatWarning } from "../src/reporter.ts";

Deno.test("formatSuccess formats correctly with singular", () => {
  assertEquals(formatSuccess("file.md", 1), "✓ file.md: 1 diagram");
});

Deno.test("formatSuccess formats correctly with plural", () => {
  assertEquals(formatSuccess("file.md", 3), "✓ file.md: 3 diagrams");
});

Deno.test("formatWarning formats correctly", () => {
  assertEquals(formatWarning("file.md"), "⚠ file.md: 0 diagrams");
});

Deno.test("formatError formats correctly", () => {
  assertEquals(
    formatError("file.md", "diagram.mmd", "not found"),
    "✗ file.md: diagram.mmd - not found",
  );
});

Deno.test("formatSummary formats correctly with singular", () => {
  assertEquals(formatSummary(1, 1), "Done. Total: 1 diagram in 1 file.");
});

Deno.test("formatSummary formats correctly with plural", () => {
  assertEquals(formatSummary(5, 2), "Done. Total: 5 diagrams in 2 files.");
});
