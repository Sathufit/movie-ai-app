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
          className="w-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 hover:border-purple-500/50 focus:border-purple-500 text-white placeholder-zinc-500 rounded-full py-4 pl-12 pr-12 outline-none transition-all duration-300"
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
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-lg border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[500px] overflow-y-auto"
          >
            {!query && (
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleTrendingClick(term)}
                      className="px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-full text-sm transition-all duration-200 hover:scale-105"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query && (
              <>
                <div className="border-t border-zinc-800" />
                <div className="p-2">
                  {isSearching ? (
                    <div className="text-center py-8 text-zinc-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-2"></div>
                      <p>Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((movie) => (
                      <button
                        key={movie.id}
                        onClick={() => handleMovieClick(movie.id)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-zinc-800/50 rounded-lg transition-colors text-left"
                      >
                        <div className="relative w-12 h-16 flex-shrink-0 bg-zinc-800 rounded overflow-hidden">
                          <Image
                            src={getImageUrl(movie.poster_path, "w185")}
                            alt={movie.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-movie.png";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">
                            {movie.title}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <span>{movie.release_date?.split("-")[0] || "N/A"}</span>
                            <span>•</span>
                            <span>⭐ {movie.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 text-zinc-500">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No results found for "{query}"</p>
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
