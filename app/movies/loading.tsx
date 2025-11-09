import { Film } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950/20 to-zinc-950">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              MovieAI
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-10 bg-zinc-800/50 rounded-lg animate-pulse" />
              <div className="w-24 h-10 bg-zinc-800/50 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Categories Skeleton */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-32 h-12 bg-zinc-800/50 rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <Film className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-400" size={24} />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] bg-zinc-800/50 rounded-xl animate-pulse" />
              <div className="h-4 bg-zinc-800/50 rounded animate-pulse" />
              <div className="h-4 bg-zinc-800/50 rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
