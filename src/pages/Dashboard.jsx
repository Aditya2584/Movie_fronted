import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, ShieldAlert, Key, User, Calendar, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle, Landmark } from 'lucide-react';

const Dashboard = () => {
  const { user, updatePassword } = useAuth();
  
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, profile
  const [bookings, setBookings] = useState([]);
  const [moviesLookup, setMoviesLookup] = useState({});
  const [theatresLookup, setTheatresLookup] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Password reset fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch User's bookings
        const bookingsRes = await API.get('/bookings');
        setBookings(bookingsRes.data.data || []);

        // Fetch Movies & Theatres list to map titles/names
        const [moviesRes, theatresRes] = await Promise.all([
          API.get('/movies'),
          API.get('/theatres')
        ]);

        const moviesMap = (moviesRes.data.data || []).reduce((acc, m) => {
          acc[m._id] = m;
          return acc;
        }, {});
        setMoviesLookup(moviesMap);

        const theatresMap = (theatresRes.data.data || []).reduce((acc, t) => {
          acc[t._id] = t;
          return acc;
        }, {});
        setTheatresLookup(theatresMap);

      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);

    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      setResetLoading(false);
      return;
    }

    const result = await updatePassword(oldPassword, newPassword);
    setResetLoading(false);

    if (result.success) {
      setResetSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } else {
      setResetError(result.error);
    }
  };

  const getStatusBadge = (status) => {
    // Map BOOKING_STATUS: successfull, processing, cancelled, expired
    switch (status) {
      case 'SUCCESSFULL':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5" /> Successful
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-950/30 px-2.5 py-1 rounded-full border border-red-500/20 uppercase tracking-wide">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-900 px-2.5 py-1 rounded-full border border-gray-700 uppercase tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5" /> Expired
          </span>
        );
      default: // IN_PROCESS
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase tracking-wide animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 glass rounded-2xl p-6 border border-white/5 space-y-6 h-fit shadow-xl">
        <div className="flex items-center space-x-3 pb-4 border-b border-white/5">
          <div className="bg-purple-650 p-2.5 rounded-xl shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white max-w-[150px] truncate">{user?.email}</h2>
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider bg-purple-950/50 px-2 py-0.5 rounded border border-purple-500/20">{user?.role}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center space-x-2.5 w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/15'
                : 'text-gray-400 hover:text-gray-250 hover:bg-slate-900/40'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>My Bookings</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2.5 w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/15'
                : 'text-gray-400 hover:text-gray-250 hover:bg-slate-900/40'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Security Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Bookings View */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 pb-3.5 border-b border-white/5">
              <Ticket className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Purchase History</h2>
            </div>

            {error && (
              <div className="bg-red-950/20 border border-red-500/25 text-red-300 p-4 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="text-center py-16 glass rounded-2xl border border-white/5 space-y-4">
                <Ticket className="w-12 h-12 text-gray-650 mx-auto" />
                <p className="text-gray-400 text-sm max-w-sm mx-auto">No ticket bookings recorded. Visit the home page to select a movie and reserve your seat!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...bookings].reverse().map(booking => {
                  const movieItem = moviesLookup[booking.movieId] || {};
                  const theatreItem = theatresLookup[booking.theatreId] || {};

                  return (
                    <div key={booking._id} className="glass rounded-2xl p-5 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-purple-500/20 transition-all">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{movieItem.language || 'Movie'}</span>
                          {getStatusBadge(booking.status)}
                        </div>
                        <h3 className="text-lg font-bold text-white uppercase leading-snug">
                          {movieItem.name || 'Unknown Movie'}
                        </h3>
                        
                        {/* Summary details */}
                        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-gray-400 mt-2 font-medium">
                          <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5 text-gray-500" /> {theatreItem.name || 'Theater ID: ' + booking.theatreId}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-500" /> {booking.timing}</span>
                          <span className="flex items-center gap-1"><Ticket className="w-3.5 h-3.5 text-gray-500" /> {booking.noOfSeats} Seats</span>
                          <span className="flex items-center gap-1 text-emerald-400 font-bold"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> ₹{booking.totalCost}</span>
                        </div>
                      </div>

                      {/* Action buttons (Checkout if PROCESSING/IN_PROCESS) */}
                      {booking.status === 'IN_PROCESS' && (
                        <div>
                          <a
                            href={`/checkout/${booking._id}`}
                            className="bg-purple-650 hover:bg-purple-500 text-white rounded-lg px-4 py-2 text-xs font-bold transition-all shadow-md shadow-purple-500/10 uppercase tracking-wider block text-center"
                          >
                            Pay Now
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Security / Password Settings View */}
        {activeTab === 'profile' && (
          <div className="glass rounded-2xl p-6 md:p-8 border border-white/5 space-y-6 shadow-xl max-w-xl">
            <div className="flex items-center space-x-2 pb-3.5 border-b border-white/5">
              <Key className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Security Control</h2>
            </div>

            {resetError && (
              <div className="bg-red-950/40 border border-red-500/35 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-500/35 text-emerald-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Old Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full flex items-center justify-center bg-purple-650 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold shadow-lg shadow-purple-500/15 transition-all text-sm uppercase tracking-wide cursor-pointer disabled:opacity-50"
                >
                  {resetLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
