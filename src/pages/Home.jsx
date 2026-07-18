import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Search, Film, Calendar, User, Compass, AlertCircle } from 'lucide-react';

// Consistent beautiful poster images generator
export const getMoviePoster = (name = '') => {
  const posters = [
    "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600&auto=format&fit=crop&q=80", // Cyberpunk Neon
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80", // Cinema Popcorn
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80", // Action Spark
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80", // Vintage Cinema Reels
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80", // Retro Theater Seats
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80", // Clapperboard/Showtime
  ];
  if (!name) return posters[0];
  const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return posters[Math.abs(charCodeSum) % posters.length];
};

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, RELEASED, COMING_SOON
  const [langFilter, setLangFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await API.get('/movies');
        const moviesList = response.data.data || [];
        setMovies(moviesList);
        setFilteredMovies(moviesList);
      } catch (err) {
        setError('Could not load movies from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Filter application
  useEffect(() => {
    let result = [...movies];

    if (search.trim()) {
      result = result.filter(m => 
        m.name.toLowerCase().includes(search.toLowerCase()) || 
        m.director.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(m => m.releaseStatus === statusFilter);
    }

    if (langFilter !== 'ALL') {
      result = result.filter(m => m.language === langFilter);
    }

    setFilteredMovies(result);
  }, [search, statusFilter, langFilter, movies]);

  // List of distinct languages for filter
  const languages = ['ALL', ...new Set(movies.map(m => m.language).filter(Boolean))];

  // Featured movie (take first released movie or first in list)
  const featuredMovie = movies.find(m => m.releaseStatus === 'RELEASED') || movies[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      
      {/* Featured Banner Hero */}
      {featuredMovie && (
        <div className="relative rounded-3xl overflow-hidden glass h-[450px] flex items-end p-8 md:p-16 shadow-2xl border border-white/5">
          <div className="absolute inset-0 z-0">
            <img 
              src={getMoviePoster(featuredMovie.name)} 
              alt={featuredMovie.name}
              className="w-full h-full object-cover object-center opacity-30 blur-[2px] scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              Featured Movie
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase tracking-tight">
              {featuredMovie.name}
            </h1>
            <p className="text-gray-300 text-sm md:text-base line-clamp-3">
              {featuredMovie.description}
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-purple-400" /> Released: {featuredMovie.releaseDate}</span>
              <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-purple-400" /> Director: {featuredMovie.director}</span>
              <span className="bg-slate-800 text-gray-300 px-2.5 py-0.5 rounded text-xs font-semibold">{featuredMovie.language}</span>
            </div>
            <div className="pt-2">
              <Link 
                to={`/movie/${featuredMovie._id}`}
                className="inline-flex items-center gap-2 bg-purple-650 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/25 uppercase text-sm tracking-wider cursor-pointer"
              >
                <span>Book Tickets</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Control bar: Search and Filter */}
      <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search by title, director..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex rounded-lg overflow-hidden bg-slate-900/60 border border-white/10 p-1 text-xs">
            {['ALL', 'RELEASED', 'COMING_SOON'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`py-1.5 px-3 rounded-md font-semibold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Language filter dropdown */}
          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="bg-slate-900/60 border border-white/10 rounded-lg text-sm text-gray-300 py-2 px-3 focus:outline-none focus:border-purple-500 transition-all"
          >
            {languages.map(lang => (
              <option key={lang} value={lang} className="bg-[#0b0f19]">
                {lang === 'ALL' ? 'All Languages' : lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Compass className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white tracking-wider uppercase">Movies Collection</h2>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-950/20 border border-red-500/20 p-4 rounded-xl">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {filteredMovies.length === 0 ? (
          <div className="text-center py-12 glass rounded-2xl border border-white/5">
            <Film className="w-12 h-12 text-gray-650 mx-auto mb-3" />
            <p className="text-gray-400">No movies found matching your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map(movie => (
              <Link 
                to={`/movie/${movie._id}`} 
                key={movie._id} 
                className="group relative flex flex-col glass rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/35 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1"
              >
                {/* Poster container */}
                <div className="aspect-[2/3] w-full overflow-hidden bg-slate-950 relative">
                  <img 
                    src={getMoviePoster(movie.name)} 
                    alt={movie.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Status overlay */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider ${
                      movie.releaseStatus === 'RELEASED' 
                        ? 'bg-emerald-500/90 text-white' 
                        : 'bg-amber-500/90 text-slate-900'
                    }`}>
                      {movie.releaseStatus === 'RELEASED' ? 'Released' : 'Coming Soon'}
                    </span>
                  </div>

                  {/* Gradient shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Details */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-widest">{movie.language}</span>
                    <h3 className="text-lg font-bold text-white leading-snug group-hover:text-purple-300 transition-colors uppercase line-clamp-1">
                      {movie.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {movie.description}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3.5 mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span className="truncate">Dir: {movie.director}</span>
                    <span className="text-purple-400/80 font-medium">More Info →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;
