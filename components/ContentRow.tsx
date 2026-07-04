'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContentRowProps {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
  children: React.ReactNode;
}

export default function ContentRow({ title, subtitle, onViewAll, children }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="group/row relative mb-12 md:mb-16">
      {/* Row Header */}
      <div className="flex items-end justify-between mb-4 md:mb-5 px-4 sm:px-6 lg:px-12">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
          {subtitle && (
            <p className="text-xs md:text-sm text-zinc-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs md:text-sm text-zinc-400 hover:text-white transition-colors duration-200 font-medium flex items-center gap-1 group/btn flex-shrink-0 ml-4"
          >
            <span className="border-b border-transparent group-hover/btn:border-white transition-colors">View all</span>
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </button>
        )}
      </div>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-4 z-10 w-10 md:w-14 flex items-center justify-start pl-1 md:pl-2
                     bg-gradient-to-r from-[#111111]/95 to-transparent
                     opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
          aria-label="Scroll left"
        >
          <div className="bg-[#1f1f1f]/90 hover:bg-[#2a2a2a] border border-white/10 rounded-full p-1.5 md:p-2 transition-all duration-200 hover:scale-110 shadow-lg">
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
        </button>

        {/* Scrollable Cards Area */}
        <div
          ref={scrollRef}
          className="flex gap-2.5 md:gap-3 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-12 pb-2"
        >
          {children}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-4 z-10 w-10 md:w-14 flex items-center justify-end pr-1 md:pr-2
                     bg-gradient-to-l from-[#111111]/95 to-transparent
                     opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
          aria-label="Scroll right"
        >
          <div className="bg-[#1f1f1f]/90 hover:bg-[#2a2a2a] border border-white/10 rounded-full p-1.5 md:p-2 transition-all duration-200 hover:scale-110 shadow-lg">
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
        </button>
      </div>
    </section>
  );
}
