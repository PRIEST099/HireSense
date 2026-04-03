import * as XLSX from "xlsx";
import { parseCSV, type ParsedCandidate } from "./csv-parser";

export function parseExcel(
  buffer: Buffer
): { candidates: ParsedCandidate[]; errors: string[] } {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return { candidates: [], errors: ["Excel file has no sheets"] };
  }

  const sheet = workbook.Sheets[sheetName];
  const csvText = XLSX.utils.sheet_to_csv(sheet);

  return parseCSV(csvText);
}
