import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, Ticket, Clock, Film } from 'lucide-react';

const GENRES = ['Drama', 'Action', 'Thriller', 'Sci-Fi', 'Comedy', 'Romance', 'Horror', 'Adventure'];

const getMovieMeta = (name = '') => {
  const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rating = ((seed % 20) + 60) / 10;
  const hours = 1 + (seed % 2);
  const minutes = 20 + (seed % 40);
  const genre = GENRES[seed % GENRES.length];
  return {
    rating: rating.toFixed(1),
    runtime: `${hours}h ${minutes}m`,
    genre,
  };
};

const getBackdropUrl = (posterUrl) => {
  if (!posterUrl) return posterUrl;
  return posterUrl.replace('w=600', 'w=1920').replace('q=80', 'q=85');
};

const HeroBanner = ({ movies = [], getMoviePoster }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const featuredMovies = movies.filter((m) => m.releaseStatus === 'RELEASED').slice(0, 5);
  const displayMovies = featuredMovies.length > 0 ? featuredMovies : movies.slice(0, 5);

  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 500);
      }, 250);
    },
    [isTransitioning],
  );

  useEffect(() => {
    if (displayMovies.length <= 1) return;
    const timer = setInterval(() => {
      goToSlide((currentIndex + 1) % displayMovies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [currentIndex, displayMovies.length, goToSlide]);

  const movie = displayMovies[currentIndex];
  const poster = useMemo(
    () => (movie ? getMoviePoster(movie.name) : ''),
    [movie, getMoviePoster],
  );
  const backdrop = getBackdropUrl(poster);
  const meta = movie ? getMovieMeta(movie.name) : null;

  if (displayMovies.length === 0 || !movie) return null;

  return (
    <section className="relative w-full overflow-hidden hero-cinematic">
      {/* Backdrop */}
      <div className="absolute inset-0">
        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <img
            src={backdrop}
            alt=""
            aria-hidden="true"
            className="hero-backdrop w-full h-full object-cover object-center scale-105"
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg-base via-bg-base/90 to-bg-base/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base/60 via-transparent to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-bg-base/80 to-transparent hidden lg:block" />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 container mx-auto px-6 lg:px-8 min-h-[560px] md:min-h-[620px] lg:min-h-[720px] flex items-end lg:items-center pb-16 lg:pb-0 pt-8 transition-all duration-500 ease-out ${
          isTransitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Floating poster — mobile / tablet */}
        <div className="lg:hidden absolute top-8 right-6 sm:right-8 z-20 hero-poster-float">
          <div className="relative w-[110px] sm:w-[130px] rounded-xl overflow-hidden border border-border shadow-xl hero-poster-card">
            <img
              src={poster}
              alt={movie.name}
              className="w-full aspect-poster object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 w-full items-center">
          {/* Text column */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-6 md:space-y-7 pr-[120px] sm:pr-[148px] lg:pr-0">
            {/* IMDb rating */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-card/80 border border-border backdrop-blur-sm">
                <span className="text-[10px] font-bold tracking-widest text-[#F5C518] bg-black/90 px-1.5 py-0.5 rounded-sm leading-none">
                  IMDb
                </span>
                <span className="text-sm font-semibold text-text-primary tabular-nums">
                  {meta.rating}
                  <span className="text-text-muted font-normal">/10</span>
                </span>
              </div>
              <span className="text-xs text-text-muted hidden sm:inline">Featured</span>
            </div>

            {/* Title */}
            <h1 className="type-hero max-w-3xl text-balance">{movie.name}</h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-text-muted" />
                {meta.runtime}
              </span>
              <span className="w-1 h-1 rounded-full bg-border-strong hidden sm:block" />
              <span className="inline-flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-text-muted" />
                {meta.genre}
              </span>
              {movie.language && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border-strong hidden sm:block" />
                  <span className="px-2.5 py-0.5 rounded-md bg-bg-elevated border border-border text-xs text-text-secondary">
                    {movie.language}
                  </span>
                </>
              )}
              {movie.releaseDate && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border-strong hidden sm:block" />
                  <span>{movie.releaseDate}</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="type-body-lg max-w-xl line-clamp-3 md:line-clamp-4 text-text-secondary">
              {movie.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to={`/movie/${movie._id}`}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 cursor-pointer hover-lift-sm"
              >
                <Ticket className="w-4 h-4" />
                Book Tickets
              </Link>
              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline inline-flex items-center gap-2 px-6 py-3 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  Watch Trailer
                </a>
              )}
            </div>
          </div>

          {/* Floating poster — desktop */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 justify-center xl:justify-end">
            <div className="hero-poster-float relative">
              <div className="absolute -inset-6 rounded-3xl bg-white/[0.03] blur-2xl pointer-events-none" />
              <div className="relative w-[260px] xl:w-[300px] rounded-2xl overflow-hidden border border-border shadow-xl hero-poster-card">
                <img
                  src={poster}
                  alt={movie.name}
                  className="w-full aspect-poster object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel indicators */}
      {displayMovies.length > 1 && (
        <div className="absolute bottom-6 lg:bottom-10 left-6 lg:left-8 z-20 flex items-center gap-2">
          {displayMovies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Show featured movie ${idx + 1}`}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-8 bg-text-primary'
                  : 'w-4 bg-white/25 hover:bg-white/45'
              }`}
            />
          ))}
        </div>
      )}

      {/* Scoped hero animations */}
      <style>{`
        .hero-cinematic .hero-backdrop {
          animation: heroKenBurns 24s ease-in-out infinite alternate;
        }
        .hero-cinematic .hero-poster-float {
          animation: heroFloat 7s ease-in-out infinite;
        }
        .hero-cinematic .hero-poster-card {
          animation: heroFloatCard 7s ease-in-out infinite;
        }
        @keyframes heroKenBurns {
          from { transform: scale(1.05); }
          to   { transform: scale(1.12); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes heroFloatCard {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-6px) rotate(0.5deg); }
        }
      `}</style>
    </section>
  );
};

export default HeroBanner;
