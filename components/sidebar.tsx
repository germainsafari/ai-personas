"use client"

import type React from "react"

import { usePersona } from "@/components/persona-provider"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { personas, selectedPersona, setSelectedPersona } = usePersona()

  return (
    <aside className={cn("flex flex-col border-r border-gray-200 bg-white", className)} {...props}>
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-800">AI Personas</h2>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-2">
          <ul className="space-y-1">
            {personas.map((persona) => (
              <li key={persona.id}>
                <button
                  onClick={() => setSelectedPersona(persona)}
                  className={cn(
                    "flex w-full items-center rounded-md px-3 py-2 text-left transition-colors",
                    selectedPersona?.id === persona.id
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Avatar className="mr-3 h-8 w-8">
                    <AvatarImage src={persona.imageUrl || "/placeholder.svg"} alt={persona.name} />
                    <AvatarFallback>
                      {persona.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate">
                    <p className="font-medium">{persona.name}</p>
                    <p className="text-xs text-gray-500 truncate">{persona.title}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-4">
        <div className="text-xs text-gray-500">
          <p>Version 1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
