import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { Landmark, Calendar, Clock, ArrowLeft, Armchair, ChevronRight } from 'lucide-react';

const Booking = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Generate consistent mock booked seats using a simple hash of showId
  const [mockBookedSeats, setMockBookedSeats] = useState([]);

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        // Fetch all shows and find the matching one
        const showsRes = await API.get('/shows');
        const showItem = (showsRes.data.data || []).find(s => s._id === showId);
        
        if (!showItem) {
          setError('Show not found or invalid show ID.');
          setLoading(false);
          return;
        }

        setShow(showItem);

        // Fetch associated Movie
        const movieRes = await API.get(`/movies/${showItem.movieId}`);
        setMovie(movieRes.data.data);

        // Seed seat map with random already-booked seats (approx 35% booked)
        const booked = [];
        const charCodeSum = showId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        // Let's generate 80 seats (8 rows, 10 columns: A1 to H10)
        const totalSeatsCount = 80;
        const totalRows = 8;
        const seatsPerRow = 10;
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

        for (let r = 0; r < totalRows; r++) {
          for (let c = 1; c <= seatsPerRow; c++) {
            const seatId = `${rows[r]}${c}`;
            // Simple pseudo-random formula based on seat indices and showId hash
            const seatHash = (r * 13 + c * 7 + charCodeSum) % 100;
            if (seatHash < 35) { // 35% chance to be already booked
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
    if (mockBookedSeats.includes(seatId)) return; // Can't select already booked seats

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
      // Calculate total price
      const totalCost = selectedSeats.length * show.price;

      // Submit booking creation
      const response = await API.post('/bookings', {
        theatreId: show.theatreId._id || show.theatreId,
        movieId: show.movieId,
        timing: show.timing,
        noOfSeats: selectedSeats.length,
        totalCost: totalCost
      });

      const booking = response.data.data;
      
      // Store selected seat names in temp storage to display in checkout/tickets
      localStorage.setItem(`booking_seats_${booking._id}`, JSON.stringify(selectedSeats));

      // Redirect to checkout with booking ID
      navigate(`/checkout/${booking._id}`);
    } catch (err) {
      alert(err.response?.data?.err || 'Failed to initialize booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !show || !movie) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-12">
        <h2 className="text-xl font-bold text-white">Booking Error</h2>
        <p className="text-gray-400">{error || 'Unable to start booking session.'}</p>
        <Link to="/" className="text-purple-400 hover:text-purple-300 font-semibold underline">
          Go Back
        </Link>
      </div>
    );
  }

  // Row and seat definitions for render
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const columns = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      {/* Back to details */}
      <div>
        <Link 
          to={`/movie/${movie._id}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Movie Timings</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive Seat Grid */}
        <div className="lg:col-span-2 space-y-8 glass rounded-3xl p-6 md:p-8 border border-white/5">
          {/* Cinema Screen Mock */}
          <div className="relative text-center w-full max-w-lg mx-auto mb-12">
            <div className="h-2 w-full bg-gradient-to-r from-purple-800 via-purple-500 to-purple-800 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.8)]"></div>
            <div className="text-purple-400 text-xs font-bold uppercase tracking-widest mt-2">
              Cinema Screen
            </div>
          </div>

          {/* Seat Grid */}
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[450px] space-y-3 flex flex-col items-center justify-center">
              {rows.map(row => (
                <div key={row} className="flex items-center space-x-3">
                  {/* Row Indicator */}
                  <span className="w-6 text-sm text-gray-500 font-bold text-center">{row}</span>
                  
                  {/* Seats in Row */}
                  <div className="flex items-center space-x-2.5">
                    {columns.map(col => {
                      const seatId = `${row}${col}`;
                      const isBooked = mockBookedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);

                      let seatColor = 'bg-slate-800 text-slate-400 hover:bg-purple-950 hover:text-purple-200 border-white/5';
                      if (isBooked) {
                        seatColor = 'bg-slate-950 text-slate-700 border-transparent cursor-not-allowed';
                      } else if (isSelected) {
                        seatColor = 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20';
                      }

                      return (
                        <button
                          key={seatId}
                          disabled={isBooked}
                          onClick={() => toggleSeatSelection(seatId)}
                          className={`w-9 h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${seatColor}`}
                          title={`Seat ${seatId}`}
                        >
                          <Armchair className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seat Legend */}
          <div className="flex justify-center items-center gap-8 text-xs border-t border-white/5 pt-6">
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-6 h-6 rounded bg-slate-800 border border-white/5 flex items-center justify-center"><Armchair className="w-3.5 h-3.5" /></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-400">
              <div className="w-6 h-6 rounded bg-purple-600 border border-purple-400 flex items-center justify-center"><Armchair className="w-3.5 h-3.5 text-white" /></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-6 h-6 rounded bg-slate-950 flex items-center justify-center"><Armchair className="w-3.5 h-3.5" /></div>
              <span>Booked</span>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Info Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Movie Title Header */}
            <div className="border-b border-white/5 pb-4">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{movie.language}</span>
              <h2 className="text-xl font-bold text-white uppercase mt-0.5">{movie.name}</h2>
              <span className="text-xs text-gray-400">Director: {movie.director}</span>
            </div>

            {/* Show details list */}
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-1.5"><Landmark className="w-4 h-4 text-purple-400" /> Theatre</span>
                <span className="text-white font-medium uppercase text-right">{show.theatreId?.name}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-400" /> Timing</span>
                <span className="text-white font-medium">{show.timing}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-purple-400" /> Show Format</span>
                <span className="text-white font-medium uppercase">{show.format || '2D'}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Ticket Price</span>
                <span className="text-white font-semibold">₹{show.price}</span>
              </div>
            </div>

            {/* Seating calculation details */}
            <div className="border-t border-white/5 pt-4 space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Selected Seats ({selectedSeats.length})</span>
                <p className="text-sm text-purple-300 font-bold break-all">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                </p>
              </div>

              <div className="flex items-end justify-between bg-slate-950/40 border border-white/5 rounded-xl p-3.5">
                <span className="text-xs text-gray-400 font-medium">Total Price</span>
                <span className="text-2xl font-black text-purple-400">
                  ₹{selectedSeats.length * show.price}
                </span>
              </div>
            </div>

            {/* Confirm booking button */}
            <button
              onClick={handleBookingSubmit}
              disabled={selectedSeats.length === 0 || bookingLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-3.5 font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all text-sm disabled:opacity-50 cursor-pointer uppercase tracking-wider"
            >
              {bookingLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Book and Proceed</span>
                  <ChevronRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Booking;
