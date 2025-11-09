import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MovieAI - Discover Your Next Favorite Movie',
    short_name: 'MovieAI',
    description: 'Explore thousands of movies with AI-powered recommendations',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#9333ea',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
