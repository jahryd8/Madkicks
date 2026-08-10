import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CartDrawer } from './CartDrawer';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemCount } = useCart();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="bg-black text-white sticky top-0 z-40 shadow-md font-sans">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="text-2xl font-black tracking-wider flex items-center gap-1 hover:opacity-90">
            🔥 MADKICKS
          </Link>

          {/* Navigation Links & Actions */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium hover:text-gray-300 transition-colors hidden sm:block"
            >
              Shop
            </Link>

            {/* Cart Button with Live Item Counter Badge (Triggers Drawer) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-200 hover:text-white transition-colors focus:outline-none"
              aria-label={`Shopping Cart with ${totalItemCount} items`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>

              {/* Live Count Badge */}
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {totalItemCount > 99 ? '99+' : totalItemCount}
                </span>
              )}
            </button>

            {/* Auth State Control */}
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center space-x-2 text-sm font-medium focus:outline-none hover:text-gray-300 py-1"
                >
                  {/* User Avatar Circle */}
                  <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {user.name ? user.name.slice(0, 2) : 'MK'}
                  </div>
                  <span className="hidden md:inline-block max-w-[100px] truncate">
                    {user.name || 'Account'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-md shadow-lg py-1 border border-gray-200 focus:outline-none z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-bold truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      My Orders
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-amber-600 font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors border-t border-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white text-black hover:bg-gray-200 text-sm font-bold py-2 px-4 rounded transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Slide-out Cart Drawer Instance */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};