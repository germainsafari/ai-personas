"use client"

import { useRef, useState } from "react"
import { Upload } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export type UploadedFile = {
  id: string
  name: string
  type: string
  size: number
  url: string
  content?: string
  ocrApplied?: boolean
  thumbnail?: string
  metadata?: Record<string, any>
}

interface FileUploaderProps {
  onFileUpload: (file: UploadedFile) => void
  isUploading: boolean
  setIsUploading: (uploading: boolean) => void
}

export function FileUploader({
  onFileUpload,
  isUploading,
  setIsUploading,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const supportedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ]

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files: FileList) => {
    const file = files[0]

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      })
      return
    }

    if (!supportedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Only PDF, DOCX, TXT, CSV, JPG, PNG, GIF, and WEBP allowed",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-handler", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Upload failed:", errorText)
        throw new Error(errorText || `Upload failed: ${response.status}`)
      }

      const data = await response.json()
      setUploadProgress(100)

      console.log("Backend metadata:", data.metadata)

      onFileUpload({
        id: data.id,
        name: data.name,
        type: data.type,
        size: data.size,
        url: "", // Placeholder, set if using file preview
        content: data.content,
        ocrApplied: !!data.content,
        metadata: data.metadata,
      })

      toast({
        title: "Upload successful",
        description: `Title: ${data.metadata?.title || "N/A"}, Size: ${Math.round(data.size / 1024)} KB`,
      })
    } catch (error: any) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border",
          isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-accent/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          disabled={isUploading}
          accept=".pdf,.docx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp"
        />

        <div className="flex flex-col items-center justify-center py-2">
          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
          <p className="mb-1 text-sm font-medium">
            {isUploading ? "Uploading..." : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, DOCX, TXT, CSV, JPG, PNG, GIF, WEBP (max 10MB)
          </p>
        </div>

        {isUploading && (
          <div className="w-full mt-2">
            <Progress value={uploadProgress} className="h-2 w-full" />
            <p className="mt-1 text-xs text-center text-muted-foreground">Uploading...</p>
          </div>
        )}
      </div>
    </div>
  )
}
