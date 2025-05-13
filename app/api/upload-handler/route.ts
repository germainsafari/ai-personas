import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { lookup } from 'mime-types'

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const id = uuidv4()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const uniqueName = `${id}.${ext}`
    const savePath = path.join(uploadDir, uniqueName)

    // Convert File to Buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(savePath, buffer)

    // Get file type
    const fileType = file.type || lookup(ext) || 'application/octet-stream'

    const fileInfo = {
      id,
      name: file.name,
      type: fileType,
      size: buffer.length,
      url: `/uploads/${uniqueName}`,
    }

    // For supported document types, process the document
    const supportedTypes = ['pdf', 'docx', 'txt', 'csv', 'jpg', 'jpeg', 'png', 'tiff', 'bmp']
    if (supportedTypes.includes(ext.toLowerCase())) {
      try {
        // Create FormData for Python backend
        const processFormData = new FormData()
        processFormData.append('file', new Blob([buffer], { type: fileType }), file.name)

        // Send to Python backend for processing
        const response = await fetch(`${PYTHON_BACKEND_URL}/process-document`, {
          method: 'POST',
          body: processFormData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.detail || 'Failed to process document')
        }

        const processResult = await response.json()

        // Combine file info with processing results
        const result = {
          ...fileInfo,
          content: processResult.content,
          metadata: processResult.metadata,
          chunks: processResult.chunks,
          processedAt: processResult.processedAt,
          // Add any other fields from processResult that you need
        }

        // Return the combined result
        return NextResponse.json(result)
      } catch (error: any) {
        console.error('Document processing error:', error)
        return NextResponse.json(
          { 
            error: 'Document processing failed',
            details: error.message,
            fileInfo 
          },
          { status: 500 }
        )
      }
    }

    // For unsupported types, just return file info
    return NextResponse.json(fileInfo)
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    )
  }
} 