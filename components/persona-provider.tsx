"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Persona } from "@/types/persona"
import type { Message, Branch, ChatExportFormat } from "@/types/persona"
import { personas } from "@/data/personas"
import { v4 as uuidv4 } from "uuid"

type PersonaContextType = {
  personas: Persona[]
  selectedPersona: Persona | null
  setSelectedPersona: (persona: Persona) => void
  chatHistory: Record<string, Message[]>
  addMessage: (personaId: string, message: Message) => void
  deleteMessage: (personaId: string, messageId: string) => void
  clearChat: (personaId: string) => void
  exportChat: (personaId: string, format: ChatExportFormat) => void
  branches: Record<string, Branch[]>
  activeBranch: Record<string, string>
  createBranch: (personaId: string, name: string, parentMessageId: string) => void
  switchBranch: (personaId: string, branchId: string) => void
  renameBranch: (personaId: string, branchId: string, newName: string) => void
  deleteBranch: (personaId: string, branchId: string) => void
  isSidebarOpen: boolean
  toggleSidebar: () => void
  isApiKeySet: boolean
  // Bio modal state
  bioModalPersona: Persona | null
  setBioModalPersona: (persona: Persona | null) => void
  isBioModalOpen: boolean
  setIsBioModalOpen: (isOpen: boolean) => void
  // Message history helpers
  getMessagesByTimeframe: (personaId: string, timeframe: "today" | "yesterday" | "week") => Message[]
  hasMessagesInTimeframe: (personaId: string, timeframe: "today" | "yesterday" | "week") => boolean
  // Conversation state
  hasActiveConversation: Record<string, boolean>
  setHasActiveConversation: (personaId: string, active: boolean) => void
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined)

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({})
  const [branches, setBranches] = useState<Record<string, Branch[]>>({})
  const [activeBranch, setActiveBranch] = useState<Record<string, string>>({})
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isApiKeySet, setIsApiKeySet] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasActiveConversation, setHasActiveConversationState] = useState<Record<string, boolean>>({})

  // Bio modal state
  const [bioModalPersona, setBioModalPersona] = useState<Persona | null>(null)
  const [isBioModalOpen, setIsBioModalOpen] = useState(false)

  // Set active conversation state for a specific persona
  const setHasActiveConversation = (personaId: string, active: boolean) => {
    setHasActiveConversationState((prev) => ({
      ...prev,
      [personaId]: active,
    }))
  }

  // Check if API key is set
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/check-api-key")
        if (response.ok) {
          const data = await response.json()
          setIsApiKeySet(data.hasApiKey)
        } else {
          console.error("Failed to check API key status")
          setIsApiKeySet(false)
        }
      } catch (error) {
        console.error("Error checking API key:", error)
        setIsApiKeySet(false)
      }
    }

    checkApiKey()
  }, [])

  // Load chat history and branches from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Load chat history
        const savedHistory = localStorage.getItem("ai-personas-chat-history")
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory)

          // Convert string timestamps back to Date objects
          Object.keys(parsed).forEach((personaId) => {
            parsed[personaId] = parsed[personaId].map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          })

          setChatHistory(parsed)

          // Initialize active conversation state based on chat history
          const activeConversations: Record<string, boolean> = {}
          Object.keys(parsed).forEach((personaId) => {
            activeConversations[personaId] = parsed[personaId].length > 0
          })
          setHasActiveConversationState(activeConversations)
        }

        // Load branches
        const savedBranches = localStorage.getItem("ai-personas-branches")
        if (savedBranches) {
          const parsed = JSON.parse(savedBranches)

          // Convert string timestamps back to Date objects
          Object.keys(parsed).forEach((personaId) => {
            parsed[personaId] = parsed[personaId].map((branch: any) => ({
              ...branch,
              createdAt: new Date(branch.createdAt),
            }))
          })

          setBranches(parsed)
        }

        // Load active branches
        const savedActiveBranch = localStorage.getItem("ai-personas-active-branch")
        if (savedActiveBranch) {
          setActiveBranch(JSON.parse(savedActiveBranch))
        }
      } catch (error) {
        console.error("Failed to load data from localStorage:", error)
      }
      setIsInitialized(true)
    }
  }, [])

  // Set initial persona when component mounts
  useEffect(() => {
    if (personas.length > 0 && !selectedPersona) {
      setSelectedPersona(personas[0])
    }
  }, [selectedPersona])

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try {
        localStorage.setItem("ai-personas-chat-history", JSON.stringify(chatHistory))
      } catch (error) {
        console.error("Failed to save chat history:", error)
      }
    }
  }, [chatHistory, isInitialized])

  // Save branches to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try {
        localStorage.setItem("ai-personas-branches", JSON.stringify(branches))
      } catch (error) {
        console.error("Failed to save branches:", error)
      }
    }
  }, [branches, isInitialized])

  // Save active branch to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      try {
        localStorage.setItem("ai-personas-active-branch", JSON.stringify(activeBranch))
      } catch (error) {
        console.error("Failed to save active branch:", error)
      }
    }
  }, [activeBranch, isInitialized])

  // Initialize default branch for a persona if it doesn't exist
  const ensureDefaultBranch = (personaId: string) => {
    if (!branches[personaId] || branches[personaId].length === 0) {
      const defaultBranch: Branch = {
        id: "default",
        name: "Main Conversation",
        createdAt: new Date(),
      }

      setBranches((prev) => ({
        ...prev,
        [personaId]: [defaultBranch],
      }))

      setActiveBranch((prev) => ({
        ...prev,
        [personaId]: "default",
      }))

      return "default"
    }

    if (!activeBranch[personaId]) {
      setActiveBranch((prev) => ({
        ...prev,
        [personaId]: branches[personaId][0].id,
      }))
      return branches[personaId][0].id
    }

    return activeBranch[personaId]
  }

  const addMessage = (personaId: string, message: Message) => {
    const currentBranchId = ensureDefaultBranch(personaId)

    // Add branchId to the message if not already set
    const messageWithBranch = {
      ...message,
      branchId: message.branchId || currentBranchId,
    }

    setChatHistory((prev) => {
      const personaMessages = prev[personaId] || []
      return {
        ...prev,
        [personaId]: [...personaMessages, messageWithBranch],
      }
    })

    // Set active conversation state to true when a message is added
    setHasActiveConversation(personaId, true)
  }

  const deleteMessage = (personaId: string, messageId: string) => {
    setChatHistory((prev) => {
      const personaMessages = prev[personaId] || []

      // Find the message to delete
      const messageIndex = personaMessages.findIndex((msg) => msg.id === messageId)
      if (messageIndex === -1) return prev

      // Get the message and its children (if any)
      const messageToDelete = personaMessages[messageIndex]

      // If this is a branching point, we need to handle branches
      const branchesUsingThisMessage = (branches[personaId] || []).filter(
        (branch) => branch.parentMessageId === messageId,
      )

      // Delete branches that start from this message
      if (branchesUsingThisMessage.length > 0) {
        const branchIdsToDelete = branchesUsingThisMessage.map((b) => b.id)
        setBranches((prev) => ({
          ...prev,
          [personaId]: (prev[personaId] || []).filter((b) => !branchIdsToDelete.includes(b.id)),
        }))
      }

      // Delete this message and all subsequent messages in the same branch
      const updatedMessages = personaMessages.filter((msg, idx) => {
        // Keep messages before the deleted one
        if (idx < messageIndex) return true

        // Delete the message itself
        if (idx === messageIndex) return false

        // For messages after, only keep if they're not in the same branch
        // or if they're not children of the deleted message
        return msg.branchId !== messageToDelete.branchId
      })

      // Update active conversation state if all messages are deleted
      if (updatedMessages.length === 0) {
        setHasActiveConversation(personaId, false)
      }

      return {
        ...prev,
        [personaId]: updatedMessages,
      }
    })
  }

  const clearChat = (personaId: string) => {
    setChatHistory((prev) => {
      const newHistory = { ...prev }
      delete newHistory[personaId]
      return newHistory
    })

    // Also clear branches for this persona
    setBranches((prev) => {
      const newBranches = { ...prev }
      delete newBranches[personaId]
      return newBranches
    })

    // Reset active branch
    setActiveBranch((prev) => {
      const newActiveBranch = { ...prev }
      delete newActiveBranch[personaId]
      return newActiveBranch
    })

    // Set active conversation state to false when chat is cleared
    setHasActiveConversation(personaId, false)
  }

  const exportChat = (personaId: string, format: ChatExportFormat) => {
    const personaMessages = chatHistory[personaId] || []
    const currentBranchId = activeBranch[personaId] || "default"
    const branchMessages = personaMessages.filter((msg) => msg.branchId === currentBranchId)

    if (branchMessages.length === 0) {
      alert("No messages to export")
      return
    }

    const persona = personas.find((p) => p.id === personaId)
    const fileName = `chat-with-${persona?.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}`

    let content = ""
    let fileType = ""

    if (format === "text") {
      content = branchMessages
        .map((msg) => `[${msg.role}] ${new Date(msg.timestamp).toLocaleString()}\n${msg.content}\n`)
        .join("\n")
      fileType = "text/plain"
    } else if (format === "json") {
      content = JSON.stringify(
        {
          persona: persona,
          messages: branchMessages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp).toISOString(),
          })),
          exportedAt: new Date().toISOString(),
        },
        null,
        2,
      )
      fileType = "application/json"
    } else if (format === "markdown") {
      content = `# Conversation with ${persona?.name} (${persona?.title})\n\n`
      content += `Exported on: ${new Date().toLocaleString()}\n\n`
      content += branchMessages
        .map(
          (msg) =>
            `## ${msg.role === "user" ? "You" : persona?.name} (${new Date(
              msg.timestamp,
            ).toLocaleString()})\n\n${msg.content}\n`,
        )
        .join("\n")
      fileType = "text/markdown"
    }

    // Create a blob and download it
    const blob = new Blob([content], { type: fileType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName}.${format === "json" ? "json" : format === "markdown" ? "md" : "txt"}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const createBranch = (personaId: string, name: string, parentMessageId: string) => {
    const branchId = uuidv4()

    // Create the new branch
    setBranches((prev) => {
      const personaBranches = prev[personaId] || []
      const newBranch: Branch = {
        id: branchId,
        name,
        createdAt: new Date(),
        parentMessageId,
      }
      return {
        ...prev,
        [personaId]: [...personaBranches, newBranch],
      }
    })

    // Switch to the new branch
    setActiveBranch((prev) => ({
      ...prev,
      [personaId]: branchId,
    }))

    return branchId
  }

  const switchBranch = (personaId: string, branchId: string) => {
    setActiveBranch((prev) => ({
      ...prev,
      [personaId]: branchId,
    }))
  }

  const renameBranch = (personaId: string, branchId: string, newName: string) => {
    setBranches((prev) => {
      const personaBranches = prev[personaId] || []
      return {
        ...prev,
        [personaId]: personaBranches.map((branch) => (branch.id === branchId ? { ...branch, name: newName } : branch)),
      }
    })
  }

  const deleteBranch = (personaId: string, branchId: string) => {
    // Don't allow deleting the default branch
    if (branchId === "default") return

    setBranches((prev) => {
      const personaBranches = prev[personaId] || []
      return {
        ...prev,
        [personaId]: personaBranches.filter((branch) => branch.id !== branchId),
      }
    })

    // If the active branch is being deleted, switch to the default branch
    if (activeBranch[personaId] === branchId) {
      setActiveBranch((prev) => ({
        ...prev,
        [personaId]: "default",
      }))
    }

    // We don't delete messages from the chat history as they might be referenced by other branches
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  // Helper functions for message history
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isYesterday = (date: Date) => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    )
  }

  const isWithinLastWeek = (date: Date) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return date > weekAgo && !isToday(date) && !isYesterday(date)
  }

  // Get messages by timeframe
  const getMessagesByTimeframe = (personaId: string, timeframe: "today" | "yesterday" | "week") => {
    const messages = chatHistory[personaId] || []

    // Get the first message of each conversation (user messages only)
    const conversationStarters = messages
      .filter((msg) => msg.role === "user")
      .reduce((acc: Message[], msg) => {
        // Check if we already have a message from this conversation
        const existingConversation = acc.find(
          (m) =>
            // Same day conversations are grouped together
            new Date(m.timestamp).toDateString() === new Date(msg.timestamp).toDateString(),
        )

        if (!existingConversation) {
          acc.push(msg)
        }

        return acc
      }, [])

    // Filter by timeframe
    return conversationStarters.filter((msg) => {
      const msgDate = new Date(msg.timestamp)
      if (timeframe === "today") return isToday(msgDate)
      if (timeframe === "yesterday") return isYesterday(msgDate)
      if (timeframe === "week") return isWithinLastWeek(msgDate)
      return false
    })
  }

  // Check if there are messages in a timeframe
  const hasMessagesInTimeframe = (personaId: string, timeframe: "today" | "yesterday" | "week") => {
    return getMessagesByTimeframe(personaId, timeframe).length > 0
  }

  return (
    <PersonaContext.Provider
      value={{
        personas,
        selectedPersona,
        setSelectedPersona,
        chatHistory,
        addMessage,
        deleteMessage,
        clearChat,
        exportChat,
        branches,
        activeBranch,
        createBranch,
        switchBranch,
        renameBranch,
        deleteBranch,
        isSidebarOpen,
        toggleSidebar,
        isApiKeySet,
        // Bio modal state
        bioModalPersona,
        setBioModalPersona,
        isBioModalOpen,
        setIsBioModalOpen,
        // Message history helpers
        getMessagesByTimeframe,
        hasMessagesInTimeframe,
        // Conversation state
        hasActiveConversation,
        setHasActiveConversation,
      }}
    >
      {children}
    </PersonaContext.Provider>
  )
}

export function usePersona() {
  const context = useContext(PersonaContext)
  if (context === undefined) {
    throw new Error("usePersona must be used within a PersonaProvider")
  }
  return context
}
