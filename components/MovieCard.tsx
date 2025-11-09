"use client";

import { motion } from "framer-motion";
import { Star, Calendar } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/lib/tmdb";

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
  index: number;
  onClick?: () => void;
}

export default function MovieCard({ movie, index, onClick }: MovieCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const posterUrl = getImageUrl(movie.poster, "w500");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group relative bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800/50 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm cursor-pointer"
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-800">
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onError={(e) => {
            e.currentTarget.src = "/placeholder-movie.png";
          }}
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-sm text-zinc-300 line-clamp-3 mb-3">
              {movie.description}
            </p>
            <button className="flex items-center gap-2 bg-white/90 hover:bg-white text-black font-semibold px-4 py-2 rounded-full text-sm transition-colors w-full justify-center">
              View Details
            </button>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
          <span className="text-sm font-bold text-white">
            {movie.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h4 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
          {movie.title}
        </h4>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(movie.releaseDate)}</span>
        </div>
      </div>

      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent rounded-xl" />
      </div>
    </motion.div>
  );
}
