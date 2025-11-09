const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string }[];
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  spoken_languages: { english_name: string }[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface Credits {
  cast: Cast[];
  crew: { id: number; name: string; job: string; profile_path: string }[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

export const tmdbApi = {
  getNowPlaying: async (page = 1) => {
    return fetcher(`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`);
  },

  getTrending: async (timeWindow: 'day' | 'week' = 'week') => {
    return fetcher(`${BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`);
  },

  getPopular: async (page = 1) => {
    return fetcher(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`);
  },

  searchMovies: async (query: string, page = 1) => {
    return fetcher(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`);
  },

  getMovieDetails: async (id: number): Promise<MovieDetails> => {
    return fetcher(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=en-US`);
  },

  getMovieVideos: async (id: number) => {
    return fetcher(`${BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`);
  },

  getMovieCredits: async (id: number): Promise<Credits> => {
    return fetcher(`${BASE_URL}/movie/${id}/credits?api_key=${TMDB_API_KEY}&language=en-US`);
  },

  getRecommendations: async (id: number) => {
    return fetcher(`${BASE_URL}/movie/${id}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
  },
};

export const getImageUrl = (path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return '/placeholder-movie.png';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatRuntime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};
