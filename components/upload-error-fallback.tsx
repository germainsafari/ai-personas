"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface UploadErrorFallbackProps {
  error: string
  onRetry: () => void
}

export function UploadErrorFallback({ error, onRetry }: UploadErrorFallbackProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Upload Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{error}</p>
        <Button variant="outline" size="sm" className="w-fit" onClick={onRetry}>
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  )
}
