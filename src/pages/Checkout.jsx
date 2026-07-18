import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { getMoviePoster } from './Home';
import { CreditCard, Clock, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Ticket } from 'lucide-react';

const Checkout = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [movie, setMovie] = useState(null);
  const [theatre, setTheatre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  
  const [payLoading, setPayLoading] = useState(false);
  const [payStatus, setPayStatus] = useState(null); // success, failed, expired
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // Fetch Booking
        const bookingRes = await API.get(`/bookings/${bookingId}`);
        const bookingData = bookingRes.data.data;
        setBooking(bookingData);

        // Retrieve local seat list
        const savedSeats = localStorage.getItem(`booking_seats_${bookingId}`);
        if (savedSeats) {
          setSeats(JSON.parse(savedSeats));
        }

        // Fetch Movie Details
        const movieRes = await API.get(`/movies/${bookingData.movieId}`);
        setMovie(movieRes.data.data);

        // Fetch Theatre Details
        const theatreRes = await API.get(`/theatres/${bookingData.theatreId}`);
        setTheatre(theatreRes.data.data);

        // Calculate timer remaining (5 minutes from booking creation)
        const bookingTime = new Date(bookingData.createdAt).getTime();
        const expiryTime = bookingTime + 5 * 60 * 1000;
        const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
        
        setTimeLeft(remaining);

        if (remaining <= 0 || bookingData.status === 'EXPIRED') {
          setPayStatus('expired');
        } else if (bookingData.status === 'SUCCESSFULL') {
          setPayStatus('success');
        }

      } catch (err) {
        setError('Unable to fetch checkout records.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [bookingId]);

  // Countdown clock effect
  useEffect(() => {
    if (timeLeft <= 0 || payStatus) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPayStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, payStatus]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (timeLeft <= 0) {
      setPayStatus('expired');
      return;
    }

    setPayLoading(true);
    try {
      // Call payments create API
      const response = await API.post('/payments', {
        bookingId: bookingId,
        amount: booking.totalCost
      });
      
      const bookingResult = response.data.data;
      
      if (bookingResult.status === 'SUCCESSFULL') {
        setPayStatus('success');
      } else if (bookingResult.status === 'CANCELLED') {
        setPayStatus('failed');
      } else if (bookingResult.status === 'EXPIRED') {
        setPayStatus('expired');
      }
    } catch (err) {
      setPayStatus('failed');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !booking || !movie || !theatre) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-12">
        <h2 className="text-xl font-bold text-white">Checkout Error</h2>
        <p className="text-gray-400">{error || 'Unable to start checkout session.'}</p>
        <Link to="/" className="text-purple-400 hover:text-purple-300 font-semibold underline">
          Go Back
        </Link>
      </div>
    );
  }

  // Payment State: Success View
  if (payStatus === 'success') {
    return (
      <div className="max-w-md mx-auto glass rounded-3xl p-8 border border-emerald-500/25 shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/30">
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Booking Confirmed!</h2>
          <p className="text-gray-400 text-sm">Your payment was processed successfully. Enjoy your movie!</p>
        </div>

        {/* Ticket Mock Card */}
        <div className="bg-slate-950/65 border border-white/5 rounded-2xl p-5 text-left space-y-4 divide-y divide-white/5">
          <div className="pb-3 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{movie.language}</span>
              <h3 className="font-bold text-white uppercase text-base">{movie.name}</h3>
            </div>
            <Ticket className="w-6 h-6 text-purple-400" />
          </div>
          
          <div className="py-3 grid grid-cols-2 gap-y-2 text-xs">
            <div>
              <span className="text-gray-500 block">THEATRE</span>
              <span className="text-gray-200 font-medium uppercase">{theatre.name}</span>
            </div>
            <div>
              <span className="text-gray-500 block">TIMING</span>
              <span className="text-gray-200 font-medium">{booking.timing}</span>
            </div>
            <div className="mt-1">
              <span className="text-gray-500 block">SEATS ({booking.noOfSeats})</span>
              <span className="text-purple-300 font-bold">{seats.join(', ') || 'Reserved Seats'}</span>
            </div>
            <div className="mt-1">
              <span className="text-gray-500 block">BOOKING ID</span>
              <span className="text-gray-400 font-mono text-[10px] truncate block max-w-[120px]">{booking._id}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-2">
          <Link 
            to="/dashboard" 
            className="w-full bg-purple-650 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold shadow-lg shadow-purple-500/15 transition-all text-sm uppercase tracking-wide"
          >
            View My Tickets
          </Link>
          <Link 
            to="/" 
            className="text-sm font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Payment State: Expired View
  if (payStatus === 'expired') {
    return (
      <div className="max-w-md mx-auto glass rounded-3xl p-8 border border-red-500/25 shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-red-500/10 p-4 rounded-full border border-red-500/30">
            <XCircle className="w-16 h-16 text-red-400 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Booking Expired</h2>
          <p className="text-gray-400 text-sm">Bookings must be completed within 5 minutes. Your reservation has timed out.</p>
        </div>

        <div className="pt-4">
          <Link 
            to={`/movie/${movie._id}`} 
            className="w-full inline-block bg-purple-650 hover:bg-purple-500 text-white rounded-xl py-3 font-semibold shadow-lg shadow-purple-500/15 transition-all text-sm uppercase tracking-wide"
          >
            Re-select Seats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Expiry Bar banner */}
      <div className="bg-amber-950/30 border border-amber-500/25 text-amber-300 rounded-2xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2.5">
          <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="text-sm font-medium">Complete booking before ticket expires:</span>
        </div>
        <span className="text-lg font-black tracking-wider text-amber-400 font-mono">
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left Column: Card form input (3 columns) */}
        <form onSubmit={handlePayment} className="md:col-span-3 glass rounded-3xl p-6 md:p-8 border border-white/5 space-y-6 shadow-xl">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" /> Payment Details
            </h2>
          </div>

          {payStatus === 'failed' && (
            <div className="bg-red-950/40 border border-red-500/35 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>Payment failed. Check your card details and try again.</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Card Holder Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cardholder Name</label>
              <input
                type="text"
                required
                placeholder="JOHN DOE"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Card Number</label>
              <input
                type="text"
                required
                maxLength="19"
                placeholder="4111 2222 3333 4444"
                value={cardNumber}
                onChange={(e) => {
                  // Auto format card space
                  const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                  const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                  setCardNumber(formatted);
                }}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm font-mono"
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Expiry Date</label>
                <input
                  type="text"
                  required
                  maxLength="5"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length >= 2) {
                      val = val.substring(0, 2) + '/' + val.substring(2, 4);
                    }
                    setExpiry(val);
                  }}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm font-mono text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">CVV</label>
                <input
                  type="password"
                  required
                  maxLength="3"
                  placeholder="•••"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm font-mono text-center"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={payLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-4 font-bold shadow-lg shadow-purple-500/25 transition-all text-sm uppercase tracking-wide cursor-pointer"
            >
              {payLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <span>Pay ₹{booking.totalCost} Now</span>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Ticket Summary (2 columns) */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>

            <div className="aspect-[2/3] w-full max-w-[150px] mx-auto rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-slate-950">
              <img 
                src={getMoviePoster(movie.name)} 
                alt={movie.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center border-b border-white/5 pb-4 space-y-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{movie.language}</span>
              <h3 className="font-extrabold text-white uppercase text-lg">{movie.name}</h3>
              <p className="text-xs text-gray-400">Dir: {movie.director}</p>
            </div>

            <div className="space-y-3.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase font-semibold">Theatre</span>
                <span className="text-white font-medium uppercase">{theatre.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase font-semibold">City</span>
                <span className="text-white font-medium uppercase">{theatre.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase font-semibold">Timing</span>
                <span className="text-white font-medium">{booking.timing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 uppercase font-semibold">Seats Selected</span>
                <span className="text-purple-300 font-bold">{seats.join(', ') || 'Reserved Seats'}</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex items-center justify-between bg-slate-950/40 border border-white/5 rounded-2xl p-4">
              <span className="text-xs text-gray-400 font-semibold uppercase">Total Charge</span>
              <span className="text-xl font-black text-purple-400">₹{booking.totalCost}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
