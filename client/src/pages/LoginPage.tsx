import React, { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { LoginPayload } from '../api/authApi';

interface LocationState {
  from?: Location;
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as Location & { state?: LocationState };

  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState<LoginPayload>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Invalid email or password. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-100 relative overflow-hidden">
      {/* Background Decorative Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-2xl p-8 backdrop-blur-xl relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="text-3xl font-black tracking-tight text-white uppercase italic">
              Mad<span className="text-zinc-500">Kicks</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Sign in to access your orders, saved kicks, and express checkout
          </p>
        </div>

        {/* Redirect Notice */}
        {location.state?.from && (
          <div className="mb-6 p-3.5 bg-amber-950/30 border border-amber-800/50 text-amber-300 rounded-xl text-xs flex items-start space-x-2.5">
            <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>You must be signed in to access <strong className="text-amber-200">{location.state.from.pathname}</strong>.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-950/40 border border-red-800/60 text-red-400 rounded-xl text-xs font-medium flex items-start space-x-2.5">
            <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-zinc-400 hover:text-white transition">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-zinc-800 bg-zinc-950/60 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition"
                aria-label="Toggle Password Visibility"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.003 10.003 0 0110.123 5.937c-1.275 4.057-5.065 7-9.543 7a9.96 9.96 0 01-2.932-.437M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-xl transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-2 shadow-lg shadow-white/5"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Signing In...</span>
              </span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-bold text-white hover:underline ml-1">
            Create one
          </Link>
        </div>

      </div>
    </div>
  );
};