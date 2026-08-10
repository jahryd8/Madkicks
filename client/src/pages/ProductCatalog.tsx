import React, { useState, useMemo } from 'react';
import type { ShoeProduct } from '../types/product';
import { MOCK_SHOES } from '../data/shoes';
import { ShoeDetail } from '../components/ShoeDetail';

export const ProductCatalog: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<ShoeProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');

  // Extract unique brands dynamically
  const brands = useMemo(() => {
    const set = new Set(MOCK_SHOES.map((s) => s.brand));
    return ['All', ...Array.from(set)];
  }, []);

  // Filter products by brand and search query
  const filteredShoes = useMemo(() => {
    return MOCK_SHOES.filter((shoe) => {
      const matchesBrand = selectedBrand === 'All' || shoe.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchesSearch =
        shoe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shoe.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBrand && matchesSearch;
    });
  }, [searchQuery, selectedBrand]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-zinc-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Inventory
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
              Latest <span className="text-zinc-500">Drops</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Verified 100% authentic sneakers. Direct from the vault.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[280px]">
            <input
              type="text"
              placeholder="Search kicks or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 rounded-xl border border-zinc-800 bg-zinc-900/90 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
            />
            <svg
              className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Brand Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {brands.map((brand) => {
            const isActive = selectedBrand === brand;
            return (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-white text-black border-white shadow-lg shadow-white/5'
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
              >
                {brand}
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredShoes.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <p className="text-base font-semibold text-zinc-300">No sneakers found</p>
            <p className="text-xs text-zinc-500 mt-1">Try tweaking your search or brand filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBrand('All');
              }}
              className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShoes.map((shoe) => (
            <div
              key={shoe.id}
              onClick={() => setSelectedProduct(shoe)}
              className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/50 transition duration-300 cursor-pointer group flex flex-col justify-between relative"
            >
              {/* Product Image Area */}
              <div className="h-72 bg-zinc-950/80 overflow-hidden relative p-4 flex items-center justify-center">
                <img
                  src={shoe.imageUrl}
                  alt={shoe.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition duration-500 ease-out"
                />

                {/* Brand Pill */}
                <span className="absolute top-3 left-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                  {shoe.brand}
                </span>

                {/* Quick View Tag on Hover */}
                <span className="absolute bottom-3 right-3 bg-white/90 text-black text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition duration-200 transform translate-y-2 group-hover:translate-y-0">
                  Quick View
                </span>
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between bg-zinc-900">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-zinc-300 transition line-clamp-1">
                    {shoe.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {shoe.sizes.length} Sizes in Vault
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Price</span>
                    <span className="text-lg font-black text-white">${shoe.price.toFixed(2)}</span>
                  </div>

                  <button className="px-3.5 py-2 bg-zinc-800 group-hover:bg-white group-hover:text-black text-white text-xs font-bold rounded-xl transition duration-200">
                    Select Size
                  </button>
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