import React, { useState, useEffect } from 'react';
import type { ShoeProduct, ShoeVariant } from '../types/product';
import { useCart } from '../context/CartContext';

interface ShoeDetailProps {
  product: ShoeProduct | null;
  onClose: () => void;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ShoeDetail: React.FC<ShoeDetailProps> = ({ product, onClose }) => {
  const [selectedSize, setSelectedSize] = useState<string | number>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  // Call hook unconditionally at top-level
  const { addToCart } = useCart();

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize('');
    }
    setQuantity(1);
    setAdded(false);
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize || !addToCart) return;

    // 1. Check if matching variant exists by size
    const matchingVariant: ShoeVariant | undefined = product.variants?.find(
      (v) => String(v.size) === String(selectedSize)
    );

    // 2. Validate extracted variant UUID against strict standard
    const rawVariantId = matchingVariant?.id ? String(matchingVariant.id) : null;
    const isValidUuid = rawVariantId && UUID_REGEX.test(rawVariantId);

    // Fallback logic: Only use string ID if valid UUID, otherwise pass string for client warning
    const realVariantId = isValidUuid 
      ? rawVariantId 
      : matchingVariant?.id 
        ? String(matchingVariant.id)
        : String(product.id);

    addToCart(
      {
        productId: String(product.id),
        variantId: realVariantId,
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

  const currentPrice = product.price || 0;

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

          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-auto max-h-[280px] md:max-h-[360px] object-contain relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.7)]"
            />
          ) : (
            <div className="text-4xl text-zinc-700 relative z-10">👟</div>
          )}

          {product.brand && (
            <span className="absolute top-4 left-4 bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg backdrop-blur-md">
              {product.brand}
            </span>
          )}
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
                ${currentPrice.toFixed(2)}
              </p>
            </div>

            {/* Description */}
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

              {product.sizes && product.sizes.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = String(selectedSize) === String(size);
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
              ) : (
                <p className="text-xs text-rose-400 italic">No available sizes found for this product.</p>
              )}
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
              <span>Add to Cart — ${(currentPrice * quantity).toFixed(2)}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};