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
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading movie details...</p>
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black">
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(movieJsonLd) }}
      />
      
      {/* Hero Section with Backdrop */}
      <div className="relative h-[60vh] md:h-[70vh]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-8 left-8 z-10 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Actions */}
        <div className="absolute top-8 right-8 z-10 flex gap-3">
          <button className="bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-colors">
            <Heart className="w-6 h-6" />
          </button>
          <button className="bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
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
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{movie.title}</h1>
                {movie.tagline && <p className="text-xl text-zinc-400 italic mb-4">"{movie.tagline}"</p>}

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full">
                    <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                    <span className="text-white font-bold">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-zinc-400 text-sm">({movie.vote_count.toLocaleString()} votes)</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-5 h-5" />
                    <span>{formatDate(movie.release_date)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-5 h-5" />
                    <span>{formatRuntime(movie.runtime)}</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {movie.genres?.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-4 py-1 bg-zinc-800/50 text-zinc-300 rounded-full text-sm border border-zinc-700"
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
                  className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 mb-6"
                >
                  <Play className="w-6 h-6" fill="currentColor" />
                  Watch Trailer
                </button>
              )}

              {/* Overview */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-3">Overview</h2>
                <p className="text-zinc-300 text-lg leading-relaxed">{movie.overview}</p>
              </div>

              {/* AI Summary */}
              <div className="bg-gradient-to-r from-purple-900/30 to-red-900/30 border border-purple-500/20 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">AI-Generated Summary</h2>
                </div>

                {aiSummary ? (
                  <p className="text-zinc-300 leading-relaxed">{aiSummary}</p>
                ) : (
                  <div>
                    <p className="text-zinc-400 mb-3">Get an AI-powered concise summary of this movie.</p>
                    <button
                      onClick={handleAISummary}
                      disabled={loadingAI}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingAI ? 'Generating...' : 'Generate AI Summary'}
                    </button>
                  </div>
                )}
              </div>

              {/* AI Chat Interface */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">Chat About This Movie</h2>
                  </div>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {showChat ? 'Hide Chat' : 'Start Chat'}
                  </button>
                </div>

                {showChat ? (
                  <div className="space-y-4">
                    {/* Chat Messages */}
                    <div className="bg-zinc-900/50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                      {chatMessages.length === 0 ? (
                        <p className="text-zinc-400 text-center py-8">
                          Ask me anything about this movie! For example:
                          <br />
                          <span className="text-sm mt-2 block text-zinc-500">
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
                              className={`max-w-[80%] rounded-lg p-3 ${
                                msg.role === 'User'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-zinc-800 text-zinc-200'
                              }`}
                            >
                              <p className="text-xs font-semibold mb-1 opacity-70">
                                {msg.role}
                              </p>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                          </div>
                        ))
                      )}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-zinc-800 text-zinc-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                              <p className="text-sm">AI is thinking...</p>
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
                        className="flex-1 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || chatLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-400">
                    Have questions about this movie? Click "Start Chat" to ask our AI assistant anything!
                  </p>
                )}
              </div>

              {/* Director */}
              {director && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Director</h3>
                  <p className="text-zinc-300">{director.name}</p>
                </div>
              )}

              {/* Production Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="text-zinc-500 mb-1">Status</h3>
                  <p className="text-white">{movie.status}</p>
                </div>
                <div>
                  <h3 className="text-zinc-500 mb-1">Original Language</h3>
                  <p className="text-white">
                    {movie.spoken_languages[0]?.english_name || 'Unknown'}
                  </p>
                </div>
                {movie.budget > 0 && (
                  <div>
                    <h3 className="text-zinc-500 mb-1">Budget</h3>
                    <p className="text-white">${(movie.budget / 1000000).toFixed(0)}M</p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <h3 className="text-zinc-500 mb-1">Revenue</h3>
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
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              {mainCast.map((person) => (
                <div key={person.id} className="text-center">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 mb-3">
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
                  <h3 className="text-white font-semibold text-sm mb-1">{person.name}</h3>
                  <p className="text-zinc-400 text-xs">{person.character}</p>
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
            className="mt-16 mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
