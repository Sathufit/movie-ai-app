import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://movieai-eta.vercel.app'),
  title: {
    default: "MovieAI - AI-Powered Movie Discovery & Recommendations",
    template: "%s | MovieAI"
  },
  description: "Discover your next favorite movie with AI-powered natural language search. Explore 500,000+ movies, get instant AI summaries, personalized recommendations, and trending films. Search like you talk: 'sci-fi movies like Interstellar' and get perfect matches.",
  keywords: [
    "AI movie search",
    "movie recommendations",
    "natural language movie search",
    "AI movie discovery",
    "find movies to watch",
    "movie database",
    "AI film recommendations",
    "movie search engine",
    "TMDB alternative",
    "Netflix alternative",
    "what to watch",
    "movie AI assistant",
    "gemini AI movies",
    "smart movie search",
    "film discovery",
    "trending movies",
    "now playing movies",
    "movie plot summaries",
    "personalized movie recommendations"
  ],
  authors: [{ name: "MovieAI Team", url: "https://movieai-eta.vercel.app" }],
  creator: "MovieAI",
  publisher: "MovieAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://movieai-eta.vercel.app",
    siteName: "MovieAI",
    title: "MovieAI - AI-Powered Movie Discovery & Recommendations",
    description: "Search 500,000+ movies using natural language. Ask 'thriller with twist ending' and get AI-powered recommendations instantly. Never scroll endlessly again!",
    images: [
      {
        url: "/og-image.png", // We'll create this
        width: 1200,
        height: 630,
        alt: "MovieAI - AI-Powered Movie Discovery Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MovieAI - AI-Powered Movie Discovery",
    description: "Search movies like you talk. Get AI recommendations instantly from 500,000+ films.",
    images: ["/og-image.png"],
    creator: "@movieai", // Replace with your Twitter handle
  },
  alternates: {
    canonical: "https://movieai-eta.vercel.app",
  },
  category: "entertainment",
  applicationName: "MovieAI",
  appleWebApp: {
    capable: true,
    title: "MovieAI",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'MovieAI',
    url: 'https://movieai-eta.vercel.app',
    description: 'AI-powered movie discovery platform with natural language search and personalized recommendations',
    applicationCategory: 'Entertainment',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    featureList: [
      'AI-powered natural language search',
      'Access to 500,000+ movies',
      'Instant AI-generated summaries',
      'Personalized recommendations',
      'Real-time trending movies',
      'Mobile responsive design'
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
