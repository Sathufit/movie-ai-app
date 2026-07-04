'use client';

import { use, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft, RefreshCw, AlertCircle, Loader2, Play, Star,
  Maximize2, Volume2, ChevronDown,
} from 'lucide-react';
import { tmdbApi, MovieDetails, getImageUrl } from '@/lib/tmdb';

interface Source {
  name: string;
  label: string;
  getUrl: (id: number) => string;
}

const SOURCES: Source[] = [
  { name: '2Embed',   label: '2Embed',    getUrl: (id) => `https://www.2embed.cc/embed/${id}` },
  { name: 'VidSrc',   label: 'VidSrc',    getUrl: (id) => `https://vidsrc.to/embed/movie/${id}` },
  { name: 'VidSrc2',  label: 'VidSrc 2',  getUrl: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}` },
  { name: 'EmbedSu',  label: 'Embed.su',  getUrl: (id) => `https://embed.su/embed/movie/${id}` },
  { name: 'AutoEmbed',label: 'AutoEmbed', getUrl: (id) => `https://autoembed.cc/movie/tmdb/${id}` },
];

export default function MovieWatchPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const tmdbId = parseInt(id);

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [showSources, setShowSources] = useState(false);
  const sourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tmdbApi.getMovieDetails(tmdbId).then(setMovie).catch(console.error);
  }, [tmdbId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sourcesRef.current && !sourcesRef.current.contains(e.target as Node)) {
        setShowSources(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const reload = useCallback(() => {
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
  }, []);

  const changeSource = useCallback((i: number) => {
    setSourceIndex(i);
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
    setShowSources(false);
  }, []);

  const source = SOURCES[sourceIndex];
  const embedUrl = source.getUrl(tmdbId);
  const year = movie?.release_date ? new Date(movie.release_date).getFullYear() : '';

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">
      {/* ── Top Bar ── */}
      <header className="flex items-center gap-3 px-4 md:px-6 bg-[#0c0c0c] border-b border-white/8 h-14 flex-shrink-0 z-20 sticky top-0">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </button>

        <div className="flex-1 min-w-0 text-center">
          {movie ? (
            <div className="flex items-center justify-center gap-2">
              <p className="text-white font-semibold text-sm truncate max-w-xs md:max-w-md">{movie.title}</p>
              {year && <span className="text-zinc-500 text-xs flex-shrink-0">{year}</span>}
              {movie.vote_average > 0 && (
                <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 text-xs font-semibold">{movie.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-4 w-32 mx-auto skeleton rounded" />
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Source Selector */}
          <div className="relative" ref={sourcesRef}>
            <button
              onClick={() => setShowSources((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-zinc-300 hover:text-white transition-colors font-medium"
            >
              <span className="hidden sm:inline text-zinc-500">Server:</span>
              <span>{source.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${showSources ? 'rotate-180' : ''}`} />
            </button>

            {showSources && (
              <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[140px]">
                {SOURCES.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => changeSource(i)}
                    className={`w-full px-4 py-2.5 text-left text-xs font-medium transition-colors flex items-center justify-between ${
                      i === sourceIndex
                        ? 'bg-[#e50914]/15 text-[#e50914]'
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{i === 0 ? `★ ${s.label}` : s.label}</span>
                    {i === sourceIndex && <span className="text-[10px] text-[#e50914] font-bold">ACTIVE</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={reload}
            className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Reload player"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Player Area ── */}
      <div className="flex-1 flex flex-col">
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
          {iframeLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#080808] gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-2 border-[#e50914]/25 border-t-[#e50914] animate-spin" />
                <Play className="absolute inset-0 m-auto w-5 h-5 text-[#e50914]" fill="currentColor" />
              </div>
              <p className="text-zinc-500 text-sm">Loading {source.label}…</p>
            </div>
          )}
          <iframe
            key={iframeKey}
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            title={`Watch ${movie?.title ?? 'Movie'}`}
            onLoad={() => setIframeLoading(false)}
          />
        </div>

        {/* ── Movie Info Below Player ── */}
        {movie && (
          <div className="px-4 md:px-6 py-5 bg-[#0c0c0c] border-t border-white/5">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4">
              {/* Poster */}
              <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-[#1a1a1a] hidden sm:block">
                <Image
                  src={getImageUrl(movie.poster_path, 'w185')}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  onError={(e) => { e.currentTarget.src = '/placeholder-movie.png'; }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-lg font-bold text-white leading-tight">{movie.title}</h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {year && <span className="text-zinc-500 text-xs">{year}</span>}
                      {movie.runtime > 0 && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span className="text-zinc-500 text-xs">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                        </>
                      )}
                      {movie.vote_average > 0 && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 text-xs font-semibold">{movie.vote_average.toFixed(1)}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/movie/${tmdbId}`)}
                    className="text-xs text-zinc-400 hover:text-white transition-colors border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg flex-shrink-0"
                  >
                    View Details
                  </button>
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {movie.genres.slice(0, 4).map((g) => (
                      <span key={g.id} className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/8 text-zinc-400 rounded-full">
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                {movie.overview && (
                  <p className="text-zinc-500 text-xs leading-relaxed mt-2 line-clamp-2">{movie.overview}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Server Switcher Strip ── */}
        <div className="px-4 md:px-6 py-3 bg-[#0a0a0a] border-t border-white/5 flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <span className="text-zinc-600 text-xs flex-shrink-0">Try another server:</span>
          {SOURCES.map((s, i) => (
            <button
              key={s.name}
              onClick={() => changeSource(i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all ${
                i === sourceIndex
                  ? 'bg-[#e50914] text-white shadow-lg shadow-red-900/30'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/8'
              }`}
            >
              {i === 0 ? `★ ${s.label}` : s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="flex items-center gap-2 px-4 md:px-6 py-2.5 bg-[#080808] border-t border-white/5 flex-shrink-0">
        <AlertCircle className="w-3 h-3 text-zinc-700 flex-shrink-0" />
        <p className="text-zinc-700 text-xs">
          If a server doesn&apos;t load, try another. Install uBlock Origin to block ads.
        </p>
      </footer>
    </div>
  );
}
