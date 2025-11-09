'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import AISearchBar from '@/components/AISearchBar';
import MovieCard from '@/components/MovieCard';
import { Film, Sparkles, Menu, X, ArrowUp } from 'lucide-react';
import { tmdbApi, Movie } from '../lib/tmdb';

export default function Home() {
  const router = useRouter();
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
            <Film className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" size={24} />
          </div>
          <p className="text-slate-400 mt-4 animate-pulse">Loading amazing movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <header className="mb-12 md:mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/30">
                  <Film className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  MovieAI
                </h1>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex gap-6 text-sm text-slate-400" aria-label="Main navigation">
                <button onClick={() => router.push('/')} className="hover:text-cyan-400 transition-colors duration-300">
                  Home
                </button>
                <button onClick={() => router.push('/movies')} className="hover:text-cyan-400 transition-colors duration-300">
                  Browse Movies
                </button>
              </nav>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white p-2 hover:bg-slate-800 rounded-lg transition-all duration-300 hover:scale-110"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
            
            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mb-6 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-xl shadow-cyan-500/5 animate-in slide-in-from-top">
                <nav className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      router.push('/');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-slate-300 hover:text-cyan-400 px-4 py-2 hover:bg-slate-800/50 rounded-lg transition-all duration-300"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => {
                      router.push('/movies');
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-slate-300 hover:text-cyan-400 px-4 py-2 hover:bg-slate-800/50 rounded-lg transition-all duration-300"
                  >
                    Browse Movies
                  </button>
                </nav>
              </div>
            )}

            {/* Hero Text */}
            <section className="max-w-3xl mb-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight animate-in fade-in slide-in-from-bottom duration-700">
                Discover Your Next Favorite Movie
              </h2>
              <p className="text-base md:text-lg text-slate-400 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '100ms' }}>
                Explore thousands of movies, get AI-powered recommendations, and never miss a great film.
              </p>
              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-6 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-500">500K+ Movies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span className="text-sm text-slate-500">AI-Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span className="text-sm text-slate-500">Updated Daily</span>
                </div>
              </div>
            </section>

            {/* AI Search Bar */}
            <div className="mb-5 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-sm font-medium text-white">AI-Powered Search</h3>
              </div>
              <AISearchBar />
            </div>

            {/* Regular Search Bar */}
            <div className="animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '300ms' }}>
              <h3 className="text-sm font-medium text-white mb-2">Search by Title</h3>
              <SearchBar />
            </div>
          </header>

          {/* Now Playing Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Now Playing</h3>
                <p className="text-xs text-slate-500">In theaters now</p>
              </div>
              <button 
                onClick={() => router.push('/movies?category=now_playing')}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-300 flex items-center gap-1 group"
              >
                View All
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Trending This Week</h3>
                <p className="text-xs text-slate-500">Most popular movies right now</p>
              </div>
              <button 
                onClick={() => router.push('/movies?category=popular')}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-300 flex items-center gap-1 group"
              >
                View All
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

          {/* Browse All Movies CTA */}
          <section className="mb-12 group">
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 rounded-xl p-8 md:p-10 text-center backdrop-blur-sm relative overflow-hidden transition-all duration-500 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="inline-block p-3 bg-cyan-500/10 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Film className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                  Discover Thousands of Movies
                </h3>
                <p className="text-sm md:text-base text-slate-400 mb-5 max-w-xl mx-auto">
                  Browse our complete collection with advanced filters by genre, rating, and release date.
                </p>
                <button
                  onClick={() => router.push('/movies')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105"
                >
                  <Film size={18} />
                  Browse All Movies
                </button>
              </div>
            </div>
          </section>

          {/* AI Feature Teaser */}
          <section className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 rounded-xl p-8 md:p-10 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-500">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  AI-Powered Movie Insights
                </h3>
              </div>
              <p className="text-sm md:text-base text-slate-400">
                Get instant plot summaries, personalized recommendations, and discover hidden gems with our advanced AI
                technology powered by Google Gemini.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-16 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <p className="text-slate-600 text-xs">
              © 2025 MovieAI. Created by Sathush Nanayakkara.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-110 transition-all duration-300 z-50 group"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
}
