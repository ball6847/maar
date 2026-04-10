import { assertEquals, assertNotEquals } from "@std/assert";

const testDir = "test/temp";

// Ensure test directory exists
try {
  await Deno.mkdir(testDir, { recursive: true });
} catch { /* ignore */ }

Deno.test("processes single file with single diagram", async () => {
  const testFile = `${testDir}/test-simple.md`;
  const mmdFile = `${testDir}/diagram.mmd`;

  await Deno.writeTextFile(mmdFile, "flowchart TD\n    A[Start] --> B[End]\n");
  await Deno.writeTextFile(testFile, "# Test\n\n[View](diagram.mmd)\n");

  const command = new Deno.Command("deno", {
    args: ["run", "--allow-read", "--allow-write", "maar.ts", testFile],
    stdout: "piped",
    stderr: "piped",
  });

  const { stdout } = await command.output();
  const output = new TextDecoder().decode(stdout);

  assertEquals(output.includes("✓"), true);
  assertEquals(output.includes("1 diagram"), true);

  const content = await Deno.readTextFile(testFile);
  assertEquals(content.includes("<!-- MAAR: diagram.mmd -->"), true);
  assertEquals(content.includes("```"), true);
});

Deno.test("processes file with no diagrams", async () => {
  const testFile = `${testDir}/test-empty.md`;
  await Deno.writeTextFile(testFile, "# Test\n\nNo diagrams here.\n");

  const command = new Deno.Command("deno", {
    args: ["run", "--allow-read", "--allow-write", "maar.ts", testFile],
    stdout: "piped",
    stderr: "piped",
  });

  const { stdout } = await command.output();
  const output = new TextDecoder().decode(stdout);

  assertEquals(output.includes("⚠"), true);
  assertEquals(output.includes("0 diagrams"), true);
});

Deno.test("exits with error for missing mmd file", async () => {
  const testFile = `${testDir}/test-missing.md`;
  await Deno.writeTextFile(testFile, "# Test\n\n[View](nonexistent.mmd)\n");

  const command = new Deno.Command("deno", {
    args: ["run", "--allow-read", "--allow-write", "maar.ts", testFile],
    stdout: "piped",
    stderr: "piped",
  });

  const { code } = await command.output();

  assertNotEquals(code, 0);
});

Deno.test("exits with error for missing markdown file", async () => {
  const command = new Deno.Command("deno", {
    args: ["run", "--allow-read", "--allow-write", "maar.ts", "nonexistent.md"],
    stdout: "piped",
    stderr: "piped",
  });

  const { code } = await command.output();

  assertNotEquals(code, 0);
});

Deno.test("re-runs deterministically", async () => {
  const testFile = `${testDir}/test-deterministic.md`;
  const mmdFile = `${testDir}/diagram2.mmd`;

  // Clean up from previous runs
  try {
    await Deno.remove(testFile);
    await Deno.remove(mmdFile);
  } catch { /* ignore */ }

  await Deno.writeTextFile(mmdFile, "flowchart TD\n    A --> B\n");
  await Deno.writeTextFile(testFile, "# Test\n\n[View](diagram2.mmd)\n");

  // First run
  const command1 = new Deno.Command("deno", {
    args: ["run", "--allow-read", "--allow-write", "maar.ts", testFile],
    stdout: "piped",
    stderr: "piped",
  });
  await command1.output();

  const content1 = await Deno.readTextFile(testFile);

  // Verify first run has exactly one MAAR marker
  const markerCount1 = (content1.match(/<!-- MAAR:/g) || []).length;
  assertEquals(markerCount1, 1);

  // Second run
  const command2 = new Deno.Command("deno", {
    args: ["run", "--allow-read", "--allow-write", "maar.ts", testFile],
    stdout: "piped",
    stderr: "piped",
  });
  await command2.output();

  const content2 = await Deno.readTextFile(testFile);

  // Verify second run still has exactly one MAAR marker
  const markerCount2 = (content2.match(/<!-- MAAR:/g) || []).length;
  assertEquals(markerCount2, 1);

  // Content should be identical
  assertEquals(content1, content2);
});
