import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, Trash2, ShieldCheck, Film, Landmark, Calendar, Link2, AlertCircle } from 'lucide-react';

const Admin = () => {
  const [activeSection, setActiveSection] = useState('movies'); // movies, theatres, shows
  
  // Lists
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Movie Form State
  const [movieName, setMovieName] = useState('');
  const [movieDesc, setMovieDesc] = useState('');
  const [movieCasts, setMovieCasts] = useState('');
  const [movieTrailer, setMovieTrailer] = useState('');
  const [movieLang, setMovieLang] = useState('English');
  const [movieDate, setMovieDate] = useState('');
  const [movieDirector, setMovieDirector] = useState('');
  const [movieStatus, setMovieStatus] = useState('RELEASED'); // RELEASED, COMING_SOON

  // Theatre Form State
  const [theatreName, setTheatreName] = useState('');
  const [theatreDesc, setTheatreDesc] = useState('');
  const [theatreCity, setTheatreCity] = useState('');
  const [theatrePin, setTheatrePin] = useState('');
  const [theatreAddr, setTheatreAddr] = useState('');

  // Show Form State
  const [showTheatreId, setShowTheatreId] = useState('');
  const [showMovieId, setShowMovieId] = useState('');
  const [showTiming, setShowTiming] = useState('');
  const [showSeats, setShowSeats] = useState(100);
  const [showPrice, setShowPrice] = useState(200);
  const [showFormat, setShowFormat] = useState('2D');

  // Linking Form State
  const [selectedTheatreForLink, setSelectedTheatreForLink] = useState(null);
  const [moviesChecked, setMoviesChecked] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [moviesRes, theatresRes, showsRes] = await Promise.all([
        API.get('/movies'),
        API.get('/theatres'),
        API.get('/shows')
      ]);

      setMovies(moviesRes.data.data || []);
      setTheatres(theatresRes.data.data || []);
      setShows(showsRes.data.data || []);
    } catch (err) {
      setError('Could not load administrative details.');
    } finally {
      setLoading(false);
    }
  };

  // Movie Actions
  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const castsArr = movieCasts.split(',').map(c => c.trim()).filter(Boolean);
      await API.post('/movies', {
        name: movieName,
        description: movieDesc,
        casts: castsArr,
        trailerUrl: movieTrailer,
        language: movieLang,
        releaseDate: movieDate,
        director: movieDirector,
        releaseStatus: movieStatus
      });

      alert('Movie successfully added!');
      // Clear inputs
      setMovieName('');
      setMovieDesc('');
      setMovieCasts('');
      setMovieTrailer('');
      setMovieLang('English');
      setMovieDate('');
      setMovieDirector('');
      setMovieStatus('RELEASED');
      
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to add movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!confirm('Are you sure you want to delete this movie? This will affect shows scheduled for it.')) return;
    try {
      await API.delete(`/movies/${id}`);
      alert('Movie successfully deleted!');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to delete movie');
    }
  };

  // Theatre Actions
  const handleAddTheatre = async (e) => {
    e.preventDefault();
    try {
      await API.post('/theatres', {
        name: theatreName,
        description: theatreDesc,
        city: theatreCity,
        pincode: parseInt(theatrePin),
        address: theatreAddr
      });

      alert('Theatre successfully created!');
      setTheatreName('');
      setTheatreDesc('');
      setTheatreCity('');
      setTheatrePin('');
      setTheatreAddr('');
      
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to add theatre');
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!confirm('Are you sure you want to delete this theatre?')) return;
    try {
      await API.delete(`/theatres/${id}`);
      alert('Theatre successfully deleted!');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to delete theatre');
    }
  };

  // Show Actions
  const handleAddShow = async (e) => {
    e.preventDefault();
    try {
      await API.post('/shows', {
        theatreId: showTheatreId,
        movieId: showMovieId,
        timing: showTiming,
        noOfSeats: parseInt(showSeats),
        price: parseInt(showPrice),
        format: showFormat
      });

      alert('Show timing scheduled successfully!');
      setShowTheatreId('');
      setShowMovieId('');
      setShowTiming('');
      setShowSeats(100);
      setShowPrice(200);
      setShowFormat('2D');
      
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to schedule show. Note: Ensure the movie is linked to the theatre first.');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!confirm('Are you sure you want to remove this show?')) return;
    try {
      await API.delete(`/shows/${id}`);
      alert('Show successfully removed!');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to delete show');
    }
  };

  // Movie Link management
  const openLinkManager = (theatre) => {
    setSelectedTheatreForLink(theatre);
    setMoviesChecked(theatre.movies || []);
  };

  const handleCheckboxChange = (movieId) => {
    if (moviesChecked.includes(movieId)) {
      setMoviesChecked(moviesChecked.filter(id => id !== movieId));
    } else {
      setMoviesChecked([...moviesChecked, movieId]);
    }
  };

  const handleSaveLinks = async () => {
    if (!selectedTheatreForLink) return;
    try {
      // For this PATCH route, we pass the final movieIds list
      // In controllers/theatre.controller.js we see it updates movies linked to the theatre
      // Wait, we can pass "movieIds" and "insert: true" (since it replaces or appends)
      await API.patch(`/theatres/${selectedTheatreForLink._id}/movies`, {
        movieIds: moviesChecked,
        insert: true
      });

      alert('Theatre movies successfully updated!');
      setSelectedTheatreForLink(null);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to save movie links');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-white/5">
        <div className="bg-purple-650 p-2.5 rounded-xl shadow-lg">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Control Panel</h1>
          <p className="text-xs text-gray-400">Configure global cinema entities, timings, and schedules.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-500/25 text-red-300 p-4 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/5 pb-1 gap-2 text-sm font-semibold">
        {[
          { id: 'movies', label: 'Movies', icon: Film },
          { id: 'theatres', label: 'Theatres', icon: Landmark },
          { id: 'shows', label: 'Showtimes', icon: Calendar }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSection(tab.id);
                setSelectedTheatreForLink(null);
              }}
              className={`flex items-center gap-2 py-3 px-5 border-b-2 transition-all cursor-pointer ${
                activeSection === tab.id
                  ? 'border-purple-500 text-purple-400 font-bold bg-purple-950/10'
                  : 'border-transparent text-gray-400 hover:text-gray-250 hover:border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. MOVIES SECTION */}
      {activeSection === 'movies' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Create Movie Form */}
          <form onSubmit={handleAddMovie} className="xl:col-span-1 glass rounded-2xl p-6 border border-white/5 space-y-4 h-fit shadow-lg">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Plus className="w-4 h-4 text-purple-400" /> Create Movie
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Inception"
                  value={movieName}
                  onChange={(e) => setMovieName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Description</label>
                <textarea
                  required
                  placeholder="A thief who steals corporate secrets..."
                  value={movieDesc}
                  onChange={(e) => setMovieDesc(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm h-20"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Casts (comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="Leonardo DiCaprio, Elliot Page"
                  value={movieCasts}
                  onChange={(e) => setMovieCasts(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Director</label>
                  <input
                    type="text"
                    required
                    placeholder="Christopher Nolan"
                    value={movieDirector}
                    onChange={(e) => setMovieDirector(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Language</label>
                  <input
                    type="text"
                    required
                    placeholder="English"
                    value={movieLang}
                    onChange={(e) => setMovieLang(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Release Date</label>
                  <input
                    type="text"
                    required
                    placeholder="2010-07-16"
                    value={movieDate}
                    onChange={(e) => setMovieDate(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Release Status</label>
                  <select
                    value={movieStatus}
                    onChange={(e) => setMovieStatus(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                  >
                    <option value="RELEASED" className="bg-[#0b0f19]">Released</option>
                    <option value="COMING_SOON" className="bg-[#0b0f19]">Coming Soon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Trailer YouTube Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=YoHD9XEInc0"
                  value={movieTrailer}
                  onChange={(e) => setMovieTrailer(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-650 hover:bg-purple-500 text-white rounded-lg py-2.5 font-bold transition-all text-xs uppercase tracking-wide cursor-pointer mt-3"
            >
              Add Movie
            </button>
          </form>

          {/* Movies List */}
          <div className="xl:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Current Movies Collection</h3>
            {movies.length === 0 ? (
              <p className="text-gray-400 text-sm py-6">No movies in collection yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {movies.map(movie => (
                  <div key={movie._id} className="glass rounded-xl p-4 border border-white/5 flex justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">{movie.language}</span>
                      <h4 className="font-bold text-white text-base uppercase leading-snug">{movie.name}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2">{movie.description}</p>
                      <div className="text-[10px] text-gray-500 pt-2 font-medium">Director: {movie.director}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteMovie(movie._id)}
                      className="bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/25 p-2 rounded-lg self-center cursor-pointer"
                      title="Delete Movie"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. THEATRES SECTION */}
      {activeSection === 'theatres' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Add Theatre Form */}
          <form onSubmit={handleAddTheatre} className="xl:col-span-1 glass rounded-2xl p-6 border border-white/5 space-y-4 h-fit shadow-lg">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Plus className="w-4 h-4 text-purple-400" /> Create Theatre
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Name</label>
                <input
                  type="text"
                  required
                  placeholder="PVR IMAX Premium"
                  value={theatreName}
                  onChange={(e) => setTheatreName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Description</label>
                <textarea
                  placeholder="Equipped with laser projectors and IMAX screen..."
                  value={theatreDesc}
                  onChange={(e) => setTheatreDesc(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm h-16"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-400 mb-1.5 uppercase">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Bangalore"
                    value={theatreCity}
                    onChange={(e) => setTheatreCity(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Pincode</label>
                  <input
                    type="number"
                    required
                    placeholder="560001"
                    value={theatrePin}
                    onChange={(e) => setTheatrePin(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Address Details</label>
                <input
                  type="text"
                  required
                  placeholder="Forum Mall, Koramangala"
                  value={theatreAddr}
                  onChange={(e) => setTheatreAddr(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-650 hover:bg-purple-500 text-white rounded-lg py-2.5 font-bold transition-all text-xs uppercase tracking-wide cursor-pointer mt-3"
            >
              Add Theatre
            </button>
          </form>

          {/* Theatres List */}
          <div className="xl:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Available Theatres</h3>
            
            {selectedTheatreForLink ? (
              /* LINKING MANAGER SUB-VIEW */
              <div className="glass rounded-2xl p-6 border border-purple-500/35 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-purple-400" /> Link Movies to {selectedTheatreForLink.name}
                  </h4>
                  <button 
                    onClick={() => setSelectedTheatreForLink(null)}
                    className="text-gray-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-purple-300">Select which movies this theatre can project. Scheduled shows require mapped movies.</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {movies.map(movie => (
                    <label 
                      key={movie._id} 
                      className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        moviesChecked.includes(movie._id)
                          ? 'bg-purple-950/30 border-purple-500 text-purple-200'
                          : 'bg-slate-900/30 border-white/5 text-gray-400 hover:border-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={moviesChecked.includes(movie._id)}
                        onChange={() => handleCheckboxChange(movie._id)}
                        className="rounded border-gray-650 bg-slate-900 text-purple-500 focus:ring-purple-500 focus:ring-opacity-25"
                      />
                      <span className="truncate">{movie.name}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleSaveLinks}
                    className="bg-purple-650 hover:bg-purple-500 text-white rounded-lg px-5 py-2.5 text-xs font-bold transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Save Linked Movies
                  </button>
                  <button
                    onClick={() => setSelectedTheatreForLink(null)}
                    className="text-gray-400 hover:text-white px-4 py-2 text-xs font-bold transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            ) : (
              /* THEATRE GRID LIST */
              theatres.length === 0 ? (
                <p className="text-gray-400 text-sm py-6">No theatres created yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {theatres.map(theatre => (
                    <div key={theatre._id} className="glass rounded-xl p-5 border border-white/5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-white text-base uppercase leading-snug">{theatre.name}</h4>
                        <p className="text-xs text-gray-400">{theatre.description}</p>
                        <div className="text-[10px] text-gray-500 font-medium">City: {theatre.city} | PIN: {theatre.pincode}</div>
                        <div className="text-[10px] text-purple-400 font-semibold pt-1">
                          Linked Movies Count: {theatre.movies?.length || 0}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t border-white/5 pt-3.5 mt-2 justify-between">
                        <button
                          onClick={() => openLinkManager(theatre)}
                          className="flex items-center gap-1 bg-purple-950/50 hover:bg-purple-900 border border-purple-500/25 text-purple-300 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Link Movies</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTheatre(theatre._id)}
                          className="bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/25 p-2 rounded-lg cursor-pointer"
                          title="Delete Theatre"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* 3. SHOWS SECTION */}
      {activeSection === 'shows' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Add Show Form */}
          <form onSubmit={handleAddShow} className="xl:col-span-1 glass rounded-2xl p-6 border border-white/5 space-y-4 h-fit shadow-lg">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Plus className="w-4 h-4 text-purple-400" /> Create Show
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Select Theatre</label>
                <select
                  required
                  value={showTheatreId}
                  onChange={(e) => {
                    setShowTheatreId(e.target.value);
                    setShowMovieId(''); // Reset selected movie
                  }}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                >
                  <option value="" className="bg-[#0b0f19]">-- Choose Theatre --</option>
                  {theatres.map(t => (
                    <option key={t._id} value={t._id} className="bg-[#0b0f19]">
                      {t.name} ({t.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Select Movie</label>
                <p className="text-[10px] text-gray-500 mb-1">Only movies linked to the selected theatre are valid.</p>
                <select
                  required
                  value={showMovieId}
                  disabled={!showTheatreId}
                  onChange={(e) => setShowMovieId(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm disabled:opacity-40"
                >
                  <option value="" className="bg-[#0b0f19]">-- Choose Movie --</option>
                  {(() => {
                    const activeTheatre = theatres.find(t => t._id === showTheatreId);
                    if (!activeTheatre || !activeTheatre.movies) return null;
                    return activeTheatre.movies.map(mId => {
                      const movieObj = movies.find(mv => mv._id === mId);
                      return movieObj ? (
                        <option key={movieObj._id} value={movieObj._id} className="bg-[#0b0f19]">
                          {movieObj.name}
                        </option>
                      ) : null;
                    });
                  })()}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Show Time</label>
                  <input
                    type="text"
                    required
                    placeholder="06:30 PM"
                    value={showTiming}
                    onChange={(e) => setShowTiming(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Format (e.g. 2D/3D)</label>
                  <input
                    type="text"
                    placeholder="IMAX 3D"
                    value={showFormat}
                    onChange={(e) => setShowFormat(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Total Seats Available</label>
                  <input
                    type="number"
                    required
                    value={showSeats}
                    onChange={(e) => setShowSeats(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-400 mb-1.5 uppercase">Ticket Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={showPrice}
                    onChange={(e) => setShowPrice(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-lg py-2.5 px-3.5 text-white focus:outline-none focus:border-purple-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-650 hover:bg-purple-500 text-white rounded-lg py-2.5 font-bold transition-all text-xs uppercase tracking-wide cursor-pointer mt-3"
            >
              Schedule Show
            </button>
          </form>

          {/* Shows Grid List */}
          <div className="xl:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Scheduled Shows Timetable</h3>
            {shows.length === 0 ? (
              <p className="text-gray-400 text-sm py-6">No scheduled shows found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shows.map(show => {
                  const movieObj = movies.find(m => m._id === show.movieId) || {};
                  const theatreObj = show.theatreId || {}; // populated

                  return (
                    <div key={show._id} className="glass rounded-xl p-4.5 border border-white/5 flex justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">{show.format || '2D'}</span>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/10">₹{show.price}</span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm uppercase truncate max-w-[200px]" title={movieObj.name}>
                          {movieObj.name || 'Unknown Movie'}
                        </h4>
                        
                        <div className="text-[10px] text-gray-400 space-y-0.5">
                          <div>Theatre: <strong className="text-gray-300 uppercase">{theatreObj.name || 'Unknown'}</strong></div>
                          <div>Timing: <strong className="text-gray-300">{show.timing}</strong></div>
                          <div>Total Seats: <strong className="text-gray-300">{show.noOfSeats}</strong></div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteShow(show._id)}
                        className="bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/25 p-2 rounded-lg self-center cursor-pointer"
                        title="Delete Show"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
