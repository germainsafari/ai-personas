import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Updated LangChain imports (modular packages)
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "@langchain/community/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "@langchain/community/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";

// Pinecone
import { Pinecone } from "@pinecone-database/pinecone";
// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: Request) {
  try {
    // Ensure upload directories exist
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    const processedDir = path.join(process.cwd(), "public", "processed")

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      if (!fs.existsSync(processedDir)) {
        fs.mkdirSync(processedDir, { recursive: true })
      }
    } catch (dirError) {
      console.error("Error creating directories:", dirError)
      return NextResponse.json(
        { error: "Server configuration error: Could not create upload directories" },
        { status: 500 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    // Create unique ID and filename
    const id = uuidv4()
    const fileExtension = file.name.split(".").pop() || ""
    const fileName = `${id}.${fileExtension}`

    // Save file to disk
    const filePath = join(uploadDir, fileName)
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, fileBuffer)

    // Process the document based on its type
    let content = ""
    let metadata = {}

    try {
      switch (file.type) {
        case "application/pdf":
          const pdfLoader = new PDFLoader(filePath)
          const pdfDocs = await pdfLoader.load()
          content = pdfDocs.map((doc) => doc.pageContent).join("\n")
          metadata = pdfDocs[0]?.metadata || {}
          break

        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          const docxLoader = new DocxLoader(filePath)
          const docxDocs = await docxLoader.load()
          content = docxDocs.map((doc) => doc.pageContent).join("\n")
          metadata = docxDocs[0]?.metadata || {}
          break

        case "text/plain":
          const textLoader = new TextLoader(filePath)
          const textDocs = await textLoader.load()
          content = textDocs.map((doc) => doc.pageContent).join("\n")
          metadata = textDocs[0]?.metadata || {}
          break

        case "text/csv":
          const csvLoader = new CSVLoader(filePath)
          const csvDocs = await csvLoader.load()
          content = csvDocs.map((doc) => doc.pageContent).join("\n")
          metadata = csvDocs[0]?.metadata || {}
          break

        default:
          content = "Unsupported file type for text extraction"
      }
    } catch (error) {
      console.error("Error processing document:", error)
      return NextResponse.json(
        { error: "Failed to process document" },
        { status: 500 },
      )
    }

    // Split content into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    const chunks = await splitter.createDocuments([content], [
      {
        id,
        name: file.name,
        type: file.type,
        url: `/uploads/${fileName}`,
        metadata,
      },
    ])

    // Generate embeddings and store in Pinecone
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    const index = pinecone.index("quickstart-js")
    
    // Store chunks in Pinecone
    for (const chunk of chunks) {
      const embedding = await embeddings.embedQuery(chunk.pageContent)
      await index.upsert({
        vectors: [{
          id: `${id}-${chunks.indexOf(chunk)}`,
          values: embedding,
          metadata: {
            text: chunk.pageContent,
            documentId: id,
            fileName: file.name,
            fileType: file.type,
            url: `/uploads/${fileName}`,
            ...chunk.metadata,
          },
        }],
      })
    }

    // Save processed content
    const processedPath = join(processedDir, `${id}.json`)
    const processedData = {
      id,
      name: file.name,
      type: file.type,
      size: file.size,
      content,
      metadata,
      url: `/uploads/${fileName}`,
      processedAt: new Date().toISOString(),
      chunks: chunks.length,
    }

    await writeFile(processedPath, JSON.stringify(processedData, null, 2))

    return NextResponse.json(processedData)
  } catch (error: any) {
    console.error("Document processing error:", error)
    return NextResponse.json(
      { error: error.message || "Document processing failed" },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const processedDir = path.join(process.cwd(), "public", "processed")
    const files = fs.readdirSync(processedDir)
    
    const documents = files
      .filter(file => file.endsWith(".json"))
      .map(file => {
        const content = JSON.parse(fs.readFileSync(join(processedDir, file), "utf-8"))
        return {
          id: content.id,
          name: content.name,
          type: content.type,
          size: content.size,
          url: content.url,
          processedAt: content.processedAt,
          chunks: content.chunks,
        }
      })

    return NextResponse.json({ documents })
  } catch (error: any) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch documents" },
      { status: 500 },
    )
  }
} 