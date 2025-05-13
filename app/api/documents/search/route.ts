import { NextResponse } from "next/server"
import { join } from "path"
import path from "path"
import fs from "fs"
import { OpenAIEmbeddings } from "@langchain/openai"
import { Pinecone } from "@pinecone-database/pinecone"

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_ENVIRONMENT || "gcp-starter"
})

interface SearchFilters {
  type?: string
  minSize?: number
  maxSize?: number
  dateRange?: {
    start?: string
    end?: string
  }
  metadata?: {
    [key: string]: any
  }
}

export async function POST(request: Request) {
  try {
    const { query, filters, limit = 5 } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    // Generate embedding for the query
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })
    const queryEmbedding = await embeddings.embedQuery(query)

    // Build filter object
    const filterObject: any = {}
    
    if (filters) {
      const searchFilters = filters as SearchFilters
      
      if (searchFilters.type) {
        filterObject.fileType = searchFilters.type
      }
      
      if (searchFilters.minSize || searchFilters.maxSize) {
        filterObject.size = {}
        if (searchFilters.minSize) filterObject.size.$gte = searchFilters.minSize
        if (searchFilters.maxSize) filterObject.size.$lte = searchFilters.maxSize
      }
      
      if (searchFilters.dateRange) {
        filterObject.processedAt = {}
        if (searchFilters.dateRange.start) filterObject.processedAt.$gte = searchFilters.dateRange.start
        if (searchFilters.dateRange.end) filterObject.processedAt.$lte = searchFilters.dateRange.end
      }
      
      if (searchFilters.metadata) {
        Object.entries(searchFilters.metadata).forEach(([key, value]) => {
          filterObject[`metadata.${key}`] = value
        })
      }
    }

    // Search in Pinecone
    const index = pinecone.index("quickstart-js")
    const searchResults = await index.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      filter: Object.keys(filterObject).length > 0 ? filterObject : undefined,
    })

    // Format results and group by document
    const documentMap = new Map()
    
    searchResults.matches.forEach((match) => {
      const docId = match.metadata?.documentId
      if (!docId) return
      
      if (!documentMap.has(docId)) {
        documentMap.set(docId, {
          id: docId,
          name: match.metadata?.fileName,
          type: match.metadata?.fileType,
          url: match.metadata?.url,
          metadata: match.metadata,
          chunks: [],
          score: match.score,
        })
      }
      
      documentMap.get(docId).chunks.push({
        text: match.metadata?.text,
        score: match.score,
      })
    })

    // Convert map to array and sort by score
    const formattedResults = Array.from(documentMap.values())
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({
      results: formattedResults,
      total: formattedResults.length,
    })
  } catch (error: any) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 },
    )
  }
} 