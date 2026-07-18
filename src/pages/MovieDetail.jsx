import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { getMoviePoster } from './Home';
import { Calendar, User, Film, Clock, Landmark, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';

// Helper to convert standard watch URLs to embed URLs for YouTube
const getEmbedUrl = (url) => {
  if (!url) return '';
  try {
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v');
    } else if (url.includes('youtu.be/')) {
      const parts = url.split('/');
      videoId = parts[parts.length - 1]?.split('?')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch (e) {
    return '';
  }
};

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        // Fetch Movie Details
        const movieRes = await API.get(`/movies/${id}`);
        setMovie(movieRes.data.data);

        // Fetch Movie Shows
        const showsRes = await API.get(`/shows?movieId=${id}`);
        setShows(showsRes.data.data || []);
      } catch (err) {
        setError('Error loading movie details.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center space-y-4">
        <div className="flex justify-center text-red-400">
          <AlertCircle className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <p className="text-gray-400">{error || 'The requested movie could not be loaded.'}</p>
        <Link to="/" className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-semibold mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to Explore
        </Link>
      </div>
    );
  }

  // Group shows by Theatre
  const showsByTheatre = shows.reduce((acc, show) => {
    const theatre = show.theatreId;
    if (!theatre) return acc;
    const key = theatre._id;
    if (!acc[key]) {
      acc[key] = {
        name: theatre.name,
        city: theatre.city,
        address: theatre.address,
        shows: []
      };
    }
    acc[key].shows.push(show);
    return acc;
  }, {});

  const embedTrailer = getEmbedUrl(movie.trailerUrl);

  return (
    <div className="space-y-12">
      {/* Back navigation */}
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 font-medium transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* Movie Info Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Poster Image */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative aspect-[2/3] max-w-sm mx-auto">
            <img 
              src={getMoviePoster(movie.name)} 
              alt={movie.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-purple-600 text-white font-bold text-xs uppercase px-2.5 py-1 rounded shadow-lg">
              {movie.releaseStatus}
            </div>
          </div>
        </div>

        {/* Right Column: Title and Details */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
              {movie.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="bg-purple-950/60 border border-purple-500/30 text-purple-300 font-semibold px-3 py-1 rounded">
                {movie.language}
              </span>
              <span className="bg-slate-900 border border-white/5 text-gray-300 px-3 py-1 rounded font-semibold">
                Released: {movie.releaseDate}
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed text-base">
              {movie.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-white/5 py-4 my-2">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <User className="w-4 h-4 text-purple-400" />
                <span><strong className="text-gray-200">Director:</strong> {movie.director}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Film className="w-4 h-4 text-purple-400" />
                <span><strong className="text-gray-200">Casts:</strong> {movie.casts.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Video Trailer Iframe */}
          {embedTrailer ? (
            <div className="w-full aspect-video rounded-2xl overflow-hidden glass border border-white/10 shadow-lg mt-4">
              <iframe
                src={embedTrailer}
                title={`${movie.name} Trailer`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="w-full aspect-video rounded-2xl flex items-center justify-center glass border border-white/5 text-gray-500 mt-4">
              <span>No Video Trailer Available</span>
            </div>
          )}
        </div>
      </div>

      {/* Showtimes & Timetables */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
          <Clock className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Book Show Timings</h2>
        </div>

        {Object.keys(showsByTheatre).length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl border border-white/5">
            <Landmark className="w-12 h-12 text-gray-650 mx-auto mb-3" />
            <p className="text-gray-400 max-w-md mx-auto">
              {movie.releaseStatus === 'RELEASED' 
                ? 'No shows currently scheduled for this movie. Theatres will release bookings soon!' 
                : 'Tickets will open once the movie is officially released! Stay tuned.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(showsByTheatre).map((theatre, idx) => (
              <div key={idx} className="glass rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Landmark className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-bold text-white uppercase">{theatre.name}</h3>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 pl-7">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span>{theatre.address}, {theatre.city}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                  {theatre.shows.map(show => (
                    <Link
                      to={`/booking/${show._id}`}
                      key={show._id}
                      className="bg-slate-900/60 hover:bg-purple-950/40 hover:border-purple-500/50 border border-white/10 rounded-xl p-3.5 text-center min-w-[120px] transition-all group flex flex-col justify-between"
                    >
                      <span className="text-sm font-semibold text-purple-300 group-hover:text-purple-200">
                        {show.timing}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase mt-0.5">
                        {show.format || '2D'}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 mt-2 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10">
                        ₹{show.price}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
