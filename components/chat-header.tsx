"use client"

import { usePersona } from "@/components/persona-provider"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { BranchSelector } from "@/components/branch-selector"
import { ChatExport } from "@/components/chat-export"

export function ChatHeader({ personaId }: { personaId: string }) {
  const { selectedPersona, clearChat, chatHistory, activeBranch } = usePersona()

  if (!selectedPersona) return null

  const personaMessages = chatHistory[personaId] || []
  const currentBranchId = activeBranch[personaId] || "default"
  const branchMessages = personaMessages.filter((msg) => msg.branchId === currentBranchId)

  const hasMessages = branchMessages.length > 0

  return (
    <div className="flex items-center justify-between border-b border-border p-3">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">Chat with {selectedPersona.name}</div>
        <BranchSelector personaId={personaId} />
      </div>

      <div className="flex items-center gap-1">
        <ChatExport personaId={personaId} />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Clear chat</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your conversation with {selectedPersona.name}. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => clearChat(personaId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
