import React, { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import type { ShoeProduct } from '../types/product';
import { MOCK_SHOES } from '../data/shoes';

const AVAILABLE_SIZES = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13];

export const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<ShoeProduct[]>(MOCK_SHOES);

  // New shoe form state
  const [name, setName] = useState<string>('');
  const [brand, setBrand] = useState<string>('Nike');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSizeToggle = (size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size].sort((a, b) => a - b)
    );
  };

  const handleAddProduct = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price || parseFloat(price) <= 0) {
      setFormError('Please enter a valid product name and price.');
      return;
    }

    if (selectedSizes.length === 0) {
      setFormError('Please select at least one available size.');
      return;
    }

    const newShoe: ShoeProduct = {
      id: `shoe-${Date.now()}`,
      name: name.trim(),
      brand,
      price: parseFloat(price),
      description: description.trim() || 'No description provided.',
      imageUrl:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      sizes: selectedSizes,
    };

    setProducts((prev) => [newShoe, ...prev]);

    // Reset form
    setName('');
    setBrand('Nike');
    setPrice('');
    setDescription('');
    setImageUrl('');
    setSelectedSizes([]);
    setFormError(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Manage inventory, add drops, and remove listings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create New Product Form */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>🔥</span> Add New Shoe Listing
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Shoe Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="e.g. Travis Scott x Air Jordan 1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-black transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Brand</label>
                  <select
                    value={brand}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-black bg-white transition"
                  >
                    <option value="Nike">Nike</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Adidas">Adidas</option>
                    <option value="Yeezy">Yeezy</option>
                    <option value="New Balance">New Balance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                    placeholder="200.00"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-black transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Enter details about materials, release, and colorway..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-black transition resize-none"
                />
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-2">
                  Available Sizes (US)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {AVAILABLE_SIZES.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`py-1.5 text-xs font-bold rounded border transition ${
                          isSelected
                            ? 'bg-black text-white border-black'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-md transition text-sm"
              >
                Publish Listing
              </button>
            </form>
          </div>

          {/* Current Inventory Table */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Current Listings</h2>
              <span className="text-xs font-bold bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                {products.length} Items
              </span>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto pr-1">
              {products.map((shoe) => (
                <div key={shoe.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                    <img src={shoe.imageUrl} alt={shoe.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                      {shoe.brand}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 truncate">{shoe.name}</h3>
                    <p className="text-xs font-extrabold text-gray-900 mt-0.5">${shoe.price.toFixed(2)}</p>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      Sizes: {shoe.sizes.join(', ')}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteProduct(shoe.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md text-xs font-bold transition flex-shrink-0"
                    title="Delete product"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};