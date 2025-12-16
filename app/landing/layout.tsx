import type { Metadata } from "next"

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
    url: "https://app.the-xperience.com/landing",
    siteName: "Xperience Pro",
    title: "Xperience Pro - Stop applying in the dark. Start getting real interviews.",
    description: "A step-by-step program to build a winning CV, adapt it to each job, master LinkedIn, and feel confident in interviews.",
    images: [
      {
        url: "/og-image.jpg", // TODO: Add actual OG image
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
    images: ["/og-image.jpg"], // TODO: Add actual Twitter image
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
    canonical: "https://app.the-xperience.com/landing",
    languages: {
      "en": "https://app.the-xperience.com/landing",
      "fr": "https://app.the-xperience.com/landing",
    },
  },
  verification: {
    // TODO: Add Google Search Console verification if needed
    // google: "your-google-verification-code",
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

