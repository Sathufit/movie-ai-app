'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid3x3, List, ChevronDown, Star, Calendar, TrendingUp, Film, X, ArrowUp, Tv } from 'lucide-react';
import { tmdbApi, Movie, TVShow } from '@/lib/tmdb';
import MediaCard from '@/components/MediaCard';
import MovieCard from '@/components/MovieCard';
import Navbar from '@/components/Navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

type MediaType = 'movie' | 'tv';
type MovieCategory = 'popular' | 'top_rated' | 'now_playing' | 'upcoming';
type TVCategory = 'popular' | 'top_rated' | 'on_the_air' | 'airing_today';
type SortType = 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'title.asc';
type ViewType = 'grid' | 'list';

interface Genre {
  id: number;
  name: string;
}

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as MediaType) || 'movie';
  const initialCategory = searchParams.get('category') || 'popular';

  const [mediaType, setMediaType] = useState<MediaType>(initialType);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [movieCategory, setMovieCategory] = useState<MovieCategory>(
    (initialCategory as MovieCategory) || 'popular'
  );
  const [tvCategory, setTVCategory] = useState<TVCategory>('popular');
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
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { fetchGenres(); }, [mediaType]);

  useEffect(() => {
    fetchContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [mediaType, movieCategory, tvCategory, page, selectedGenres, minRating, sortBy]);

  const fetchGenres = async () => {
    try {
      const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
      const response = await fetch(
        `https://api.themoviedb.org/3/genre/${endpoint}/list?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
      );
      const data = await response.json();
      setGenres(data.genres || []);
    } catch {}
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      let response: any;
      if (mediaType === 'movie') {
        switch (movieCategory) {
          case 'popular': response = await tmdbApi.getPopular(page); break;
          case 'top_rated': response = await tmdbApi.getTopRated(page); break;
          case 'now_playing': response = await tmdbApi.getNowPlaying(page); break;
          case 'upcoming': response = await tmdbApi.getUpcoming(page); break;
          default: response = await tmdbApi.getPopular(page);
        }
        let filtered = response.results;
        if (selectedGenres.length > 0) {
          filtered = filtered.filter((m: Movie) => m.genre_ids?.some((id) => selectedGenres.includes(id)));
        }
        if (minRating > 0) filtered = filtered.filter((m: Movie) => m.vote_average >= minRating);
        setMovies(sortContent(filtered, sortBy));
        setTotalPages(response.total_pages);
      } else {
        switch (tvCategory) {
          case 'popular': response = await tmdbApi.getPopularTV(page); break;
          case 'top_rated': response = await tmdbApi.getTopRatedTV(page); break;
          case 'on_the_air': response = await tmdbApi.getOnTheAirTV(page); break;
          case 'airing_today': response = await tmdbApi.getAiringTodayTV(page); break;
          default: response = await tmdbApi.getPopularTV(page);
        }
        let filtered = response.results;
        if (selectedGenres.length > 0) {
          filtered = filtered.filter((s: TVShow) => s.genre_ids?.some((id) => selectedGenres.includes(id)));
        }
        if (minRating > 0) filtered = filtered.filter((s: TVShow) => s.vote_average >= minRating);
        setTVShows(sortContent(filtered, sortBy));
        setTotalPages(response.total_pages);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortContent = (content: any[], sort: SortType) => {
    const sorted = [...content];
    switch (sort) {
      case 'popularity.desc': return sorted.sort((a, b) => b.popularity - a.popularity);
      case 'vote_average.desc': return sorted.sort((a, b) => b.vote_average - a.vote_average);
      case 'release_date.desc':
        return sorted.sort((a, b) =>
          new Date(b.release_date || b.first_air_date).getTime() -
          new Date(a.release_date || a.first_air_date).getTime()
        );
      case 'title.asc':
        return sorted.sort((a, b) =>
          (a.title || a.name).toLowerCase().localeCompare((b.title || b.name).toLowerCase())
        );
      default: return sorted;
    }
  };

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setMinRating(0);
    setPage(1);
  };

  const handleMediaClick = (id: number, type: MediaType) => router.push(`/${type}/${id}`);

  const movieCategories = [
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'top_rated', label: 'Top Rated', icon: Star },
    { id: 'now_playing', label: 'Now Playing', icon: Film },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  ];

  const tvCategories = [
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'top_rated', label: 'Top Rated', icon: Star },
    { id: 'on_the_air', label: 'On The Air', icon: Tv },
    { id: 'airing_today', label: 'Airing Today', icon: Calendar },
  ];

  const sortOptions = [
    { value: 'popularity.desc', label: 'Most Popular' },
    { value: 'vote_average.desc', label: 'Highest Rated' },
    { value: 'release_date.desc', label: 'Newest First' },
    { value: 'title.asc', label: 'A–Z' },
  ];

  const ratingOptions = [
    { value: 0, label: 'All Ratings' },
    { value: 6, label: '6+ Stars' },
    { value: 7, label: '7+ Stars' },
    { value: 8, label: '8+ Stars' },
    { value: 9, label: '9+ Stars' },
  ];

  const currentContent = mediaType === 'movie' ? movies : tvShows;
  const categories = mediaType === 'movie' ? movieCategories : tvCategories;
  const currentCategory = mediaType === 'movie' ? movieCategory : tvCategory;

  const activeFilterCount = selectedGenres.length + (minRating > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 pt-24 md:pt-28 pb-16">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {mediaType === 'movie' ? 'Movies' : 'TV Shows'}
            </h1>
            {!loading && currentContent.length > 0 && (
              <p className="text-sm text-zinc-500 mt-1">
                {currentContent.length} titles · Page {page} of {totalPages}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="hidden sm:flex items-center bg-[#1a1a1a] rounded-lg p-1 border border-white/5">
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewType === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewType === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                showFilters || activeFilterCount > 0
                  ? 'bg-[#e50914]/10 text-[#e50914] border border-[#e50914]/30'
                  : 'bg-[#1a1a1a] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-[#e50914] text-white text-xs rounded-full font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Media Type Toggle */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { type: 'movie' as MediaType, label: 'Movies', Icon: Film },
            { type: 'tv' as MediaType, label: 'TV Shows', Icon: Tv },
          ].map(({ type, label, Icon }) => (
            <button
              key={type}
              onClick={() => { setMediaType(type); setPage(1); setSelectedGenres([]); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mediaType === type
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-[#1a1a1a] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                mediaType === 'movie'
                  ? setMovieCategory(id as MovieCategory)
                  : setTVCategory(id as TVCategory);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                currentCategory === id
                  ? 'bg-[#e50914] text-white shadow-lg shadow-red-900/20'
                  : 'bg-[#1a1a1a] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Quick Genre Filters */}
        {!showFilters && (
          <div className="mb-6 overflow-x-auto hide-scrollbar -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              <span className="text-xs text-zinc-600 flex items-center px-1">Genres:</span>
              {[
                { id: 28, name: 'Action' },
                { id: 35, name: 'Comedy' },
                { id: 18, name: 'Drama' },
                { id: 878, name: 'Sci-Fi' },
                { id: 27, name: 'Horror' },
                { id: 10749, name: 'Romance' },
                { id: 53, name: 'Thriller' },
                { id: 16, name: 'Animation' },
              ].map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => { toggleGenre(genre.id); setShowFilters(true); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedGenres.includes(genre.id)
                      ? 'bg-[#e50914] text-white'
                      : 'bg-[#1a1a1a] text-zinc-400 hover:text-white border border-white/5'
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
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-white">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      <X size={12} />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Sort */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Sort By</label>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortType)}
                        className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white appearance-none cursor-pointer hover:border-white/20 focus:border-white/30 outline-none transition-colors"
                      >
                        {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Min Rating</label>
                    <div className="relative">
                      <select
                        value={minRating}
                        onChange={(e) => { setMinRating(Number(e.target.value)); setPage(1); }}
                        className="w-full bg-[#222] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white appearance-none cursor-pointer hover:border-white/20 focus:border-white/30 outline-none transition-colors"
                      >
                        {ratingOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={14} />
                    </div>
                  </div>

                  {/* Genres */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                      Genres {selectedGenres.length > 0 && `(${selectedGenres.length})`}
                    </label>
                    <div className="max-h-[150px] overflow-y-auto hide-scrollbar">
                      <div className="flex flex-wrap gap-1.5">
                        {genres.map((genre) => (
                          <button
                            key={genre.id}
                            onClick={() => toggleGenre(genre.id)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                              selectedGenres.includes(genre.id)
                                ? 'bg-[#e50914] text-white'
                                : 'bg-[#222] text-zinc-400 hover:text-white border border-white/5'
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

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentContent.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1a1a1a] rounded-full mb-4 border border-white/5">
              {mediaType === 'movie' ? <Film className="w-8 h-8 text-zinc-600" /> : <Tv className="w-8 h-8 text-zinc-600" />}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No results</h3>
            <p className="text-sm text-zinc-500 mb-6">Try adjusting your filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-[#e50914] hover:bg-[#c40812] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <motion.div
              key={`${mediaType}-${viewType}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={
                viewType === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5'
                  : 'flex flex-col gap-3'
              }
            >
              {currentContent.map((item, index) =>
                viewType === 'grid' ? (
                  <div key={item.id} onClick={() => handleMediaClick(item.id, mediaType)} className="cursor-pointer group">
                    <MediaCard
                      media={{
                        id: item.id,
                        title: 'title' in item ? item.title : undefined,
                        name: 'name' in item ? item.name : undefined,
                        poster: item.poster_path,
                        rating: item.vote_average,
                        releaseDate: 'release_date' in item ? item.release_date : undefined,
                        firstAirDate: 'first_air_date' in item ? item.first_air_date : undefined,
                        description: item.overview,
                        mediaType,
                      }}
                      index={index}
                    />
                  </div>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => handleMediaClick(item.id, mediaType)}
                    className="flex items-center gap-4 bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-white/5 rounded-xl p-3 transition-all duration-200 text-left group"
                  >
                    <div className="relative w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#222]">
                      <img
                        src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                        alt={'title' in item ? item.title : item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = '/placeholder-movie.png'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#e50914] transition-colors">
                        {'title' in item ? item.title : item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-yellow-400 font-bold">★ {item.vote_average.toFixed(1)}</span>
                        <span className="text-xs text-zinc-600">
                          {('release_date' in item ? item.release_date : item.first_air_date)?.split('-')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{item.overview}</p>
                    </div>
                  </button>
                )
              )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-[#1a1a1a] border border-white/10 text-zinc-400 text-sm rounded-lg hover:bg-[#222] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;

                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          page === pageNum
                            ? 'bg-[#e50914] text-white shadow-lg shadow-red-900/30'
                            : 'bg-[#1a1a1a] border border-white/10 text-zinc-400 hover:bg-[#222] hover:text-white'
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
                  className="px-4 py-2 bg-[#1a1a1a] border border-white/10 text-zinc-400 text-sm rounded-lg hover:bg-[#222] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 p-3 bg-[#e50914] hover:bg-[#c40812] text-white rounded-full shadow-xl shadow-red-900/30 hover:scale-110 transition-all duration-200 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
