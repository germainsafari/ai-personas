"use client"

import type React from "react"
import { useRef, useState } from "react"
import { usePersona } from "@/components/persona-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizonal } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

// Helper function to detect ambiguous queries
function isAmbiguousQuery(query: string): boolean {
  // Convert to lowercase for comparison
  const text = query.toLowerCase().trim()

  // Check if it's a single word or very short phrase
  if (text.split(/\s+/).length <= 2) {
    // List of common ambiguous topics
    const ambiguousTopics = [
      "brand",
      "branding",
      "marketing",
      "strategy",
      "design",
      "social media",
      "content",
      "campaign",
      "digital",
      "analytics",
    ]

    // Check if the query matches any ambiguous topics
    return ambiguousTopics.some((topic) => text === topic || text.includes(topic))
  }

  return false
}

// Topic-specific clarification templates
const topicClarifications = {
  brand:
    'Could you please clarify what you\'re looking for regarding "brand"? Are you interested in:\n\n• Branding guidelines or assets?\n• Brand strategy or positioning?\n• A specific brand (your own or another)?\n• Help defining or improving a brand?\n\nLet me know so I can assist you more effectively.',
  marketing:
    "When you mention \"marketing\", which aspect are you most interested in discussing?\n\n• Digital marketing strategies?\n• Content marketing approaches?\n• Marketing analytics and measurement?\n• Campaign planning and execution?\n\nI'd be happy to focus our conversation on what's most relevant to you.",
  strategy:
    "I'd be glad to discuss strategy. To help you better, could you specify which type of strategy you're referring to?\n\n• Brand strategy?\n• Marketing strategy?\n• Content strategy?\n• Social media strategy?\n• Business strategy?\n\nThis will help me provide more targeted insights.",
}

export function FallbackChat({ personaId }: { personaId: string }) {
  const { selectedPersona, chatHistory, addMessage } = usePersona()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const personaMessages = chatHistory[personaId] || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedPersona) return

    // Add user message
    const userMessage = {
      id: uuidv4(),
      content: input,
      role: "user" as const,
      timestamp: new Date(),
    }

    addMessage(personaId, userMessage)
    setInput("")
    setIsLoading(true)
    scrollToBottom()

    try {
      // Simulate AI response with a delay
      setTimeout(() => {
        let aiResponse = ""

        // Check if this is an ambiguous query that needs clarification
        if (isAmbiguousQuery(input)) {
          // Find the appropriate clarification response
          for (const [topic, response] of Object.entries(topicClarifications)) {
            if (input.toLowerCase().includes(topic)) {
              aiResponse = response
              break
            }
          }

          // Default clarification for other ambiguous queries
          if (!aiResponse) {
            aiResponse =
              "I'd be happy to help with that. Could you share a bit more about what specific aspect you're interested in so I can provide the most relevant insights?"
          }
        } else {
          // For non-ambiguous queries, generate a more conversational response
          aiResponse = generateSimulatedResponse(input, selectedPersona)
        }

        const aiMessage = {
          id: uuidv4(),
          content: aiResponse,
          role: "assistant" as const,
          timestamp: new Date(),
        }
        addMessage(personaId, aiMessage)
        setIsLoading(false)
        inputRef.current?.focus()
        scrollToBottom()
      }, 1000)
    } catch (error) {
      console.error("Error generating response:", error)
      setIsLoading(false)
    }
  }

  // Function to generate a simulated response based on the persona
  const generateSimulatedResponse = (userInput: string, persona: any): string => {
    // More conversational responses that end with questions
    const responses = [
      `As a ${persona.title}, I would approach this by considering the brand guidelines first. What specific challenges are you facing in this area?`,
      `That's an interesting question! In my experience with brand compliance, I've found that clear communication is key. Have you established communication channels for your team?`,
      `From my perspective as ${persona.name}, I would recommend focusing on consistency across touchpoints. Which aspects of this are most important to your organization?`,
      `Great point. When dealing with these types of situations, I typically advise teams to document their processes. Would you like me to elaborate on any particular aspect?`,
      `Based on my experience in ${persona.title}, I would suggest starting with a brand audit. Is there a specific area you'd like to prioritize?`,
      `This is a common challenge in brand management. My approach would be to align stakeholders first. What stakeholders are involved in your situation?`,
      `I've seen similar situations before. The key is to balance creativity with consistency. What's your current approach to this balance?`,
      `Looking at this from a ${persona.title}'s perspective, I would prioritize audience needs. Have you conducted any audience research recently?`,
    ]

    return responses[Math.floor(Math.random() * responses.length)]
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
        {personaMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Ask {selectedPersona?.name} anything...</p>
          </div>
        ) : (
          personaMessages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] shadow-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
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
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-lg px-4 py-2 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
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
