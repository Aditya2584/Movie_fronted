import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Ticket, ShieldAlert, Key, User, Calendar, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle, Landmark } from 'lucide-react';

const Dashboard = () => {
  const { user, updatePassword } = useAuth();

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [moviesLookup, setMoviesLookup] = useState({});
  const [theatresLookup, setTheatresLookup] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const bookingsRes = await API.get('/bookings');
        setBookings(bookingsRes.data.data || []);

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
    switch (status) {
      case 'SUCCESSFULL':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-wide">
            <CheckCircle2 className="w-3.5 h-3.5" /> Successful
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20 uppercase tracking-wide">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#6B6B6B] bg-[#181818] px-2.5 py-1 rounded-lg border border-[#2A2A2A] uppercase tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5" /> Expired
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 uppercase tracking-wide animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF5A1F]/20 border-t-[#FF5A1F] rounded-full animate-spin"></div>
          <span className="text-sm text-[#A8A8A8]">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 container mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-8 space-y-8 h-fit shadow-xl">
          <div className="flex items-center gap-3 pb-6 border-b border-border">
            <div className="bg-bg-elevated p-3 rounded-xl border border-border">
              <User className="w-5 h-5 text-text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary max-w-[150px] truncate">{user?.email}</h2>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{user?.role}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-bg-active text-text-primary border border-border'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>My Bookings</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-bg-active text-text-primary border border-border'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Security Settings</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">

          {/* Bookings */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#2A2A2A]">
                <Ticket className="w-5 h-5 text-[#FF5A1F]" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Purchase History</h2>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {bookings.length === 0 ? (
                <div className="text-center py-20 glass-card rounded-2xl space-y-4 border border-border">
                  <Ticket className="w-12 h-12 text-text-muted mx-auto opacity-50" />
                  <p className="type-body max-w-sm mx-auto">No ticket bookings recorded. Visit the home page to select a movie and reserve your seat!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {[...bookings].reverse().map(booking => {
                    const movieItem = moviesLookup[booking.movieId] || {};
                    const theatreItem = theatresLookup[booking.theatreId] || {};

                    return (
                      <div key={booking._id} className="relative bg-bg-card border border-border rounded-2xl overflow-hidden hover:border-border-hover transition-all duration-300 hover:shadow-lg flex flex-col md:flex-row">
                        {/* Left/Top Content */}
                        <div className="flex-1 p-6 md:p-8 space-y-4 border-b md:border-b-0 md:border-r border-dashed border-border relative">
                          <div className="absolute -bottom-3 -right-3 md:-top-3 md:-right-3 w-6 h-6 bg-bg-base rounded-full hidden md:block"></div>
                          <div className="absolute -bottom-3 -right-3 md:-bottom-3 md:-right-3 w-6 h-6 bg-bg-base rounded-full hidden md:block"></div>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="type-overline text-accent">{movieItem.language || 'Movie'}</span>
                            {getStatusBadge(booking.status)}
                          </div>
                          <h3 className="type-section line-clamp-1">
                            {movieItem.name || 'Unknown Movie'}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <span className="type-label">Theatre</span>
                              <p className="type-body-lg font-medium text-text-primary">{theatreItem.name || 'Theater ID: ' + booking.theatreId}</p>
                            </div>
                            <div>
                              <span className="type-label">Timing</span>
                              <p className="type-body-lg font-medium text-text-primary">{booking.timing}</p>
                            </div>
                          </div>
                        </div>

                        {/* Right/Bottom Content */}
                        <div className="w-full md:w-64 bg-bg-elevated p-6 md:p-8 flex flex-col justify-center space-y-4">
                          <div className="flex justify-between items-center md:items-start md:flex-col gap-2">
                            <div className="space-y-1">
                              <span className="type-label">Seats</span>
                              <p className="type-body-lg font-medium text-text-primary">{booking.noOfSeats}</p>
                            </div>
                            <div className="text-right md:text-left space-y-1">
                              <span className="type-label">Total Cost</span>
                              <p className="text-2xl font-semibold tabular-nums text-emerald-500">₹{booking.totalCost}</p>
                            </div>
                          </div>

                          {booking.status === 'IN_PROCESS' && (
                            <div className="pt-2">
                              <a
                                href={`/checkout/${booking._id}`}
                                className="btn-primary w-full text-center"
                              >
                                Pay Now
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'profile' && (
            <div className="glass-card rounded-2xl p-8 space-y-6 shadow-xl max-w-xl border border-border">
              <div className="flex items-center gap-2 pb-4 border-b border-border">
                <Key className="w-5 h-5 text-text-primary" />
                <h2 className="type-section text-lg">Security Control</h2>
              </div>

              {resetError && (
                <div className="alert-error">
                  <AlertCircle className="w-5 h-5" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="alert">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-emerald-500">{resetSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-5 mt-2">
                <div>
                  <label className="type-label">Old Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="type-label">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full flex items-center justify-center btn-primary"
                  >
                    {resetLoading ? (
                      <div className="spinner-sm border-text-inverse/20 border-t-text-inverse"></div>
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
    </div>
  );
};

export default Dashboard;
