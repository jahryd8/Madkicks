import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  MapPin, 
  ExternalLink,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-auto">
      {/* Value Propositions Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Truck className="w-6 h-6 text-indigo-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Fast Local Shipping</h4>
              <p className="text-xs text-slate-400">Reliable delivery across Jamaica</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <ShieldCheck className="w-6 h-6 text-indigo-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">100% Authentic Sneakers</h4>
              <p className="text-xs text-slate-400">Verified quality & original stock</p>
            </div>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <RotateCcw className="w-6 h-6 text-indigo-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">Secure Stripe Checkout</h4>
              <p className="text-xs text-slate-400">Encrypted payments & webhooks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="text-2xl font-black tracking-wider text-white">
              MAD<span className="text-indigo-500">KICKS</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your premium marketplace for authentic sneakers, footwear, and urban culture essentials.
            </p>
            
            {/* Social SVGs replacing lucide brand exports */}
            <div className="flex space-x-3 pt-2">
              <a 
                href="https://github.com/jahryd8/Madkicks" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-full text-white transition-colors"
                aria-label="GitHub Repository"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-full text-white transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-full text-white transition-colors"
                aria-label="X Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/catalog" className="hover:text-white transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-white transition-colors">New Arrivals</Link>
              </li>
              <li>
                <Link to="/catalog" className="hover:text-white transition-colors">Bestsellers</Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">Track Orders</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Sign In / Register</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support & Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <a 
                  href="mailto:jahwebproductions+madkicks@gmail.com" 
                  className="hover:text-white transition-colors text-xs sm:text-sm break-all"
                >
                  jahwebproductions+madkicks@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="text-slate-400">Kingston, Jamaica</span>
              </li>
              <li className="pt-2">
                <a 
                  href="https://github.com/jahryd8/Madkicks" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  View Source Code <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Sub-footer Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} MadKicks. Built by JahWeb Productions. All rights reserved.</p>
        <p className="flex items-center gap-4">
          <span>Terms of Service</span>
          <span>•</span>
          <span>Privacy Policy</span>
        </p>
      </div>
    </footer>
  );
};