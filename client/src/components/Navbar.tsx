import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItemCount } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Drops', path: '/' },
    { name: 'Catalog', path: '/catalog' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-black tracking-tight text-white uppercase italic">
              Mad<span className="text-zinc-500 group-hover:text-zinc-300 transition">Kicks</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-150 ${
                    active
                      ? 'bg-zinc-900 text-white border border-zinc-800'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Cart & Auth Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Cart Icon Trigger */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white transition group"
            aria-label="Open Cart"
          >
            <svg
              className="w-5 h-5 text-zinc-300 group-hover:text-white transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>

            {/* Live Cart Counter Badge */}
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-950 shadow-lg animate-pulse">
                {totalItemCount > 99 ? '99+' : totalItemCount}
              </span>
            )}
          </button>

          {/* User Auth Menu */}
          {user ? (
            <div className="hidden sm:flex items-center space-x-3 border-l border-zinc-800 pl-3">
              <span className="text-xs font-medium text-zinc-400 truncate max-w-[120px]">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2 border-l border-zinc-800 pl-3">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-zinc-200 text-black transition shadow-sm"
              >
                Join
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white transition"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-bold transition ${
                  isActive(link.path)
                    ? 'bg-zinc-900 text-white border border-zinc-800'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-zinc-400">{user.email}</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 text-zinc-300 border border-zinc-800"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-xs font-bold border border-zinc-800 text-zinc-300 bg-zinc-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-xs font-bold bg-white text-black"
                >
                  Join Vault
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};