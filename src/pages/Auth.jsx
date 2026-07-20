import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Film, Shield, ArrowRight } from 'lucide-react';

const AuthField = ({ id, label, icon: Icon, type = 'text', value, onChange, placeholder, required = true }) => (
  <div className="form-group auth-field">
    <label htmlFor={id} className="type-label">
      {label}
    </label>
    <div className="relative group">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted transition-colors duration-200 group-focus-within:text-text-primary">
        <Icon className="w-4 h-4" />
      </span>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="auth-input w-full rounded-lg border border-border hover:border-border-hover bg-bg-secondary/60 py-3 pl-10 pr-4 text-sm text-text-primary
          placeholder:text-text-placeholder backdrop-blur-sm
          transition-all duration-300 ease-out
          focus:outline-none focus:border-border-focus focus:bg-bg-secondary focus:ring-1 focus:ring-white/10"
      />
      <span
        className="auth-input-line absolute bottom-0 left-3 right-3 h-px bg-text-primary origin-left scale-x-0 transition-transform duration-300 ease-out group-focus-within:scale-x-100"
        aria-hidden="true"
      />
    </div>
  </div>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
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
        setPassword('');
      } else {
        setError(result.error);
      }
    }
  };

  const switchMode = (login) => {
    setIsLogin(login);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 lg:py-20 bg-bg-base">
      <div className="w-full max-w-[420px] animate-scaleIn">
        <div className="relative overflow-hidden rounded-2xl border border-border glass p-10 sm:p-12 shadow-xl">
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/[0.03] blur-3xl"
            aria-hidden="true"
          />

          <div className="relative space-y-8">
            {/* Brand */}
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-bg-elevated">
                <Film className="w-5 h-5 text-text-primary" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                  {isLogin ? 'Welcome back' : 'Create account'}
                </h1>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {isLogin
                    ? 'Sign in to access your tickets and bookings'
                    : 'Join CinePass to start booking shows'}
                </p>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="tabs-pill flex w-full">
              <button
                type="button"
                onClick={() => switchMode(true)}
                className={`flex-1 tab-pill ${isLogin ? 'tab-pill-active' : ''}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode(false)}
                className={`flex-1 tab-pill ${!isLogin ? 'tab-pill-active' : ''}`}
              >
                Register
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="alert-error animate-fadeIn" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="alert-neutral animate-fadeIn" role="status">
                {success}
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div
                className={`space-y-4 transition-all duration-300 ease-out ${
                  isLogin ? '' : 'animate-fadeIn'
                }`}
              >
                {!isLogin && (
                  <AuthField
                    id="name"
                    label="Full name"
                    icon={UserIcon}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                )}

                <AuthField
                  id="email"
                  label="Email address"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />

                <AuthField
                  id="password"
                  label="Password"
                  icon={Lock}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />

                {!isLogin && (
                  <div className="form-group animate-fadeIn">
                    <label className="type-label flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      Account type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['CUSTOMER', 'CLIENT', 'ADMIN'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`
                            rounded-lg border py-2.5 px-2 text-xs font-medium
                            transition-all duration-200 ease-out cursor-pointer
                            ${role === r
                              ? 'bg-text-primary text-text-inverse border-text-primary scale-[1.02]'
                              : 'bg-bg-secondary/60 border-border text-text-secondary hover:border-border-hover hover:text-text-primary'
                            }
                          `}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full flex items-center justify-center gap-2 btn-primary py-3.5 mt-2
                  disabled:opacity-40 cursor-pointer transition-all duration-200 hover-lift-sm active:scale-[0.98]"
              >
                {loading ? (
                  <div className="spinner-sm border-text-inverse/20 border-t-text-inverse" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-text-muted">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(!isLogin)}
                className="font-medium text-text-primary hover:text-text-secondary transition-colors duration-200 cursor-pointer"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
