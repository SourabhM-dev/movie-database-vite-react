import { useState, useEffect } from 'react';
import './App.css';
import Search from './components/Search.jsx';
import MovieCard from './components/MovieCard.jsx';
import Spinner from './components/Spinner.jsx';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';


const useDebounce = (callback, delay, dependencies) => {
  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [...dependencies, delay]);
};

const API_BASE_URL = 'http://www.omdbapi.com';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query) => {
    if (!query) {
      setMovieList([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const url = `${API_BASE_URL}/?s=${encodeURIComponent(query)}&apikey=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error);
        setMovieList([]);
      } else {
        setMovieList(data.Search || []);
        setErrorMessage('');
        if (query && data.Search && data.Search.length > 0) {
          await updateSearchCount(query, data.Search[0]);
        }
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies || []);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.length > 0 ? (
                movieList.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} />
                ))
              ) : (
                <p>No movies found. Try another search.</p>
              )}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
