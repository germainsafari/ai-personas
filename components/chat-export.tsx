"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePersona } from "@/components/persona-provider"
import type { ChatExportFormat } from "@/types/persona"

interface ChatExportProps {
  personaId: string
}

export function ChatExport({ personaId }: ChatExportProps) {
  const { exportChat, chatHistory, activeBranch } = usePersona()

  const personaMessages = chatHistory[personaId] || []
  const currentBranchId = activeBranch[personaId] || "default"
  const branchMessages = personaMessages.filter((msg) => msg.branchId === currentBranchId)

  const handleExport = (format: ChatExportFormat) => {
    exportChat(personaId, format)
  }

  if (branchMessages.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Download className="h-4 w-4" />
          <span className="sr-only">Export chat</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("text")}>Export as Text</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("markdown")}>Export as Markdown</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>Export as JSON</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
