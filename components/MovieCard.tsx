'use client';

import Image from 'next/image';
import { Star, Play, Info } from 'lucide-react';
import { getImageUrl } from '@/lib/tmdb';

interface Movie {
  id: number;
  title: string;
  poster: string;
  rating: number;
  releaseDate: string;
  description: string;
}

interface MovieCardProps {
  movie: Movie;
  index?: number;
  onClick?: () => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;
  const posterUrl = getImageUrl(movie.poster, 'w342');

  return (
    <div
      onClick={onClick}
      className="group relative flex-shrink-0 w-[130px] sm:w-[150px] md:w-[170px] lg:w-[190px] cursor-pointer"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] shadow-lg shadow-black/40">
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 130px, (max-width: 768px) 150px, (max-width: 1024px) 170px, 190px"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-movie.png';
          }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {/* Rating */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span className="text-white text-[10px] font-bold">{movie.rating.toFixed(1)}</span>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <p className="text-[10px] text-zinc-300 line-clamp-2 mb-2 leading-relaxed">{movie.description}</p>
            <div className="flex gap-1.5">
              <button className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-white/90 text-black text-[10px] font-bold py-1.5 rounded-md transition-colors">
                <Play className="w-2.5 h-2.5 fill-black" />
                Play
              </button>
              <button className="flex items-center justify-center bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-md transition-colors border border-white/25">
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card label */}
      <div className="mt-2 px-0.5">
        <h4 className="text-xs md:text-sm font-semibold text-zinc-200 line-clamp-1 group-hover:text-white transition-colors duration-200">
          {movie.title}
        </h4>
        {year && (
          <p className="text-[10px] md:text-xs text-zinc-600 mt-0.5">{year}</p>
        )}
      </div>
    </div>
  );
}
