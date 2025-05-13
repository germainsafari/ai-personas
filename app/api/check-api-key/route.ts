import { NextResponse } from "next/server"

export async function GET() {
  try {
    const hasApiKey = !!process.env.OPENAI_API_KEY

    // Log the API key status (without revealing the key)
    console.log("API key check:", hasApiKey ? "API key is set" : "API key is not set")

    return NextResponse.json({
      hasApiKey,
      useMockResponses: !hasApiKey || process.env.USE_MOCK_RESPONSES === "true",
    })
  } catch (error: any) {
    console.error("Error checking API key:", error)

    // Always return a valid response
    return NextResponse.json({
      hasApiKey: false,
      useMockResponses: true,
      error: error.message || "An error occurred while checking API key",
    })
  }
}
