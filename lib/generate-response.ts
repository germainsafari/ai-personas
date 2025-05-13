// In a real implementation, this would use the AI SDK to generate responses
// This is a placeholder for the actual implementation

// List of topics that might need clarification
const clarificationTopics = [
  "brand",
  "branding",
  "marketing",
  "strategy",
  "design",
  "social media",
  "content",
  "campaign",
  "digital",
  "analytics",
]

// Helper function to detect ambiguous queries
function isAmbiguousQuery(query: string, conversationHistory: any[] = []): boolean {
  // Convert to lowercase for comparison
  const text = query.toLowerCase().trim()

  // Check if it's a single word or very short phrase
  if (text.split(/\s+/).length <= 2) {
    // Check if the query matches or contains any ambiguous topics
    const matchedTopic = clarificationTopics.find((topic) => text === topic || text.includes(topic))

    if (matchedTopic) {
      // Check if this topic has already been clarified in the conversation
      if (hasTopicBeenClarified(matchedTopic, conversationHistory)) {
        return false
      }
      return true
    }
  }

  return false
}

// Check if a topic has already been clarified in the conversation
function hasTopicBeenClarified(topic: string, conversationHistory: any[]): boolean {
  if (!conversationHistory || conversationHistory.length < 3) {
    return false
  }

  // Look for patterns that indicate a clarification has already happened
  for (let i = 0; i < conversationHistory.length - 2; i++) {
    const message = conversationHistory[i]
    const nextMessage = conversationHistory[i + 1]
    const responseToNext = conversationHistory[i + 2]

    // Pattern: user mentions topic -> AI asks for clarification -> user responds
    if (
      message.role === "user" &&
      message.content.toLowerCase().includes(topic) &&
      nextMessage.role === "assistant" &&
      (nextMessage.content.includes("clarify") ||
        nextMessage.content.includes("which aspect") ||
        nextMessage.content.includes("what specific") ||
        nextMessage.content.includes("interested in")) &&
      responseToNext.role === "user"
    ) {
      return true
    }
  }

  // Also check if the user has already provided detailed context about the topic
  for (const message of conversationHistory) {
    if (
      message.role === "user" &&
      message.content.toLowerCase().includes(topic) &&
      message.content.split(" ").length > 15
    ) {
      // If user has already provided a detailed message about this topic
      return true
    }
  }

  return false
}

// Topic-specific clarification templates
const topicClarifications = {
  brand:
    'Could you please clarify what you\'re looking for regarding "brand"? Are you interested in:\n\n• Branding guidelines or assets?\n• Brand strategy or positioning?\n• A specific brand (your own or another)?\n• Help defining or improving a brand?\n\nLet me know so I can assist you more effectively.',
  marketing:
    "When you mention \"marketing\", which aspect are you most interested in discussing?\n\n• Digital marketing strategies?\n• Content marketing approaches?\n• Marketing analytics and measurement?\n• Campaign planning and execution?\n\nI'd be happy to focus our conversation on what's most relevant to you.",
  strategy:
    "I'd be glad to discuss strategy. To help you better, could you specify which type of strategy you're referring to?\n\n• Brand strategy?\n• Marketing strategy?\n• Content strategy?\n• Social media strategy?\n• Business strategy?\n\nThis will help me provide more targeted insights.",
}

// This is a mock implementation - in a real app, we would store conversation history
// and use it to determine if a topic has been clarified
const mockConversationHistory: any[] = []

export async function generateResponse(message: string, systemPrompt: string) {
  // In production, replace with actual AI SDK call:
  // import { generateText } from 'ai'
  // import { openai } from '@ai-sdk/openai'
  //
  // Using gpt-4o-mini for optimal cost-efficiency while maintaining good performance
  // const { text } = await generateText({
  //   model: openai("gpt-4o-mini"),
  //   system: systemPrompt + "\n\nIMPORTANT: Be conversational and human-like. For ambiguous queries, ask clarifying questions first, but don't repeat clarifications for topics already discussed. Keep responses concise unless detailed information is requested. End with a follow-up question.",
  //   prompt: message,
  //   messages: mockConversationHistory // In a real implementation, we would pass the actual conversation history
  // })
  //
  // return text

  // Update mock conversation history
  mockConversationHistory.push({ role: "user", content: message })

  // For now, return a simulated response
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      let response = ""

      // Check if this is an ambiguous query that needs clarification
      if (isAmbiguousQuery(message, mockConversationHistory)) {
        // Find the appropriate clarification response
        for (const [topic, clarificationResponse] of Object.entries(topicClarifications)) {
          if (message.toLowerCase().includes(topic)) {
            response = clarificationResponse
            break
          }
        }

        // Default clarification for other ambiguous queries
        if (!response) {
          response =
            "I'd be happy to help with that. Could you share a bit more about what specific aspect you're interested in so I can provide the most relevant insights?"
        }
      } else {
        // For non-ambiguous queries or topics already clarified, use the standard responses
        const responses = [
          "That's an interesting question. From my professional perspective, I'd approach this by... What specific challenges are you facing in this area?",
          "Based on my experience in this role, I would suggest starting with... Does that align with what you're trying to achieve?",
          "Good point! When dealing with these situations, I typically focus on... What part of this process interests you most?",
          "Let me think about that from my position as a brand specialist... I believe the key consideration is... Would you like me to elaborate on any particular aspect?",
        ]
        response = responses[Math.floor(Math.random() * responses.length)]
      }

      // Update mock conversation history with the assistant's response
      mockConversationHistory.push({ role: "assistant", content: response })

      resolve(response)
    }, 1000)
  })
}
