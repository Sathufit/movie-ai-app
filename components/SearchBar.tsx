"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp } from "lucide-react";
import { tmdbApi, Movie, getImageUrl } from "@/lib/tmdb";
import Image from "next/image";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const trendingSearches = [
    "Dune: Part Two",
    "Oppenheimer",
    "Poor Things",
    "The Holdovers",
    "Barbie",
  ];

  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await tmdbApi.searchMovies(query);
        setSearchResults(data.results.slice(0, 5));
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleClear = () => {
    setQuery("");
    setSearchResults([]);
  };

  const handleMovieClick = (id: number) => {
    router.push(`/movie/${id}`);
    setQuery("");
    setSearchResults([]);
    setIsFocused(false);
  };

  const handleTrendingClick = async (searchTerm: string) => {
    setQuery(searchTerm);
    try {
      const data = await tmdbApi.searchMovies(searchTerm);
      setSearchResults(data.results.slice(0, 5));
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div className="relative max-w-2xl">
      {/* Search Input */}
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          placeholder="Search for movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full bg-slate-900/80 backdrop-blur-sm border border-slate-700 hover:border-cyan-500/50 focus:border-cyan-500 text-white placeholder-slate-500 rounded-full py-3 md:py-4 pl-10 md:pl-12 pr-10 md:pr-12 outline-none transition-all duration-300 text-sm md:text-base"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </motion.div>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-lg border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[400px] md:max-h-[500px] overflow-y-auto"
          >
            {!query && (
              <div className="p-3 md:p-4">
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400 mb-2 md:mb-3">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="font-medium">Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleTrendingClick(term)}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full text-xs md:text-sm transition-all duration-200 hover:scale-105"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query && (
              <>
                <div className="border-t border-slate-800" />
                <div className="p-2">
                  {isSearching ? (
                    <div className="text-center py-8 text-slate-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                      <p className="text-sm">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((movie) => (
                      <button
                        key={movie.id}
                        onClick={() => handleMovieClick(movie.id)}
                        className="w-full flex items-center gap-3 md:gap-4 p-2 md:p-3 hover:bg-slate-800/50 rounded-lg transition-colors text-left"
                      >
                        <div className="relative w-10 h-14 md:w-12 md:h-16 flex-shrink-0 bg-slate-800 rounded overflow-hidden">
                          <Image
                            src={getImageUrl(movie.poster_path, 'w185')}
                            alt={movie.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-movie.png';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate text-sm md:text-base">
                            {movie.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400">
                            <span>{movie.release_date?.split("-")[0] || "N/A"}</span>
                            <span>•</span>
                            <span>⭐ {movie.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Search className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No results found for "{query}"</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
