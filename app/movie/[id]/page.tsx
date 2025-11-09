'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Metadata } from 'next';
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Play,
  Heart,
  Share2,
  Sparkles,
  MessageCircle,
  Send,
  Film,
} from 'lucide-react';
import {
  tmdbApi,
  MovieDetails,
  Credits,
  getImageUrl,
  formatDate,
  formatRuntime,
  Video,
  Movie,
} from '@/lib/tmdb';
import { geminiService } from '@/lib/gemini';
import MovieCard from '@/components/MovieCard';

interface PageProps {
  params: Promise<{ id: string }>;
}

// This would ideally be in a generateMetadata function for dynamic metadata
// but since this is a client component, we'll add JSON-LD in the component itself

export default function MovieDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [movieData, creditsData, videosData, recsData] = await Promise.all([
          tmdbApi.getMovieDetails(parseInt(id)),
          tmdbApi.getMovieCredits(parseInt(id)),
          tmdbApi.getMovieVideos(parseInt(id)),
          tmdbApi.getRecommendations(parseInt(id)),
        ]);

        setMovie(movieData);
        setCredits(creditsData);
        setVideos(videosData.results.filter((v: Video) => v.type === 'Trailer' && v.site === 'YouTube'));
        setRecommendations(recsData.results.slice(0, 4));
      } catch (error) {
        console.error('Error fetching movie data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  const handleAISummary = async () => {
    if (!movie || aiSummary) return;

    try {
      setLoadingAI(true);
      const summary = await geminiService.summarizeMovie(movie.title, movie.overview);
      setAiSummary(summary);
    } catch (error) {
      console.error('Error generating AI summary:', error);
      setAiSummary('Unable to generate AI summary. Please make sure your Gemini API key is configured.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !movie || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message to chat
    const newMessages = [...chatMessages, { role: 'User', text: userMessage }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const response = await geminiService.chatAboutMovie(
        movie.title,
        movie.overview,
        userMessage,
        chatMessages
      );
      
      setChatMessages([...newMessages, { role: 'AI', text: response }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setChatMessages([
        ...newMessages,
        { role: 'AI', text: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
            <Film className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" size={24} />
          </div>
          <p className="text-slate-400 mt-4 text-sm md:text-base">Loading movie details...</p>
        </div>
      </div>
    );
  }

  const trailer = videos[0];
  const director = credits?.crew.find((person) => person.job === 'Director');
  const mainCast = credits?.cast.slice(0, 6) || [];

  // JSON-LD structured data for SEO
  const movieJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: movie.title,
    description: movie.overview,
    image: getImageUrl(movie.poster_path, 'w500'),
    datePublished: movie.release_date,
    director: director ? {
      '@type': 'Person',
      name: director.name,
    } : undefined,
    actor: mainCast.map(actor => ({
      '@type': 'Person',
      name: actor.name,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: movie.vote_average.toFixed(1),
      ratingCount: movie.vote_count,
      bestRating: 10,
      worstRating: 0,
    },
    genre: movie.genres?.map(g => g.name),
    duration: `PT${movie.runtime}M`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(movieJsonLd) }}
      />
      
      {/* Hero Section with Backdrop */}
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src={getImageUrl(movie.backdrop_path, 'w1280')}
            alt={movie.title}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              e.currentTarget.src = '/placeholder-movie.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 md:top-8 md:left-8 z-10 bg-black/50 backdrop-blur-sm text-white p-2 md:p-3 rounded-full hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Actions */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10 flex gap-2 md:gap-3">
          <button className="bg-black/50 backdrop-blur-sm text-white p-2 md:p-3 rounded-full hover:bg-black/70 transition-colors">
            <Heart className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button className="bg-black/50 backdrop-blur-sm text-white p-2 md:p-3 rounded-full hover:bg-black/70 transition-colors">
            <Share2 className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-20 sm:-mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1">
            <div className="relative aspect-[2/3] max-w-xs mx-auto lg:max-w-none rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-movie.png';
                }}
              />
            </div>
          </motion.div>

          {/* Info */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              {/* Title & Rating */}
              <div className="mb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight">{movie.title}</h1>
                {movie.tagline && <p className="text-lg md:text-xl text-zinc-400 italic mb-4">"{movie.tagline}"</p>}

                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-2 bg-yellow-500/20 px-3 md:px-4 py-2 rounded-full">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" fill="currentColor" />
                    <span className="text-white font-bold text-sm md:text-base">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-slate-400 text-xs md:text-sm">({movie.vote_count.toLocaleString()} votes)</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-sm md:text-base">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                    <span>{formatDate(movie.release_date)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-sm md:text-base">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {movie.genres?.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 md:px-4 py-1 bg-slate-800/50 text-slate-300 rounded-full text-xs md:text-sm border border-slate-700"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trailer Button */}
              {trailer && (
                <button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                  className="flex items-center justify-center gap-2 md:gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 transform hover:scale-105 mb-6 w-full sm:w-auto text-sm md:text-base shadow-lg shadow-cyan-500/30"
                >
                  <Play className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                  Watch Trailer
                </button>
              )}

              {/* Overview */}
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Overview</h2>
                <p className="text-slate-300 text-base md:text-lg leading-relaxed">{movie.overview}</p>
              </div>

              {/* AI Summary */}
              <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/20 rounded-xl p-4 md:p-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                  <h2 className="text-lg md:text-xl font-bold text-white">AI-Generated Summary</h2>
                </div>

                {aiSummary ? (
                  <p className="text-slate-300 leading-relaxed text-sm md:text-base">{aiSummary}</p>
                ) : (
                  <div>
                    <p className="text-slate-400 mb-3 text-sm md:text-base">Get an AI-powered concise summary of this movie.</p>
                    <button
                      onClick={handleAISummary}
                      disabled={loadingAI}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 md:px-6 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full sm:w-auto shadow-lg shadow-cyan-500/30"
                    >
                      {loadingAI ? 'Generating...' : 'Generate AI Summary'}
                    </button>
                  </div>
                )}
              </div>

              {/* AI Chat Interface */}
              <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/20 rounded-xl p-4 md:p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                    <h2 className="text-lg md:text-xl font-bold text-white">Chat About This Movie</h2>
                  </div>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="text-xs md:text-sm text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg"
                  >
                    {showChat ? 'Hide Chat' : 'Start Chat'}
                  </button>
                </div>

                {showChat ? (
                  <div className="space-y-4">
                    {/* Chat Messages */}
                    <div className="bg-slate-900/50 rounded-lg p-3 md:p-4 max-h-80 md:max-h-96 overflow-y-auto space-y-3">
                      {chatMessages.length === 0 ? (
                        <p className="text-slate-400 text-center py-6 md:py-8 text-sm md:text-base">
                          Ask me anything about this movie! For example:
                          <br />
                          <span className="text-xs md:text-sm mt-2 block text-slate-500">
                            "What are the main themes?", "Who are the main characters?", "Is it suitable for kids?"
                          </span>
                        </p>
                      ) : (
                        chatMessages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.role === 'User' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] md:max-w-[80%] rounded-lg p-2.5 md:p-3 ${
                                msg.role === 'User'
                                  ? 'bg-cyan-600 text-white'
                                  : 'bg-slate-800 text-slate-200'
                              }`}
                            >
                              <p className="text-xs font-semibold mb-1 opacity-70">
                                {msg.role}
                              </p>
                              <p className="text-xs md:text-sm">{msg.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-800 text-slate-200 rounded-lg p-2.5 md:p-3">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-t-2 border-b-2 border-blue-500"></div>
                              <p className="text-xs md:text-sm">AI is thinking...</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask about the movie..."
                        disabled={chatLoading}
                        className="flex-1 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-3 md:px-4 py-2 md:py-3 outline-none focus:border-blue-500 transition-colors disabled:opacity-50 text-sm md:text-base"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || chatLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 md:p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                      >
                        <Send className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm md:text-base">
                    Have questions about this movie? Click "Start Chat" to ask our AI assistant anything!
                  </p>
                )}
              </div>

              {/* Director */}
              {director && (
                <div className="mb-6">
                  <h3 className="text-base md:text-lg font-semibold text-white mb-2">Director</h3>
                  <p className="text-slate-300 text-sm md:text-base">{director.name}</p>
                </div>
              )}

              {/* Production Info */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                <div>
                  <h3 className="text-slate-500 mb-1">Status</h3>
                  <p className="text-white">{movie.status}</p>
                </div>
                <div>
                  <h3 className="text-slate-500 mb-1">Original Language</h3>
                  <p className="text-white">
                    {movie.spoken_languages[0]?.english_name || 'Unknown'}
                  </p>
                </div>
                {movie.budget > 0 && (
                  <div>
                    <h3 className="text-slate-500 mb-1">Budget</h3>
                    <p className="text-white">${(movie.budget / 1000000).toFixed(0)}M</p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <h3 className="text-slate-500 mb-1">Revenue</h3>
                    <p className="text-white">${(movie.revenue / 1000000).toFixed(0)}M</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Cast */}
        {mainCast.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 md:mt-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
              {mainCast.map((person) => (
                <div key={person.id} className="text-center">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 mb-2 md:mb-3">
                    <Image
                      src={getImageUrl(person.profile_path, 'w185')}
                      alt={person.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-movie.png';
                      }}
                    />
                  </div>
                  <h3 className="text-white font-semibold text-xs md:text-sm mb-1">{person.name}</h3>
                  <p className="text-slate-400 text-xs">{person.character}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 md:mt-16 mb-12 md:mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {recommendations.map((movie, index) => (
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
                  index={index}
                  onClick={() => router.push(`/movie/${movie.id}`)}
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
