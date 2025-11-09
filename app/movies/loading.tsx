import { Film } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              MovieAI
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-10 bg-slate-800/50 rounded-lg animate-pulse" />
              <div className="w-24 h-10 bg-slate-800/50 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Categories Skeleton */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-32 h-10 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
            <Film className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" size={24} />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] bg-slate-800/50 rounded-xl animate-pulse" />
              <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
              <div className="h-4 bg-slate-800/50 rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
