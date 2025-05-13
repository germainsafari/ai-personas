import { readFile } from "fs/promises"
import mammoth from "mammoth"

export async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const buffer = await readFile(filePath)
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error("Error extracting text from DOCX:", error)
    return "Error extracting text from DOCX"
  }
}
