import { readFile } from "fs/promises"
import { parse } from "csv-parse/sync"

export async function extractTextFromCsv(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, "utf-8")
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
    })

    // Convert CSV to a readable text format
    let result = ""

    // Add headers
    if (records.length > 0) {
      const headers = Object.keys(records[0])
      result += headers.join(", ") + "\n"
    }

    // Add rows
    records.forEach((record: any, index: number) => {
      const values = Object.values(record)
      result += values.join(", ")
      if (index < records.length - 1) {
        result += "\n"
      }
    })

    return result
  } catch (error) {
    console.error("Error extracting text from CSV:", error)
    return "Error extracting text from CSV"
  }
}
