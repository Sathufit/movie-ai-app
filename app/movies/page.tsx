'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid3x3, List, ChevronDown, Star, Calendar, TrendingUp, Film, X } from 'lucide-react';
import { tmdbApi, Movie } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';
import { useRouter } from 'next/navigation';

type CategoryType = 'popular' | 'top_rated' | 'now_playing' | 'upcoming';
type SortType = 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'title.asc';
type ViewType = 'grid' | 'list';

interface Genre {
  id: number;
  name: string;
}

export default function MoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryType>('popular');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortType>('popularity.desc');

  // Fetch genres on mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch movies when filters change
  useEffect(() => {
    fetchMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [category, page, selectedGenres, minRating, sortBy]);

  const fetchGenres = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
      );
      const data = await response.json();
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      let response;
      
      switch (category) {
        case 'popular':
          response = await tmdbApi.getPopular(page);
          break;
        case 'top_rated':
          response = await tmdbApi.getTopRated(page);
          break;
        case 'now_playing':
          response = await tmdbApi.getNowPlaying(page);
          break;
        case 'upcoming':
          response = await tmdbApi.getUpcoming(page);
          break;
        default:
          response = await tmdbApi.getPopular(page);
      }

      let filteredMovies = response.results;

      // Apply genre filter
      if (selectedGenres.length > 0) {
        filteredMovies = filteredMovies.filter((movie) =>
          movie.genre_ids?.some((id) => selectedGenres.includes(id))
        );
      }

      // Apply rating filter
      if (minRating > 0) {
        filteredMovies = filteredMovies.filter((movie) => movie.vote_average >= minRating);
      }

      // Apply sorting
      filteredMovies = sortMovies(filteredMovies, sortBy);

      setMovies(filteredMovies);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortMovies = (moviesList: Movie[], sort: SortType): Movie[] => {
    const sorted = [...moviesList];
    
    switch (sort) {
      case 'popularity.desc':
        return sorted.sort((a, b) => b.popularity - a.popularity);
      case 'vote_average.desc':
        return sorted.sort((a, b) => b.vote_average - a.vote_average);
      case 'release_date.desc':
        return sorted.sort((a, b) => 
          new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        );
      case 'title.asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  };

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
    setPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setMinRating(0);
    setPage(1);
  };

  const categories = [
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'top_rated', label: 'Top Rated', icon: Star },
    { id: 'now_playing', label: 'Now Playing', icon: Film },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  ];

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'title.asc', label: 'A-Z' },
  ];

  const ratingOptions = [
    { value: 0, label: 'All Ratings' },
    { value: 6, label: '6+ Stars' },
    { value: 7, label: '7+ Stars' },
    { value: 8, label: '8+ Stars' },
    { value: 9, label: '9+ Stars' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950/20 to-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="bg-gradient-to-br from-purple-600 to-red-600 p-2 rounded-xl">
                  <Film className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  MovieAI
                </h1>
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-4 text-sm text-zinc-400">
                <button 
                  onClick={() => router.push('/')} 
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
                <span className="text-zinc-700">|</span>
                <span className="text-purple-400 font-medium">Browse Movies</span>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-zinc-900/50 rounded-lg p-1">
                <button
                  onClick={() => setViewType('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewType === 'grid'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewType('list')}
                  className={`p-2 rounded transition-colors ${
                    viewType === 'list'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  showFilters
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
                {(selectedGenres.length > 0 || minRating > 0) && (
                  <span className="flex items-center justify-center w-5 h-5 bg-purple-500 text-white text-xs rounded-full">
                    {selectedGenres.length + (minRating > 0 ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setCategory(id as CategoryType);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                category === id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Filters</h3>
                  {(selectedGenres.length > 0 || minRating > 0) && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <X size={16} />
                      Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">
                      Sort By
                    </label>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortType)}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer hover:border-purple-500 transition-colors"
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={20} />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">
                      Minimum Rating
                    </label>
                    <div className="relative">
                      <select
                        value={minRating}
                        onChange={(e) => {
                          setMinRating(Number(e.target.value));
                          setPage(1);
                        }}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer hover:border-purple-500 transition-colors"
                      >
                        {ratingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={20} />
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-zinc-400 mb-3">
                      Genres ({selectedGenres.length} selected)
                    </label>
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                      <div className="flex flex-wrap gap-2">
                        {genres.map((genre) => (
                          <button
                            key={genre.id}
                            onClick={() => toggleGenre(genre.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              selectedGenres.includes(genre.id)
                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                            }`}
                          >
                            {genre.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              <Film className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-400" size={24} />
            </div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <Film className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-400 mb-2">No movies found</h3>
            <p className="text-zinc-600 mb-6">Try adjusting your filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Movies Grid/List */}
            <motion.div
              key={viewType}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={
                viewType === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {movies.map((movie, index) => (
                <MovieCard
                  key={movie.id}
                  movie={{
                    id: movie.id,
                    title: movie.title,
                    poster: movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : '/placeholder-movie.png',
                    rating: movie.vote_average,
                    releaseDate: movie.release_date,
                    description: movie.overview,
                  }}
                  index={index}
                  onClick={() => router.push(`/movie/${movie.id}`)}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-zinc-900/50 text-zinc-400 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-zinc-800"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                            : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-zinc-900/50 text-zinc-400 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-zinc-800"
                >
                  Next
                </button>
              </div>
            )}

            {/* Results Info */}
            <p className="text-center text-zinc-500 text-sm mt-8">
              Showing page {page} of {totalPages}
            </p>
          </>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(39, 39, 42, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </div>
  );
}
