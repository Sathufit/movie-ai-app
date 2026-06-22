'use client';

import { useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';

interface VideoPlayerModalProps {
  tmdbId: number;
  title: string;
  mediaType?: 'movie' | 'tv';
  onClose: () => void;
}

export default function VideoPlayerModal({ tmdbId, title, mediaType = 'movie', onClose }: VideoPlayerModalProps) {
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

  const embedUrl = `https://vidsrc.to/embed/${mediaType}/${tmdbId}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[900px] bg-slate-950 rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h2 className="text-white font-semibold text-sm md:text-base truncate px-4 flex-1 text-center">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-800 flex-shrink-0"
            aria-label="Close player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 16:9 iframe container */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            referrerPolicy="origin"
            allow="autoplay; fullscreen; picture-in-picture"
            title={`Watch ${title}`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    </div>
  );
}
