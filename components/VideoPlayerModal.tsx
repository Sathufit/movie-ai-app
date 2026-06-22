'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { X, ArrowLeft, RefreshCw, AlertCircle, Loader2, ChevronDown, Play } from 'lucide-react';
import Image from 'next/image';
import { tmdbApi, Season, Episode, getImageUrl } from '@/lib/tmdb';

interface Source {
  name: string;
  getMovieUrl: (id: number) => string;
  getTvUrl: (id: number, season: number, episode: number) => string;
}

const SOURCES: Source[] = [
  {
    name: 'VidSrc',
    getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: 'VidSrc.xyz',
    getMovieUrl: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
  {
    name: 'Embed.su',
    getMovieUrl: (id) => `https://embed.su/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: '2Embed',
    getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    getTvUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    name: 'AutoEmbed',
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

  // TV-specific state
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [showEpisodePanel, setShowEpisodePanel] = useState(true);

  const episodeListRef = useRef<HTMLDivElement>(null);

  const validSeasons = (initialSeasons ?? []).filter((s) => s.season_number > 0);
  const currentSource = SOURCES[sourceIndex];

  const embedUrl =
    mediaType === 'movie'
      ? currentSource.getMovieUrl(tmdbId)
      : currentSource.getTvUrl(tmdbId, selectedSeason, selectedEpisode);

  // Fetch episodes when season changes
  useEffect(() => {
    if (mediaType !== 'tv') return;
    let cancelled = false;
    const fetchEpisodes = async () => {
      setLoadingEpisodes(true);
      try {
        const data = await tmdbApi.getTVSeasonDetails(tmdbId, selectedSeason);
        if (!cancelled) setEpisodes(data.episodes ?? []);
      } catch {
        if (!cancelled) setEpisodes([]);
      } finally {
        if (!cancelled) setLoadingEpisodes(false);
      }
    };
    fetchEpisodes();
    return () => { cancelled = true; };
  }, [tmdbId, selectedSeason, mediaType]);

  // Scroll selected episode into view
  useEffect(() => {
    if (!episodeListRef.current) return;
    const active = episodeListRef.current.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [selectedEpisode, episodes]);

  const handleSourceChange = useCallback((index: number) => {
    setSourceIndex(index);
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
  }, []);

  const handleEpisodeSelect = useCallback((ep: number) => {
    setSelectedEpisode(ep);
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
  }, []);

  const handleSeasonChange = useCallback((s: number) => {
    setSelectedSeason(s);
    setSelectedEpisode(1);
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const currentEpisodeData = episodes.find((e) => e.episode_number === selectedEpisode);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1100px] bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex-1 text-center px-3 min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">{title}</h2>
            {mediaType === 'tv' && (
              <p className="text-slate-400 text-xs">
                S{selectedSeason} · E{selectedEpisode}
                {currentEpisodeData?.name ? ` · ${currentEpisodeData.name}` : ''}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => { setIframeLoading(true); setIframeKey((k) => k + 1); }}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
              title="Reload"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Source Tabs ── */}
        <div className="flex items-center gap-1 px-3 py-2 bg-slate-900/60 border-b border-slate-800 overflow-x-auto flex-shrink-0">
          <span className="text-slate-500 text-xs mr-1 flex-shrink-0">Source:</span>
          {SOURCES.map((source, i) => (
            <button
              key={source.name}
              onClick={() => handleSourceChange(i)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                i === sourceIndex
                  ? 'bg-red-600 text-white shadow-sm shadow-red-500/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {source.name}
            </button>
          ))}
        </div>

        {/* ── Main Area: player + optional episode panel ── */}
        <div className={`flex flex-col ${mediaType === 'tv' ? 'lg:flex-row' : ''} flex-1 min-h-0 overflow-hidden`}>
          {/* Player */}
          <div className={`relative bg-black flex-shrink-0 ${mediaType === 'tv' ? 'lg:flex-1' : 'w-full'}`}>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              {iframeLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 gap-3">
                  <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                  <p className="text-slate-400 text-sm">{currentSource.name} is loading...</p>
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

          {/* ── Episode Panel (TV only) ── */}
          {mediaType === 'tv' && (
            <div className="lg:w-80 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950 min-h-0">
              {/* Season Selector */}
              <div className="px-3 py-2.5 border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">Episodes</span>
                  <button
                    onClick={() => setShowEpisodePanel((v) => !v)}
                    className="text-slate-400 hover:text-white transition-colors lg:hidden"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${showEpisodePanel ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>

                {validSeasons.length > 0 ? (
                  <div className="relative">
                    <select
                      value={selectedSeason}
                      onChange={(e) => handleSeasonChange(Number(e.target.value))}
                      className="w-full bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
                    >
                      {validSeasons.map((s) => (
                        <option key={s.season_number} value={s.season_number}>
                          Season {s.season_number}
                          {s.episode_count ? ` · ${s.episode_count} eps` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSeasonChange(s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-all ${
                          selectedSeason === s
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        S{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Episode List */}
              <div
                className={`flex-1 overflow-y-auto overscroll-contain ${showEpisodePanel ? 'block' : 'hidden lg:block'}`}
                style={{ maxHeight: 'calc(56.25vw - 40px)', minHeight: 0 }}
                ref={episodeListRef}
              >
                {loadingEpisodes ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                  </div>
                ) : episodes.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8 px-4">
                    No episodes found for this season.
                  </p>
                ) : (
                  <div className="p-2 space-y-1">
                    {episodes.map((ep) => {
                      const isActive = ep.episode_number === selectedEpisode;
                      return (
                        <button
                          key={ep.id}
                          data-active={isActive}
                          onClick={() => handleEpisodeSelect(ep.episode_number)}
                          className={`w-full flex gap-3 p-2 rounded-lg text-left transition-all group ${
                            isActive
                              ? 'bg-red-600/20 border border-red-600/50'
                              : 'hover:bg-slate-800/70 border border-transparent'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="relative flex-shrink-0 w-20 aspect-video rounded overflow-hidden bg-slate-800">
                            {ep.still_path ? (
                              <Image
                                src={getImageUrl(ep.still_path, 'w185')}
                                alt={ep.name}
                                fill
                                className="object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-4 h-4 text-slate-600" />
                              </div>
                            )}
                            {isActive && (
                              <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                                <Play className="w-4 h-4 text-white" fill="currentColor" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${isActive ? 'text-red-400' : 'text-slate-400'}`}>
                              E{ep.episode_number}
                            </p>
                            <p className={`text-sm font-medium truncate leading-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>
                              {ep.name}
                            </p>
                            {ep.runtime && (
                              <p className="text-xs text-slate-500 mt-0.5">{ep.runtime} min</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border-t border-slate-800 flex-shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <p className="text-slate-500 text-xs">
            If a source doesn&apos;t load, try another tab above. For the best experience, install{' '}
            <span className="text-slate-400">uBlock Origin</span> in your browser to block ads.
          </p>
        </div>
      </div>
    </div>
  );
}
