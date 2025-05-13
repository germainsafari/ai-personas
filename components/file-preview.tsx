"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { X, FileText, ImageIcon, FileSpreadsheet, FileCode, ExternalLink, Download, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { UploadedFile } from "@/components/file-uploader"

interface FilePreviewProps {
  file: UploadedFile
  onRemove: () => void
  inMessage?: boolean
}

export function FilePreview({ file, onRemove, inMessage = false }: FilePreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [showOcrText, setShowOcrText] = useState(false)

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
  const isPdf = file.type === "application/pdf"
  const hasOcr = file.ocrApplied && file.content

  return (
    <>
      <div
        className={cn("flex items-center gap-2 p-2 rounded-lg border", inMessage ? "bg-secondary/50" : "bg-background")}
      >
        <div className="flex-shrink-0">
          {isImage && file.thumbnail ? (
            <div
              className="w-10 h-10 rounded bg-center bg-cover cursor-pointer"
              style={{ backgroundImage: `url(${file.thumbnail})` }}
              onClick={() => setPreviewOpen(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">{getFileIcon()}</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate" title={file.name}>
              {file.name}
            </p>
            {hasOcr && (
              <Badge variant="outline" className="text-xs bg-primary/10">
                <Type className="h-3 w-3 mr-1" />
                OCR
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
        </div>

        <div className="flex gap-1">
          {!inMessage && (
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
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              setPreviewOpen(true)
            }}
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">Preview</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              window.open(file.url, "_blank")
            }}
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {file.name}
              {hasOcr && (
                <Badge variant="outline" className="ml-2">
                  <Type className="h-3 w-3 mr-1" />
                  OCR Applied
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 max-h-[70vh] overflow-auto">
            {isImage ? (
              <div className="space-y-4">
                <img
                  src={file.url || "/placeholder.svg"}
                  alt={file.name}
                  className="max-w-full h-auto rounded-lg mx-auto"
                />

                {hasOcr && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Extracted Text (OCR)</h3>
                      <Button variant="outline" size="sm" onClick={() => setShowOcrText(!showOcrText)}>
                        {showOcrText ? "Hide Text" : "Show Text"}
                      </Button>
                    </div>

                    {showOcrText && (
                      <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">{file.content}</div>
                    )}
                  </div>
                )}
              </div>
            ) : isPdf ? (
              <iframe src={`${file.url}#view=FitH`} className="w-full h-[70vh] rounded-lg" />
            ) : (
              <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                {file.content || "Preview not available for this file type"}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
