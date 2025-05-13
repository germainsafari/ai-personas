import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + " bytes"
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB"
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }
}

export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) {
    return "image"
  } else if (mimeType === "application/pdf") {
    return "pdf"
  } else if (mimeType.includes("spreadsheet") || mimeType === "text/csv") {
    return "spreadsheet"
  } else if (mimeType.includes("document") || mimeType === "text/plain") {
    return "document"
  } else {
    return "file"
  }
}
