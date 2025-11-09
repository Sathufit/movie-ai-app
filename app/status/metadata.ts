import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Status - MovieAI',
  description: 'Check MovieAI system status, API connectivity, and configuration. Verify TMDB API, Gemini AI, and Image CDN connections.',
  keywords: ['MovieAI status', 'API status', 'system check', 'TMDB connection', 'Gemini AI status'],
  robots: {
    index: false, // Don't index status pages
    follow: true,
  },
};
