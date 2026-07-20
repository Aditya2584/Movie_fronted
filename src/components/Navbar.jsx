import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Film,
  LogOut,
  User,
  LayoutDashboard,
  Settings,
  Search,
  Menu,
  X,
  ChevronDown,
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

  const isHome = location.pathname === '/';
  const isSolid = scrolled || !isHome;

  const navLinks = [
    { to: '/', label: 'Home', isActive: location.pathname === '/' && !location.hash },
    { to: '/#movies', label: 'Movies', isActive: location.hash === '#movies' },
  ];

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  const NavItem = ({ to, label, icon: Icon, isActive, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200
        ${isActive
          ? 'text-text-primary'
          : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
        }`}
    >
      <span className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </span>
      {isActive && (
        <span className="absolute bottom-0 left-3.5 right-3.5 h-px bg-text-primary rounded-full" />
      )}
    </Link>
  );

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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavItem key={link.label} {...link} />
            ))}
            {user && (
              <NavItem
                to="/dashboard"
                label="My Tickets"
                icon={LayoutDashboard}
                isActive={location.pathname === '/dashboard'}
              />
            )}
            {(isAdmin || isClient) && (
              <NavItem
                to="/admin"
                label="Admin"
                icon={Settings}
                isActive={location.pathname === '/admin'}
              />
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <button
              onClick={handleSearch}
              aria-label="Search movies"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg
                text-text-secondary hover:text-text-primary hover:bg-bg-hover
                transition-all duration-200 cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* User — desktop */}
            {user ? (
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-lg
                    hover:bg-bg-hover transition-all duration-200 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-bg-elevated border border-border
                    flex items-center justify-center text-xs font-medium text-text-primary">
                    {userInitial}
                  </div>
                  <span className="text-sm text-text-secondary max-w-30 truncate hidden lg:block">
                    {user.email}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200
                      ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-bg-elevated border border-border
                    rounded-xl shadow-lg py-1.5 animate-fadeIn origin-top-right">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-text-primary truncate">{user.email}</p>
                      <p className="text-xs text-text-muted mt-0.5 capitalize">{user.role?.toLowerCase()}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary
                          hover:text-text-primary hover:bg-bg-hover transition-colors duration-150"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        My Tickets
                      </Link>
                      {(isAdmin || isClient) && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary
                            hover:text-text-primary hover:bg-bg-hover transition-colors duration-150"
                        >
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-border pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-error
                          hover:bg-error-muted transition-colors duration-150 cursor-pointer"
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
                className="hidden md:inline-flex btn-primary text-sm px-4 py-2 cursor-pointer"
              >
                Sign In
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg
                text-text-primary hover:bg-bg-hover transition-all duration-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
    </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-bg-base/95 backdrop-blur-lg animate-fadeIn">
          <div className="container mx-auto px-6 py-4 space-y-1">

            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${link.isActive
                    ? 'text-text-primary bg-bg-hover'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                  }`}
              >
                {link.label}
                {link.isActive && <span className="w-1 h-1 rounded-full bg-text-primary" />}
              </Link>
            ))}

            {user && (
              <Link
                to="/dashboard"
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${location.pathname === '/dashboard'
                    ? 'text-text-primary bg-bg-hover'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  My Tickets
                </span>
                {location.pathname === '/dashboard' && (
                  <span className="w-1 h-1 rounded-full bg-text-primary" />
                )}
              </Link>
            )}

            {(isAdmin || isClient) && (
              <Link
                to="/admin"
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${location.pathname === '/admin'
                    ? 'text-text-primary bg-bg-hover'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </span>
                {location.pathname === '/admin' && (
                  <span className="w-1 h-1 rounded-full bg-text-primary" />
                )}
              </Link>
            )}

            {/* Mobile search */}
            <button
              onClick={() => { setMobileMenuOpen(false); handleSearch(); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                text-text-secondary hover:text-text-primary hover:bg-bg-hover
                transition-colors duration-150 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              Search
            </button>

            <div className="border-t border-border pt-3 mt-2">
              {user ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border
                      flex items-center justify-center text-xs font-medium text-text-primary">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{user.email}</p>
                      <p className="text-xs text-text-muted capitalize">{user.role?.toLowerCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                      text-error hover:bg-error-muted transition-colors duration-150 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="block w-full text-center btn-primary text-sm py-2.5 cursor-pointer"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
