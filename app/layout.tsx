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
  title: "MovieAI - Discover Your Next Favorite Movie",
  description: "Explore thousands of movies with AI-powered recommendations. Get instant plot summaries, personalized suggestions, and never miss a great film again.",
  keywords: ["movies", "AI", "recommendations", "film", "cinema", "entertainment"],
  authors: [{ name: "MovieAI Team" }],
  openGraph: {
    title: "MovieAI - Discover Your Next Favorite Movie",
    description: "Explore thousands of movies with AI-powered recommendations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
