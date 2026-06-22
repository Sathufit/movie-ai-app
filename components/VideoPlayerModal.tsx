'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { X, ArrowLeft, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

interface Source {
  name: string;
  getUrl: (id: number, type: 'movie' | 'tv') => string;
}

const SOURCES: Source[] = [
  {
    name: 'VidSrc',
    getUrl: (id, type) => `https://vidsrc.to/embed/${type}/${id}`,
  },
  {
    name: 'VidSrc.xyz',
    getUrl: (id, type) => `https://vidsrc.xyz/embed/${type}?tmdb=${id}`,
  },
  {
    name: 'Embed.su',
    getUrl: (id, type) => `https://embed.su/embed/${type}/${id}`,
  },
  {
    name: '2Embed',
    getUrl: (id, type) =>
      type === 'movie'
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}`,
  },
  {
    name: 'AutoEmbed',
    getUrl: (id, type) => `https://autoembed.cc/${type}/tmdb/${id}`,
  },
];

interface VideoPlayerModalProps {
  tmdbId: number;
  title: string;
  mediaType?: 'movie' | 'tv';
  onClose: () => void;
}

export default function VideoPlayerModal({
  tmdbId,
  title,
  mediaType = 'movie',
  onClose,
}: VideoPlayerModalProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentSource = SOURCES[sourceIndex];
  const embedUrl = currentSource.getUrl(tmdbId, mediaType);

  const handleSourceChange = useCallback((index: number) => {
    setSourceIndex(index);
    setLoading(true);
    setKey((k) => k + 1);
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setKey((k) => k + 1);
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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[960px] bg-slate-950 rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h2 className="text-white font-semibold text-sm truncate px-3 flex-1 text-center">
            {title}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-800"
              title="Reload player"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-800"
              aria-label="Close player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Source Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 bg-slate-900/70 border-b border-slate-800 overflow-x-auto flex-shrink-0">
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

        {/* Player */}
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 gap-4">
              <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
              <p className="text-slate-400 text-sm">Loading {currentSource.name}...</p>
            </div>
          )}

          <iframe
            key={key}
            ref={iframeRef}
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            title={`Watch ${title}`}
            onLoad={() => setLoading(false)}
          />
        </div>

        {/* Footer tip */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 border-t border-slate-800 flex-shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <p className="text-slate-500 text-xs">
            If the video doesn&apos;t load, try switching to a different source above.
          </p>
        </div>
      </div>
    </div>
  );
}
