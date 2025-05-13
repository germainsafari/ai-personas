import { mkdir } from "fs/promises"
import { join } from "path"
import sharp from "sharp"
import { extractTextFromImage, imageContainsText } from "./ocr-processor"

export async function generateThumbnail(filePath: string, id: string, fileExtension: string): Promise<string> {
  try {
    // Create thumbnails directory if it doesn't exist
    const thumbnailDir = join(process.cwd(), "public", "uploads", "thumbnails")
    await mkdir(thumbnailDir, { recursive: true })

    // Generate thumbnail
    const thumbnailPath = join(thumbnailDir, `${id}_thumb.${fileExtension}`)

    await sharp(filePath)
      .resize(200, 200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFile(thumbnailPath)

    return thumbnailPath
  } catch (error) {
    console.error("Error generating thumbnail:", error)
    throw error
  }
}

export async function processImage(filePath: string): Promise<string | null> {
  try {
    // First check if the image likely contains text to avoid unnecessary processing
    const hasText = await imageContainsText(filePath)

    if (hasText) {
      // Extract text using OCR
      const extractedText = await extractTextFromImage(filePath)
      return extractedText
    }

    return null
  } catch (error) {
    console.error("Error processing image:", error)
    return null
  }
}
