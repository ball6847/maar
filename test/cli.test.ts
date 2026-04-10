import { assertEquals } from "jsr:@std/assert";
import { parseArgs } from "../src/cli.ts";

Deno.test("parseArgs returns file paths from argv", async () => {
  // Create a temp file that exists
  await Deno.writeTextFile("test/temp/argtest.md", "# Test");
  const args = ["test/temp/argtest.md"];
  const result = await parseArgs(args);

  assertEquals(result, ["test/temp/argtest.md"]);
  await Deno.remove("test/temp/argtest.md");
});
