'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Search, Sparkles, X, Film, Tv, Star, Loader2, ArrowLeft } from 'lucide-react';
import { tmdbApi, Movie, TVShow, getImageUrl } from '@/lib/tmdb';
import { geminiService } from '@/lib/gemini';
import Navbar from '@/components/Navbar';

type SearchResult = (Movie | TVShow) & { media_type?: 'movie' | 'tv' };
type SearchMode = 'title' | 'ai';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [mode, setMode] = useState<SearchMode>('title');
  const [titleResults, setTitleResults] = useState<SearchResult[]>([]);
  const [aiResults, setAiResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const getTitle = (r: SearchResult) => ('title' in r ? r.title : r.name);
  const getDate = (r: SearchResult) =>
    'release_date' in r ? r.release_date : r.first_air_date;

  // Run title search whenever activeQuery changes
  useEffect(() => {
    if (!activeQuery.trim()) {
      setTitleResults([]);
      return;
    }
    const doSearch = async () => {
      setLoading(true);
      try {
        const data = await tmdbApi.searchMulti(activeQuery);
        const filtered = data.results
          .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
          .slice(0, 20);
        setTitleResults(filtered);
      } catch (err) {
        console.error('Search error:', err);
        setTitleResults([]);
      } finally {
        setLoading(false);
      }
    };
    doSearch();
  }, [activeQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveQuery(query.trim());
      router.replace(`/search?q=${encodeURIComponent(query.trim())}`, { scroll: false });
      setAiResults([]);
      setAiError('');
    }
  };

  const handleAISearch = async () => {
    if (!activeQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError('');
    setAiResults([]);
    try {
      const suggestions = await geminiService.searchMoviesByDescription(activeQuery);
      const promises = suggestions.map(async (title) => {
        try {
          const result = await tmdbApi.searchMulti(title);
          const match = result.results.find(
            (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
          );
          return match || null;
        } catch {
          return null;
        }
      });
      const results = (await Promise.all(promises)).filter(Boolean) as SearchResult[];
      setAiResults(results);
      if (results.length === 0) setAiError('No AI results found. Try a different description.');
    } catch (err: any) {
      setAiError('AI search failed. Please check your Gemini API key is configured.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleResultClick = (r: SearchResult) => {
    const type = r.media_type || 'movie';
    router.push(`/${type}/${r.id}`);
  };

  const displayResults = mode === 'ai' ? aiResults : titleResults;

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 pt-28 md:pt-32 pb-16">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* Search Bar */}
        <div className="max-w-2xl mb-10">
          <form onSubmit={handleSubmit} className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies, TV shows..."
              className="w-full bg-[#1a1a1a] border border-white/10 hover:border-white/20 focus:border-white/40 text-white placeholder-zinc-500 rounded-xl py-4 pl-12 pr-12 outline-none transition-all duration-200 text-base"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>
        </div>

        {activeQuery && (
          <>
            {/* Mode Tabs */}
            <div className="flex items-center gap-1 mb-8 bg-[#1a1a1a] rounded-xl p-1 w-fit border border-white/5">
              <button
                onClick={() => setMode('title')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === 'title'
                    ? 'bg-white text-black shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Film className="w-4 h-4" />
                Title Search
                {titleResults.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    mode === 'title' ? 'bg-black/15 text-black' : 'bg-white/10 text-zinc-300'
                  }`}>
                    {titleResults.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setMode('ai');
                  if (aiResults.length === 0 && !aiLoading && !aiError) {
                    handleAISearch();
                  }
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === 'ai'
                    ? 'bg-[#e50914] text-white shadow-lg shadow-red-900/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI Search
                {aiResults.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    mode === 'ai' ? 'bg-black/20 text-white' : 'bg-white/10 text-zinc-300'
                  }`}>
                    {aiResults.length}
                  </span>
                )}
              </button>
            </div>

            {/* Results Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {mode === 'ai' ? 'AI Recommendations for' : 'Results for'}{' '}
                <span className="text-[#e50914]">&ldquo;{activeQuery}&rdquo;</span>
              </h1>
              {mode === 'ai' && (
                <p className="text-zinc-500 text-sm mt-1">
                  AI-powered recommendations based on your description
                </p>
              )}
            </div>

            {/* AI Search Action (if on AI tab and no results yet) */}
            {mode === 'ai' && aiResults.length === 0 && !aiLoading && !aiError && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-[#e50914]/10 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-[#e50914]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Search</h3>
                <p className="text-zinc-500 text-sm mb-6 max-w-md">
                  Describe what you&apos;re looking for and our AI will find the best matches
                </p>
                <button
                  onClick={handleAISearch}
                  className="flex items-center gap-2 bg-[#e50914] hover:bg-[#c40812] text-white font-bold px-8 py-3 rounded-lg transition-colors shadow-lg shadow-red-900/30"
                >
                  <Sparkles className="w-5 h-5" />
                  Find with AI
                </button>
              </div>
            )}

            {/* Loading */}
            {(loading && mode === 'title') || (aiLoading && mode === 'ai') ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#e50914] animate-spin mb-4" />
                <p className="text-zinc-500 text-sm">
                  {mode === 'ai' ? 'AI is finding the best matches...' : 'Searching...'}
                </p>
              </div>
            ) : null}

            {/* Error */}
            {mode === 'ai' && aiError && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-red-400 mb-4">{aiError}</p>
                <button
                  onClick={handleAISearch}
                  className="text-sm text-[#e50914] hover:text-[#c40812] underline transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* No Results */}
            {!loading && !aiLoading && displayResults.length === 0 && !aiError && mode === 'title' && activeQuery && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-4 border border-white/5">
                  <Search className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                <p className="text-zinc-500 text-sm mb-6">
                  Try searching with different keywords
                </p>
                <button
                  onClick={() => { setMode('ai'); handleAISearch(); }}
                  className="flex items-center gap-2 bg-[#e50914]/10 hover:bg-[#e50914]/20 text-[#e50914] font-semibold px-6 py-2.5 rounded-lg transition-colors border border-[#e50914]/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Try AI Search instead
                </button>
              </div>
            )}

            {/* Results Grid */}
            {!loading && !aiLoading && displayResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                {displayResults.map((result) => {
                  const title = getTitle(result);
                  const date = getDate(result);
                  const year = date ? new Date(date).getFullYear() : null;
                  const isTV = result.media_type === 'tv';

                  return (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="group cursor-pointer"
                    >
                      {/* Poster */}
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] shadow-lg shadow-black/40 mb-2">
                        <Image
                          src={getImageUrl(result.poster_path, 'w342')}
                          alt={title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-movie.png';
                          }}
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="bg-white rounded-full p-3 shadow-xl">
                            <Film className="w-5 h-5 text-black" />
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                          <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-[10px] font-bold">
                            {result.vote_average.toFixed(1)}
                          </span>
                        </div>

                        {isTV && (
                          <div className="absolute top-2 right-2 bg-[#e50914] rounded px-1.5 py-0.5 flex items-center gap-1">
                            <Tv className="w-2.5 h-2.5 text-white" />
                            <span className="text-[9px] text-white font-bold">TV</span>
                          </div>
                        )}
                      </div>

                      <h4 className="text-xs md:text-sm font-semibold text-zinc-200 line-clamp-1 group-hover:text-white transition-colors">
                        {title}
                      </h4>
                      {year && (
                        <p className="text-[10px] md:text-xs text-zinc-600 mt-0.5">{year}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!activeQuery && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-5 border border-white/5">
              <Search className="w-9 h-9 text-zinc-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Search for anything</h2>
            <p className="text-zinc-500 text-sm max-w-xs">
              Search by title to find specific movies and TV shows, or use AI Search to describe what you want to watch.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
