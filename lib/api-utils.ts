import { v4 as uuidv4 } from "uuid"
import type { Message } from "@/types/persona"
import type { UploadedFile } from "@/components/file-uploader"

/**
 * Send a message to the chat API and handle the response
 */
export async function sendChatMessage({
  messages,
  systemPrompt,
  personaId,
  addMessage,
  currentBranchId = "default",
  fileContext = "",
}: {
  messages: { content: string; role: string; files?: UploadedFile[] }[]
  systemPrompt: string
  personaId: string
  addMessage: (personaId: string, message: Message) => void
  currentBranchId?: string
  fileContext?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Call the API with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout (increased for file processing)

    // Enhance system prompt with file context if available
    let enhancedSystemPrompt = systemPrompt
    if (fileContext) {
      enhancedSystemPrompt += "\n\n" + fileContext
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages.map(({ content, role }) => ({ content, role })),
        systemPrompt: enhancedSystemPrompt,
        fileContext,
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
    const aiMessage: Message = {
      id: uuidv4(),
      content: data.content,
      role: "assistant",
      timestamp: new Date(),
      branchId: currentBranchId,
    }

    addMessage(personaId, aiMessage)
    return { success: true }
  } catch (error: any) {
    if (error.name === "AbortError") {
      return { success: false, error: "Request timed out. Please try again." }
    }
    return { success: false, error: error.message || "Failed to get a response. Please try again." }
  }
}
