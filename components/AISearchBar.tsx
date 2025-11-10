'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Loader2, X, Film, Tv } from 'lucide-react';
import { geminiService } from '@/lib/gemini';
import { tmdbApi, Movie, TVShow } from '@/lib/tmdb';
import Image from 'next/image';
import { getImageUrl } from '@/lib/tmdb';

type SearchResult = (Movie | TVShow) & { media_type: 'movie' | 'tv' };

export default function AISearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  const exampleQueries = [
    'A mind-bending sci-fi movie',
    'Romantic comedy set in New York',
    'Dark thriller with plot twists',
    'Adventure movie with treasure hunting',
  ];

  // Helper functions to handle Movie vs TVShow differences
  const getTitle = (result: SearchResult): string => {
    return 'title' in result ? result.title : result.name;
  };

  const getReleaseDate = (result: SearchResult): string | undefined => {
    return 'release_date' in result ? result.release_date : result.first_air_date;
  };

  const handleAISearch = async () => {
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setError('');
    setSearchResults([]);
    setShowResults(true);

    try {
      // Get AI suggestions
      const suggestions = await geminiService.searchMoviesByDescription(query);
      
      // Search TMDB for each suggestion (using multi-search to include both movies and TV shows)
      const searchPromises = suggestions.map(async (title) => {
        try {
          const result = await tmdbApi.searchMulti(title);
          // Filter to only movies and TV shows (no people)
          const filtered = result.results.filter(
            (item): item is SearchResult => 
              (item.media_type === 'movie' || item.media_type === 'tv')
          );
          return filtered[0]; // Get first match
        } catch (err) {
          return null;
        }
      });

      const results = await Promise.all(searchPromises);
      const validResults = results.filter((m): m is SearchResult => m !== null && m !== undefined);
      
      setSearchResults(validResults);

      if (validResults.length === 0) {
        setError('No results found. Try a different description.');
      }
    } catch (err: any) {
      console.error('AI Search error:', err);
      setError('Failed to search. Please check your Gemini API key.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMovieClick = (id: number, mediaType: 'movie' | 'tv') => {
    router.push(`/${mediaType}/${id}`);
    setQuery('');
    setShowResults(false);
    setSearchResults([]);
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
    setSearchResults([]);
    setError('');
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <div className="relative max-w-3xl mb-12">
      {/* AI Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-cyan-400">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
        </div>

        <input
          type="text"
          placeholder="Describe the movie or TV show you want to watch... (AI-powered)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
          className="w-full bg-gradient-to-r from-cyan-900/30 to-blue-900/30 backdrop-blur-sm border-2 border-cyan-500/50 hover:border-cyan-500 focus:border-cyan-500 text-white placeholder-slate-400 rounded-2xl py-3 md:py-4 lg:py-5 pl-10 md:pl-12 lg:pl-14 pr-20 md:pr-24 lg:pr-32 outline-none transition-all duration-300 text-sm md:text-base lg:text-lg"
        />

        <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex gap-1 md:gap-2">
          {query && (
            <button
              onClick={handleClear}
              className="text-slate-400 hover:text-white transition-colors p-1.5 md:p-2"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
          <button
            onClick={handleAISearch}
            disabled={!query.trim() || isSearching}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-3 md:px-4 lg:px-6 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-1 md:gap-2 text-xs md:text-sm lg:text-base shadow-lg shadow-cyan-500/30"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                <span className="hidden sm:inline">Searching...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Example Queries */}
      {!showResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 md:mt-4 flex flex-wrap gap-2"
        >
          <span className="text-xs md:text-sm text-slate-500">Try:</span>
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-xs md:text-sm bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white px-2.5 md:px-3 py-1 rounded-full transition-all duration-200 border border-slate-700 hover:border-cyan-500/50"
            >
              {example}
            </button>
          ))}
        </motion.div>
      )}

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 mt-4 bg-slate-900/95 backdrop-blur-lg border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[500px] md:max-h-[600px] overflow-y-auto"
          >
            {error ? (
              <div className="p-6 md:p-8 text-center">
                <p className="text-red-400 text-sm md:text-base">{error}</p>
                <button
                  onClick={handleClear}
                  className="mt-4 text-cyan-400 hover:text-cyan-300 transition-colors text-sm md:text-base"
                >
                  Try again
                </button>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-3 md:p-4">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                    AI Found {searchResults.length} Results
                  </h3>
                  <button
                    onClick={handleClear}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleMovieClick(result.id, result.media_type)}
                      className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all duration-200 text-left border border-slate-700 hover:border-cyan-500/50"
                    >
                      <div className="relative w-14 h-20 md:w-16 md:h-24 flex-shrink-0 bg-slate-800 rounded overflow-hidden">
                        <Image
                          src={getImageUrl(result.poster_path, 'w185')}
                          alt={getTitle(result)}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-movie.png';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-semibold truncate text-sm md:text-base">
                            {getTitle(result)}
                          </h4>
                          {result.media_type === 'tv' && (
                            <Tv className="w-3 h-3 md:w-4 md:h-4 text-cyan-400 flex-shrink-0" />
                          )}
                          {result.media_type === 'movie' && (
                            <Film className="w-3 h-3 md:w-4 md:h-4 text-blue-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400 mb-1">
                          <span>{getReleaseDate(result)?.split('-')[0] || 'N/A'}</span>
                          <span>•</span>
                          <span>⭐ {result.vote_average.toFixed(1)}</span>
                          <span>•</span>
                          <span className="text-[10px] md:text-xs text-slate-500">
                            {result.media_type === 'tv' ? 'TV Show' : 'Movie'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {result.overview}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : isSearching ? (
              <div className="p-8 md:p-12 text-center">
                <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-cyan-500 mx-auto mb-4 animate-spin" />
                <p className="text-slate-400 text-sm md:text-base">AI is finding the perfect movies for you...</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
