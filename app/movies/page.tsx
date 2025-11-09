'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid3x3, List, ChevronDown, Star, Calendar, TrendingUp, Film, X, ArrowUp } from 'lucide-react';
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
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/50 shadow-lg shadow-cyan-500/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group"
              >
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/30">
                  <Film className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  MovieAI
                </h1>
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-4 text-sm text-slate-400">
                <button 
                  onClick={() => router.push('/')} 
                  className="hover:text-cyan-400 transition-colors duration-300"
                >
                  Home
                </button>
                <span className="text-slate-700">|</span>
                <span className="text-cyan-400 font-medium">Browse Movies</span>
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-900/50 rounded-lg p-1 border border-slate-800">
                <button
                  onClick={() => setViewType('grid')}
                  className={`p-2 rounded transition-all duration-300 ${
                    viewType === 'grid'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewType('list')}
                  className={`p-2 rounded transition-all duration-300 ${
                    viewType === 'list'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  showFilters
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
                {(selectedGenres.length > 0 || minRating > 0) && (
                  <span className="flex items-center justify-center w-5 h-5 bg-cyan-500 text-white text-xs rounded-full animate-pulse">
                    {selectedGenres.length + (minRating > 0 ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 relative">
        {/* Page Title with count */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {category === 'popular' && 'Popular Movies'}
            {category === 'top_rated' && 'Top Rated Movies'}
            {category === 'now_playing' && 'Now Playing'}
            {category === 'upcoming' && 'Coming Soon'}
          </h1>
          {!loading && movies.length > 0 && (
            <p className="text-sm text-slate-500">
              Showing {movies.length} movies • Page {page} of {totalPages}
            </p>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setCategory(id as CategoryType);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                category === id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105'
                  : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Quick Genre Filters */}
        {!showFilters && (
          <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-2 min-w-max">
              <span className="text-xs text-slate-500 flex items-center px-2">Quick filters:</span>
              {[
                { id: 28, name: 'Action' },
                { id: 35, name: 'Comedy' },
                { id: 18, name: 'Drama' },
                { id: 878, name: 'Sci-Fi' },
                { id: 27, name: 'Horror' },
                { id: 10749, name: 'Romance' },
              ].map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => {
                    toggleGenre(genre.id);
                    if (!showFilters) setShowFilters(true);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                    selectedGenres.includes(genre.id)
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5 shadow-xl shadow-cyan-500/5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Filters</h3>
                    {(selectedGenres.length > 0 || minRating > 0) && (
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedGenres.length} {selectedGenres.length === 1 ? 'genre' : 'genres'}
                        {minRating > 0 && `, ${minRating}+ stars`}
                      </p>
                    )}
                  </div>
                  {(selectedGenres.length > 0 || minRating > 0) && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-300"
                    >
                      <X size={14} />
                      Clear
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Sort By */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                      Sort By
                    </label>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortType)}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white appearance-none cursor-pointer hover:border-cyan-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                      Minimum Rating
                    </label>
                    <div className="relative">
                      <select
                        value={minRating}
                        onChange={(e) => {
                          setMinRating(Number(e.target.value));
                          setPage(1);
                        }}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white appearance-none cursor-pointer hover:border-cyan-500/50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                      >
                        {ratingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                      Genres {selectedGenres.length > 0 && `(${selectedGenres.length})`}
                    </label>
                    <div className="max-h-[180px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 #0f172a' }}>
                      <div className="flex flex-wrap gap-2">
                        {genres.map((genre) => (
                          <button
                            key={genre.id}
                            onClick={() => toggleGenre(genre.id)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all duration-300 ${
                              selectedGenres.includes(genre.id)
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
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
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 bg-slate-900/50 rounded-2xl mb-4">
              <Film className="w-16 h-16 text-slate-700 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              We couldn't find any movies matching your filters. Try adjusting your search criteria.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/30"
              >
                Clear All Filters
              </button>
              <button
                onClick={() => {
                  setCategory('popular');
                  clearFilters();
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors duration-300"
              >
                View Popular Movies
              </button>
            </div>
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
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-slate-900/80 border border-slate-700 text-slate-400 text-sm rounded-lg hover:bg-slate-800 hover:border-cyan-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1.5">
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
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-300 ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                            : 'bg-slate-900/80 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-cyan-500/50'
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
                  className="px-4 py-2 bg-slate-900/80 border border-slate-700 text-slate-400 text-sm rounded-lg hover:bg-slate-800 hover:border-cyan-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Next
                </button>
              </div>
            )}

            {/* Results Info */}
            <p className="text-center text-slate-600 text-xs mt-6">
              Page {page} of {totalPages}
            </p>
          </>
        )}
      </div>

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
