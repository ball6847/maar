export interface DiagramLink {
  lineIndex: number;
  mmdPath: string;
  originalLine: string;
  linkText: string;
}

export interface RenderResult {
  success: boolean;
  ascii?: string;
  error?: string;
}

export type DiagramResult =
  | { status: "success"; path: string }
  | { status: "error"; path: string; message: string };

export interface FileResult {
  filePath: string;
  count: number;
  diagrams: DiagramResult[];
}
