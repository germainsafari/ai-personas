import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    console.log('Received request to process document');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file provided in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}`);

    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), 'tmp');
    await mkdir(tempDir, { recursive: true });

    // Create a temporary file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(tempDir, `${uuidv4()}-${file.name}`);
    await writeFile(tempPath, buffer);

    console.log(`Created temporary file at: ${tempPath}`);

    // Forward the file to Python backend
    const formDataForBackend = new FormData();
    formDataForBackend.append('file', new Blob([buffer], { type: file.type }), file.name);

    console.log('Sending request to Python backend...');
    const response = await fetch(`${PYTHON_BACKEND_URL}/process-document`, {
      method: 'POST',
      body: formDataForBackend,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Python backend error:', error);
      throw new Error(error.detail || 'Failed to process document');
    }

    const result = await response.json();
    console.log('Successfully processed document');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process document',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 