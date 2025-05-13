"use client"

import { useState } from "react"
import { MoreHorizontal, Trash2, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePersona } from "@/components/persona-provider"

interface MessageActionsProps {
  messageId: string
  personaId: string
  isUserMessage: boolean
}

export function MessageActions({ messageId, personaId, isUserMessage }: MessageActionsProps) {
  const { deleteMessage, createBranch } = usePersona()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [branchName, setBranchName] = useState("")

  const handleDelete = () => {
    deleteMessage(personaId, messageId)
  }

  const handleCreateBranch = () => {
    if (branchName.trim()) {
      createBranch(personaId, branchName.trim(), messageId)
      setBranchName("")
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity absolute -top-3 right-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Message actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>

          {isUserMessage && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Branch from here
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create new conversation branch</DialogTitle>
                  <DialogDescription>
                    This will create a new branch starting from this message. You can switch between branches at any
                    time.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="branch-name">Branch name</Label>
                  <Input
                    id="branch-name"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g., Alternative approach"
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBranch} disabled={!branchName.trim()}>
                    Create Branch
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
