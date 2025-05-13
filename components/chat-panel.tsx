"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { usePersona } from "@/components/persona-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendHorizonal } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import type { Message } from "@/types/persona"

interface ChatPanelProps {
  personaId: string
}

export function ChatPanel({ personaId }: ChatPanelProps) {
  const { selectedPersona, chatHistory, addMessage } = usePersona()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const personaMessages = chatHistory[personaId] || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedPersona) return

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }
    addMessage(personaId, userMessage)
    setInput("")
    setIsLoading(true)

    try {
      // In a real implementation, we would call an API to get the AI response
      // For now, simulate a delay and return a canned response
      setTimeout(() => {
        const aiMessage: Message = {
          id: uuidv4(),
          content: generateAIResponse(input, selectedPersona?.title || ""),
          role: "assistant",
          timestamp: new Date(),
        }
        addMessage(personaId, aiMessage)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error getting AI response:", error)
      setIsLoading(false)
    }
  }

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [personaMessages])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {personaMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-500">Ask {selectedPersona?.name} anything...</p>
            </div>
          ) : (
            personaMessages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

// Helper function to generate responses
function generateAIResponse(userMessage: string, personaTitle: string): string {
  // In a production app, this would be replaced with a call to an LLM API
  const responses = [
    `As a ${personaTitle}, I need to consider various compliance factors here. Let me think about this...`,
    `That's an interesting point! From my perspective in ${personaTitle}, I would approach this by...`,
    `Given my experience in brand compliance, I would recommend focusing on regulatory guidelines first...`,
    `Good question! When dealing with brand identity, we always need to balance creativity with consistency...`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}
