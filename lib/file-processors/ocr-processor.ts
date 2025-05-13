import { createWorker } from "tesseract.js"
import fs from "fs/promises"

export async function extractTextFromImage(filePath: string): Promise<string> {
  try {
    // Check if file exists
    await fs.access(filePath)

    try {
      // Create a worker
      const worker = await createWorker("eng")

      // Recognize text
      const { data } = await worker.recognize(filePath)

      // Terminate worker
      await worker.terminate()

      // Return extracted text or a message if no text was found
      if (data.text.trim()) {
        return data.text.trim()
      } else {
        return "No text was detected in this image."
      }
    } catch (tesseractError) {
      console.error("Tesseract error:", tesseractError)
      return "OCR processing is currently unavailable. The image was uploaded but text could not be extracted."
    }
  } catch (error) {
    console.error("Error extracting text from image:", error)
    return "Error extracting text from image."
  }
}

// Function to check if an image likely contains text (optional optimization)
export async function imageContainsText(filePath: string): Promise<boolean> {
  try {
    try {
      const worker = await createWorker("eng")

      // Use low confidence detection to quickly check for text
      worker.setParameters({
        tessedit_do_invert: "0",
        tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?:;'\"-()[]{}",
      })

      const { data } = await worker.recognize(filePath)
      await worker.terminate()

      // If we have more than a few characters, assume there's text
      return data.text.trim().length > 10
    } catch (tesseractError) {
      console.error("Tesseract error in imageContainsText:", tesseractError)
      // If Tesseract fails, assume there might be text
      return true
    }
  } catch (error) {
    console.error("Error checking if image contains text:", error)
    return false
  }
}
