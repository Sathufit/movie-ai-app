'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { X, ArrowLeft, RefreshCw, AlertCircle, Loader2, ChevronDown, Play, Tv } from 'lucide-react';
import Image from 'next/image';
import { tmdbApi, Season, Episode, getImageUrl } from '@/lib/tmdb';

interface Source {
  name: string;
  label: string;
  getMovieUrl: (id: number) => string;
  getTvUrl: (id: number, season: number, episode: number) => string;
}

// 2Embed is first (most reliable)
const SOURCES: Source[] = [
  {
    name: '2Embed',
    label: '2Embed',
    getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    getTvUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    name: 'VidSrc',
    label: 'VidSrc',
    getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: 'VidSrc.xyz',
    label: 'VidSrc 2',
    getMovieUrl: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    name: 'Embed.su',
    label: 'Embed.su',
    getMovieUrl: (id) => `https://embed.su/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: 'AutoEmbed',
    label: 'AutoEmbed',
    getMovieUrl: (id) => `https://autoembed.cc/movie/tmdb/${id}`,
    getTvUrl: (id, s, e) => `https://autoembed.cc/tv/tmdb/${id}-${s}-${e}`,
  },
];

interface VideoPlayerModalProps {
  tmdbId: number;
  title: string;
  mediaType?: 'movie' | 'tv';
  seasons?: Season[];
  onClose: () => void;
}

export default function VideoPlayerModal({
  tmdbId,
  title,
  mediaType = 'movie',
  seasons: initialSeasons,
  onClose,
}: VideoPlayerModalProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  // TV episode state
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [episodePanelOpen, setEpisodePanelOpen] = useState(false);

  const episodeListRef = useRef<HTMLDivElement>(null);
  const validSeasons = (initialSeasons ?? []).filter((s) => s.season_number > 0);
  const source = SOURCES[sourceIndex];

  const embedUrl =
    mediaType === 'movie'
      ? source.getMovieUrl(tmdbId)
      : source.getTvUrl(tmdbId, selectedSeason, selectedEpisode);

  // Fetch episodes when season changes
  useEffect(() => {
    if (mediaType !== 'tv') return;
    let cancelled = false;
    setLoadingEpisodes(true);
    tmdbApi
      .getTVSeasonDetails(tmdbId, selectedSeason)
      .then((data) => { if (!cancelled) setEpisodes(data.episodes ?? []); })
      .catch(() => { if (!cancelled) setEpisodes([]); })
      .finally(() => { if (!cancelled) setLoadingEpisodes(false); });
    return () => { cancelled = true; };
  }, [tmdbId, selectedSeason, mediaType]);

  // Scroll active episode into view
  useEffect(() => {
    episodeListRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [selectedEpisode, episodes]);

  const changeSource = useCallback((i: number) => {
    setSourceIndex(i);
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
  }, []);

  const reload = useCallback(() => {
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
  }, []);

  const selectEpisode = useCallback((ep: number) => {
    setSelectedEpisode(ep);
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
    // Close panel on mobile after selection
    setEpisodePanelOpen(false);
  }, []);

  const changeSeason = useCallback((s: number) => {
    setSelectedSeason(s);
    setSelectedEpisode(1);
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
  }, []);

  // Escape key + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const currentEp = episodes.find((e) => e.episode_number === selectedEpisode);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[1100px] bg-[#0a0a0f] sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black border-t sm:border border-white/10 max-h-[95dvh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Bar ── */}
        <div className="flex items-center gap-3 px-3 sm:px-4 py-3 bg-[#0f0f1a] border-b border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Back</span>
          </button>

          <div className="flex-1 min-w-0 text-center">
            <p className="text-white font-semibold text-sm truncate leading-tight">{title}</p>
            {mediaType === 'tv' && (
              <p className="text-slate-400 text-xs mt-0.5">
                Season {selectedSeason} · Episode {selectedEpisode}
                {currentEp ? ` · ${currentEp.name}` : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={reload}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Reload"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Source Selector ── */}
        <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#0d0d18] border-b border-white/10 overflow-x-auto flex-shrink-0 scrollbar-hide">
          <span className="text-slate-500 text-xs shrink-0 mr-0.5">Server:</span>
          {SOURCES.map((s, i) => (
            <button
              key={s.name}
              onClick={() => changeSource(i)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                i === sourceIndex
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {i === 0 ? `★ ${s.label}` : s.label}
            </button>
          ))}
        </div>

        {/* ── Player + Episodes ── */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

          {/* Player */}
          <div className="relative bg-black shrink-0 lg:flex-1 lg:min-w-0">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              {iframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a0f] gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-red-600/30 border-t-red-500 animate-spin" />
                    <Play className="absolute inset-0 m-auto w-4 h-4 text-red-400" fill="currentColor" />
                  </div>
                  <p className="text-slate-400 text-sm">Loading {source.label}…</p>
                </div>
              )}
              <iframe
                key={iframeKey}
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                title={`Watch ${title}`}
                onLoad={() => setIframeLoading(false)}
              />
            </div>
          </div>

          {/* Episode Panel – TV only */}
          {mediaType === 'tv' && (
            <div className="lg:w-72 lg:flex-shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0a0a0f] min-h-0">

              {/* Mobile toggle */}
              <button
                onClick={() => setEpisodePanelOpen((v) => !v)}
                className="lg:hidden flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors border-b border-white/10"
              >
                <span className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  Episodes
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    episodePanelOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Panel body – always visible on lg, toggleable on mobile */}
              <div
                className={`flex flex-col min-h-0 ${
                  episodePanelOpen ? 'flex' : 'hidden lg:flex'
                } max-h-[40vh] lg:max-h-none lg:flex-1`}
              >
                {/* Season dropdown */}
                <div className="px-3 py-2.5 border-b border-white/10 flex-shrink-0">
                  <div className="relative">
                    <select
                      value={selectedSeason}
                      onChange={(e) => changeSeason(Number(e.target.value))}
                      className="w-full bg-white/5 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
                    >
                      {validSeasons.length > 0
                        ? validSeasons.map((s) => (
                            <option key={s.season_number} value={s.season_number}>
                              Season {s.season_number}
                              {s.episode_count ? ` (${s.episode_count} eps)` : ''}
                            </option>
                          ))
                        : Array.from({ length: 5 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Season {i + 1}
                            </option>
                          ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Episode list */}
                <div className="flex-1 overflow-y-auto overscroll-contain" ref={episodeListRef}>
                  {loadingEpisodes ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                    </div>
                  ) : episodes.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8 px-4">
                      No episodes found.
                    </p>
                  ) : (
                    <div className="p-2 space-y-1">
                      {episodes.map((ep) => {
                        const active = ep.episode_number === selectedEpisode;
                        return (
                          <button
                            key={ep.id}
                            data-active={active}
                            onClick={() => selectEpisode(ep.episode_number)}
                            className={`w-full flex gap-2.5 p-2 rounded-xl text-left transition-all ${
                              active
                                ? 'bg-red-600/15 border border-red-500/40'
                                : 'hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            {/* Thumbnail */}
                            <div className="relative shrink-0 w-[72px] aspect-video rounded-lg overflow-hidden bg-slate-800">
                              {ep.still_path ? (
                                <Image
                                  src={getImageUrl(ep.still_path, 'w185')}
                                  alt={ep.name}
                                  fill
                                  className="object-cover"
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                  sizes="72px"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Play className="w-4 h-4 text-slate-600" />
                                </div>
                              )}
                              {active && (
                                <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center">
                                  <Play className="w-3.5 h-3.5 text-white" fill="currentColor" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 py-0.5">
                              <p className={`text-xs font-semibold mb-0.5 ${active ? 'text-red-400' : 'text-slate-500'}`}>
                                E{ep.episode_number}
                              </p>
                              <p className={`text-xs font-medium leading-snug line-clamp-2 ${active ? 'text-white' : 'text-slate-300'}`}>
                                {ep.name}
                              </p>
                              {ep.runtime && (
                                <p className="text-xs text-slate-600 mt-0.5">{ep.runtime} min</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#0d0d18] border-t border-white/10 flex-shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <p className="text-slate-600 text-xs">
            If a server doesn&apos;t load, try another above.{' '}
            <span className="text-slate-500">Install uBlock Origin</span> in your browser to block ads.
          </p>
        </div>
      </div>
    </div>
  );
}
