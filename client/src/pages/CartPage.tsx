import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  RotateCcw 
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  // Defensive field mapping for cart item price and quantity
  const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const shippingCost = 0.0;
  const estimatedTax = subtotal * 0.08;
  const grandTotal = subtotal + shippingCost + estimatedTax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] bg-slate-50/50 flex flex-col items-center justify-center p-4 font-sans text-center">
        <div className="bg-white p-10 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100 max-w-md w-full">
          <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Looks like you haven't added any kicks to your cart yet.
          </p>
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-medium py-3 px-5 rounded-xl hover:bg-slate-800 transition text-sm shadow-sm active:scale-[0.99]"
          >
            <ArrowLeft className="w-4 h-4" />
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
            <p className="text-sm text-slate-500 mt-1">
              {cartItems.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0)} item(s) ready for checkout
            </p>
          </div>
          <button
            onClick={clearCart}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-100 transition self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item: any) => {
              const itemTitle = item.title || item.name || 'Sneaker Item';
              const itemImage = item.imageUrl || item.image;
              const itemPrice = item.price || 0;
              const itemQuantity = item.quantity || 1;

              return (
                <div
                  key={item.id}
                  className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-6 hover:border-slate-300 transition"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-slate-100 rounded-xl border border-slate-200/60 flex-shrink-0 overflow-hidden">
                    {itemImage ? (
                      <img src={itemImage} alt={itemTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        👟
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h3 className="text-base font-bold text-slate-900 truncate">{itemTitle}</h3>
                    {item.size && (
                      <p className="text-xs text-slate-500 mt-1">
                        US Size: <span className="font-semibold text-slate-800">{item.size}</span>
                      </p>
                    )}
                    <p className="text-sm font-semibold text-slate-700 mt-2">${itemPrice.toFixed(2)} each</p>
                  </div>

                  {/* Quantity Controls & Line Total */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/80 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, itemQuantity - 1)}
                        disabled={itemQuantity <= 1}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900 min-w-[2rem] text-center">
                        {itemQuantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, itemQuantity + 1)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-extrabold text-slate-900">
                        ${(itemPrice * itemQuantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm sticky top-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Order Summary</h2>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-slate-800">${estimatedTax.toFixed(2)}</span>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-slate-900">
                  <span className="text-base font-bold">Total</span>
                  <span className="text-xl font-extrabold">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Continue Shopping
                </Link>
              </div>

              {/* Guarantees */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/50 flex items-center gap-2 text-xs font-medium text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>100% Authentic Sneaker Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};