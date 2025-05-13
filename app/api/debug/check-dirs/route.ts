import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    const thumbnailDir = path.join(process.cwd(), "public", "uploads", "thumbnails")

    const uploadDirExists = fs.existsSync(uploadDir)
    const thumbnailDirExists = fs.existsSync(thumbnailDir)

    // Check if directories are writable
    let uploadDirWritable = false
    let thumbnailDirWritable = false

    if (uploadDirExists) {
      try {
        const testFile = path.join(uploadDir, ".test-write")
        fs.writeFileSync(testFile, "test")
        fs.unlinkSync(testFile)
        uploadDirWritable = true
      } catch (e) {
        uploadDirWritable = false
      }
    }

    if (thumbnailDirExists) {
      try {
        const testFile = path.join(thumbnailDir, ".test-write")
        fs.writeFileSync(testFile, "test")
        fs.unlinkSync(testFile)
        thumbnailDirWritable = true
      } catch (e) {
        thumbnailDirWritable = false
      }
    }

    return NextResponse.json({
      uploadDir: {
        path: uploadDir,
        exists: uploadDirExists,
        writable: uploadDirWritable,
      },
      thumbnailDir: {
        path: thumbnailDir,
        exists: thumbnailDirExists,
        writable: thumbnailDirWritable,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to check directories",
      },
      { status: 500 },
    )
  }
}
