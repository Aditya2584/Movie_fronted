import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Film, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import TrendingMovieCard from '../components/TrendingMovieCard';
import TrendingSidebar from '../components/TrendingSidebar';
import MovieCard from '../components/MovieCard';
import SearchFilters from '../components/SearchFilters';
import GenreTabs from '../components/GenreTabs';
import ComingSoon from '../components/ComingSoon';
import Newsletter from '../components/Newsletter';
import LoadingSkeleton from '../components/LoadingSkeleton';

// Consistent movie poster images
export const getMoviePoster = (name = '') => {
  const posters = [
    "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
  ];
  if (!name) return posters[0];
  const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return posters[Math.abs(charCodeSum) % posters.length];
};

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [langFilter, setLangFilter] = useState('ALL');
  const [activeGenre, setActiveGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Trending scroll ref
  const trendingScrollRef = React.useRef(null);

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

  const languages = ['ALL', ...new Set(movies.map(m => m.language).filter(Boolean))];

  const scrollTrending = (direction) => {
    if (trendingScrollRef.current) {
      const scrollAmount = 320;
      trendingScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="pt-16">
        <LoadingSkeleton type="hero" />
        <div className="container mx-auto px-6 py-12">
          <LoadingSkeleton type="card" count={12} />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Hero Banner */}
      <HeroBanner movies={movies} getMoviePoster={getMoviePoster} />

      {/* Trending Movies - Horizontal Scroll */}
      <section className="container mx-auto px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <p className="type-overline">Now Streaming</p>
            <h2 className="type-section">Trending Movies</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollTrending('left')}
              aria-label="Scroll trending left"
              className="btn-icon-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTrending('right')}
              aria-label="Scroll trending right"
              className="btn-icon-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={trendingScrollRef}
          className="flex gap-6 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1"
        >
          {movies.filter(m => m.releaseStatus === 'RELEASED').map((movie) => (
            <TrendingMovieCard
              key={movie._id}
              movie={movie}
              poster={getMoviePoster(movie.name)}
            />
          ))}
        </div>
      </section>

      {/* Catalog Section with Sidebar */}
      <section id="movies" className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Section Header */}
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-[#FF5A1F] rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                Catalog
              </h2>
              <div className="hidden sm:block h-px flex-1 ml-4 bg-gradient-to-r from-[#2A2A2A] to-transparent"></div>
            </div>

            {/* Search & Filters */}
            <SearchFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              langFilter={langFilter}
              onLangChange={setLangFilter}
              languages={languages}
            />

            {/* Genre Tabs */}
            <GenreTabs
              activeTab={activeGenre}
              onTabChange={setActiveGenre}
            />

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-950/20 border border-red-500/20 p-4 rounded-xl">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Movie Grid */}
            {filteredMovies.length === 0 ? (
              <div className="relative overflow-hidden rounded-2xl border border-border glass px-6 py-20 text-center">
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent"
                  aria-hidden="true"
                />
                <div className="relative mx-auto max-w-sm space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-bg-elevated shadow-sm">
                    <Film className="h-7 w-7 text-text-muted" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-text-primary">No movies found</h3>
                    <p className="type-body">
                      Nothing matches your search or filters. Try adjusting your criteria to discover more titles.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {filteredMovies.map((movie, idx) => (
                  <MovieCard
                    key={movie._id}
                    movie={movie}
                    poster={getMoviePoster(movie.name)}
                    index={idx}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Trending Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TrendingSidebar movies={movies} getMoviePoster={getMoviePoster} />
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="container mx-auto px-6 pb-16">
        <ComingSoon movies={movies} getMoviePoster={getMoviePoster} />
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
};

export default Home;
