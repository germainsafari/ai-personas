"use client"

import { usePersona } from "@/components/persona-provider"
import { Sidebar } from "@/components/sidebar"
import { ChatPanel } from "@/components/chat-panel"
import { PersonaDetail } from "@/components/persona-detail"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"

export function PersonaLayout() {
  const { selectedPersona, isSidebarOpen, toggleSidebar } = usePersona()

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Mobile sidebar toggle */}
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="absolute left-4 top-4 z-50 md:hidden">
        <PanelLeft className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>

      {/* Sidebar component */}
      <Sidebar
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out md:relative md:translate-x-0`}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main persona profile */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {selectedPersona ? (
            <PersonaDetail persona={selectedPersona} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">Select a persona to view details</p>
            </div>
          )}
        </div>

        {/* Chat interface */}
        <div className="h-1/3 border-t border-gray-200">
          {selectedPersona && <ChatPanel personaId={selectedPersona.id} />}
        </div>
      </div>
    </div>
  )
}
