"use client";

import { motion } from "framer-motion";
import { Star, Calendar, Tv } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/lib/tmdb";

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster: string;
  rating: number;
  releaseDate?: string;
  firstAirDate?: string;
  description: string;
  mediaType: 'movie' | 'tv';
}

interface MediaCardProps {
  media: MediaItem;
  index: number;
  onClick?: () => void;
}

export default function MediaCard({ media, index, onClick }: MediaCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const title = media.title || media.name || "Unknown";
  const date = media.releaseDate || media.firstAirDate || "";
  const posterUrl = getImageUrl(media.poster, "w500");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group relative bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800/50 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm cursor-pointer"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-800">
        <Image
          src={posterUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onError={(e) => {
            e.currentTarget.src = "/placeholder-movie.png";
          }}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
            <p className="text-xs md:text-sm text-slate-300 line-clamp-3 mb-2 md:mb-3">
              {media.description}
            </p>
            <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm transition-colors w-full justify-center shadow-lg shadow-cyan-500/30">
              View Details
            </button>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
          <span className="text-sm font-bold text-white">
            {media.rating.toFixed(1)}
          </span>
        </div>

        {/* Media Type Badge */}
        {media.mediaType === 'tv' && (
          <div className="absolute top-3 left-3 bg-cyan-500/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
            <Tv className="w-3 h-3 text-white" />
            <span className="text-xs font-bold text-white">TV</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 md:p-4">
        <h4 className="text-sm md:text-base lg:text-lg font-bold text-white mb-1.5 md:mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-400">
          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
          <span>{formatDate(date)}</span>
        </div>
      </div>

      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/20 to-transparent rounded-xl" />
      </div>
    </motion.div>
  );
}
