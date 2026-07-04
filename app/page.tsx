'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Info, Star, Film } from 'lucide-react';
import { tmdbApi, Movie, getImageUrl } from '../lib/tmdb';
import Navbar from '@/components/Navbar';
import ContentRow from '@/components/ContentRow';
import MovieCard from '@/components/MovieCard';

export default function Home() {
  const router = useRouter();
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [trendingTV, setTrendingTV] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingData, nowPlayingData, trendingTVData, topRatedData] = await Promise.all([
          tmdbApi.getTrending('week'),
          tmdbApi.getNowPlaying(),
          tmdbApi.getTrendingTV('week'),
          tmdbApi.getTopRated(),
        ]);

        const trendingMovies = trendingData.results.slice(0, 20);
        setTrending(trendingMovies);
        setNowPlaying(nowPlayingData.results.slice(0, 20));
        setTrendingTV(trendingTVData.results.slice(0, 20));
        setTopRated(topRatedData.results.slice(0, 20));

        // Pick a featured movie with a good backdrop from top trending
        const withBackdrop = trendingMovies.filter((m) => m.backdrop_path);
        const pick = withBackdrop[Math.floor(Math.random() * Math.min(withBackdrop.length, 5))];
        setFeaturedMovie(pick || trendingMovies[0]);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const heroYear = featuredMovie?.release_date
    ? new Date(featuredMovie.release_date).getFullYear()
    : '';

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Navbar isHeroPage={true} />

      {/* ── Hero ── */}
      {featuredMovie && (
        <section className="relative h-[88vh] min-h-[580px] max-h-[900px]">
          {/* Backdrop */}
          <div className="absolute inset-0">
            <Image
              src={getImageUrl(featuredMovie.backdrop_path, 'w1280')}
              alt={featuredMovie.title}
              fill
              className={`object-cover transition-opacity duration-700 ${heroLoaded ? 'opacity-100' : 'opacity-0'}`}
              priority
              onLoad={() => setHeroLoaded(true)}
              onError={() => setHeroLoaded(true)}
            />
          </div>

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-[#111111]/20" />

          {/* Content */}
          <div className="relative h-full flex items-end">
            <div className="max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-12 pb-20 md:pb-28">
              <div className="max-w-xl md:max-w-2xl">
                {/* Meta */}
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 text-sm font-bold">
                      {featuredMovie.vote_average.toFixed(1)}
                    </span>
                  </div>
                  {heroYear && (
                    <>
                      <span className="text-zinc-500">·</span>
                      <span className="text-zinc-400 text-sm">{heroYear}</span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-[1.05] tracking-tight">
                  {featuredMovie.title}
                </h1>

                {/* Description */}
                <p className="text-sm md:text-base text-zinc-300 mb-7 md:mb-8 leading-relaxed line-clamp-3 max-w-lg">
                  {featuredMovie.overview}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push(`/movie/${featuredMovie.id}`)}
                    className="flex items-center gap-2.5 bg-white hover:bg-white/90 text-black font-bold px-7 md:px-9 py-3 md:py-3.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 shadow-xl text-sm md:text-base"
                  >
                    <Play className="w-5 h-5 fill-black" />
                    Watch Now
                  </button>
                  <button
                    onClick={() => router.push(`/movie/${featuredMovie.id}`)}
                    className="flex items-center gap-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold px-7 md:px-9 py-3 md:py-3.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm border border-white/20 text-sm md:text-base"
                  >
                    <Info className="w-5 h-5" />
                    More Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Content Rows ── */}
      <div className="pt-8 pb-16">
        {trending.length > 0 && (
          <ContentRow
            title="Trending Now"
            subtitle="Most popular this week"
            onViewAll={() => router.push('/browse?type=movie&category=popular')}
          >
            {trending.map((movie, i) => (
              <MovieCard
                key={movie.id}
                movie={{
                  id: movie.id,
                  title: movie.title,
                  poster: movie.poster_path,
                  rating: movie.vote_average,
                  releaseDate: movie.release_date,
                  description: movie.overview,
                }}
                index={i}
                onClick={() => router.push(`/movie/${movie.id}`)}
              />
            ))}
          </ContentRow>
        )}

        {nowPlaying.length > 0 && (
          <ContentRow
            title="Now Playing"
            subtitle="In theaters now"
            onViewAll={() => router.push('/browse?type=movie&category=now_playing')}
          >
            {nowPlaying.map((movie, i) => (
              <MovieCard
                key={movie.id}
                movie={{
                  id: movie.id,
                  title: movie.title,
                  poster: movie.poster_path,
                  rating: movie.vote_average,
                  releaseDate: movie.release_date,
                  description: movie.overview,
                }}
                index={i}
                onClick={() => router.push(`/movie/${movie.id}`)}
              />
            ))}
          </ContentRow>
        )}

        {trendingTV.length > 0 && (
          <ContentRow
            title="Trending TV Shows"
            subtitle="Most watched series this week"
            onViewAll={() => router.push('/browse?type=tv&category=popular')}
          >
            {trendingTV.map((show, i) => (
              <MovieCard
                key={show.id}
                movie={{
                  id: show.id,
                  title: show.name,
                  poster: show.poster_path,
                  rating: show.vote_average,
                  releaseDate: show.first_air_date,
                  description: show.overview,
                }}
                index={i}
                onClick={() => router.push(`/tv/${show.id}`)}
              />
            ))}
          </ContentRow>
        )}

        {topRated.length > 0 && (
          <ContentRow
            title="Top Rated Movies"
            subtitle="Critically acclaimed all-time greats"
            onViewAll={() => router.push('/browse?type=movie&category=top_rated')}
          >
            {topRated.map((movie, i) => (
              <MovieCard
                key={movie.id}
                movie={{
                  id: movie.id,
                  title: movie.title,
                  poster: movie.poster_path,
                  rating: movie.vote_average,
                  releaseDate: movie.release_date,
                  description: movie.overview,
                }}
                index={i}
                onClick={() => router.push(`/movie/${movie.id}`)}
              />
            ))}
          </ContentRow>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#e50914] p-1.5 rounded-lg">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-extrabold tracking-tight">MovieAI</span>
          </div>
          <p className="text-zinc-600 text-xs text-center">
            © 2025 MovieAI · Created by Sathush Nanayakkara · Powered by TMDB &amp; Google Gemini
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <button onClick={() => router.push('/browse?type=movie')} className="hover:text-zinc-400 transition-colors">Movies</button>
            <button onClick={() => router.push('/browse?type=tv')} className="hover:text-zinc-400 transition-colors">TV Shows</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
