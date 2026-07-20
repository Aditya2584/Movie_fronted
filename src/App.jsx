import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Booking from './pages/Booking';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// A private route component for logged in users
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0B0B]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#FF5A1F]/20 border-t-[#FF5A1F] rounded-full animate-spin"></div>
        <span className="text-sm text-[#A8A8A8] font-medium tracking-wider">Loading...</span>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/auth" replace />;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const { user, isAdmin, isClient, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0B0B]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#FF5A1F]/20 border-t-[#FF5A1F] rounded-full animate-spin"></div>
        <span className="text-sm text-[#A8A8A8] font-medium tracking-wider">Loading...</span>
      </div>
    </div>
  );
  return (user && (isAdmin || isClient)) ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#0B0B0B] text-gray-100 selection:bg-[#FF5A1F] selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/auth" element={<Auth />} />
              
              <Route path="/booking/:showId" element={
                <PrivateRoute>
                  <Booking />
                </PrivateRoute>
              } />
              
              <Route path="/checkout/:bookingId" element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              } />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/admin" element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
