import type { UploadedFile } from "@/components/file-uploader"

export type Persona = {
  id: string
  name: string
  title: string
  imageUrl: string
  about: string
  needs: string
  characteristics: string
  quotes: string
  challenges: string
  systemPrompt: string
}

export type Message = {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: Date
  branchId?: string // For conversation branching
  parentId?: string // For conversation branching
  files?: UploadedFile[] // For file attachments
}

export type Branch = {
  id: string
  name: string
  createdAt: Date
  parentMessageId?: string // Message where the branch was created
}

export type ChatExportFormat = "text" | "json" | "markdown"
