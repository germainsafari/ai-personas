"use client"

import { usePersona } from "@/components/persona-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { MessageHistory } from "@/components/message-history"
import { Separator } from "@/components/ui/separator"

export function EnhancedSidebar() {
  const { personas, selectedPersona, setSelectedPersona, setBioModalPersona, setIsBioModalOpen } = usePersona()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPersonas = personas.filter(
    (persona) =>
      persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handlePersonaClick = (persona: any) => {
    setSelectedPersona(persona)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">AI Personas</h2>
          <ThemeToggle />
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search personas..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <div className="px-2">
          <h3 className="px-2 text-xs font-medium text-muted-foreground mb-2">Personas</h3>
          <ul className="space-y-1">
            {filteredPersonas.map((persona) => (
              <li key={persona.id}>
                <button
                  onClick={() => handlePersonaClick(persona)}
                  className={`flex w-full items-center rounded-lg px-3 py-2 text-left transition-all duration-200 ${
                    selectedPersona?.id === persona.id
                      ? "bg-primary/10 text-primary dark:bg-primary/20"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  <Avatar className="mr-3 h-10 w-10 border shadow-sm">
                    <AvatarImage src={persona.imageUrl || "/placeholder.svg"} alt={persona.name} />
                    <AvatarFallback>
                      {persona.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{persona.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{persona.title}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="my-4" />

        {/* Message History Section */}
        <div className="px-2">
          {personas.map((persona) => (
            <MessageHistory key={persona.id} personaId={persona.id} />
          ))}
        </div>
      </div>

      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p>AI Personas v1.0</p>
        </div>
      </div>
    </div>
  )
}
