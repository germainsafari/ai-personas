"use client"

import { usePersona } from "@/components/persona-provider"
import { Button } from "@/components/ui/button"
import { Clock, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface MessageHistoryProps {
  personaId: string
}

export function MessageHistory({ personaId }: MessageHistoryProps) {
  const { getMessagesByTimeframe, hasMessagesInTimeframe, setSelectedPersona, personas } = usePersona()

  const todayMessages = getMessagesByTimeframe(personaId, "today")
  const yesterdayMessages = getMessagesByTimeframe(personaId, "yesterday")
  const weekMessages = getMessagesByTimeframe(personaId, "week")

  const persona = personas.find((p) => p.id === personaId)

  if (!persona) return null

  const hasAnyMessages = todayMessages.length > 0 || yesterdayMessages.length > 0 || weekMessages.length > 0

  if (!hasAnyMessages) return null

  const renderMessageGroup = (messages: any[], title: string) => {
    if (messages.length === 0) return null

    return (
      <div className="mb-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-1">{title}</h4>
        <ul className="space-y-1">
          {messages.map((message) => (
            <li key={message.id}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs py-1 h-auto"
                onClick={() => setSelectedPersona(persona)}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {message.content.substring(0, 30)}
                    {message.content.length > 30 ? "..." : ""}
                  </span>
                  <span className="ml-auto text-muted-foreground flex-shrink-0 text-[10px]">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </span>
                </div>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 px-2 mb-2">
        <Clock className="h-3 w-3" />
        <h3 className="text-xs font-medium">Recent Conversations</h3>
      </div>

      {renderMessageGroup(todayMessages, "Today")}
      {renderMessageGroup(yesterdayMessages, "Yesterday")}
      {renderMessageGroup(weekMessages, "Previous 7 Days")}
    </div>
  )
}
