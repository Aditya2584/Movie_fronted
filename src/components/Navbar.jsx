import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Film,
  LogOut,
  LayoutDashboard,
  Settings,
  Search,
  Menu,
  X,
  ChevronDown,
  Bell
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isClient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/');
  };

  const handleSearch = () => {
    navigate('/');
    setTimeout(() => {
      document.getElementById('movie-search')?.focus();
      document.getElementById('movies')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const navLinks = [
    { to: '/', label: 'Home', isActive: location.pathname === '/' && !location.hash },
    { to: '/#movies', label: 'Movies', isActive: location.hash === '#movies' },
  ];

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';
  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  const NavItem = ({ to, label, isActive, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`relative px-4 py-2 text-[15px] font-medium rounded-full transition-all duration-300
        ${isActive
          ? 'text-white bg-white/10'
          : 'text-white/60 hover:text-white hover:bg-white/5'
        }`}
    >
      {label}
    </Link>
  );

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border
        ${scrolled 
          ? 'bg-[rgba(10,10,10,0.85)] backdrop-blur-[24px] border-[rgba(255,255,255,0.18)] shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
          : 'bg-[rgba(10,10,10,0.7)] backdrop-blur-[20px] border-[rgba(255,255,255,0.05)]'
        } h-[60px] rounded-4xl`}
    >
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        
        {/* Left Section */}
        <div className="w-1/3 flex justify-start">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-8 h-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              <Film className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[17px] font-bold text-white tracking-wide">
              FrameSeat
            </span>
          </Link>
        </div>

        {/* Center Section - Desktop Navigation */}
        <nav className="w-1/3 hidden md:flex items-center justify-center gap-2">
          {navLinks.map((link) => (
            <NavItem key={link.label} {...link} />
          ))}
          {user && (
            <NavItem
              to="/dashboard"
              label="My Tickets"
              isActive={location.pathname === '/dashboard'}
            />
          )}
          {(isAdmin || isClient) && (
            <NavItem
              to="/admin"
              label="Admin"
              isActive={location.pathname === '/admin'}
            />
          )}
        </nav>

        {/* Right Section */}
        <div className="w-1/3 flex justify-end items-center gap-3">
          
          <button
            onClick={handleSearch}
            aria-label="Search movies"
            className="hidden md:flex text-white/60 hover:text-white transition-colors w-9 h-9 items-center justify-center rounded-full hover:bg-white/5"
          >
            <Search className="w-4 h-4" />
          </button>
          
          {user && (
            <button
              aria-label="Notifications"
              className="hidden md:flex text-white/60 hover:text-white transition-colors w-9 h-9 items-center justify-center rounded-full hover:bg-white/5"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}

          {user ? (
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200"
              >
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-medium text-white">
                  {userInitial}
                </div>
                <span className="text-[14px] font-medium text-white/80 hidden lg:block">
                  {userName}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200
                    ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl py-1.5 animate-fadeIn origin-top-right">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                    <p className="text-xs text-white/50 mt-0.5 capitalize">{user.role?.toLowerCase() || 'User'}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-[14px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      My Tickets
                    </Link>
                    {(isAdmin || isClient) && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-[14px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-[14px] text-[#ff453a] hover:bg-[#ff453a]/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden md:inline-flex px-5 py-2 text-[14px] font-medium bg-white text-black rounded-full hover:bg-white/90 transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

    </header>
  );
};

export default Navbar;
