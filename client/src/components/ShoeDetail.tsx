import React, { useState } from 'react';
import type { ShoeProduct } from '../types/product';
import { useCart } from '../context/CartContext';

interface ShoeDetailProps {
  product: ShoeProduct | null;
  onClose: () => void;
}

export const ShoeDetail: React.FC<ShoeDetailProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  
  // Track selected variant/size object instead of just size
  const [selectedVariantId, setSelectedVariantId] = useState<number | string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handleAddToCart = () => {
    setError(null);

    if (!selectedVariantId || !selectedSize) {
      setError('Please select a size first.');
      return;
    }

    addToCart(
      {
        productId: product.id,
        variantId: selectedVariantId, // <-- Pass variantId to satisfy updated CartItem type
        title: product.name,
        price: product.price,
        size: selectedSize,
        imageUrl: product.imageUrl,
      },
      1
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black font-bold text-lg"
        >
          ✕
        </button>

        {/* Product Info */}
        <div className="h-56 bg-gray-100 rounded-xl overflow-hidden mb-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-2xl font-black text-gray-900">{product.name}</h2>
        <p className="text-xl font-bold text-gray-900 mt-1">${product.price.toFixed(2)}</p>

        {/* Size Selection */}
        <div className="mt-6">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
            Select Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {/* 
              If product.variants exists, map variants.
              Fallback to product.sizes if using mockup objects with size/variantId pairs.
            */}
            {(product.variants || product.sizes)?.map((v: any) => {
              // Handle both object variant structure { id, size } and simple size values
              const variantId = typeof v === 'object' ? v.id : `${product.id}-${v}`;
              const sizeValue = typeof v === 'object' ? v.size : v;
              const isSelected = selectedVariantId === variantId;

              return (
                <button
                  key={variantId}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(variantId);
                    setSelectedSize(sizeValue);
                    setError(null);
                  }}
                  className={`py-2 rounded-lg font-bold text-sm border transition ${
                    isSelected
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-black'
                  }`}
                >
                  US {sizeValue}
                </button>
              );
            })}
          </div>
          {error && <p className="text-xs font-bold text-red-600 mt-2">{error}</p>}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-6 w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};