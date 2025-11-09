// TMDB API integration

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Types
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids?: number[];
  genres?: Genre[];
  popularity: number;
}

export interface MovieDetails extends Movie {
  runtime: number;
  budget: number;
  revenue: number;
  status: string;
  tagline: string;
  spoken_languages: SpokenLanguage[];
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface VideosResponse {
  id: number;
  results: Video[];
}

export interface MoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// Helper functions
export const getImageUrl = (
  path: string | null,
  size: string = 'w500'
): string => {
  if (!path) return '/placeholder-movie.png';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatRuntime = (minutes: number): string => {
  if (!minutes) return 'Unknown';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// API functions
class TMDBApi {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = TMDB_API_KEY || '';
    this.baseUrl = TMDB_BASE_URL;
  }

  private async fetchFromTMDB<T>(endpoint: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error('TMDB API key is not configured');
    }

    const url = `${this.baseUrl}${endpoint}${
      endpoint.includes('?') ? '&' : '?'
    }api_key=${this.apiKey}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchMovies(query: string, page: number = 1): Promise<MoviesResponse> {
    return this.fetchFromTMDB<MoviesResponse>(
      `/search/movie?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
    );
  }

  async getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<MoviesResponse> {
    return this.fetchFromTMDB<MoviesResponse>(`/trending/movie/${timeWindow}`);
  }

  async getNowPlaying(page: number = 1): Promise<MoviesResponse> {
    return this.fetchFromTMDB<MoviesResponse>(`/movie/now_playing?page=${page}`);
  }

  async getPopular(page: number = 1): Promise<MoviesResponse> {
    return this.fetchFromTMDB<MoviesResponse>(`/movie/popular?page=${page}`);
  }

  async getTopRated(page: number = 1): Promise<MoviesResponse> {
    return this.fetchFromTMDB<MoviesResponse>(`/movie/top_rated?page=${page}`);
  }

  async getUpcoming(page: number = 1): Promise<MoviesResponse> {
    return this.fetchFromTMDB<MoviesResponse>(`/movie/upcoming?page=${page}`);
  }

  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    return this.fetchFromTMDB<MovieDetails>(`/movie/${movieId}`);
  }

  async getMovieCredits(movieId: number): Promise<Credits> {
    return this.fetchFromTMDB<Credits>(`/movie/${movieId}/credits`);
  }

  async getMovieVideos(movieId: number): Promise<VideosResponse> {
    return this.fetchFromTMDB<VideosResponse>(`/movie/${movieId}/videos`);
  }

  async getRecommendations(movieId: number): Promise<MoviesResponse> {
    return this.fetchFromTMDB<MoviesResponse>(`/movie/${movieId}/recommendations`);
  }

  async getSimilarMovies(movieId: number): Promise<MoviesResponse> {
    return this.fetchFromTMDB<MoviesResponse>(`/movie/${movieId}/similar`);
  }
}

export const tmdbApi = new TMDBApi();
