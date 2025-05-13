import { NextResponse } from "next/server"
import { join } from "path"
import path from "path"
import fs from "fs"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url)
    const id = url.searchParams.get("id")
    const filename = url.searchParams.get("filename")

    if (!id && !filename) {
      return NextResponse.json(
        { error: "Either document ID or filename is required" },
        { status: 400 }
      )
    }

    const processedDir = path.join(process.cwd(), "public", "processed")
    
    // Find the document
    let documentData = null

    if (id) {
      // Look for a file with this ID
      const files = fs.readdirSync(processedDir)
      const matchingFile = files.find(file => file.startsWith(`${id}.json`))
      
      if (matchingFile) {
        const filePath = join(processedDir, matchingFile)
        documentData = JSON.parse(fs.readFileSync(filePath, "utf-8"))
      }
    } else if (filename) {
      // Search by filename
      const files = fs.readdirSync(processedDir)
      
      for (const file of files) {
        const filePath = join(processedDir, file)
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
        
        if (data.name && data.name.toLowerCase() === filename.toLowerCase()) {
          documentData = data
          break
        }
      }
    }

    if (!documentData) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // Return the document content
    return NextResponse.json({
      id: documentData.id,
      name: documentData.name,
      type: documentData.type,
      content: documentData.content,
      metadata: documentData.metadata,
      summary: generateSummary(documentData.content)
    })
  } catch (error: any) {
    console.error("Error retrieving document content:", error)
    return NextResponse.json(
      { error: error.message || "Failed to retrieve document content" },
      { status: 500 }
    )
  }
}

// Helper function to generate a brief summary of the document
function generateSummary(content: string): string {
  if (!content) return "No content available";
  
  // Limit to first 5000 characters for summary generation
  const limitedContent = content.slice(0, 5000);
  
  // Extract first few paragraphs (up to 3)
  const paragraphs = limitedContent.split('\n\n')
    .filter(p => p.trim().length > 0)
    .slice(0, 3);
  
  if (paragraphs.length === 0) {
    return "Document contains no readable text.";
  }
  
  // Get document length info
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const pageEstimate = Math.ceil(wordCount / 500); // Rough estimate of pages
  
  return `${paragraphs.join('\n\n')}\n\n[Document contains approximately ${wordCount} words (about ${pageEstimate} pages)]`;
} 