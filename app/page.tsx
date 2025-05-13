import { PersonaProvider } from "@/components/persona-provider"
import { PersonaLayout } from "@/components/improved-layout"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Personas - Interactive AI Agents",
  description: "Interact with various AI personas with unique personalities, roles, and expertise",
}

export default function HomePage() {
  return (
    <PersonaProvider>
      <PersonaLayout />
    </PersonaProvider>
  )
}
