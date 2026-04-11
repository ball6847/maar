import denoJson from "../deno.json" with { type: "json" };

export async function parseArgs(args: string[]): Promise<string[]> {
  if (args.includes("--version") || args.includes("-v")) {
    console.log(`maar v${denoJson.version}`);
    Deno.exit(0);
  }

  if (args.length === 0) {
    console.error("Usage: deno run --allow-read --allow-write maar.ts <file1.md> [file2.md ...]");
    console.error("       deno run --allow-read maar.ts --version");
    Deno.exit(1);
  }

  for (const file of args) {
    try {
      await Deno.stat(file);
    } catch {
      console.error(`✗ ${file} - file not found`);
      Deno.exit(1);
    }
  }

  return args;
}
