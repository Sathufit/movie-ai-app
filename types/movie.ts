export interface Movie {
  id: number;
  title: string;
  poster: string;
  rating: number;
  releaseDate: string;
  description: string;
  trailerUrl?: string;
  genres?: string[];
}

export interface MovieCardProps {
  movie: Movie;
  index: number;
}
