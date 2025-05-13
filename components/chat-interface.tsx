"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { usePersona } from "@/components/persona-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizonal, RefreshCw, Info, Paperclip, X } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { MessageActions } from "@/components/message-actions"
import { WelcomeScreen } from "@/components/welcome-screen"
import { PersonaBioModal } from "@/components/persona-bio-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileUploader, type UploadedFile } from "@/components/file-uploader"
import { SimpleFilePreview } from "@/components/simple-file-preview"
import { cn } from "@/lib/utils"

// Import the sendChatMessage utility
import { sendChatMessage } from "@/lib/api-utils"

export function ChatInterface({ personaId }: { personaId: string }) {
  const { selectedPersona, chatHistory, addMessage, activeBranch, hasActiveConversation, setHasActiveConversation } =
    usePersona()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isBioModalOpen, setIsBioModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const personaMessages = chatHistory[personaId] || []
  const currentBranchId = activeBranch[personaId] || "default"
  const branchMessages = personaMessages.filter((msg) => msg.branchId === currentBranchId)

  // Check if there's an active conversation when component mounts or when messages change
  useEffect(() => {
    if (branchMessages.length > 0 && !hasActiveConversation[personaId]) {
      setHasActiveConversation(personaId, true)
    }
  }, [branchMessages.length, hasActiveConversation, personaId, setHasActiveConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [branchMessages.length])

  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFiles((prev) => [...prev, file])
    setShowUploader(false)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  // Handle form submission with file attachments
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && uploadedFiles.length === 0) || !selectedPersona || isLoading) return

    // Clear any previous errors
    setError(null)

    // Create message content with file references if any
    let messageContent = input.trim()

    // If there are uploaded files, add them to the message
    if (uploadedFiles.length > 0) {
      if (messageContent) {
        messageContent += "\n\n"
      }

      messageContent += "I've uploaded the following files:\n"
      uploadedFiles.forEach((file, index) => {
        messageContent += `${index + 1}. ${file.name} (${file.type})\n`
      })
    }

    // Add user message
    const userMessage = {
      id: uuidv4(),
      content: messageContent,
      role: "user" as const,
      timestamp: new Date(),
      branchId: currentBranchId,
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    }

    addMessage(personaId, userMessage)
    setInput("")
    setUploadedFiles([])
    setIsLoading(true)
    scrollToBottom()
    setHasActiveConversation(personaId, true)

    try {
      // Get messages to send to API (limit to last 10 messages to avoid token limits)
      // Only include messages from the current branch
      const recentMessages = branchMessages.slice(-10).map(({ content, role }) => ({
        content,
        role,
      }))

      // Add the new user message
      recentMessages.push({
        content: messageContent,
        role: "user" as const,
      })

      // Prepare file contents for context
      let fileContext = ""
      if (uploadedFiles.length > 0) {
        fileContext = "Here are the contents of the uploaded files:\n\n"

        for (const file of uploadedFiles) {
          if (file.content) {
            fileContext += `--- File: ${file.name} (${file.type}) ---\n`
            fileContext += file.content
            fileContext += "\n\n"
          } else if (file.type.startsWith("image/")) {
            fileContext += `--- File: ${file.name} (${file.type}) ---\n`
            fileContext += "This is an image file. Please refer to it by name when discussing it.\n\n"
          }
        }
      }

      // Send the message to the API
      const result = await sendChatMessage({
        messages: recentMessages,
        systemPrompt: selectedPersona.systemPrompt,
        personaId,
        addMessage,
        currentBranchId,
        fileContext,
      })

      if (!result.success) {
        throw new Error(result.error)
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

    // If the message had files, restore them
    if (lastUserMessage.files) {
      setUploadedFiles(lastUserMessage.files)
    }
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
      handleSubmit(e as any)
    }
  }

  // If there's no active conversation, show the welcome screen
  if (!hasActiveConversation[personaId]) {
    return (
      <>
        <WelcomeScreen personaId={personaId} onStartConversation={() => setHasActiveConversation(personaId, true)} />
        <PersonaBioModal persona={selectedPersona} isOpen={isBioModalOpen} onClose={() => setIsBioModalOpen(false)} />
      </>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat header with persona info and bio button */}
      <div className="flex items-center p-3 border-b">
        <Avatar className="h-8 w-8 mr-3">
          <AvatarImage src={selectedPersona?.imageUrl || "/placeholder.svg"} alt={selectedPersona?.name} />
          <AvatarFallback>
            {selectedPersona?.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-sm font-medium">{selectedPersona?.name}</h2>
          <p className="text-xs text-muted-foreground">{selectedPersona?.title}</p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setIsBioModalOpen(true)}>
          <Info className="h-4 w-4" />
          View Bio
        </Button>
      </div>

      {/* Chat messages - with improved scrollable interface */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {branchMessages.map((message) => (
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

              {/* Display files if any - simplified version */}
              {message.files && message.files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.files.map((file) => (
                    <div key={file.id} className="p-2 bg-background/20 rounded text-xs">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-1 text-xs opacity-70">
                {new Intl.DateTimeFormat("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(message.timestamp))}
              </div>
            </div>
            <MessageActions messageId={message.id} personaId={personaId} isUserMessage={message.role === "user"} />
          </div>
        ))}

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

      {/* File uploader */}
      {showUploader && (
        <div className="border-t p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Upload Files</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowUploader(false)}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <FileUploader onFileUpload={handleFileUpload} isUploading={isUploading} setIsUploading={setIsUploading} />
        </div>
      )}

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="border-t p-4">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <SimpleFilePreview key={file.id} file={file} onRemove={() => removeFile(file.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("flex-shrink-0", showUploader && "text-primary")}
            onClick={() => setShowUploader(!showUploader)}
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach files</span>
          </Button>

          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              uploadedFiles.length > 0
                ? "Ask about the uploaded files or type a message..."
                : `Ask ${selectedPersona?.name} anything...`
            }
            disabled={isLoading || isUploading}
            className="min-h-[44px] max-h-[200px] resize-none"
            rows={1}
          />

          <Button
            type="submit"
            size="icon"
            disabled={isLoading || isUploading || (!input.trim() && uploadedFiles.length === 0)}
          >
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>

      {/* Bio modal */}
      <PersonaBioModal persona={selectedPersona} isOpen={isBioModalOpen} onClose={() => setIsBioModalOpen(false)} />
    </div>
  )
}
