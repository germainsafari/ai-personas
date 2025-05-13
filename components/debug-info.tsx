"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bug } from "lucide-react"

export function DebugInfo() {
  const [showDebug, setShowDebug] = useState(false)
  const [info, setInfo] = useState<any>(null)

  const checkEnvironment = async () => {
    try {
      // Check if we're in development mode
      const isDev = process.env.NODE_ENV === "development"

      // Check if directories exist
      const uploadDirCheck = await fetch("/api/debug/check-dirs")
      const uploadDirData = await uploadDirCheck.json()

      // Get browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        windowDimensions: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      }

      setInfo({
        isDev,
        uploadDirs: uploadDirData,
        browserInfo,
        timestamp: new Date().toISOString(),
      })

      setShowDebug(true)
    } catch (error) {
      console.error("Error fetching debug info:", error)
      setInfo({ error: "Failed to fetch debug info" })
      setShowDebug(true)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm" onClick={checkEnvironment}>
        <Bug className="h-4 w-4 mr-2" />
        Debug
      </Button>

      {showDebug && info && (
        <div className="absolute bottom-12 right-0 w-80 max-h-96 overflow-auto bg-background border rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Debug Information</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
              Close
            </Button>
          </div>
          <pre className="text-xs overflow-auto p-2 bg-muted rounded">{JSON.stringify(info, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
