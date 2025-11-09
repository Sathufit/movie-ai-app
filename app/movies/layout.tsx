import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Movies - Discover & Filter Thousands of Films',
  description: 'Browse and filter through thousands of movies. Filter by genre, rating, and release date. Explore popular movies, top-rated films, now playing in theaters, and upcoming releases. Find your perfect movie with advanced search and filtering.',
  keywords: [
    'browse movies',
    'filter movies by genre',
    'top rated movies',
    'popular movies',
    'now playing movies',
    'upcoming movies',
    'movie database',
    'search movies',
    'movie catalog',
    'film collection',
    'movies by rating',
    'movies by year',
    'action movies',
    'comedy movies',
    'drama movies',
    'sci-fi movies',
    'horror movies',
    'romance movies'
  ],
  openGraph: {
    title: 'Browse Movies - MovieAI',
    description: 'Browse and filter thousands of movies by genre, rating, and more. Discover popular, top-rated, and upcoming films.',
    url: 'https://movieai-eta.vercel.app/movies',
    siteName: 'MovieAI',
    images: [
      {
        url: 'https://movieai-eta.vercel.app/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'MovieAI - Browse Movies',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse Movies - MovieAI',
    description: 'Browse and filter thousands of movies by genre, rating, and more.',
    images: ['https://movieai-eta.vercel.app/opengraph-image'],
  },
  alternates: {
    canonical: 'https://movieai-eta.vercel.app/movies',
  },
};

export default function MoviesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
