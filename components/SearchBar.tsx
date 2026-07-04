"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Film, Tv } from "lucide-react";
import { tmdbApi, Movie, TVShow, getImageUrl } from "@/lib/tmdb";
import Image from "next/image";

type SearchResult = (Movie | TVShow) & { media_type?: 'movie' | 'tv' };

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const trendingSearches = [
    "Dune: Part Two",
    "Oppenheimer",
    "The Last of Us",
    "Wednesday",
    "Barbie",
  ];

  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await tmdbApi.searchMulti(query);
        const filtered = data.results
          .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
          .slice(0, 6);
        setSearchResults(filtered);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  const handleClear = () => {
    setQuery("");
    setSearchResults([]);
  };

  const handleResultClick = (id: number, mediaType: 'movie' | 'tv' = 'movie') => {
    router.push(`/${mediaType}/${id}`);
    setQuery("");
    setSearchResults([]);
    setIsFocused(false);
  };

  const handleTrendingClick = async (term: string) => {
    setQuery(term);
    try {
      const data = await tmdbApi.searchMulti(term);
      const filtered = data.results
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        .slice(0, 6);
      setSearchResults(filtered);
    } catch {
      /* ignore */
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setSearchResults([]);
      setIsFocused(false);
    }
  };

  const getTitle = (result: SearchResult) =>
    'title' in result ? result.title : result.name;

  const getReleaseDate = (result: SearchResult) =>
    'release_date' in result ? result.release_date : result.first_air_date;

  return (
    <div className="relative max-w-2xl">
      {/* Input */}
      <motion.div
        animate={{ scale: isFocused ? 1.01 : 1 }}
        transition={{ duration: 0.15 }}
        className="relative"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          placeholder="Search by title — press Enter for full results"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#1a1a1a] border border-white/10 hover:border-white/20 focus:border-white/40 text-white placeholder-zinc-500 rounded-xl py-3.5 pl-12 pr-12 outline-none transition-all duration-200 text-sm"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-[420px] overflow-y-auto"
          >
            {!query && (
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3 uppercase tracking-wider font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Trending
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleTrendingClick(term)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-lg text-xs transition-all duration-150"
                    >
                      {term}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-600 mt-3">
                  Press <kbd className="bg-white/10 px-1 rounded text-zinc-400">Enter</kbd> to see all results
                </p>
              </div>
            )}

            {query && (
              <div className="p-2">
                {isSearching ? (
                  <div className="text-center py-8 text-zinc-500">
                    <div className="w-6 h-6 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.id, result.media_type || 'movie')}
                        className="w-full flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-lg transition-colors text-left"
                      >
                        <div className="relative w-10 h-14 flex-shrink-0 bg-[#222] rounded overflow-hidden">
                          <Image
                            src={getImageUrl(result.poster_path, 'w185')}
                            alt={getTitle(result)}
                            fill
                            className="object-cover"
                            onError={(e) => { e.currentTarget.src = '/placeholder-movie.png'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white text-sm font-medium truncate">{getTitle(result)}</h4>
                            {result.media_type === 'tv'
                              ? <Tv className="w-3 h-3 text-[#e50914] flex-shrink-0" />
                              : <Film className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                            }
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                            <span>{getReleaseDate(result)?.split('-')[0] || 'N/A'}</span>
                            <span>·</span>
                            <span>★ {result.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                    {/* View all link */}
                    <button
                      onClick={() => {
                        router.push(`/search?q=${encodeURIComponent(query)}`);
                        setQuery('');
                        setIsFocused(false);
                      }}
                      className="w-full text-center py-3 text-xs text-[#e50914] hover:text-red-400 transition-colors border-t border-white/5 mt-1"
                    >
                      View all results for &ldquo;{query}&rdquo; →
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    <Search className="w-7 h-7 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No results for &ldquo;{query}&rdquo;</p>
                    <button
                      onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
                      className="text-xs text-[#e50914] hover:text-red-400 transition-colors mt-2 block mx-auto"
                    >
                      Try AI search instead
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
