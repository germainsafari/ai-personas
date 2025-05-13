"use client"

import { usePersona } from "@/components/persona-provider"
import { EnhancedSidebar } from "@/components/enhanced-sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { ApiKeyCheck } from "@/components/api-key-check"

export function PersonaLayout() {
  const { selectedPersona, isSidebarOpen, toggleSidebar } = usePersona()

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <Button variant="outline" size="icon" onClick={toggleSidebar} className="absolute left-4 top-4 z-50 md:hidden">
        <PanelLeft className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      {/* Enhanced Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 z-30 w-64 border-r border-border bg-card transition-transform duration-200 ease-in-out md:relative md:translate-x-0`}
      >
        <EnhancedSidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* API Key Check */}
        <div className="p-4">
          <ApiKeyCheck />
        </div>

        {/* Chat interface */}
        <div className="flex-1 overflow-hidden bg-card">
          {selectedPersona ? (
            <ChatInterface personaId={selectedPersona.id} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Select a persona to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
