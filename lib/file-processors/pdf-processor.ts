import { readFile } from "fs/promises"
import path from "path"
import fs from "fs"

interface PDFMetadata {
  title?: string
  author?: string
  subject?: string
  keywords?: string[]
  creationDate?: string
  modificationDate?: string
  pageCount: number
  fileSize: number
}

export async function extractTextFromPdf(filePath: string): Promise<{ text: string; metadata: PDFMetadata }> {
  try {
    // Ensure the file exists before trying to read it
    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF file not found at path: ${filePath}`)
    }

    // Dynamically import pdf-parse to avoid webpack trying to resolve it during build
    const pdfParse = (await import('pdf-parse')).default
    
    const data = await readFile(filePath)
    const pdfData = await pdfParse(data)

    const metadata: PDFMetadata = {
      title: pdfData.info?.Title,
      author: pdfData.info?.Author,
      subject: pdfData.info?.Subject,
      keywords: pdfData.info?.Keywords ? pdfData.info.Keywords.split(',').map(k => k.trim()) : undefined,
      creationDate: pdfData.info?.CreationDate,
      modificationDate: pdfData.info?.ModDate,
      pageCount: pdfData.numpages,
      fileSize: data.length,
    }

    return {
      text: pdfData.text,
      metadata,
    }
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
