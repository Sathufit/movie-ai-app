'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
  Tv as TvIcon,
} from 'lucide-react';
import {
  tmdbApi,
  TVShowDetails,
  Credits,
  getImageUrl,
  formatDate,
  Video,
  TVShow,
} from '@/lib/tmdb';
import { geminiService } from '@/lib/gemini';
import MediaCard from '@/components/MediaCard';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TVShowDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [show, setShow] = useState<TVShowDetails | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [recommendations, setRecommendations] = useState<TVShow[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; text: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchShowData = async () => {
      try {
        setLoading(true);
        const [showData, creditsData, videosData, recsData] = await Promise.all([
          tmdbApi.getTVShowDetails(parseInt(id)),
          tmdbApi.getTVShowCredits(parseInt(id)),
          tmdbApi.getTVShowVideos(parseInt(id)),
          tmdbApi.getTVShowRecommendations(parseInt(id)),
        ]);
        setShow(showData);
        setCredits(creditsData);
        setVideos(videosData.results.filter((v: Video) => v.type === 'Trailer' && v.site === 'YouTube'));
        setRecommendations(recsData.results.slice(0, 8));
      } catch (err) {
        console.error('Error fetching TV show:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShowData();
  }, [id]);

  const handleAISummary = async () => {
    if (!show || aiSummary) return;
    try {
      setLoadingAI(true);
      const summary = await geminiService.summarizeMovie(show.name, show.overview);
      setAiSummary(summary);
    } catch {
      setAiSummary('Unable to generate AI summary. Please check your Gemini API key.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !show || chatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput('');
    const newMessages = [...chatMessages, { role: 'User', text: userMessage }];
    setChatMessages(newMessages);
    setChatLoading(true);
    try {
      const response = await geminiService.chatAboutMovie(
        show.name, show.overview, userMessage, chatMessages
      );
      setChatMessages([...newMessages, { role: 'AI', text: response }]);
    } catch {
      setChatMessages([...newMessages, { role: 'AI', text: 'Sorry, an error occurred. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading || !show) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const trailer = videos[0];
  const creators = show.created_by || [];
  const mainCast = credits?.cast.slice(0, 6) || [];

  const hasAired = !!show.first_air_date && new Date(show.first_air_date) <= new Date();
  const isAvailable =
    hasAired &&
    show.number_of_episodes > 0 &&
    show.status !== 'Planned' &&
    show.status !== 'In Production';

  const formatEpisodeRuntime = (runtime: number[]) => {
    if (!runtime || runtime.length === 0) return 'Unknown';
    return `${runtime[0]} min/ep`;
  };

  const handleWatch = () => router.push(`/watch/tv/${show.id}?season=1&episode=1`);

  return (
    <div className="min-h-screen bg-[#111111] text-white">

      {/* Hero Backdrop */}
      <div className="relative h-[55vh] sm:h-[65vh] md:h-[75vh]">
        <Image
          src={getImageUrl(show.backdrop_path, 'w1280')}
          alt={show.name}
          fill
          className="object-cover"
          priority
          onError={(e) => { e.currentTarget.src = '/placeholder-movie.png'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/30 to-transparent" />

        <button
          onClick={() => router.back()}
          className="absolute top-5 left-4 md:top-8 md:left-8 z-10 bg-black/50 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-black/70 transition-colors border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute top-5 right-4 md:top-8 md:right-8 z-10 flex gap-2">
          <button className="bg-black/50 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-black/70 transition-colors border border-white/10">
            <Heart className="w-5 h-5" />
          </button>
          <button className="bg-black/50 backdrop-blur-sm text-white p-2.5 rounded-full hover:bg-black/70 transition-colors border border-white/10">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-12 -mt-24 sm:-mt-36 md:-mt-44 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="relative aspect-[2/3] max-w-[260px] mx-auto lg:max-w-none rounded-xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5">
              <Image
                src={getImageUrl(show.poster_path, 'w500')}
                alt={show.name}
                fill
                className="object-cover"
                onError={(e) => { e.currentTarget.src = '/placeholder-movie.png'; }}
              />
              <div className="absolute top-3 left-3 bg-[#e50914]/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <TvIcon className="w-3 h-3 text-white" />
                <span className="text-xs font-bold text-white">TV SHOW</span>
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 leading-tight">
              {show.name}
            </h1>
            {show.tagline && (
              <p className="text-base md:text-lg text-zinc-400 italic mb-5">&ldquo;{show.tagline}&rdquo;</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-bold text-sm">{show.vote_average.toFixed(1)}</span>
                <span className="text-zinc-400 text-xs">({show.vote_count.toLocaleString()})</span>
              </div>
              {show.first_air_date && (
                <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(show.first_air_date)}</span>
                </div>
              )}
              {show.episode_run_time?.length > 0 && (
                <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{formatEpisodeRuntime(show.episode_run_time)}</span>
                </div>
              )}
            </div>

            {/* Show stats */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-300 rounded-full text-xs font-medium">
                {show.number_of_seasons} {show.number_of_seasons === 1 ? 'Season' : 'Seasons'}
              </span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-300 rounded-full text-xs font-medium">
                {show.number_of_episodes} Episodes
              </span>
              <span className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-300 rounded-full text-xs font-medium">
                {show.status}
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {show.genres?.map((g) => (
                <span key={g.id} className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-300 rounded-full text-xs font-medium">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {isAvailable ? (
                <button
                  onClick={handleWatch}
                  className="flex items-center justify-center gap-2.5 bg-white hover:bg-white/90 text-black font-bold px-8 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-xl text-sm sm:text-base w-full sm:w-auto"
                >
                  <Play className="w-5 h-5 fill-black" />
                  Watch Now
                </button>
              ) : (
                <div className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 text-sm w-full sm:w-auto">
                  <Clock className="w-4 h-4" />
                  <span>{show.status === 'In Production' ? 'In Production' : 'Coming Soon'}</span>
                </div>
              )}
              {trailer && (
                <button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')}
                  className="flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 border border-white/10 text-sm sm:text-base w-full sm:w-auto"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Watch Trailer
                </button>
              )}
            </div>

            {/* Overview */}
            <div className="mb-7">
              <h2 className="text-lg md:text-xl font-bold text-white mb-3">Overview</h2>
              <p className="text-zinc-300 leading-relaxed">{show.overview}</p>
            </div>

            {/* AI Summary */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#e50914]" />
                <h2 className="text-base font-bold text-white">AI Summary</h2>
              </div>
              {aiSummary ? (
                <p className="text-zinc-300 text-sm leading-relaxed">{aiSummary}</p>
              ) : (
                <div>
                  <p className="text-zinc-500 text-sm mb-3">Get an AI-generated summary of this show.</p>
                  <button
                    onClick={handleAISummary}
                    disabled={loadingAI}
                    className="bg-[#e50914] hover:bg-[#c40812] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                  >
                    {loadingAI ? 'Generating...' : 'Generate Summary'}
                  </button>
                </div>
              )}
            </div>

            {/* AI Chat */}
            <div className="bg-white/3 border border-white/8 rounded-xl p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-base font-bold text-white">Ask About This Show</h2>
                </div>
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                >
                  {showChat ? 'Hide' : 'Start Chat'}
                </button>
              </div>

              {showChat ? (
                <div className="space-y-3">
                  <div className="bg-[#0d0d0d] rounded-lg p-3 max-h-72 overflow-y-auto space-y-3">
                    {chatMessages.length === 0 ? (
                      <p className="text-zinc-500 text-center py-6 text-sm">
                        Ask anything — seasons, characters, plot...
                      </p>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'User' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg px-3 py-2 text-xs md:text-sm ${
                            msg.role === 'User' ? 'bg-[#e50914] text-white' : 'bg-[#1a1a1a] text-zinc-200 border border-white/5'
                          }`}>
                            <p className="text-[10px] font-semibold mb-1 opacity-60">{msg.role}</p>
                            <p>{msg.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-zinc-500">Thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask about the show..."
                      disabled={chatLoading}
                      className="flex-1 bg-[#1a1a1a] border border-white/10 focus:border-white/25 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 outline-none text-sm transition-colors disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || chatLoading}
                      className="bg-[#e50914] hover:bg-[#c40812] text-white p-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">Ask our AI anything about this TV show.</p>
              )}
            </div>

            {/* Creators */}
            {creators.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-zinc-500 mb-1 uppercase tracking-wider">Created By</h3>
                <p className="text-white text-sm">{creators.map((c) => c.name).join(', ')}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Status</h3>
                <p className="text-white">{show.status}</p>
              </div>
              <div>
                <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Type</h3>
                <p className="text-white">{show.type}</p>
              </div>
              <div>
                <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-1">First Aired</h3>
                <p className="text-white">{formatDate(show.first_air_date)}</p>
              </div>
              {show.last_air_date && (
                <div>
                  <h3 className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Last Aired</h3>
                  <p className="text-white">{formatDate(show.last_air_date)}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Cast */}
        {mainCast.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-5">Cast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {mainCast.map((person) => (
                <div key={person.id} className="text-center group">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] mb-2 shadow-lg border border-white/5">
                    <Image
                      src={getImageUrl(person.profile_path, 'w185')}
                      alt={person.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.src = '/placeholder-movie.png'; }}
                    />
                  </div>
                  <h3 className="text-white text-xs font-semibold leading-tight mb-0.5">{person.name}</h3>
                  <p className="text-zinc-600 text-[10px]">{person.character}</p>
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
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-5">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recommendations.map((rec, i) => (
                <MediaCard
                  key={rec.id}
                  media={{
                    id: rec.id,
                    name: rec.name,
                    poster: rec.poster_path,
                    rating: rec.vote_average,
                    firstAirDate: rec.first_air_date,
                    description: rec.overview,
                    mediaType: 'tv',
                  }}
                  index={i}
                  onClick={() => router.push(`/tv/${rec.id}`)}
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
