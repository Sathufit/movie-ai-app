'use client';

import { use, useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft, RefreshCw, AlertCircle, Loader2, Play, Star,
  ChevronDown, Tv, Menu, X,
} from 'lucide-react';
import { tmdbApi, TVShowDetails, Season, Episode, getImageUrl } from '@/lib/tmdb';

interface Source {
  name: string;
  label: string;
  getUrl: (id: number, s: number, e: number) => string;
}

const SOURCES: Source[] = [
  { name: '2Embed',    label: '2Embed',    getUrl: (id, s, e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
  { name: 'VidSrc',    label: 'VidSrc',    getUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
  { name: 'VidSrc2',   label: 'VidSrc 2',  getUrl: (id, s, e) => `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
  { name: 'EmbedSu',   label: 'Embed.su',  getUrl: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}` },
  { name: 'AutoEmbed', label: 'AutoEmbed', getUrl: (id, s, e) => `https://autoembed.cc/tv/tmdb/${id}-${s}-${e}` },
];

function TVWatchContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tmdbId = parseInt(id);

  const [show, setShow] = useState<TVShowDetails | null>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [showSources, setShowSources] = useState(false);
  const [episodePanelOpen, setEpisodePanelOpen] = useState(false);

  const [selectedSeason, setSelectedSeason] = useState(() =>
    parseInt(searchParams.get('season') || '1')
  );
  const [selectedEpisode, setSelectedEpisode] = useState(() =>
    parseInt(searchParams.get('episode') || '1')
  );
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const sourcesRef = useRef<HTMLDivElement>(null);
  const episodeListRef = useRef<HTMLDivElement>(null);

  // Fetch show details
  useEffect(() => {
    tmdbApi.getTVShowDetails(tmdbId).then(setShow).catch(console.error);
  }, [tmdbId]);

  // Fetch episodes when season changes
  useEffect(() => {
    let cancelled = false;
    setLoadingEpisodes(true);
    tmdbApi
      .getTVSeasonDetails(tmdbId, selectedSeason)
      .then((data) => { if (!cancelled) setEpisodes(data.episodes ?? []); })
      .catch(() => { if (!cancelled) setEpisodes([]); })
      .finally(() => { if (!cancelled) setLoadingEpisodes(false); });
    return () => { cancelled = true; };
  }, [tmdbId, selectedSeason]);

  // Scroll active episode into view
  useEffect(() => {
    episodeListRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedEpisode, episodes]);

  // Close sources dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sourcesRef.current && !sourcesRef.current.contains(e.target as Node)) {
        setShowSources(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const updateUrl = useCallback((season: number, episode: number) => {
    router.replace(`/watch/tv/${id}?season=${season}&episode=${episode}`, { scroll: false });
  }, [router, id]);

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

  const selectEpisode = useCallback((ep: number) => {
    setSelectedEpisode(ep);
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
    setEpisodePanelOpen(false);
    updateUrl(selectedSeason, ep);
  }, [selectedSeason, updateUrl]);

  const changeSeason = useCallback((s: number) => {
    setSelectedSeason(s);
    setSelectedEpisode(1);
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
    updateUrl(s, 1);
  }, [updateUrl]);

  const source = SOURCES[sourceIndex];
  const embedUrl = source.getUrl(tmdbId, selectedSeason, selectedEpisode);
  const validSeasons = (show?.seasons ?? []).filter((s) => s.season_number > 0);
  const currentEp = episodes.find((e) => e.episode_number === selectedEpisode);

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col lg:overflow-hidden lg:h-screen">
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
          {show ? (
            <div>
              <p className="text-white font-semibold text-sm truncate leading-tight">{show.name}</p>
              <p className="text-zinc-500 text-xs mt-0.5">
                Season {selectedSeason} · Episode {selectedEpisode}
                {currentEp ? ` · ${currentEp.name}` : ''}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="h-3.5 w-36 mx-auto skeleton rounded" />
              <div className="h-2.5 w-24 mx-auto skeleton rounded" />
            </div>
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

          {/* Mobile episode panel toggle */}
          <button
            onClick={() => setEpisodePanelOpen((v) => !v)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Episodes"
          >
            {episodePanelOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Main Content: Player + Episode Sidebar ── */}
      <div className="flex flex-col lg:flex-row flex-1 lg:min-h-0 overflow-hidden">

        {/* Player Column */}
        <div className="flex flex-col flex-1 lg:min-w-0 overflow-y-auto lg:overflow-hidden">
          {/* Video */}
          <div className="relative w-full bg-black flex-shrink-0" style={{ paddingBottom: '56.25%' }}>
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
              title={`Watch ${show?.name ?? 'TV Show'}`}
              onLoad={() => setIframeLoading(false)}
            />
          </div>

          {/* Show info below player */}
          {show && (
            <div className="px-4 md:px-6 py-4 bg-[#0c0c0c] border-t border-white/5 flex-shrink-0">
              <div className="max-w-3xl">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-base font-bold text-white">{show.name}</h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {show.first_air_date && (
                        <span className="text-zinc-500 text-xs">{new Date(show.first_air_date).getFullYear()}</span>
                      )}
                      {show.vote_average > 0 && (
                        <>
                          <span className="text-zinc-700">·</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 text-xs font-semibold">{show.vote_average.toFixed(1)}</span>
                          </span>
                        </>
                      )}
                      <span className="text-zinc-700">·</span>
                      <span className="text-zinc-500 text-xs">{show.number_of_seasons} seasons</span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/tv/${tmdbId}`)}
                    className="text-xs text-zinc-400 hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                  >
                    View Details
                  </button>
                </div>

                {/* Current episode info */}
                {currentEp && (
                  <div className="mt-3 p-3 bg-white/3 border border-white/8 rounded-xl">
                    <div className="flex items-start gap-3">
                      {currentEp.still_path && (
                        <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                          <Image
                            src={getImageUrl(currentEp.still_path, 'w185')}
                            alt={currentEp.name}
                            fill
                            className="object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            sizes="80px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#e50914] font-semibold mb-0.5">
                          S{selectedSeason} E{selectedEpisode}
                        </p>
                        <p className="text-sm font-semibold text-white leading-tight">{currentEp.name}</p>
                        {currentEp.overview && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{currentEp.overview}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Server strip */}
          <div className="px-4 md:px-6 py-3 bg-[#0a0a0a] border-t border-white/5 flex items-center gap-2 overflow-x-auto hide-scrollbar flex-shrink-0">
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

        {/* ── Episode Sidebar ── */}
        <aside
          className={`
            lg:w-80 lg:flex-shrink-0 bg-[#0c0c0c] border-t lg:border-t-0 lg:border-l border-white/8
            flex flex-col lg:min-h-0
            ${episodePanelOpen ? 'flex' : 'hidden lg:flex'}
            max-h-[60vh] lg:max-h-none
          `}
        >
          {/* Season Selector */}
          <div className="px-3 py-3 border-b border-white/8 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Tv className="w-3.5 h-3.5 text-[#e50914]" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Episodes</span>
            </div>
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => changeSeason(Number(e.target.value))}
                className="w-full bg-[#1a1a1a] text-white text-sm rounded-lg px-3 py-2.5 border border-white/10 focus:outline-none focus:border-[#e50914]/50 appearance-none cursor-pointer transition-colors"
              >
                {validSeasons.length > 0
                  ? validSeasons.map((s) => (
                      <option key={s.season_number} value={s.season_number}>
                        Season {s.season_number}
                        {s.episode_count ? ` · ${s.episode_count} eps` : ''}
                      </option>
                    ))
                  : Array.from({ length: 5 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Season {i + 1}</option>
                    ))
                }
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Episode List */}
          <div className="flex-1 overflow-y-auto overscroll-contain" ref={episodeListRef}>
            {loadingEpisodes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-[#e50914] animate-spin" />
              </div>
            ) : episodes.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-10 px-4">No episodes found</p>
            ) : (
              <div className="p-2 space-y-1">
                {episodes.map((ep) => {
                  const active = ep.episode_number === selectedEpisode;
                  return (
                    <button
                      key={ep.id}
                      data-active={active}
                      onClick={() => selectEpisode(ep.episode_number)}
                      className={`w-full flex gap-3 p-2.5 rounded-xl text-left transition-all group ${
                        active
                          ? 'bg-[#e50914]/12 border border-[#e50914]/30'
                          : 'hover:bg-white/4 border border-transparent'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        {ep.still_path ? (
                          <Image
                            src={getImageUrl(ep.still_path, 'w185')}
                            alt={ep.name}
                            fill
                            className="object-cover"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            sizes="80px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-4 h-4 text-zinc-700" />
                          </div>
                        )}
                        {active ? (
                          <div className="absolute inset-0 bg-[#e50914]/50 flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 text-white" fill="currentColor" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <Play className="w-3.5 h-3.5 text-white" fill="currentColor" />
                          </div>
                        )}
                      </div>

                      {/* Episode info */}
                      <div className="flex-1 min-w-0 py-0.5">
                        <p className={`text-[11px] font-semibold mb-0.5 ${active ? 'text-[#e50914]' : 'text-zinc-500'}`}>
                          E{ep.episode_number}
                          {ep.runtime ? ` · ${ep.runtime}m` : ''}
                        </p>
                        <p className={`text-xs font-medium leading-snug line-clamp-2 ${active ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>
                          {ep.name}
                        </p>
                        {ep.vote_average > 0 && (
                          <p className="text-[10px] text-zinc-600 mt-0.5">
                            ★ {ep.vote_average.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
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

export default function TVWatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TVWatchContent id={id} />
    </Suspense>
  );
}
