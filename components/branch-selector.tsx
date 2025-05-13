"use client"

import { useState } from "react"
import { GitBranch, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePersona } from "@/components/persona-provider"
import { Badge } from "@/components/ui/badge"

interface BranchSelectorProps {
  personaId: string
}

export function BranchSelector({ personaId }: BranchSelectorProps) {
  const { branches, activeBranch, switchBranch, renameBranch, deleteBranch } = usePersona()
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [newBranchName, setNewBranchName] = useState("")

  const personaBranches = branches[personaId] || []
  const currentBranchId = activeBranch[personaId] || "default"
  const currentBranch = personaBranches.find((branch) => branch.id === currentBranchId)

  const handleSwitchBranch = (branchId: string) => {
    switchBranch(personaId, branchId)
  }

  const handleRenameClick = (branchId: string, currentName: string) => {
    setSelectedBranchId(branchId)
    setNewBranchName(currentName)
    setIsRenameDialogOpen(true)
  }

  const handleDeleteClick = (branchId: string) => {
    setSelectedBranchId(branchId)
    setIsDeleteDialogOpen(true)
  }

  const handleRenameConfirm = () => {
    if (selectedBranchId && newBranchName.trim()) {
      renameBranch(personaId, selectedBranchId, newBranchName.trim())
      setIsRenameDialogOpen(false)
    }
  }

  const handleDeleteConfirm = () => {
    if (selectedBranchId) {
      deleteBranch(personaId, selectedBranchId)
      setIsDeleteDialogOpen(false)
    }
  }

  if (personaBranches.length <= 1) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <GitBranch className="h-4 w-4" />
            <span className="max-w-[100px] truncate">{currentBranch?.name || "Main Conversation"}</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1">
              {personaBranches.length}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Conversation Branches</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {personaBranches.map((branch) => (
              <DropdownMenuItem key={branch.id} className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  className={`h-8 justify-start px-2 flex-1 ${
                    branch.id === currentBranchId ? "font-medium bg-accent" : ""
                  }`}
                  onClick={() => handleSwitchBranch(branch.id)}
                >
                  <span className="truncate">{branch.name}</span>
                </Button>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRenameClick(branch.id, branch.name)
                    }}
                  >
                    <Edit className="h-3 w-3" />
                    <span className="sr-only">Rename</span>
                  </Button>
                  {branch.id !== "default" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(branch.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename branch</DialogTitle>
            <DialogDescription>Enter a new name for this conversation branch.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-branch-name">Branch name</Label>
            <Input
              id="new-branch-name"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameConfirm} disabled={!newBranchName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this branch? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
