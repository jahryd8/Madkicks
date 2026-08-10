import React, { useState } from 'react';
import type { ShoeProduct } from '../types/product';
import { MOCK_SHOES } from '../data/shoes';
import { ShoeDetail } from '../components/ShoeDetail';

export const ProductCatalog: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<ShoeProduct | null>(null);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Latest Drops</h1>
          <p className="text-sm text-gray-600 mt-1">Authentic sneakers, ready to ship.</p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_SHOES.map((shoe) => (
            <div
              key={shoe.id}
              onClick={() => setSelectedProduct(shoe)}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="h-64 bg-gray-100 overflow-hidden relative">
                <img
                  src={shoe.imageUrl}
                  alt={shoe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold uppercase px-2 py-1 rounded">
                  {shoe.brand}
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-600 transition">
                  {shoe.name}
                </h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-black text-gray-900">${shoe.price.toFixed(2)}</span>
                  <span className="text-xs font-semibold text-gray-500">
                    {shoe.sizes.length} sizes available
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <ShoeDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};