import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FlowGen v2.0 - Visual App Builder",
  description: "Empower non-technical founders to build, deploy, and own their full-stack web applications by translating visual logic into production-grade code.",
  keywords: ["no-code", "app builder", "visual programming", "AI", "deployment"],
  authors: [{ name: "FlowGen Team" }],
  openGraph: {
    title: "FlowGen v2.0 - Visual App Builder",
    description: "Build full-stack apps visually with AI-powered code generation",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
