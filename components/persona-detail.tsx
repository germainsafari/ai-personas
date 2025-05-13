"use client"

import type React from "react"

import type { Persona } from "@/types/persona"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Heart, MessageSquare, Quote, AlertTriangle } from "lucide-react"

interface PersonaDetailProps {
  persona: Persona
}

export function PersonaDetail({ persona }: PersonaDetailProps) {
  return (
    <div>
      <div className="mb-6 flex items-center space-x-4">
        <div className="h-16 w-16 overflow-hidden rounded-lg shadow-md">
          <img src={persona.imageUrl || "/placeholder.svg"} alt={persona.name} className="h-full w-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{persona.name}</h1>
          <p className="text-muted-foreground">{persona.title}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InfoCard icon={<User className="h-5 w-5" />} title="About Me" content={persona.about} />

        <InfoCard icon={<Heart className="h-5 w-5" />} title="Needs" content={persona.needs} />

        <InfoCard
          icon={<MessageSquare className="h-5 w-5" />}
          title="Characteristics"
          content={persona.characteristics}
        />

        <InfoCard icon={<Quote className="h-5 w-5" />} title="Quotes" content={persona.quotes} />

        <InfoCard icon={<AlertTriangle className="h-5 w-5" />} title="Challenges" content={persona.challenges} />
      </div>
    </div>
  )
}

interface InfoCardProps {
  icon: React.ReactNode
  title: string
  content: string
}

function InfoCard({ icon, title, content }: InfoCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2 bg-muted/50">
        <div className="text-primary">{icon}</div>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-card-foreground">{content}</p>
      </CardContent>
    </Card>
  )
}
