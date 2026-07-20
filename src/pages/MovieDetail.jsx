import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { getMoviePoster } from './Home';
import {
  Calendar,
  User,
  Film,
  Clock,
  Landmark,
  MapPin,
  AlertCircle,
  ArrowLeft,
  Play,
  Ticket,
  Users,
} from 'lucide-react';
import MovieCard from '../components/MovieCard';

const GENRES = ['Drama', 'Action', 'Thriller', 'Sci-Fi', 'Comedy', 'Romance', 'Horror', 'Adventure'];

const getMovieMeta = (name = '') => {
  const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    rating: (((seed % 20) + 60) / 10).toFixed(1),
    runtime: `${1 + (seed % 2)}h ${20 + (seed % 40)}m`,
    genre: GENRES[seed % GENRES.length],
  };
};

const getBackdropUrl = (posterUrl) => {
  if (!posterUrl) return posterUrl;
  return posterUrl.replace('w=600', 'w=1920').replace('q=80', 'q=85');
};

const getEmbedUrl = (url) => {
  if (!url) return '';
  try {
    if (url.includes('youtube.com/embed/')) return url;
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v');
    } else if (url.includes('youtu.be/')) {
      const parts = url.split('/');
      videoId = parts[parts.length - 1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
};

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const [movieRes, showsRes, moviesRes] = await Promise.all([
          API.get(`/movies/${id}`),
          API.get(`/shows?movieId=${id}`),
          API.get('/movies'),
        ]);
        setMovie(movieRes.data.data);
        setShows(showsRes.data.data || []);
        const allMovies = moviesRes.data.data || [];
        setRecommended(allMovies.filter((m) => m._id !== id).slice(0, 4));
      } catch {
        setError('Error loading movie details.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [id]);

  const showsByTheatre = useMemo(() => {
    return shows.reduce((acc, show) => {
      const theatre = show.theatreId;
      if (!theatre) return acc;
      const key = theatre._id;
      if (!acc[key]) {
        acc[key] = {
          name: theatre.name,
          city: theatre.city,
          address: theatre.address,
          shows: [],
        };
      }
      acc[key].shows.push(show);
      return acc;
    }, {});
  }, [shows]);

  const scrollToShowtimes = () => {
    document.getElementById('showtimes')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base">
        <div className="relative h-[60vh] min-h-[480px] overflow-hidden">
          <div className="skeleton absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/60 to-transparent" />
          <div className="container mx-auto px-6 lg:px-8 h-full flex items-end pb-12">
            <div className="flex gap-8 w-full">
              <div className="hidden lg:block skeleton w-[220px] h-[330px] rounded-2xl shrink-0" />
              <div className="flex-1 space-y-4 pb-4">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-12 w-2/3 max-w-lg rounded-lg" />
                <div className="flex gap-3">
                  <div className="skeleton h-8 w-20 rounded-lg" />
                  <div className="skeleton h-8 w-24 rounded-lg" />
                  <div className="skeleton h-8 w-16 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 lg:px-8 py-16 space-y-8">
          <div className="skeleton h-4 w-full max-w-3xl rounded" />
          <div className="skeleton h-4 w-5/6 max-w-2xl rounded" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton aspect-poster rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-bg-base">
        <div className="max-w-md text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-error-border bg-error-muted">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-2xl font-semibold text-text-primary">Movie Not Found</h2>
          <p className="type-body">{error || 'The requested movie could not be loaded.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-primary hover:text-text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const embedTrailer = getEmbedUrl(movie.trailerUrl);
  const poster = getMoviePoster(movie.name);
  const backdrop = getBackdropUrl(poster);
  const meta = getMovieMeta(movie.name);
  const hasShowtimes = Object.keys(showsByTheatre).length > 0;
  const firstShow = hasShowtimes ? Object.values(showsByTheatre)[0]?.shows[0] : null;

  return (
    <div className="min-h-screen bg-bg-base">
      {/* ─── Cinematic Hero ─────────────────────────────────── */}
      <section className="relative h-[65vh] min-h-[520px] max-h-[720px] overflow-hidden">
        <img
          src={backdrop}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-base via-bg-base/90 to-bg-base/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/50 to-bg-base/30" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-bg-base/60 to-transparent hidden lg:block" />

        <div className="relative z-10 container mx-auto px-6 lg:px-8 h-full flex items-end pb-10 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-end">
            {/* Floating poster */}
            <div className="lg:col-span-3 flex justify-center lg:justify-start">
              <div className="relative -mb-20 lg:-mb-32 hero-poster-float">
                <div className="absolute -inset-4 rounded-3xl bg-white/[0.03] blur-2xl pointer-events-none" />
                <div className="relative w-[140px] sm:w-[180px] lg:w-[220px] rounded-2xl overflow-hidden border border-border shadow-xl">
                  <img
                    src={poster}
                    alt={movie.name}
                    className="w-full aspect-poster object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Title & meta */}
            <div className="lg:col-span-9 space-y-5 lg:space-y-6 animate-fadeInUp">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>

              <div className="space-y-4">
                <h1 className="type-hero max-w-4xl">{movie.name}</h1>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10">
                    <span className="text-[10px] font-bold tracking-widest text-[#F5C518]">IMDb</span>
                    <span className="text-sm font-semibold text-text-primary tabular-nums">
                      {meta.rating}
                      <span className="text-text-muted font-normal">/10</span>
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm text-text-secondary">
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                    {meta.runtime}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-bg-elevated/80 border border-border text-xs text-text-secondary">
                    {meta.genre}
                  </span>
                  {movie.language && (
                    <span className="px-2.5 py-1 rounded-md bg-bg-elevated/80 border border-border text-xs text-text-secondary">
                      {movie.language}
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                      movie.releaseStatus === 'RELEASED'
                        ? 'bg-bg-elevated border-border text-text-secondary'
                        : 'bg-bg-elevated border-border text-text-muted'
                    }`}
                  >
                    {movie.releaseStatus === 'RELEASED' ? 'Released' : 'Coming Soon'}
                  </span>
                  {movie.releaseDate && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-text-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      {movie.releaseDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Book CTA */}
              <div className="flex flex-wrap gap-3 pt-1">
                {hasShowtimes ? (
                  <button
                    type="button"
                    onClick={scrollToShowtimes}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    Book Tickets
                  </button>
                ) : firstShow ? (
                  <Link
                    to={`/booking/${firstShow._id}`}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4" />
                    Book Tickets
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3 opacity-50 cursor-not-allowed"
                  >
                    <Ticket className="w-4 h-4" />
                    Book Tickets
                  </button>
                )}
                {embedTrailer && (
                  <a
                    href="#trailer"
                    className="btn-outline inline-flex items-center gap-2 px-6 py-3"
                  >
                    <Play className="w-4 h-4" />
                    Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content ───────────────────────────────────── */}
      <div className="container mx-auto px-6 lg:px-8 pt-24 lg:pt-36 pb-20 space-y-20 lg:space-y-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-8 space-y-16 lg:space-y-20">
            {/* Story */}
            <section className="space-y-4">
              <p className="type-overline">Story</p>
              <h2 className="type-section">Synopsis</h2>
              <p className="type-body-lg max-w-3xl leading-relaxed">{movie.description}</p>
            </section>

            {/* Cast & Director */}
            <section className="space-y-6">
              <p className="type-overline">Credits</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-bg-card p-6 space-y-2">
                  <div className="flex items-center gap-2 text-text-muted">
                    <User className="w-4 h-4" />
                    <span className="type-caption">Director</span>
                  </div>
                  <p className="type-body-lg font-medium text-text-primary">{movie.director}</p>
                </div>
                <div className="rounded-xl border border-border bg-bg-card p-6 space-y-2">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Users className="w-4 h-4" />
                    <span className="type-caption">Cast</span>
                  </div>
                  <p className="type-body-lg font-medium text-text-primary leading-relaxed">
                    {movie.casts?.join(', ')}
                  </p>
                </div>
              </div>
            </section>

            {/* Trailer */}
            <section id="trailer" className="space-y-6 scroll-mt-28">
              <div className="space-y-1">
                <p className="type-overline">Preview</p>
                <h2 className="type-section flex items-center gap-3">
                  <Play className="w-6 h-6 text-text-muted" />
                  Trailer
                </h2>
              </div>
              {embedTrailer ? (
                <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-border bg-bg-card shadow-lg">
                  <iframe
                    src={embedTrailer}
                    title={`${movie.name} Trailer`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="w-full max-w-4xl aspect-video rounded-2xl flex flex-col items-center justify-center border border-border bg-bg-card text-text-muted gap-3">
                  <Play className="w-10 h-10 text-text-placeholder" />
                  <span className="type-body">No trailer available</span>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar — quick info */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-border bg-bg-card p-8 space-y-6">
              <h3 className="type-card-title">At a glance</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="type-caption">Genre</dt>
                  <dd className="text-sm text-text-primary mt-1">{meta.genre}</dd>
                </div>
                <div>
                  <dt className="type-caption">Runtime</dt>
                  <dd className="text-sm text-text-primary mt-1">{meta.runtime}</dd>
                </div>
                <div>
                  <dt className="type-caption">Language</dt>
                  <dd className="text-sm text-text-primary mt-1">{movie.language}</dd>
                </div>
                <div>
                  <dt className="type-caption">Director</dt>
                  <dd className="text-sm text-text-primary mt-1">{movie.director}</dd>
                </div>
              </dl>
              {hasShowtimes && (
                <button
                  type="button"
                  onClick={scrollToShowtimes}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  Book Tickets
                </button>
              )}
            </div>
          </aside>
        </div>

        {/* Showtimes */}
        <section id="showtimes" className="space-y-8 scroll-mt-28">
          <div className="space-y-1">
            <p className="type-overline">Showtimes</p>
            <h2 className="type-section flex items-center gap-3">
              <Ticket className="w-6 h-6 text-text-muted" />
              Available Showtimes
            </h2>
          </div>

          {!hasShowtimes ? (
            <div className="rounded-2xl border border-border glass px-6 py-16 text-center">
              <Landmark className="w-10 h-10 text-text-muted mx-auto mb-4" />
              <p className="type-body max-w-md mx-auto">
                {movie.releaseStatus === 'RELEASED'
                  ? 'No shows currently scheduled for this movie. Theatres will release bookings soon.'
                  : 'Tickets will open once the movie is officially released.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.values(showsByTheatre).map((theatre, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-border bg-bg-card p-8
                    flex flex-col md:flex-row gap-6 md:items-center md:justify-between
                    transition-all duration-300 hover:border-border-hover hover:shadow-md"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-text-muted shrink-0" />
                      <h3 className="text-lg font-semibold text-text-primary">{theatre.name}</h3>
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-text-muted pl-7">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{theatre.address}, {theatre.city}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {theatre.shows.map((show) => (
                      <Link
                        to={`/booking/${show._id}`}
                        key={show._id}
                        className="group min-w-[110px] rounded-xl border border-border bg-bg-secondary px-4 py-3 text-center
                          transition-all duration-200 hover:border-border-hover hover:bg-bg-hover hover:-translate-y-0.5"
                      >
                        <span className="block text-sm font-semibold text-text-primary">
                          {show.timing}
                        </span>
                        <span className="block text-[10px] text-text-muted uppercase mt-0.5 tracking-wide">
                          {show.format || '2D'}
                        </span>
                        <span className="block text-xs font-medium text-text-secondary mt-2">
                          ₹{show.price}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recommended */}
        {recommended.length > 0 && (
          <section className="space-y-8">
            <div className="space-y-1">
              <p className="type-overline">You may also like</p>
              <h2 className="type-section">Recommended Movies</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {recommended.map((rec, idx) => (
                <MovieCard
                  key={rec._id}
                  movie={rec}
                  poster={getMoviePoster(rec.name)}
                  index={idx}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Poster float animation */}
      <style>{`
        .hero-poster-float {
          animation: detailPosterFloat 7s ease-in-out infinite;
        }
        @keyframes detailPosterFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default MovieDetail;
