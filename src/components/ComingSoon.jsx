import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Bell, Play } from 'lucide-react';

const ComingSoon = ({ movies = [], getMoviePoster }) => {
  const comingSoonMovies = movies.filter(m => m.releaseStatus === 'COMING_SOON');

  if (comingSoonMovies.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-[#FF5A1F] rounded-full"></div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            Soon on site
          </h2>
        </div>
        <div className="hidden sm:block h-px flex-1 mx-6 bg-gradient-to-r from-[#2A2A2A] to-transparent"></div>
      </div>

      <p className="text-[#A8A8A8] text-sm max-w-2xl">
        We will keep you up to date on movies that are about to appear on our site. New films, 
        trailers, news and many more cool things are waiting for you!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {comingSoonMovies.slice(0, 3).map((movie, idx) => (
          <Link
            to={`/movie/${movie._id}`}
            key={movie._id}
            className="group relative rounded-2xl overflow-hidden bg-[#181818] border border-[#2A2A2A] hover:border-[#FF5A1F]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[#FF5A1F]/10 animate-fadeInUp opacity-0"
            style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'forwards' }}
          >
            {/* Poster */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={getMoviePoster(movie.name)}
                alt={movie.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 rounded-full bg-[#FF5A1F]/90 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-[#FF5A1F]/30">
                  <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                </div>
              </div>

              {/* Coming soon badge */}
              <div className="absolute top-3 left-3">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-500/90 text-black uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <h3 className="text-base font-bold text-white uppercase group-hover:text-[#FF5A1F] transition-colors line-clamp-1">
                {movie.name}
              </h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{movie.releaseDate || 'TBA'}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[#FF5A1F] text-xs font-semibold">
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notify Me</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ComingSoon;
