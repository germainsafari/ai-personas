import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Roboto } from "next/font/google"
import type { Metadata } from "next"
import { Toaster } from "@/components/toaster"
import { DebugInfo } from "@/components/debug-info"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "AI Personas",
  description: "Interactive AI Personas with customizable profiles",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          {process.env.NODE_ENV === "development" && <DebugInfo />}
        </ThemeProvider>
      </body>
    </html>
  )
}
