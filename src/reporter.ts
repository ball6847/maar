export function formatSuccess(file: string, count: number): string {
  return `✓ ${file}: ${count} diagram${count === 1 ? "" : "s"}`;
}

export function formatWarning(file: string): string {
  return `⚠ ${file}: 0 diagrams`;
}

export function formatError(
  file: string,
  diagram: string,
  message: string,
): string {
  return `✗ ${file}: ${diagram} - ${message}`;
}

export function formatSummary(
  totalDiagrams: number,
  totalFiles: number,
): string {
  return `Done. Total: ${totalDiagrams} diagram${
    totalDiagrams === 1 ? "" : "s"
  } in ${totalFiles} file${totalFiles === 1 ? "" : "s"}.`;
}
