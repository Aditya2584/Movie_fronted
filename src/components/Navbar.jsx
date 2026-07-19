import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, LogOut, User, LayoutDashboard, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isClient } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-purple-600 p-2 rounded-lg group-hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20">
            <Film className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-wider">
            CatchMyShow
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-gray-300 hover:text-purple-400 font-medium transition-colors">
            Explore Movies
          </Link>

          {user && (
            <Link to="/dashboard" className="flex items-center space-x-1 text-gray-300 hover:text-purple-400 font-medium transition-colors">
              <LayoutDashboard className="w-4 h-4" />
              <span>My Tickets</span>
            </Link>
          )}

          {(isAdmin || isClient) && (
            <Link to="/admin" className="flex items-center space-x-1 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 border border-purple-500/30 px-3 py-1.5 rounded-md font-medium transition-all">
              <Settings className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          {user ? (
            <div className="flex items-center space-x-4 border-l border-white/15 pl-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                <User className="w-4 h-4 text-purple-400" />
                <span className="max-w-[120px] truncate">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-red-650 hover:bg-red-655 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-md shadow-red-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-md shadow-purple-500/25 cursor-pointer"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
