import React, { useState, useEffect } from 'react';
import type { ShoeProduct } from '../types/product';
import { useCart } from '../context/CartContext'; // Adjust path if using Cart Context

interface ShoeDetailProps {
  product: ShoeProduct | null;
  onClose: () => void;
}

export const ShoeDetail: React.FC<ShoeDetailProps> = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState<string | number>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);
  
  // Try to grab addToCart if context exists, fallback gracefully
  const cartContext = useCart ? useCart() : null;

  // Reset local state when product changes
  useEffect(() => {
    if (product && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    setQuantity(1);
    setAdded(false);
  }, [product]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  // Inside ShoeDetail.tsx:

const handleAddToCart = () => {
  if (!selectedSize || !cartContext) return;

  // Adapt ShoeProduct + size into the CartItem payload format
  cartContext.addToCart(
    {
      productId: product.id,
      variantId: `${product.id}-${selectedSize}`, // Ensures unique variant per size
      name: product.name,
      brand: product.brand,
      price: product.price,
      size: String(selectedSize),
      imageUrl: product.imageUrl,
    },
    quantity
  );

  setAdded(true);
  setTimeout(() => setAdded(false), 2000);
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-zinc-400 hover:text-white bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 rounded-full backdrop-blur-md transition"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Product Image Stage */}
        <div className="w-full md:w-1/2 bg-zinc-950 p-8 flex items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-zinc-800/80">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent pointer-events-none" />
          
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-auto max-h-[280px] md:max-h-[360px] object-contain relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.7)]"
          />

          <span className="absolute top-4 left-4 bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg backdrop-blur-md">
            {product.brand}
          </span>
        </div>

        {/* Product Details & Actions Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                  In Vault & Ready to Ship
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                {product.name}
              </h2>
              <p className="text-2xl font-black text-white mt-2">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Description (if present) */}
            {product.description && (
              <p className="text-xs text-zinc-400 leading-relaxed mb-6 line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Select Size (US)
                </label>
                <span className="text-[11px] text-zinc-500">True to size</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition border ${
                        isSelected
                          ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                          : 'bg-zinc-950/60 text-zinc-300 border-zinc-800 hover:border-zinc-600 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                Quantity
              </label>
              <div className="inline-flex items-center border border-zinc-800 rounded-xl bg-zinc-950/60 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition duration-200 flex items-center justify-center space-x-2 ${
              added
                ? 'bg-emerald-500 text-black'
                : 'bg-white hover:bg-zinc-200 text-black active:scale-[0.99] shadow-lg shadow-white/5'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {added ? (
              <>
                <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Added to Cart!</span>
              </>
            ) : (
              <span>Add to Cart — ${(product.price * quantity).toFixed(2)}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};