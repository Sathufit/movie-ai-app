'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, Menu, Film } from 'lucide-react';

interface NavbarProps {
  isHeroPage?: boolean;
}

export default function Navbar({ isHeroPage = false }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isTransparent = isHeroPage && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
          : 'bg-[#111111]/96 backdrop-blur-md border-b border-white/5 shadow-2xl'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 group flex-shrink-0"
          >
            <div className="bg-[#e50914] p-1.5 rounded-lg group-hover:bg-[#c40812] transition-colors duration-200 shadow-lg shadow-red-900/30">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">MovieAI</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => router.push('/')}
              className={`transition-colors duration-200 ${
                pathname === '/' ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => router.push('/browse?type=movie')}
              className={`transition-colors duration-200 ${
                pathname === '/browse' ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => router.push('/browse?type=tv')}
              className="text-zinc-400 hover:text-white transition-colors duration-200"
            >
              TV Shows
            </button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 md:gap-2">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && (setSearchOpen(false), setSearchQuery(''))}
                  placeholder="Search movies, shows..."
                  className="bg-[#1f1f1f] border border-white/15 focus:border-white/40 text-white placeholder-zinc-500 rounded-lg px-4 py-2 text-sm outline-none w-44 sm:w-56 md:w-72 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="text-zinc-300 hover:text-white p-2 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="text-zinc-500 hover:text-white p-2 transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="text-zinc-400 hover:text-white p-2 transition-colors duration-200"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-zinc-400 hover:text-white p-2 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-0.5">
            {[
              { label: 'Home', path: '/' },
              { label: 'Movies', path: '/browse?type=movie' },
              { label: 'TV Shows', path: '/browse?type=tv' },
            ].map(({ label, path }) => (
              <button
                key={label}
                onClick={() => { router.push(path); setMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-3 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
