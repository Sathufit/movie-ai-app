// Movie data and API utilities

export const mockMovies = [
  {
    id: 1,
    title: "Inception",
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    rating: 8.8,
    releaseDate: "2010-07-16",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
    genres: ["Action", "Sci-Fi", "Thriller"],
  },
  {
    id: 2,
    title: "The Dark Knight",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    rating: 9.0,
    releaseDate: "2008-07-18",
    description: "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest tests.",
    genres: ["Action", "Crime", "Drama"],
  },
  {
    id: 3,
    title: "Interstellar",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    rating: 8.6,
    releaseDate: "2014-11-07",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    genres: ["Adventure", "Drama", "Sci-Fi"],
  },
  {
    id: 4,
    title: "Pulp Fiction",
    poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    rating: 8.9,
    releaseDate: "1994-10-14",
    description: "The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine in four tales of violence.",
    genres: ["Crime", "Drama"],
  },
  {
    id: 5,
    title: "The Shawshank Redemption",
    poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    rating: 9.3,
    releaseDate: "1994-09-23",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    genres: ["Drama"],
  },
  {
    id: 6,
    title: "The Matrix",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    rating: 8.7,
    releaseDate: "1999-03-31",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    genres: ["Action", "Sci-Fi"],
  },
  {
    id: 7,
    title: "Forrest Gump",
    poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    rating: 8.8,
    releaseDate: "1994-07-06",
    description: "The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.",
    genres: ["Drama", "Romance"],
  },
  {
    id: 8,
    title: "Fight Club",
    poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    rating: 8.8,
    releaseDate: "1999-10-15",
    description: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
    genres: ["Drama"],
  },
];

// Utility function to format date
export const formatMovieDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short",
    day: "numeric"
  });
};

// Future: TMDB API integration
export const fetchMovies = async (query?: string) => {
  // TODO: Implement TMDB API call
  // const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  // const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`;
  
  return mockMovies;
};
