import { Link } from 'react-router-dom';

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        {/* Cancel/Warning Icon */}
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Checkout Canceled</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your payment was not processed and you haven't been charged. Your items are still saved.
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-8 space-y-3">
          <Link
            to="/cart"
            className="block w-full bg-black text-white font-semibold py-3 px-4 rounded-xl shadow hover:bg-gray-800 transition"
          >
            Return to Cart & Pay
          </Link>
          <Link
            to="/catalog"
            className="block w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-200 transition"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}