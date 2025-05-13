"use client"

import { useState } from "react"
import { usePersona } from "@/components/persona-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SendHorizonal,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Target,
  BarChart,
  Users,
  Info,
  Paperclip,
  X,
} from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PersonaBioModal } from "@/components/persona-bio-modal"
import { cn } from "@/lib/utils"

// Import the sendChatMessage utility
import { sendChatMessage } from "@/lib/api-utils"

// Add imports for file upload components
import { FileUploader, type UploadedFile } from "@/components/file-uploader"
import { SimpleFilePreview } from "@/components/simple-file-preview"

interface WelcomeScreenProps {
  personaId: string
  onStartConversation: () => void
}

export function WelcomeScreen({ personaId, onStartConversation }: WelcomeScreenProps) {
  const { selectedPersona, addMessage } = usePersona()
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBioModalOpen, setIsBioModalOpen] = useState(false)

  // Add state for file uploads
  const [isUploading, setIsUploading] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  if (!selectedPersona) return null

  // Generate persona-specific prompts based on their role and characteristics
  const getSuggestedPrompts = () => {
    // Base prompts for all personas
    const basePrompts = [
      {
        icon: <MessageSquare className="h-5 w-5 text-primary" />,
        title: "Introduce yourself",
        description: `Tell me about your role as a ${selectedPersona.title}`,
      },
      {
        icon: <Lightbulb className="h-5 w-5 text-primary" />,
        title: "Best practices",
        description: `Share best practices in your role as ${selectedPersona.title}`,
      },
      {
        icon: <Target className="h-5 w-5 text-primary" />,
        title: "Common challenges",
        description: "What challenges do you face in your role?",
      },
    ]

    // Add role-specific prompts based on persona title
    if (selectedPersona.title.includes("Brand")) {
      basePrompts.push({
        icon: <BookOpen className="h-5 w-5 text-primary" />,
        title: "Brand consistency",
        description: "How do you maintain brand consistency across different channels?",
      })
    }

    if (selectedPersona.title.includes("Compliance") || selectedPersona.title.includes("Governance")) {
      basePrompts.push({
        icon: <BarChart className="h-5 w-5 text-primary" />,
        title: "Compliance frameworks",
        description: "What brand compliance frameworks do you recommend?",
      })
    }

    if (selectedPersona.title.includes("Marketing") || selectedPersona.title.includes("Social Media")) {
      basePrompts.push({
        icon: <Users className="h-5 w-5 text-primary" />,
        title: "Marketing trends",
        description: "What current marketing trends should I know about?",
      })
    }

    // Add persona-specific prompts based on their unique characteristics
    switch (selectedPersona.id) {
      case "niina-gerber":
        basePrompts.push({
          icon: <Target className="h-5 w-5 text-primary" />,
          title: "Brand innovation",
          description: "How do you balance brand innovation with tradition and legacy?",
        })
        break
      case "kate-smith":
        basePrompts.push({
          icon: <Users className="h-5 w-5 text-primary" />,
          title: "Social media milestones",
          description: "What social media milestones are you most proud of achieving?",
        })
        break
      case "alicia-morel":
        basePrompts.push({
          icon: <BookOpen className="h-5 w-5 text-primary" />,
          title: "Brand guidelines",
          description: "How do you ensure brand guidelines are followed across the organization?",
        })
        break
      case "angela-may":
        basePrompts.push({
          icon: <MessageSquare className="h-5 w-5 text-primary" />,
          title: "Internal communication",
          description: "How do you ensure effective internal brand communication?",
        })
        break
      case "simon-wallace":
        basePrompts.push({
          icon: <BarChart className="h-5 w-5 text-primary" />,
          title: "Marketing efficiency",
          description: "How do you achieve more marketing results with less resources?",
        })
        break
      case "robert-cop":
        basePrompts.push({
          icon: <Users className="h-5 w-5 text-primary" />,
          title: "Procurement partnerships",
          description: "How do you find partners, not just suppliers?",
        })
        break
    }

    return basePrompts
  }

  const suggestedPrompts = getSuggestedPrompts()

  const handlePromptClick = (promptText: string) => {
    handleSubmit(promptText)
  }

  // Add file upload handler
  const handleFileUpload = (file: UploadedFile) => {
    setUploadedFiles((prev) => [...prev, file])
    setShowUploader(false)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  // Handle form submission with API integration
  const handleSubmit = async (text: string) => {
    const messageText = text || input
    if ((!messageText.trim() && uploadedFiles.length === 0) || !selectedPersona) return

    setIsSubmitting(true)

    // Create message content with file references if any
    let fullMessageText = messageText.trim()

    // If there are uploaded files, add them to the message
    if (uploadedFiles.length > 0) {
      if (fullMessageText) {
        fullMessageText += "\n\n"
      }

      fullMessageText += "I've uploaded the following files:\n"
      uploadedFiles.forEach((file, index) => {
        fullMessageText += `${index + 1}. ${file.name} (${file.type})\n`
      })
    }

    // Add user message
    const userMessage = {
      id: uuidv4(),
      content: fullMessageText,
      role: "user" as const,
      timestamp: new Date(),
      branchId: "default", // Ensure we're using the default branch for initial messages
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    }

    addMessage(personaId, userMessage)
    setInput("")
    setUploadedFiles([])

    try {
      // Prepare the messages for the API call
      const messages = [
        {
          content: fullMessageText.trim(),
          role: "user",
        },
      ]

      // Send the message to the API
      const result = await sendChatMessage({
        messages,
        systemPrompt: selectedPersona.systemPrompt,
        personaId,
        addMessage,
        currentBranchId: "default",
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Transition to the chat interface
      onStartConversation()
    } catch (error: any) {
      console.error("Error getting AI response:", error)
      // Add a fallback message in case of error
      const errorMessage = {
        id: uuidv4(),
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        role: "assistant" as const,
        timestamp: new Date(),
        branchId: "default",
      }
      addMessage(personaId, errorMessage)
      onStartConversation()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Persona header */}
      <div className="flex items-center p-4 border-b">
        <Avatar className="h-12 w-12 mr-3">
          <AvatarImage src={selectedPersona.imageUrl || "/placeholder.svg"} alt={selectedPersona.name} />
          <AvatarFallback>
            {selectedPersona.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{selectedPersona.name}</h2>
          <p className="text-sm text-muted-foreground">{selectedPersona.title}</p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setIsBioModalOpen(true)}>
          <Info className="h-4 w-4" />
          View Bio
        </Button>
      </div>

      {/* Prompt suggestions */}
      <div className="flex-1 p-6 overflow-auto">
        <h3 className="text-lg font-medium mb-4">How can I help you today?</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {suggestedPrompts.map((prompt, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handlePromptClick(prompt.description)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="mt-0.5 bg-primary/10 p-2 rounded-full">{prompt.icon}</div>
                <div>
                  <h4 className="font-medium">{prompt.title}</h4>
                  <p className="text-sm text-muted-foreground">{prompt.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
      <div className="border-t p-4">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(input)
          }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("flex-shrink-0", showUploader && "text-primary")}
            onClick={() => setShowUploader(!showUploader)}
            disabled={isSubmitting}
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach files</span>
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              uploadedFiles.length > 0
                ? "Ask about the uploaded files or type a message..."
                : `Ask ${selectedPersona.name} anything...`
            }
            className="flex-1"
            disabled={isSubmitting}
          />

          <Button type="submit" disabled={isSubmitting || (!input.trim() && uploadedFiles.length === 0)}>
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>

      {/* Bio modal */}
      <PersonaBioModal persona={selectedPersona} isOpen={isBioModalOpen} onClose={() => setIsBioModalOpen(false)} />
    </div>
  )
}
