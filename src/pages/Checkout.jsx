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

  const [timeLeft, setTimeLeft] = useState(300);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const [payLoading, setPayLoading] = useState(false);
  const [payStatus, setPayStatus] = useState(null);
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const bookingRes = await API.get(`/bookings/${bookingId}`);
        const bookingData = bookingRes.data.data;
        setBooking(bookingData);

        const savedSeats = localStorage.getItem(`booking_seats_${bookingId}`);
        if (savedSeats) {
          setSeats(JSON.parse(savedSeats));
        }

        const movieRes = await API.get(`/movies/${bookingData.movieId}`);
        setMovie(movieRes.data.data);

        const theatreRes = await API.get(`/theatres/${bookingData.theatreId}`);
        setTheatre(theatreRes.data.data);

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
      <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#FF5A1F]/20 border-t-[#FF5A1F] rounded-full animate-spin"></div>
          <span className="text-sm text-[#A8A8A8]">Loading checkout...</span>
        </div>
      </div>
    );
  }

  if (error || !booking || !movie || !theatre) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-24 pt-32 px-6">
        <h2 className="text-xl font-bold text-white">Checkout Error</h2>
        <p className="text-[#A8A8A8]">{error || 'Unable to start checkout session.'}</p>
        <Link to="/" className="text-[#FF5A1F] hover:text-[#FF7B39] font-semibold underline">
          Go Back
        </Link>
      </div>
    );
  }

  // Success View
  if (payStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-emerald-500/20 shadow-2xl text-center space-y-6 animate-scaleIn">
          <div className="flex justify-center">
            <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/25">
              <CheckCircle2 className="w-16 h-16 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Booking Confirmed!</h2>
            <p className="text-[#6B6B6B] text-sm">Your payment was processed successfully. Enjoy your movie!</p>
          </div>

          {/* Ticket Card */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 text-left space-y-4 divide-y divide-[#2A2A2A]">
            <div className="pb-3 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-[#FF5A1F] uppercase tracking-widest">{movie.language}</span>
                <h3 className="font-bold text-white uppercase text-base">{movie.name}</h3>
              </div>
              <Ticket className="w-6 h-6 text-[#FF5A1F]" />
            </div>

            <div className="py-3 grid grid-cols-2 gap-y-2 text-xs">
              <div>
                <span className="text-[#6B6B6B] block">THEATRE</span>
                <span className="text-white font-medium uppercase">{theatre.name}</span>
              </div>
              <div>
                <span className="text-[#6B6B6B] block">TIMING</span>
                <span className="text-white font-medium">{booking.timing}</span>
              </div>
              <div className="mt-1">
                <span className="text-[#6B6B6B] block">SEATS ({booking.noOfSeats})</span>
                <span className="text-[#FF5A1F] font-bold">{seats.join(', ') || 'Reserved Seats'}</span>
              </div>
              <div className="mt-1">
                <span className="text-[#6B6B6B] block">BOOKING ID</span>
                <span className="text-[#6B6B6B] font-mono text-[10px] truncate block max-w-[120px]">{booking._id}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Link
              to="/dashboard"
              className="w-full btn-primary text-center text-sm py-3 cursor-pointer block"
            >
              View My Tickets
            </Link>
            <Link
              to="/"
              className="text-sm font-semibold text-[#6B6B6B] hover:text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Expired View
  if (payStatus === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-red-500/20 shadow-2xl text-center space-y-6 animate-scaleIn">
          <div className="flex justify-center">
            <div className="bg-red-500/10 p-4 rounded-full border border-red-500/25">
              <XCircle className="w-16 h-16 text-red-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Booking Expired</h2>
            <p className="text-[#6B6B6B] text-sm">Bookings must be completed within 5 minutes. Your reservation has timed out.</p>
          </div>

          <div className="pt-4">
            <Link
              to={`/movie/${movie._id}`}
              className="w-full btn-primary text-center text-sm py-3 cursor-pointer block"
            >
              Re-select Seats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 container mx-auto px-4 md:px-6 max-w-4xl space-y-8">
      {/* Timer Bar */}
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="text-sm font-medium">Complete booking before ticket expires:</span>
        </div>
        <span className="text-lg font-black tracking-wider text-amber-400 font-mono">
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

        {/* Payment Form */}
        <form onSubmit={handlePayment} className="md:col-span-3 glass-card rounded-3xl p-8 md:p-10 space-y-8 shadow-xl border border-border">
          <div className="border-b border-border pb-4">
            <h2 className="type-section text-xl flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent" /> Payment Details
            </h2>
          </div>

          {payStatus === 'failed' && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>Payment failed. Check your card details and try again.</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="type-label">Cardholder Name</label>
              <input
                type="text"
                required
                placeholder="JOHN DOE"
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                className="input"
              />
            </div>

            <div>
              <label className="type-label">Card Number</label>
              <input
                type="text"
                required
                maxLength="19"
                placeholder="4111 2222 3333 4444"
                value={cardNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                  const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                  setCardNumber(formatted);
                }}
                className="input font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="type-label">Expiry Date</label>
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
                  className="input font-mono text-center"
                />
              </div>
              <div>
                <label className="type-label">CVV</label>
                <input
                  type="password"
                  required
                  maxLength="3"
                  placeholder="•••"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                  className="input font-mono text-center"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <button
              type="submit"
              disabled={payLoading}
              className="w-full flex items-center justify-center gap-2 btn-primary"
            >
              {payLoading ? (
                <div className="spinner-sm border-text-inverse/20 border-t-text-inverse"></div>
              ) : (
                <span>Pay ₹{booking.totalCost} Now</span>
              )}
            </button>
          </div>
        </form>

        {/* Ticket Summary */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-8 space-y-8 shadow-xl relative overflow-hidden border border-border">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-muted rounded-full blur-xl pointer-events-none"></div>

            <div className="aspect-[2/3] w-full max-w-[140px] mx-auto rounded-2xl overflow-hidden shadow-lg border border-border bg-bg-secondary">
              <img
                src={getMoviePoster(movie.name)}
                alt={movie.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center border-b border-border pb-6 space-y-2">
              <span className="type-overline text-accent">{movie.language}</span>
              <h3 className="type-section text-xl">{movie.name}</h3>
              <p className="type-caption">Dir: {movie.director}</p>
            </div>

            <div className="space-y-4 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span className="type-label">Theatre</span>
                <span className="text-text-primary font-medium">{theatre.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="type-label">City</span>
                <span className="text-text-primary font-medium">{theatre.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="type-label">Timing</span>
                <span className="text-text-primary font-medium">{booking.timing}</span>
              </div>
              <div className="flex justify-between">
                <span className="type-label">Seats</span>
                <span className="text-accent font-bold">{seats.join(', ') || 'Reserved'}</span>
              </div>
            </div>

            <div className="bg-bg-elevated border border-border rounded-2xl p-5 flex items-center justify-between">
              <span className="type-label mb-0">Total</span>
              <span className="text-xl font-bold text-accent">₹{booking.totalCost}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
