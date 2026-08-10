import React from 'react';
import { Link } from 'react-router-dom';

export const CheckoutCancel: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto my-16 p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 text-center text-zinc-900 dark:text-zinc-100">
      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h1 className="text-3xl font-extrabold mb-2">Checkout Canceled</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-6">
        Your transaction was cancelled and you haven't been charged. Your cart items are still saved if you wish to try again.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/cart"
          className="px-6 py-3 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold hover:opacity-90 transition"
        >
          Return to Cart
        </Link>
        <Link
          to="/products"
          className="px-6 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          Browse Kicks
        </Link>
      </div>
    </div>
  );
};

export default CheckoutCancel;