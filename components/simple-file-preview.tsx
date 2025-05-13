"use client"

import { X, FileText, ImageIcon, FileSpreadsheet, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UploadedFile } from "@/components/file-uploader"

interface SimpleFilePreviewProps {
  file: UploadedFile
  onRemove: () => void
}

export function SimpleFilePreview({ file, onRemove }: SimpleFilePreviewProps) {
  const getFileIcon = () => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="w-5 h-5" />
    } else if (file.type === "application/pdf") {
      return <FileText className="w-5 h-5" />
    } else if (file.type === "text/csv") {
      return <FileSpreadsheet className="w-5 h-5" />
    } else {
      return <FileCode className="w-5 h-5" />
    }
  }

  const isImage = file.type.startsWith("image/")

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border bg-background">
      <div className="flex-shrink-0">
        {isImage ? (
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">{getFileIcon()}</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove</span>
      </Button>
    </div>
  )
}
