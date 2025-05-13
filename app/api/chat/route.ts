import { NextResponse } from "next/server"

// More conversational mock responses for ambiguous queries
const clarificationResponses = [
  "Could you please clarify what you're looking for? I'd love to help, but want to make sure I understand what you need.",
  "I'd be happy to discuss that. Could you share a bit more about what specific aspect you're interested in?",
  "That's a broad topic! Could you tell me which part you'd like to focus on so I can give you the most relevant insights?",
  "I'd love to help with that. To better assist you, could you let me know what specific information you're looking for?",
]

// Topic-specific clarification templates
const topicClarifications = {
  brand:
    'Could you please clarify what you\'re looking for regarding "brand"? Are you interested in:\n\n• Branding guidelines or assets?\n• Brand strategy or positioning?\n• A specific brand (your own or another)?\n• Help defining or improving a brand?\n\nLet me know so I can assist you more effectively.',
  marketing:
    "When you mention \"marketing\", which aspect are you most interested in discussing?\n\n• Digital marketing strategies?\n• Content marketing approaches?\n• Marketing analytics and measurement?\n• Campaign planning and execution?\n\nI'd be happy to focus our conversation on what's most relevant to you.",
  strategy:
    "I'd be glad to discuss strategy. To help you better, could you specify which type of strategy you're referring to?\n\n• Brand strategy?\n• Marketing strategy?\n• Content strategy?\n• Social media strategy?\n• Business strategy?\n\nThis will help me provide more targeted insights.",
  "social media":
    "When it comes to social media, there are many aspects we could discuss. What are you most interested in?\n\n• Platform-specific strategies?\n• Content creation for social media?\n• Community management?\n• Social media analytics?\n\nLet me know where to focus our conversation.",
}

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
  "guidelines",
  "identity",
  "positioning",
  "audience",
  "target",
]

// Detect if a query is ambiguous and needs clarification
function isAmbiguousQuery(query: string, conversationHistory: any[]): boolean {
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

  // If it's a question without specific context
  if (text.endsWith("?") && text.length < 60) {
    // Check if it contains any of our clarification topics
    const matchedTopic = clarificationTopics.find((topic) => text.includes(topic))
    if (matchedTopic && !hasTopicBeenClarified(matchedTopic, conversationHistory)) {
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

// Get a clarification response for an ambiguous query
function getClarificationResponse(query: string): string {
  // Convert to lowercase for comparison
  const text = query.toLowerCase().trim()

  // Check for specific topic matches
  for (const [topic, response] of Object.entries(topicClarifications)) {
    if (text.includes(topic)) {
      return response
    }
  }

  // Default to a generic clarification
  return clarificationResponses[Math.floor(Math.random() * clarificationResponses.length)]
}

// Mock responses for when OpenAI API is unavailable
const mockResponses = [
  "As a brand professional, I believe consistency is key to maintaining brand identity across all touchpoints.",
  "From my experience, the most successful brands balance global consistency with local relevance.",
  "I would recommend focusing on your core brand values while allowing for some flexibility in execution.",
  "That's an interesting question. In my role, I typically approach this by considering both compliance requirements and creative needs.",
  "Based on best practices in brand management, I would suggest documenting this process clearly for all stakeholders.",
  "When facing this challenge, I've found that open communication between teams is essential for maintaining brand integrity.",
]

// Add a function to check if a message is asking for document content
async function getDocumentContextIfRequested(message: string) {
  // Check if this appears to be a request for document content or summary
  const documentKeywords = ['document', 'pdf', 'file', 'summarize', 'summarise', 'read', 'extract'];
  const containsDocumentRequest = documentKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );

  if (!containsDocumentRequest) {
    return null;
  }

  // Look for document names in the message
  const uploadedFilePattern = /I've uploaded the following files:\s*\d+\.\s*([^)]+)\s*\(/i;
  const match = message.match(uploadedFilePattern);
  
  if (!match || !match[1]) {
    return null;
  }

  const filename = match[1].trim();
  
  // Try to fetch the document content from FastAPI
  try {
    const response = await fetch(`${process.env.PYTHON_BACKEND_URL || 'http://localhost:8000'}/document/${encodeURIComponent(filename)}`);
    
    if (!response.ok) {
      console.log(`Document not found: ${filename}`);
      return null;
    }
    
    const data = await response.json();
    console.log('📄 Document data received:', {
      name: data.name,
      type: data.type,
      hasContent: !!data.content,
      hasText: !!data.text,
      hasChunks: !!data.chunks,
      contentPreview: data.content?.substring(0, 50),
      textPreview: data.text?.substring(0, 50),
      chunksPreview: data.chunks?.[0]?.substring(0, 50)
    });
    
    // Get the text content, checking content, text, and chunks fields
    const textContent = data.text || data.content || (data.chunks && data.chunks.join('\n')) || 'No content available';
    
    // Format the content based on file type
    let contentDisplay = "";
    if (data.type?.startsWith('image/') || data.metadata?.format) {
      contentDisplay = textContent !== 'No content available'
        ? `Extracted text via OCR:\n${textContent}`
        : "No readable text was extracted from this image.";
    } else {
      contentDisplay = textContent;
    }
    
    return {
      name: data.name,
      type: data.type,
      summary: data.summary || "No summary available",
      metadata: data.metadata,
      content: contentDisplay,
    };
  } catch (error) {
    console.error("Error fetching document content:", error);
    return null;
  }
}

// Update the POST function to handle files in messages
export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json()
    const { messages, systemPrompt, fileContext } = body

    // Ensure messages is an array
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request format: messages must be an array" }, { status: 400 })
    }

    // Log the incoming request for debugging
    console.log("Chat API request:", {
      systemPrompt: systemPrompt?.substring(0, 50) + "...",
      messageCount: messages.length,
      firstMessagePreview: messages[0]?.content?.substring(0, 30) + "...",
      hasFileContext: !!fileContext,
    })

    // Get the latest user message
    const latestUserMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    
    // Check for document content requests
    let documentContext = "";
    if (latestUserMessage && latestUserMessage.role === "user") {
      const docContent = await getDocumentContextIfRequested(latestUserMessage.content);
      if (docContent) {
        documentContext = `\n\nDOCUMENT CONTENT:\nFilename: ${docContent.name}\nType: ${docContent.type}\n\n${docContent.content}\n\nWhen the user asks about this document, use the above content to provide a helpful response. If they want a summary, provide the summary.`;
        
        // Log the document context for debugging
        console.log('📝 Document context being added to system prompt:', {
          filename: docContent.name,
          type: docContent.type,
          contentPreview: docContent.content.substring(0, 100) + '...'
        });
      }
    }

    // Log the full system prompt for debugging
    console.log('🧠 Full system prompt:', systemPrompt + documentContext);

    // Check if this is an ambiguous query that needs clarification
    // Only do this for the first message in a conversation or very short follow-ups
    if (
      latestUserMessage &&
      latestUserMessage.role === "user" &&
      (messages.length <= 2 || latestUserMessage.content.length < 20) &&
      isAmbiguousQuery(latestUserMessage.content, messages)
    ) {
      // Return a clarification response
      return NextResponse.json({
        content: getClarificationResponse(latestUserMessage.content),
        role: "assistant",
      })
    }

    // Check if we should use mock response (for testing or when API key is missing)
    const useMockResponse = !process.env.OPENAI_API_KEY || process.env.USE_MOCK_RESPONSES === "true"

    if (useMockResponse) {
      console.log("Using mock response")
      // Return a mock response after a short delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // If there's file context, generate a more relevant mock response
      let mockResponse = ""

      if (fileContext) {
        mockResponse = "I've analyzed the files you uploaded. Based on the content, I can see that..."

        // Check if it's an image with OCR
        if (fileContext.includes("OCR") || messages.some((m) => m.content?.includes("OCR"))) {
          mockResponse += " The text extracted from your image shows important information that I can help interpret."
        }

        // Check if it's a document
        if (fileContext.includes("PDF") || fileContext.includes("DOCX")) {
          mockResponse += " The document you've shared contains several key points that we should address."
        }

        // Check if it's data
        if (fileContext.includes("CSV") || fileContext.includes("spreadsheet")) {
          mockResponse += " The data you've provided shows some interesting patterns that I can help analyze."
        }
      } else {
        // Use standard mock responses
        mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      }

      return NextResponse.json({
        content: mockResponse,
        role: "assistant",
      })
    }

    // If we have an API key, try to use the OpenAI API
    try {
      // Prepare the messages array with the system prompt
      let systemContent = systemPrompt || "You are a helpful assistant specializing in brand and marketing expertise."

      // Add document context if available
      if (documentContext) {
        systemContent += documentContext;
      }

      // Add file context if available
      if (fileContext) {
        systemContent += "\n\n" + fileContext;
      }

      // Enhance the system prompt with conversational guidance
      systemContent += `\n\nIMPORTANT CONVERSATION GUIDELINES:
1. Be conversational and human-like in your responses.
2. For ambiguous or broad queries, ask clarifying questions before providing detailed information.
3. Keep initial responses concise (2-3 sentences) unless the user asks for detailed information.
4. Use a friendly, empathetic tone that anticipates the user's needs.
5. End your responses with a follow-up question or suggestion to keep the conversation flowing naturally.
6. Avoid lengthy informational dumps unless explicitly requested.
7. If you're unsure about what the user is asking, politely ask for clarification.
8. IMPORTANT: Review the conversation history to avoid asking for clarification on topics that have already been discussed.`

      // Add conversation memory guidance
      systemContent += `\n\nCONVERSATION MEMORY:
1. If the user has already clarified a topic earlier in the conversation, don't ask for clarification again.
2. If the user has provided detailed information about a topic, assume they understand the basics of that topic.
3. Build upon previous exchanges rather than starting from scratch with each response.
4. Reference previous parts of the conversation when relevant to show continuity.`

      const messagePayload = [
        {
          role: "system",
          content: systemContent,
        },
        ...messages.map(({ content, role }) => ({ content, role })),
      ]

      // Log the full message payload for debugging (in development only)
      if (process.env.NODE_ENV === "development") {
        console.log("OpenAI API message payload:", JSON.stringify(messagePayload, null, 2))
      }

      // Using gpt-4o-mini for optimal cost-efficiency while maintaining good performance
      // Call the OpenAI API
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messagePayload,
          temperature: 0.7,
          max_tokens: 800, // Increased token limit for more detailed responses
          presence_penalty: 0.1, // Slight penalty to avoid repetition
          frequency_penalty: 0.1, // Slight penalty to encourage diverse vocabulary
        }),
      })

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        console.error("OpenAI API error:", openaiResponse.status, errorText)
        throw new Error(`OpenAI API error: ${openaiResponse.status} ${errorText}`)
      }

      const data = await openaiResponse.json()
      console.log("OpenAI API response:", data)

      return NextResponse.json({
        content: data.choices[0].message.content,
        role: "assistant",
      })
    } catch (openaiError) {
      console.error("Error calling OpenAI API:", openaiError)

      // Fallback to mock response if OpenAI API fails
      console.log("Falling back to mock response after OpenAI API error")

      // Generate a more contextual response if there are files
      let fallbackResponse = ""

      if (fileContext) {
        fallbackResponse =
          "I've looked at the files you uploaded, but I'm having trouble processing them right now. Could you ask a specific question about the content?"
      } else {
        const mockResponses = [
          "As a brand professional, I believe consistency is key to maintaining brand identity across all touchpoints.",
          "From my experience, the most successful brands balance global consistency with local relevance.",
          "I would recommend focusing on your core brand values while allowing for some flexibility in execution.",
        ]
        fallbackResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      }

      return NextResponse.json({
        content: fallbackResponse,
        role: "assistant",
        isMockResponse: true,
      })
    }
  } catch (error) {
    console.error("Unexpected error in chat API:", error)

    // Always return a valid response, even in case of errors
    return NextResponse.json({
      content: "I'm sorry, I encountered an error processing your request. Please try again.",
      role: "assistant",
      isErrorResponse: true,
    })
  }
}
