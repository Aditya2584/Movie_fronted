import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Film, Shield, ArrowRight } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // CUSTOMER, CLIENT, ADMIN
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isLogin) {
      const result = await login(email, password);
      setLoading(false);
      if (result.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setError(result.error);
      }
    } else {
      if (!name) {
        setError('Please provide a name');
        setLoading(false);
        return;
      }
      const result = await signup(name, email, password, role);
      setLoading(false);
      if (result.success) {
        setSuccess('Successfully registered! You can now log in.');
        setIsLogin(true);
        // Clean inputs
        setPassword('');
      } else {
        setError(result.error);
      }
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass rounded-2xl p-8 relative overflow-hidden shadow-2xl shadow-purple-900/10">
        
        {/* Glow effect backdrops */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-purple-650 p-3 rounded-2xl shadow-lg shadow-purple-500/20">
              <Film className="w-8 h-8 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin ? 'Sign in to access your movie tickets' : 'Join CinePass to start booking shows'}
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/35 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/40 border border-emerald-500/35 text-emerald-300 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Name Field (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <UserIcon className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Role Field (Sign Up Only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-400" /> Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['CUSTOMER', 'CLIENT', 'ADMIN'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        role === r
                          ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                          : 'bg-slate-900/40 border-white/5 text-gray-400 hover:border-white/10'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl py-3 px-4 font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className="text-sm font-medium text-purple-450 hover:text-purple-400 transition-colors cursor-pointer"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
