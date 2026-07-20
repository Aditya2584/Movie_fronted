import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  Plus, Trash2, ShieldCheck, Film, Landmark, Calendar, 
  Link2, AlertCircle, X, DollarSign, Ticket, Activity,
  TrendingUp, Search, ChevronRight
} from 'lucide-react';

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#111111] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#18181b]">
          <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto bg-gradient-to-b from-[#111111] to-[#09090b]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card
const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col gap-4 hover:border-white/10 transition-colors shadow-lg">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-400">{title}</span>
      <div className="p-2 bg-white/5 rounded-lg border border-white/5">
        <Icon className="w-4 h-4 text-[#FF5A1F]" />
      </div>
    </div>
    <div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {trend && (
        <div className="flex items-center gap-1 text-xs text-emerald-400">
          <TrendingUp className="w-3 h-3" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  </div>
);

const Admin = () => {
  const [activeSection, setActiveSection] = useState('movies');

  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [isTheatreModalOpen, setIsTheatreModalOpen] = useState(false);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [linkModalTheatre, setLinkModalTheatre] = useState(null);

  // Movie Form
  const [movieName, setMovieName] = useState('');
  const [movieDesc, setMovieDesc] = useState('');
  const [movieCasts, setMovieCasts] = useState('');
  const [movieTrailer, setMovieTrailer] = useState('');
  const [movieLang, setMovieLang] = useState('English');
  const [movieDate, setMovieDate] = useState('');
  const [movieDirector, setMovieDirector] = useState('');
  const [movieStatus, setMovieStatus] = useState('RELEASED');

  // Theatre Form
  const [theatreName, setTheatreName] = useState('');
  const [theatreDesc, setTheatreDesc] = useState('');
  const [theatreCity, setTheatreCity] = useState('');
  const [theatrePin, setTheatrePin] = useState('');
  const [theatreAddr, setTheatreAddr] = useState('');

  // Show Form
  const [showTheatreId, setShowTheatreId] = useState('');
  const [showMovieId, setShowMovieId] = useState('');
  const [showTiming, setShowTiming] = useState('');
  const [showSeats, setShowSeats] = useState(100);
  const [showPrice, setShowPrice] = useState(200);
  const [showFormat, setShowFormat] = useState('2D');

  // Linking
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
      setMovieName(''); setMovieDesc(''); setMovieCasts(''); setMovieTrailer('');
      setMovieLang('English'); setMovieDate(''); setMovieDirector(''); setMovieStatus('RELEASED');
      setIsMovieModalOpen(false);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to add movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    try {
      await API.delete(`/movies/${id}`);
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
      setTheatreName(''); setTheatreDesc(''); setTheatreCity(''); setTheatrePin(''); setTheatreAddr('');
      setIsTheatreModalOpen(false);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to add theatre');
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!confirm('Are you sure you want to delete this theatre?')) return;
    try {
      await API.delete(`/theatres/${id}`);
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
      setShowTheatreId(''); setShowMovieId(''); setShowTiming('');
      setShowSeats(100); setShowPrice(200); setShowFormat('2D');
      setIsShowModalOpen(false);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to schedule show.');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!confirm('Are you sure you want to remove this show?')) return;
    try {
      await API.delete(`/shows/${id}`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to delete show');
    }
  };

  // Linking
  const openLinkManager = (theatre) => {
    setLinkModalTheatre(theatre);
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
    if (!linkModalTheatre) return;
    try {
      await API.patch(`/theatres/${linkModalTheatre._id}/movies`, {
        movieIds: moviesChecked,
        insert: true
      });

      alert('Theatre movies successfully updated!');
      setLinkModalTheatre(null);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to save movie links');
    }
  };

  const inputClass = "w-full bg-[#1A1A1A] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#FF5A1F] focus:ring-1 focus:ring-[#FF5A1F]/50 text-sm transition-all placeholder-gray-500 hover:border-white/20";
  const labelClass = "block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16 bg-[#09090b]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 border-2 border-white/10 border-t-[#FF5A1F] rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-gray-500 tracking-widest uppercase">Initializing Workspace</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#09090b] via-[#0f0f11] to-[#09090b] pt-24 pb-20 px-6 md:px-12 font-sans selection:bg-[#FF5A1F]/30">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F] text-xs font-semibold mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Live System Status</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Admin Console</h1>
            <p className="text-gray-400 text-sm">Manage your entire cinematic ecosystem from one unified interface.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-[#111111] p-1.5 rounded-xl border border-white/5">
            {[
              { id: 'movies', label: 'Movies' },
              { id: 'theatres', label: 'Theatres' },
              { id: 'shows', label: 'Shows' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSection === tab.id
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Movies" value={movies.length} icon={Film} trend="+12% this month" />
          <StatCard title="Active Theatres" value={theatres.length} icon={Landmark} />
          <StatCard title="Total Shows" value={shows.length} icon={Calendar} trend="+5% this week" />
          <StatCard title="Total Revenue" value="$24,500" icon={DollarSign} trend="+18% this month" />
          <StatCard title="Bookings" value="1,242" icon={Ticket} trend="+8% this week" />
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        {/* Dynamic Content Area */}
        <div className="space-y-6">
          
          {/* MOVIES */}
          {activeSection === 'movies' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Movie Database</h2>
                <button onClick={() => setIsMovieModalOpen(true)} className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  <Plus className="w-4 h-4" /> Add Movie
                </button>
              </div>

              <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#18181b] border-b border-white/5 text-gray-400">
                      <tr>
                        <th className="px-6 py-4 font-medium">Title</th>
                        <th className="px-6 py-4 font-medium">Director</th>
                        <th className="px-6 py-4 font-medium">Language</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {movies.map(movie => (
                        <tr key={movie._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{movie.name}</div>
                            <div className="text-xs text-gray-500 max-w-[200px] truncate">{movie.description}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">{movie.director}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                              {movie.language}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${movie.releaseStatus === 'RELEASED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                              {movie.releaseStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteMovie(movie._id)} className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {movies.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No movies found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* THEATRES */}
          {activeSection === 'theatres' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Theatres Directory</h2>
                <button onClick={() => setIsTheatreModalOpen(true)} className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  <Plus className="w-4 h-4" /> Add Theatre
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {theatres.map(theatre => (
                  <div key={theatre._id} className="bg-[#111111]/80 backdrop-blur-md border border-white/5 hover:border-white/20 rounded-2xl p-6 transition-all shadow-lg hover:shadow-xl group flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openLinkManager(theatre)} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors tooltip" title="Link Movies">
                          <Link2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteTheatre(theatre._id)} className="text-gray-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{theatre.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 flex-1">{theatre.description || 'No description provided.'}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                      <div className="text-xs text-gray-500 font-medium">{theatre.city} • {theatre.pincode}</div>
                      <div className="text-xs font-semibold text-[#FF5A1F] bg-[#FF5A1F]/10 px-2.5 py-1 rounded-full">
                        {theatre.movies?.length || 0} Linked
                      </div>
                    </div>
                  </div>
                ))}
                {theatres.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500 bg-[#111111]/50 rounded-2xl border border-white/5">
                    No theatres configured.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SHOWS */}
          {activeSection === 'shows' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Show Schedules</h2>
                <button onClick={() => setIsShowModalOpen(true)} className="flex items-center gap-2 bg-[#FF5A1F] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#FF7B39] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  <Plus className="w-4 h-4" /> Schedule Show
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shows.map(show => {
                  const movieObj = movies.find(m => m._id === show.movieId) || {};
                  const theatreObj = show.theatreId || {};
                  return (
                    <div key={show._id} className="relative bg-[#111111]/80 backdrop-blur-md border border-white/5 hover:border-white/20 rounded-2xl p-6 transition-all shadow-lg hover:shadow-xl group overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Calendar className="w-24 h-24 text-white" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                           <div className="flex gap-2">
                             <span className="px-2.5 py-1 bg-white/10 text-white text-xs font-bold rounded-lg backdrop-blur-md border border-white/10">{show.format || '2D'}</span>
                             <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/20">${show.price}</span>
                           </div>
                           <button onClick={() => handleDeleteShow(show._id)} className="text-gray-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 truncate pr-8">{movieObj.name || 'Unknown Movie'}</h3>
                        <div className="space-y-2 mt-4 text-sm text-gray-400 bg-white/5 p-4 rounded-xl border border-white/5">
                          <div className="flex justify-between">
                            <span>Theatre</span>
                            <span className="text-white font-medium">{theatreObj.name || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time</span>
                            <span className="text-white font-medium">{show.timing}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Seats</span>
                            <span className="text-white font-medium">{show.noOfSeats} Total</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {shows.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500 bg-[#111111]/50 rounded-2xl border border-white/5">
                    No shows scheduled.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Movie Modal */}
      <Modal isOpen={isMovieModalOpen} onClose={() => setIsMovieModalOpen(false)} title="Create New Movie">
        <form onSubmit={handleAddMovie} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Title</label>
              <input type="text" required placeholder="E.g. Inception" value={movieName} onChange={(e) => setMovieName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea required placeholder="Brief synopsis..." value={movieDesc} onChange={(e) => setMovieDesc(e.target.value)} className={`${inputClass} h-24 resize-none`}></textarea>
            </div>
            <div>
              <label className={labelClass}>Casts</label>
              <input type="text" required placeholder="Comma separated names" value={movieCasts} onChange={(e) => setMovieCasts(e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Director</label>
                <input type="text" required placeholder="Christopher Nolan" value={movieDirector} onChange={(e) => setMovieDirector(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Language</label>
                <input type="text" required placeholder="English" value={movieLang} onChange={(e) => setMovieLang(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Release Date</label>
                <input type="text" required placeholder="YYYY-MM-DD" value={movieDate} onChange={(e) => setMovieDate(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={movieStatus} onChange={(e) => setMovieStatus(e.target.value)} className={`${inputClass} appearance-none`}>
                  <option value="RELEASED">Released</option>
                  <option value="COMING_SOON">Coming Soon</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Trailer URL</label>
              <input type="url" required placeholder="YouTube Link" value={movieTrailer} onChange={(e) => setMovieTrailer(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
            <button type="button" onClick={() => setIsMovieModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-colors">Create Movie</button>
          </div>
        </form>
      </Modal>

      {/* Theatre Modal */}
      <Modal isOpen={isTheatreModalOpen} onClose={() => setIsTheatreModalOpen(false)} title="Register Theatre">
        <form onSubmit={handleAddTheatre} className="space-y-5">
           <div className="space-y-4">
            <div>
              <label className={labelClass}>Theatre Name</label>
              <input type="text" required placeholder="IMAX Downtown" value={theatreName} onChange={(e) => setTheatreName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea placeholder="Facilities, features..." value={theatreDesc} onChange={(e) => setTheatreDesc(e.target.value)} className={`${inputClass} h-20 resize-none`}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input type="text" required placeholder="New York" value={theatreCity} onChange={(e) => setTheatreCity(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Pincode</label>
                <input type="number" required placeholder="10001" value={theatrePin} onChange={(e) => setTheatrePin(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Full Address</label>
              <input type="text" required placeholder="123 Broadway St." value={theatreAddr} onChange={(e) => setTheatreAddr(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
            <button type="button" onClick={() => setIsTheatreModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-colors">Add Theatre</button>
          </div>
        </form>
      </Modal>

      {/* Show Modal */}
      <Modal isOpen={isShowModalOpen} onClose={() => setIsShowModalOpen(false)} title="Schedule New Show">
        <form onSubmit={handleAddShow} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Select Theatre</label>
              <select required value={showTheatreId} onChange={(e) => { setShowTheatreId(e.target.value); setShowMovieId(''); }} className={`${inputClass} appearance-none`}>
                <option value="">-- Choose Venue --</option>
                {theatres.map(t => <option key={t._id} value={t._id}>{t.name} ({t.city})</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Select Movie</label>
              <select required value={showMovieId} disabled={!showTheatreId} onChange={(e) => setShowMovieId(e.target.value)} className={`${inputClass} appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}>
                <option value="">-- Choose Film --</option>
                {(() => {
                  const activeT = theatres.find(t => t._id === showTheatreId);
                  if (!activeT || !activeT.movies) return null;
                  return activeT.movies.map(mId => {
                    const m = movies.find(mv => mv._id === mId);
                    return m ? <option key={m._id} value={m._id}>{m.name}</option> : null;
                  });
                })()}
              </select>
              {!showTheatreId && <p className="text-[10px] text-gray-500 mt-1">Select a theatre first to see mapped movies.</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Timing</label>
                <input type="text" required placeholder="E.g. 19:30" value={showTiming} onChange={(e) => setShowTiming(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Format</label>
                <input type="text" placeholder="IMAX, 3D, Standard" value={showFormat} onChange={(e) => setShowFormat(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Total Seats</label>
                <input type="number" required value={showSeats} onChange={(e) => setShowSeats(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Price ($)</label>
                <input type="number" required value={showPrice} onChange={(e) => setShowPrice(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
            <button type="button" onClick={() => setIsShowModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#FF5A1F] text-white hover:bg-[#FF7B39] transition-colors">Schedule</button>
          </div>
        </form>
      </Modal>

      {/* Link Movies Modal */}
      <Modal isOpen={!!linkModalTheatre} onClose={() => setLinkModalTheatre(null)} title={`Link Movies to ${linkModalTheatre?.name || ''}`}>
        <div className="space-y-6">
          <p className="text-sm text-gray-400">Select which movies can be screened at this venue. Scheduled shows will only allow selecting from these mapped movies.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
            {movies.map(movie => (
              <label
                key={movie._id}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  moviesChecked.includes(movie._id)
                    ? 'bg-[#FF5A1F]/10 border-[#FF5A1F]/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <input
                  type="checkbox"
                  checked={moviesChecked.includes(movie._id)}
                  onChange={() => handleCheckboxChange(movie._id)}
                  className="w-4 h-4 rounded border-gray-600 bg-black text-[#FF5A1F] focus:ring-[#FF5A1F] focus:ring-offset-black"
                />
                <span className="font-medium text-sm truncate">{movie.name}</span>
              </label>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
            <button onClick={() => setLinkModalTheatre(null)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleSaveLinks} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-colors">Save Links</button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Admin;
