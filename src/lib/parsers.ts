import Papa from "papaparse";
import type { ParsedFile, DataRow } from "../types/data";

export async function parseCsv(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse<DataRow>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        resolve({ fileName: file.name, headers, rows: result.data });
      },
      error: reject,
    });
  });
}

export async function parseExcel(file: File): Promise<ParsedFile> {
  // ExcelJS runs in Node; in the browser we use its stream/buffer API.
  const { default: ExcelJS } = await import("exceljs");
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("No worksheets found in file.");

  const rawHeaders: string[] = [];
  sheet.getRow(1).eachCell((cell) => rawHeaders.push(String(cell.value ?? "")));

  const rows: DataRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: DataRow = {};
    rawHeaders.forEach((header, i) => {
      const cell = row.getCell(i + 1);
      record[header] = (cell.value as string | number | null) ?? null;
    });
    rows.push(record);
  });

  return { fileName: file.name, headers: rawHeaders, rows };
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") return parseCsv(file);
  if (ext === "xls" || ext === "xlsx") return parseExcel(file);
  throw new Error(`Unsupported file type: .${ext}`);
}
