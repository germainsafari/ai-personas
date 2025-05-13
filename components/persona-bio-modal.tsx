"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, User, Heart, MessageSquare, Quote, AlertTriangle } from "lucide-react"
import type { Persona } from "@/types/persona"

interface PersonaBioModalProps {
  persona: Persona | null
  isOpen: boolean
  onClose: () => void
}

export function PersonaBioModal({ persona, isOpen, onClose }: PersonaBioModalProps) {
  if (!persona) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-lg shadow-md">
              <img
                src={persona.imageUrl || "/placeholder.svg"}
                alt={persona.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">{persona.name}</DialogTitle>
              <p className="text-muted-foreground">{persona.title}</p>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="grid gap-6 py-4 md:grid-cols-2">
          <BioSection icon={<User className="h-5 w-5" />} title="About Me" content={persona.about} />
          <BioSection icon={<Heart className="h-5 w-5" />} title="Needs" content={persona.needs} />
          <BioSection
            icon={<MessageSquare className="h-5 w-5" />}
            title="Characteristics"
            content={persona.characteristics}
          />
          <BioSection icon={<Quote className="h-5 w-5" />} title="Quotes" content={persona.quotes} />
          <BioSection icon={<AlertTriangle className="h-5 w-5" />} title="Challenges" content={persona.challenges} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface BioSectionProps {
  icon: React.ReactNode
  title: string
  content: string
}

function BioSection({ icon, title, content }: BioSectionProps) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-primary">{icon}</div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm">{content}</p>
    </div>
  )
}
