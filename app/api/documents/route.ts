import { NextResponse } from "next/server";
import { writeFile, readFileSync, readdirSync } from "fs/promises";
import { join } from "path";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Correct loader imports
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";

// These two stay in core `langchain`
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Embeddings
import { OpenAIEmbeddings } from "@langchain/openai";

// Pinecone client
import { Pinecone } from "@pinecone-database/pinecone";

// Init Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PROCESSED_DIR = path.join(process.cwd(), "public", "processed");

export async function POST(request: Request) {
  try {
    [UPLOAD_DIR, PROCESSED_DIR].forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE)
      return NextResponse.json({ error: "File too large" }, { status: 400 });

    const id = uuidv4();
    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${id}.${ext}`;
    const filePath = join(UPLOAD_DIR, fileName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    let content = "";
    let metadata = {};

    switch (file.type) {
      case "application/pdf": {
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();
        content = docs.map((d) => d.pageContent).join("\n");
        metadata = docs[0]?.metadata || {};
        break;
      }
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        const loader = new DocxLoader(filePath);
        const docs = await loader.load();
        content = docs.map((d) => d.pageContent).join("\n");
        metadata = docs[0]?.metadata || {};
        break;
      }
      case "text/plain": {
        const loader = new TextLoader(filePath);
        const docs = await loader.load();
        content = docs.map((d) => d.pageContent).join("\n");
        metadata = docs[0]?.metadata || {};
        break;
      }
      case "text/csv": {
        const loader = new CSVLoader(filePath);
        const docs = await loader.load();
        content = docs.map((d) => d.pageContent).join("\n");
        metadata = docs[0]?.metadata || {};
        break;
      }
      default:
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.createDocuments([content], [
      {
        id,
        name: file.name,
        type: file.type,
        url: `/uploads/${fileName}`,
        metadata,
      },
    ]);

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const index = pinecone.index("quickstart-js");

    for (const [i, chunk] of chunks.entries()) {
      const embedding = await embeddings.embedQuery(chunk.pageContent);
      await index.upsert({
        vectors: [
          {
            id: `${id}-${i}`,
            values: embedding,
            metadata: {
              text: chunk.pageContent,
              documentId: id,
              fileName: file.name,
              fileType: file.type,
              url: `/uploads/${fileName}`,
              ...chunk.metadata,
            },
          },
        ],
      });
    }

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
    };

    await writeFile(join(PROCESSED_DIR, `${id}.json`), JSON.stringify(processedData, null, 2));

    return NextResponse.json(processedData);
  } catch (error: any) {
    console.error("Fatal processing error:", error);
    return NextResponse.json(
      { error: error.message || "Document processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const files = fs.readdirSync(PROCESSED_DIR);
    const documents = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const data = JSON.parse(readFileSync(join(PROCESSED_DIR, f), "utf-8"));
        return {
          id: data.id,
          name: data.name,
          type: data.type,
          size: data.size,
          url: data.url,
          processedAt: data.processedAt,
          chunks: data.chunks,
        };
      });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list documents" },
      { status: 500 }
    );
  }
}
