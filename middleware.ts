import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only run on API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Skip content-type modification for upload-handler
    if (request.nextUrl.pathname === "/api/upload-handler") {
      return NextResponse.next()
    }
    
    // Add JSON content type header to all other API responses
    const response = NextResponse.next()
    response.headers.set("Content-Type", "application/json")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
