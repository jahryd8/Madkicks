import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';

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
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
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
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-base font-bold tracking-tight">Your Cart</h2>
            <span className="bg-rose-600 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {totalItemCount || 0}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List Container */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400 border border-slate-200/60">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-lg font-bold text-slate-900">Your cart is empty</p>
              <p className="text-sm mt-1 text-slate-500 max-w-xs leading-relaxed">
                Looks like you haven't added any kicks to your cart yet.
              </p>
              <button
                onClick={onClose}
                className="mt-6 inline-flex items-center gap-2 bg-slate-900 text-white font-medium py-3 px-6 rounded-xl hover:bg-slate-800 transition text-sm shadow-sm active:scale-[0.99]"
              >
                <ArrowLeft className="w-4 h-4" />
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item: any) => {
              const itemTitle = item.title || item.name || 'Sneaker Item';
              const itemImage = item.imageUrl || item.image;
              const itemPrice = item.price || 0;
              const itemQuantity = item.quantity || 1;

              return (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  {/* Item Image */}
                  <div className="w-20 h-20 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200/60">
                    {itemImage ? (
                      <img src={itemImage} alt={itemTitle} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">👟</span>
                    )}
                  </div>

                  {/* Details & Controls */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{itemTitle}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.size && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        US Size: <span className="font-semibold text-slate-700">{item.size}</span>
                      </p>
                    )}
                    <p className="text-sm font-extrabold text-slate-900 mt-1">${itemPrice.toFixed(2)}</p>

                    {/* Quantity Counter */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, itemQuantity - 1)}
                          disabled={itemQuantity <= 1}
                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md disabled:opacity-30 transition"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-slate-900">
                          {itemQuantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, itemQuantity + 1)}
                          className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/80 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="font-extrabold text-lg text-slate-900">
                ${(subtotal || 0).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-slate-500">Shipping & taxes calculated at checkout.</p>
            <button
              onClick={handleCheckout}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2 text-sm active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};