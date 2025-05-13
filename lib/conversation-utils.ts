// Utility functions for analyzing conversation history

/**
 * Checks if a specific topic has already been discussed in detail in the conversation
 * @param topic The topic to check for
 * @param messages The conversation history
 * @returns boolean indicating if the topic has been discussed in detail
 */
export function hasTopicBeenDiscussedInDetail(topic: string, messages: any[]): boolean {
  if (!messages || messages.length === 0) return false

  // Look for messages where the user discusses this topic in detail
  for (const message of messages) {
    if (
      message.role === "user" &&
      message.content.toLowerCase().includes(topic.toLowerCase()) &&
      message.content.split(" ").length > 20
    ) {
      return true
    }
  }

  return false
}

/**
 * Checks if a clarification question about a topic has already been asked and answered
 * @param topic The topic to check for
 * @param messages The conversation history
 * @returns boolean indicating if clarification has already happened
 */
export function hasTopicBeenClarified(topic: string, messages: any[]): boolean {
  if (!messages || messages.length < 3) return false

  // Look for the pattern: user mentions topic -> AI asks clarification -> user responds
  for (let i = 0; i < messages.length - 2; i++) {
    const message = messages[i]
    const nextMessage = messages[i + 1]
    const responseToNext = messages[i + 2]

    if (
      message.role === "user" &&
      message.content.toLowerCase().includes(topic.toLowerCase()) &&
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

  return false
}

/**
 * Extracts the main topics that have been discussed in the conversation
 * @param messages The conversation history
 * @returns Array of topics that have been discussed
 */
export function extractDiscussedTopics(messages: any[]): string[] {
  if (!messages || messages.length === 0) return []

  const commonTopics = [
    "brand",
    "marketing",
    "strategy",
    "design",
    "social media",
    "content",
    "campaign",
    "digital",
    "analytics",
    "audience",
    "positioning",
    "identity",
  ]

  const discussedTopics = new Set<string>()

  // Look through all messages for mentions of common topics
  for (const message of messages) {
    const content = message.content.toLowerCase()
    for (const topic of commonTopics) {
      if (content.includes(topic)) {
        discussedTopics.add(topic)
      }
    }
  }

  return Array.from(discussedTopics)
}

/**
 * Determines if the current query is a follow-up to a previous topic
 * @param query The current query
 * @param messages The conversation history
 * @returns The topic it's following up on, or null if it's not a follow-up
 */
export function isFollowUpQuery(query: string, messages: any[]): string | null {
  if (!messages || messages.length < 2) return null

  // If the query is very short, it might be a follow-up
  if (query.split(" ").length <= 3 && !query.endsWith("?")) {
    // Get the last assistant message
    const lastAssistantMessage = [...messages].reverse().find((message) => message.role === "assistant")

    if (lastAssistantMessage) {
      // Extract topics from the last assistant message
      const topics = extractDiscussedTopics([lastAssistantMessage])

      // If any of these topics are in the query, it's likely a follow-up
      for (const topic of topics) {
        if (query.toLowerCase().includes(topic)) {
          return topic
        }
      }
    }
  }

  return null
}
