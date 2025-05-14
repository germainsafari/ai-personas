import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { lookup } from 'mime-types'

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'https://backend-2-kt4y.onrender.com'

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
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate file metadata
    const id = uuidv4()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const fileType = file.type || lookup(ext) || 'application/octet-stream'

    const fileInfo = {
      id,
      name: file.name,
      type: fileType,
      size: file.size,
    }

    // Stream file directly to backend (no saving to disk)
    const buffer = Buffer.from(await file.arrayBuffer())
    const backendFormData = new FormData()
    backendFormData.append('file', new Blob([buffer], { type: fileType }), file.name)

    const response = await fetch(`${PYTHON_BACKEND_URL}/process-document`, {
      method: 'POST',
      body: backendFormData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to process document')
    }

    const result = await response.json()

    // Combine file info with processing result
    return NextResponse.json({
      ...fileInfo,
      ...result,
      processedAt: result.processedAt || new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Upload handler error:', error)
    return NextResponse.json(
      { error: 'Failed to upload or process file', details: error.message },
      { status: 500 }
    )
  }
}
