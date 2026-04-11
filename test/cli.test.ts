import { assertEquals } from "@std/assert";
import { parseArgs } from "../src/cli.ts";

Deno.test("parseArgs returns file paths from argv", async () => {
  await Deno.mkdir("test/temp", { recursive: true });
  await Deno.writeTextFile("test/temp/argtest.md", "# Test");
  const args = ["test/temp/argtest.md"];
  const result = await parseArgs(args);

  assertEquals(result, ["test/temp/argtest.md"]);
  await Deno.remove("test/temp/argtest.md");
});

Deno.test({
  name: "parseArgs --version prints version and exits 0",
  fn: async () => {
    const cmd = new Deno.Command(Deno.execPath(), {
      args: ["run", "--allow-read", "--allow-write", "maar.ts", "--version"],
      stdin: "null",
      stdout: "piped",
      stderr: "piped",
    });
    const output = await cmd.output();
    const stdout = new TextDecoder().decode(output.stdout);
    assertEquals(output.code, 0);
    assertEquals(stdout.trim().startsWith("maar v"), true);
  },
});

Deno.test({
  name: "parseArgs -v prints version and exits 0",
  fn: async () => {
    const cmd = new Deno.Command(Deno.execPath(), {
      args: ["run", "--allow-read", "--allow-write", "maar.ts", "-v"],
      stdin: "null",
      stdout: "piped",
      stderr: "piped",
    });
    const output = await cmd.output();
    const stdout = new TextDecoder().decode(output.stdout);
    assertEquals(output.code, 0);
    assertEquals(stdout.trim().startsWith("maar v"), true);
  },
});
