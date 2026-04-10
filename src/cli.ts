import { existsSync, accessSync, constants } from 'fs';

export function parseArgs(argv: string[]): string[] {
  const args = argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx tsx maar.ts <file1.md> [file2.md ...]');
    process.exit(1);
  }

  for (const file of args) {
    if (!existsSync(file)) {
      console.error(`✗ ${file} - file not found`);
      process.exit(1);
    }
    try {
      accessSync(file, constants.R_OK | constants.W_OK);
    } catch {
      console.error(`✗ ${file} - permission denied`);
      process.exit(1);
    }
  }

  return args;
}
