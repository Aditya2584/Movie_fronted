import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const TrendingSidebar = ({ movies = [], getMoviePoster }) => {
  const trending = movies.slice(0, 4);

  if (trending.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-[#FF5A1F] uppercase tracking-[0.2em]">
        Popular Films
      </h3>

      <div className="space-y-3">
        {trending.map((movie, idx) => {
          const rating = ((movie.name.charCodeAt(0) % 20 + 60) / 10).toFixed(1);
          return (
            <Link
              to={`/movie/${movie._id}`}
              key={movie._id}
              className="group flex gap-3 items-center p-2.5 rounded-xl bg-[#181818]/80 border border-[#2A2A2A] hover:border-[#FF5A1F]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF5A1F]/5 hover:-translate-y-0.5 relative overflow-hidden"
            >
              {/* Number */}
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 text-6xl font-black text-white/[0.04] leading-none select-none pointer-events-none">
                {String(idx + 1).padStart(2, '0')}
              </span>

              {/* Poster thumbnail */}
              <div className="w-16 h-22 rounded-lg overflow-hidden shrink-0 relative border border-[#2A2A2A] group-hover:border-[#FF5A1F]/30 transition-colors">
                <img
                  src={getMoviePoster(movie.name)}
                  alt={movie.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                {/* HD badge */}
                <div className="absolute top-1 right-1">
                  <span className="text-[7px] font-black px-1 py-0.5 rounded bg-[#FF5A1F]/90 text-white tracking-wider">
                    HD
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1 relative z-10">
                <h4 className="text-xs font-bold text-white truncate group-hover:text-[#FF5A1F] transition-colors uppercase">
                  {movie.name}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-[#6B6B6B]">
                  <span>{movie.language}</span>
                  <span>•</span>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    <span className="text-amber-400 font-bold">{rating}</span>
                  </div>
                </div>
              </div>

              {/* Index number */}
              <span className="text-2xl font-black text-[#FF5A1F]/20 group-hover:text-[#FF5A1F]/40 transition-colors shrink-0">
                {String(idx + 1).padStart(2, '0')}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingSidebar;
