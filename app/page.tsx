'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import AISearchBar from '@/components/AISearchBar';
import MovieCard from '@/components/MovieCard';
import { Film, Sparkles, Menu, X } from 'lucide-react';
import { tmdbApi, Movie } from '../lib/tmdb';

export default function Home() {
  const router = useRouter();
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const [nowPlayingData, trendingData] = await Promise.all([
          tmdbApi.getNowPlaying(),
          tmdbApi.getTrending('week'),
        ]);

        setNowPlaying(nowPlayingData.results.slice(0, 8));
        setTrending(trendingData.results.slice(0, 8));
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleMovieClick = (id: number) => {
    router.push(`/movie/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <header className="mb-12 md:mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
                <div className="bg-gradient-to-br from-purple-600 to-red-600 p-2 rounded-xl">
                  <Film className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
                  MovieAI
                </h1>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex gap-6 text-sm text-zinc-400" aria-label="Main navigation">
                <button onClick={() => router.push('/')} className="hover:text-white transition-colors">
                  Home
                </button>
                <button onClick={() => router.push('/status')} className="hover:text-white transition-colors">
                  Status
                </button>
                <button className="hover:text-white transition-colors">AI Features</button>
              </nav>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            
            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mb-6 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 animate-in slide-in-from-top">
                <nav className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      router.push('/');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-zinc-300 hover:text-white px-4 py-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => {
                      router.push('/status');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-zinc-300 hover:text-white px-4 py-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Status
                  </button>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-left text-zinc-300 hover:text-white px-4 py-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    AI Features
                  </button>
                </nav>
              </div>
            )}

            {/* Hero Text */}
            <section className="max-w-3xl mb-8">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Discover Your Next
                <span className="bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
                  {' '}
                  Favorite Movie
                </span>
              </h2>
              <p className="text-lg md:text-xl text-zinc-400 mb-2">
                Explore thousands of movies, get AI-powered recommendations, and never miss a great film again.
              </p>
            </section>

            {/* AI Search Bar */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">AI-Powered Search</h3>
              </div>
              <AISearchBar />
            </div>

            {/* Regular Search Bar */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Search by Title</h3>
              <SearchBar />
            </div>
          </header>

          {/* Now Playing Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white">Now Playing</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {nowPlaying.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={{
                    id: movie.id,
                    title: movie.title,
                    poster: movie.poster_path,
                    rating: movie.vote_average,
                    releaseDate: movie.release_date,
                    description: movie.overview,
                  }}
                  index={index}
                  onClick={() => handleMovieClick(movie.id)}
                />
              ))}
            </div>
          </section>

          {/* Trending Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white">Trending This Week</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={{
                    id: movie.id,
                    title: movie.title,
                    poster: movie.poster_path,
                    rating: movie.vote_average,
                    releaseDate: movie.release_date,
                    description: movie.overview,
                  }}
                  index={index}
                  onClick={() => handleMovieClick(movie.id)}
                />
              ))}
            </div>
          </section>

          {/* AI Feature Teaser */}
          <section className="bg-gradient-to-r from-purple-900/30 to-red-900/30 border border-purple-500/20 rounded-2xl p-8 md:p-12 backdrop-blur-sm">
            <div className="max-w-2xl">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                AI-Powered Movie Insights
              </h3>
              <p className="text-lg text-zinc-300 mb-6">
                Get instant plot summaries, personalized recommendations, and discover hidden gems with our advanced AI
                technology powered by Google Gemini.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-24 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-zinc-500 text-sm">
              © 2025 MovieAI. Create by Sathush Nanayakkara.
            </p>
            <button
              onClick={() => router.push('/status')}
              className="text-sm text-zinc-400 hover:text-purple-400 transition-colors"
            >
              Check System Status
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
