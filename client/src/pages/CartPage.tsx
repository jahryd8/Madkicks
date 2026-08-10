import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // Calculate subtotal directly from cartItems
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = cartItems.length > 0 ? 0.0 : 0.0;
  const estimatedTax = subtotal * 0.08;
  const grandTotal = subtotal + shippingCost + estimatedTax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-center">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-md w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🛒
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 text-sm mb-6">
            Looks like you haven't added any kicks to your cart yet.
          </p>
          <Link
            to="/"
            className="inline-block bg-black text-white font-bold py-3 px-6 rounded-md hover:bg-gray-800 transition text-sm w-full"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
            <p className="text-sm text-gray-600 mt-1">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)} item(s) in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-red-600 hover:text-red-800 transition"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">👟</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h3 className="text-base font-bold text-gray-900 truncate">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    US Size: <span className="font-bold text-gray-800">{item.size}</span>
                  </p>
                  <p className="text-sm font-black text-gray-900 mt-2">${item.price.toFixed(2)} each</p>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-200 font-bold text-sm transition"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-black text-gray-900 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-200 font-bold text-sm transition"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-base font-extrabold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-bold transition"
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-bold text-gray-900">${estimatedTax.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between font-black text-lg text-gray-900">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2"
              >
                Proceed to Checkout →
              </button>

              <div className="mt-4 text-center">
                <Link to="/" className="text-xs font-bold text-gray-500 hover:text-black transition">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};