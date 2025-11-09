// API configuration and constants

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const IMAGE_SIZES = {
  poster: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original',
  },
  backdrop: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original',
  },
  profile: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    original: 'original',
  },
};

export const getImageUrl = (
  path: string,
  type: keyof typeof IMAGE_SIZES = 'poster',
  size: 'small' | 'medium' | 'large' | 'original' = 'medium'
): string => {
  if (!path) return '/placeholder-movie.png';
  const sizeValue = IMAGE_SIZES[type][size];
  return `${TMDB_IMAGE_BASE_URL}/${sizeValue}${path}`;
};

// API endpoints
export const API_ENDPOINTS = {
  trending: (timeWindow: 'day' | 'week' = 'week') => 
    `${TMDB_BASE_URL}/trending/movie/${timeWindow}`,
  popular: `${TMDB_BASE_URL}/movie/popular`,
  topRated: `${TMDB_BASE_URL}/movie/top_rated`,
  nowPlaying: `${TMDB_BASE_URL}/movie/now_playing`,
  upcoming: `${TMDB_BASE_URL}/movie/upcoming`,
  search: `${TMDB_BASE_URL}/search/movie`,
  movieDetails: (id: number) => `${TMDB_BASE_URL}/movie/${id}`,
  movieVideos: (id: number) => `${TMDB_BASE_URL}/movie/${id}/videos`,
  movieCredits: (id: number) => `${TMDB_BASE_URL}/movie/${id}/credits`,
  movieRecommendations: (id: number) => `${TMDB_BASE_URL}/movie/${id}/recommendations`,
};

// Genre mapping
export const GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};
