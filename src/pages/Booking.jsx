import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Landmark, Calendar, Clock, ArrowLeft, Armchair, ChevronRight, Crown } from 'lucide-react';

const Booking = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [mockBookedSeats, setMockBookedSeats] = useState([]);

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const showsRes = await API.get('/shows');
        const showItem = (showsRes.data.data || []).find(s => s._id === showId);

        if (!showItem) {
          setError('Show not found or invalid show ID.');
          setLoading(false);
          return;
        }

        setShow(showItem);

        const movieRes = await API.get(`/movies/${showItem.movieId}`);
        setMovie(movieRes.data.data);

        const booked = [];
        const charCodeSum = showId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

        for (let r = 0; r < 8; r++) {
          for (let c = 1; c <= 10; c++) {
            const seatId = `${rows[r]}${c}`;
            const seatHash = (r * 13 + c * 7 + charCodeSum) % 100;
            if (seatHash < 35) {
              booked.push(seatId);
            }
          }
        }
        setMockBookedSeats(booked);

      } catch (err) {
        setError('Failed to load show booking information.');
      } finally {
        setLoading(false);
      }
    };
    fetchShowDetails();
  }, [showId]);

  const toggleSeatSelection = (seatId) => {
    if (mockBookedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats at once.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleBookingSubmit = async () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    setBookingLoading(true);
    try {
      const totalCost = selectedSeats.length * show.price;

      const response = await API.post('/bookings', {
        theatreId: show.theatreId._id || show.theatreId,
        movieId: show.movieId,
        timing: show.timing,
        noOfSeats: selectedSeats.length,
        totalCost: totalCost
      });

      const booking = response.data.data;
      localStorage.setItem(`booking_seats_${booking._id}`, JSON.stringify(selectedSeats));
      navigate(`/checkout/${booking._id}`);
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to initialize booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner-lg" />
          <span className="loading-text">Loading seats...</span>
        </div>
      </div>
    );
  }

  if (error || !show || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-bg-base">
        <div className="max-w-md text-center space-y-5">
          <h2 className="text-xl font-semibold text-text-primary">Booking Error</h2>
          <p className="type-body">{error || 'Unable to start booking session.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-primary hover:text-text-secondary transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const columns = Array.from({ length: 10 }, (_, i) => i + 1);
  const vipRows = ['A', 'B'];
  const totalPrice = selectedSeats.length * show.price;

  const getSeatClasses = (seatId, isVip) => {
    const isBooked = mockBookedSeats.includes(seatId);
    const isSelected = selectedSeats.includes(seatId);

    if (isBooked) {
      return 'bg-bg-secondary text-text-placeholder border-border/50 cursor-not-allowed opacity-30';
    }
    if (isSelected) {
      return 'bg-text-primary text-text-inverse border-text-primary shadow-md scale-110 seat-selected';
    }
    if (isVip) {
      return 'bg-bg-elevated text-text-secondary border-border hover:bg-bg-hover hover:border-border-hover hover:scale-110';
    }
    return 'bg-bg-card text-text-muted border-border hover:bg-bg-hover hover:border-border-hover hover:text-text-primary hover:scale-110';
  };

  return (
    <div className="min-h-screen bg-bg-base pb-16">
      <div className="container mx-auto px-6 lg:px-8 pt-8 lg:pt-12 space-y-8 lg:space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <Link
            to={`/movie/${movie._id}`}
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movie
          </Link>
          <div className="space-y-1">
            <p className="type-overline">Select your seats</p>
            <h1 className="type-section">{movie.name}</h1>
            <p className="type-body">
              {show.theatreId?.name} · {show.timing} · {show.format || '2D'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Seat layout */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-border bg-bg-card p-8 md:p-10 space-y-10">
              {/* Screen */}
              <div className="text-center space-y-3 max-w-lg mx-auto">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border-strong to-transparent" />
                <div className="h-8 w-full max-w-md mx-auto bg-gradient-to-b from-white/[0.06] to-transparent rounded-b-[50%]" />
                <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-text-muted">
                  Screen
                </p>
              </div>

              {/* Seat grid */}
              <div className="overflow-x-auto -mx-2 px-2 pb-2">
                <div className="min-w-[420px] space-y-2 flex flex-col items-center">
                  {rows.map((row) => {
                    const isVip = vipRows.includes(row);
                    return (
                      <div key={row} className="flex items-center gap-2.5">
                        <span className={`w-5 text-xs font-medium text-center shrink-0 ${isVip ? 'text-text-primary' : 'text-text-muted'}`}>
                          {row}
                        </span>
                        {isVip ? (
                          <Crown className="w-3 h-3 text-text-muted shrink-0" />
                        ) : (
                          <div className="w-3 shrink-0" />
                        )}
                        <div className="flex items-center gap-1.5">
                          {columns.map((col) => {
                            const seatId = `${row}${col}`;
                            const isBooked = mockBookedSeats.includes(seatId);
                            const extraMargin = col === 6 ? 'ml-3' : '';

                            return (
                                <button
                                  key={seatId}
                                  type="button"
                                  disabled={isBooked}
                                  onClick={() => toggleSeatSelection(seatId)}
                                  className={`
                                    w-9 h-9 md:w-10 md:h-10 rounded-lg border
                                    flex items-center justify-center
                                    transition-all duration-300 ease-out cursor-pointer
                                    active:scale-95
                                  ${getSeatClasses(seatId, isVip)}
                                  ${extraMargin}
                                `}
                                title={`Seat ${seatId}${isVip ? ' (Premium)' : ''}`}
                                aria-label={`Seat ${seatId}${isBooked ? ', booked' : ''}${selectedSeats.includes(seatId) ? ', selected' : ''}`}
                                aria-pressed={selectedSeats.includes(seatId)}
                              >
                                <Armchair className="w-3.5 h-3.5" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="border-t border-border pt-6">
                <p className="type-caption mb-4 text-center">Seat legend</p>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <div className="w-7 h-7 rounded-lg bg-bg-card border border-border flex items-center justify-center">
                      <Armchair className="w-3.5 h-3.5 text-text-muted" />
                    </div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-primary">
                    <div className="w-7 h-7 rounded-lg bg-text-primary border border-text-primary flex items-center justify-center">
                      <Armchair className="w-3.5 h-3.5 text-text-inverse" />
                    </div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <div className="w-7 h-7 rounded-lg bg-bg-secondary border border-border/50 flex items-center justify-center opacity-40">
                      <Armchair className="w-3.5 h-3.5" />
                    </div>
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <div className="w-7 h-7 rounded-lg bg-bg-elevated border border-border flex items-center justify-center">
                      <Crown className="w-3 h-3 text-text-muted" />
                    </div>
                    <span>Premium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky checkout */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Booking summary */}
              <div className="rounded-2xl border border-border bg-bg-card p-8 space-y-6">
                <div className="space-y-1">
                  <p className="type-overline">Booking summary</p>
                  <h2 className="text-lg font-semibold text-text-primary">{movie.name}</h2>
                  <p className="type-caption">{movie.language} · {movie.director}</p>
                </div>

                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-text-muted">
                      <Landmark className="w-4 h-4 shrink-0" />
                      Theatre
                    </dt>
                    <dd className="text-text-primary font-medium text-right text-xs uppercase">
                      {show.theatreId?.name}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-text-muted">
                      <Clock className="w-4 h-4 shrink-0" />
                      Timing
                    </dt>
                    <dd className="text-text-primary font-medium">{show.timing}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="flex items-center gap-2 text-text-muted">
                      <Calendar className="w-4 h-4 shrink-0" />
                      Format
                    </dt>
                    <dd className="text-text-primary font-medium uppercase">{show.format || '2D'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-text-muted">Price per seat</dt>
                    <dd className="text-text-primary font-medium">₹{show.price}</dd>
                  </div>
                </dl>

                <div className="border-t border-border pt-5 space-y-3">
                  <div>
                    <p className="type-caption">Selected seats ({selectedSeats.length})</p>
                    <p className="text-sm font-medium text-text-primary mt-1.5 break-all">
                      {selectedSeats.length > 0 ? [...selectedSeats].sort().join(', ') : 'None selected'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment summary */}
              <div className="rounded-2xl border border-border bg-bg-elevated p-8 space-y-6">
                <p className="type-overline">Payment summary</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>Tickets × {selectedSeats.length}</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Convenience fee</span>
                    <span>₹0</span>
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-border pt-4">
                  <span className="type-caption">Total amount</span>
                  <span className="text-2xl font-semibold text-text-primary tabular-nums">
                    ₹{totalPrice}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleBookingSubmit}
                  disabled={selectedSeats.length === 0 || bookingLoading}
                  className="w-full flex items-center justify-center gap-2 btn-primary py-3.5 disabled:opacity-40 cursor-pointer"
                >
                  {bookingLoading ? (
                    <div className="spinner-sm border-text-inverse/20 border-t-text-inverse" />
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-text-muted text-center leading-relaxed">
                  You can select up to 8 seats per booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seat selection pulse */}
      <style>{`
        .seat-selected {
          animation: seatPop 0.2s ease-out;
        }
        @keyframes seatPop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.15); }
          100% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default Booking;
