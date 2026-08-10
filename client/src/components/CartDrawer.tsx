import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, subtotal, totalItemCount } = useCart();
  const navigate = useNavigate();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* 1. Dark Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Slide-out Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out font-sans ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping Cart Drawer"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-black text-white">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight">Your Cart</h2>
            <span className="bg-red-600 text-xs font-extrabold px-2 py-0.5 rounded-full">
              {totalItemCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-md transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Item List Container */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-gray-100">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-12">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg font-semibold text-gray-800">Your cart is empty</p>
              <p className="text-sm mt-1 text-gray-500">Looks like you haven't added any kicks yet.</p>
              <button
                onClick={onClose}
                className="mt-6 bg-black text-white font-bold py-2.5 px-6 rounded-md hover:bg-gray-800 transition-colors text-sm"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-center">
                {/* Image Placeholder or Item Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">👟</span>
                  )}
                </div>

                {/* Details & Controls */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{item.title}</h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                      title="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
                  <p className="text-sm font-extrabold text-gray-900 mt-1">${item.price.toFixed(2)}</p>

                  {/* Quantity Counter */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-extrabold text-lg text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500">Shipping & taxes calculated at checkout.</p>
            <button
              onClick={handleCheckout}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};