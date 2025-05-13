"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"

export function ApiKeyCheck() {
  const [isChecking, setIsChecking] = useState(true)
  const [hasApiKey, setHasApiKey] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        setIsChecking(true)
        const response = await fetch("/api/check-api-key")

        if (!response.ok) {
          let errorMessage = "Failed to check API key status"
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch (parseError) {
            errorMessage = response.statusText || errorMessage
          }
          setError(errorMessage)
          return
        }

        try {
          const data = await response.json()
          setHasApiKey(data.hasApiKey)
        } catch (parseError) {
          setError("Failed to parse response from server")
        }
      } catch (error: any) {
        setError(error.message || "An error occurred while checking API key")
        console.error("Error checking API key:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkApiKey()
  }, [])

  if (isChecking) return null

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error checking API key</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!hasApiKey) {
    return (
      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle>Using Simulated Responses</AlertTitle>
        <AlertDescription>
          The OpenAI API key is not configured. The app is using simulated responses instead of real AI.
          <br />
          This is fine for demonstration purposes, but for a production app, you would need to add your OpenAI API key.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
