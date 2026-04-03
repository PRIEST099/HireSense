import * as XLSX from "xlsx";
import { parseCSV, type ParsedCandidate } from "./csv-parser";

export function parseExcel(
  buffer: Buffer
): { candidates: ParsedCandidate[]; errors: string[]; warnings: string[] } {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const warnings: string[] = [];

  if (!sheetName) {
    return { candidates: [], errors: ["Excel file has no sheets"], warnings: [] };
  }

  if (workbook.SheetNames.length > 1) {
    warnings.push(`Excel file has ${workbook.SheetNames.length} sheets. Only the first sheet ("${sheetName}") was imported.`);
  }

  const sheet = workbook.Sheets[sheetName];
  const csvText = XLSX.utils.sheet_to_csv(sheet);

  const result = parseCSV(csvText);
  return { ...result, warnings };
}
