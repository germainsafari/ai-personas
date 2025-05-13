"use client"

import type React from "react"
import { useRef, useState } from "react"
import { usePersona } from "@/components/persona-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizonal, RefreshCw } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { MessageActions } from "@/components/message-actions"

export function AIChat({ personaId }: { personaId: string }) {
  const { selectedPersona, chatHistory, addMessage, activeBranch } = usePersona()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const personaMessages = chatHistory[personaId] || []
  const currentBranchId = activeBranch[personaId] || "default"
  const branchMessages = personaMessages.filter((msg) => msg.branchId === currentBranchId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedPersona) return

    // Clear any previous errors
    setError(null)

    // Add user message
    const userMessage = {
      id: uuidv4(),
      content: input,
      role: "user" as const,
      timestamp: new Date(),
      branchId: currentBranchId,
    }

    addMessage(personaId, userMessage)
    setInput("")
    setIsLoading(true)
    scrollToBottom()

    try {
      // Get messages to send to API (limit to last 10 messages to avoid token limits)
      // Only include messages from the current branch
      const recentMessages = branchMessages.slice(-10).map(({ content, role }) => ({
        content,
        role,
      }))

      // Add the new user message
      recentMessages.push({
        content: input.trim(),
        role: "user" as const,
      })

      // Call the API with a timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: recentMessages,
            systemPrompt: selectedPersona.systemPrompt,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Try to parse the response as JSON
        let data
        try {
          data = await response.json()
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", parseError)
          throw new Error("Failed to parse response from server")
        }

        // Check if the response contains an error
        if (!response.ok || data.error) {
          throw new Error(data.error || "Failed to get a response")
        }

        // Check if the response contains the expected data
        if (!data || typeof data.content !== "string") {
          console.error("Invalid response format:", data)
          throw new Error("Invalid response format from server")
        }

        // Add AI response to chat history
        const aiMessage = {
          id: uuidv4(),
          content: data.content,
          role: "assistant" as const,
          timestamp: new Date(),
          branchId: currentBranchId,
        }

        addMessage(personaId, aiMessage)
      } catch (fetchError: any) {
        if (fetchError.name === "AbortError") {
          throw new Error("Request timed out. Please try again.")
        }
        throw fetchError
      }
    } catch (error: any) {
      console.error("Chat error:", error)
      setError(error.message || "Failed to get a response. Please try again.")
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
      scrollToBottom()
    }
  }

  // Function to retry the last message
  const handleRetry = () => {
    // Find the last user message in the current branch
    const lastUserMessageIndex = [...branchMessages].reverse().findIndex((m) => m.role === "user")
    if (lastUserMessageIndex === -1) return

    const lastUserMessage = [...branchMessages].reverse()[lastUserMessageIndex]

    // Set the input to the last user message and clear the error
    setInput(lastUserMessage.content)
    setError(null)
  }

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
    }, 100)
  }

  // Handle textarea resize
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {branchMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Ask {selectedPersona?.name} anything...</p>
          </div>
        ) : (
          branchMessages.map((message) => (
            <div
              key={message.id}
              className={`group relative flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] shadow-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground dark:bg-secondary/80"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="mt-1 text-xs opacity-70">
                  {new Intl.DateTimeFormat("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(message.timestamp))}
                </div>
              </div>
              <MessageActions messageId={message.id} personaId={personaId} isUserMessage={message.role === "user"} />
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-lg px-4 py-2 shadow-sm dark:bg-secondary/80">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-2 max-w-[80%]">
              <p className="text-sm">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRetry} className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex items-center space-x-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${selectedPersona?.name} anything...`}
            disabled={isLoading}
            className="min-h-[44px] max-h-[200px] resize-none"
            rows={1}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
