// Placeholder — data shape to be defined once the input format is agreed upon.
// Each row from the uploaded file will be typed here.
export type DataRow = Record<string, string | number | null>;

export interface ParsedFile {
  fileName: string;
  headers: string[];
  rows: DataRow[];
}

export type FileFormat = "csv" | "xls" | "xlsx";
