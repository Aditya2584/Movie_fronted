import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';

const GENRES = ['Drama', 'Action', 'Thriller', 'Sci-Fi', 'Comedy', 'Romance', 'Horror', 'Adventure'];

const getMovieMeta = (name = '') => {
  const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    rating: (((seed % 20) + 60) / 10).toFixed(1),
    genre: GENRES[seed % GENRES.length],
  };
};

const MovieCard = ({ movie, poster, index = 0 }) => {
  const { rating, genre } = getMovieMeta(movie.name);

  return (
    <article
      className="group animate-fadeInUp opacity-0"
      style={{
        animationDelay: `${Math.min(index * 60, 480)}ms`,
        animationFillMode: 'forwards',
      }}
    >
      <Link
        to={`/movie/${movie._id}`}
        className="block relative rounded-2xl overflow-hidden bg-bg-card border border-border
          shadow-sm transition-all duration-500 ease-out
          hover:border-border-hover hover:shadow-xl hover:-translate-y-2"
      >
        {/* Poster */}
        <div className="relative aspect-poster overflow-hidden">
          <img
            src={poster}
            alt={movie.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* IMDb rating */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm border border-white/10">
            <span className="text-[9px] font-bold tracking-wider text-[#F5C518]">IMDb</span>
            <span className="text-xs font-semibold text-text-primary tabular-nums">{rating}</span>
          </div>

          {/* Genre */}
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-bg-card/80 backdrop-blur-sm border border-border text-text-secondary">
              {genre}
            </span>
          </div>

          {/* Status */}
          {movie.releaseStatus === 'COMING_SOON' && (
            <div className="absolute top-12 left-3">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-bg-elevated/90 backdrop-blur-sm border border-border text-text-secondary">
                Coming Soon
              </span>
            </div>
          )}

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
            <div>
              <h3 className="type-card-title text-text-primary line-clamp-2 group-hover:text-white transition-colors duration-200">
                {movie.name}
              </h3>
              {movie.language && (
                <p className="type-caption mt-1">{movie.language}</p>
              )}
            </div>

            {/* Book button */}
            <span
              className="flex items-center justify-center gap-2 w-full btn-primary py-2.5 text-xs
                opacity-100 md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0
                transition-all duration-300 ease-out"
            >
              <Ticket className="w-3.5 h-3.5" />
              Book Tickets
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default MovieCard;
