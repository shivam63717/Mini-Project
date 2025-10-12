import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/providers/toast-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "CyberML - Data Science Platform",
  description: "Advanced cybersecurity machine learning and data science platform",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            {children}
            <ToastProvider />
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
