import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Poppins } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import ErrorBoundary from "@/components/ErrorBoundary"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Xperience Pro - Stop applying in the dark. Start getting real interviews.",
  description: "A step-by-step program to build a winning CV, adapt it to each job, master LinkedIn, and feel confident in interviews. For students, employees, and job seekers in Morocco.",
  keywords: [
    "CV writing",
    "job search",
    "career coaching",
    "LinkedIn optimization",
    "interview preparation",
    "Morocco",
    "emploi Maroc",
    "recherche d'emploi",
    "coaching carrière",
    "Xperience Pro",
  ],
  authors: [{ name: "Ali El Harti" }],
  creator: "Ali El Harti",
  publisher: "Xperience Pro",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["fr_FR"],
    url: "https://the-xperience.com",
    siteName: "Xperience Pro",
    title: "Xperience Pro - Stop applying in the dark. Start getting real interviews.",
    description: "A step-by-step program to build a winning CV, adapt it to each job, master LinkedIn, and feel confident in interviews.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Xperience Pro - Career Coaching Program",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xperience Pro - Stop applying in the dark. Start getting real interviews.",
    description: "A step-by-step program to build a winning CV, adapt it to each job, master LinkedIn, and feel confident in interviews.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://the-xperience.com",
    languages: {
      "en": "https://the-xperience.com",
      "fr": "https://the-xperience.com",
    },
  },
  icons: {
    icon: "/logos/favicon.png",
    apple: "/logos/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${montserrat.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <Suspense fallback={null}>{children}</Suspense>
        </ErrorBoundary>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
