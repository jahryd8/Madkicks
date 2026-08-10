import React, { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { MOCK_SHOES } from '../data/shoes';
import { 
  PlusCircle, 
  Trash2, 
  Package, 
  Tag, 
  DollarSign, 
  Image as ImageIcon, 
  AlertCircle, 
  Search,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';

const AVAILABLE_SIZES = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13];

export const AdminDashboard: React.FC = () => {
  const [products, setProducts] = useState<any[]>(MOCK_SHOES || []);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New shoe form state
  const [name, setName] = useState<string>('');
  const [brand, setBrand] = useState<string>('Nike');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSizeToggle = (size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size].sort((a, b) => a - b)
    );
  };

  const handleAddProduct = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!name.trim() || !price || parseFloat(price) <= 0) {
      setFormError('Please enter a valid product name and price.');
      return;
    }

    if (selectedSizes.length === 0) {
      setFormError('Please select at least one available size.');
      return;
    }

    const newShoe = {
      id: `shoe-${Date.now()}`,
      title: name.trim(),
      name: name.trim(),
      brand,
      price: parseFloat(price),
      description: description.trim() || 'No description provided.',
      imageUrl:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      image:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      sizes: selectedSizes,
    };

    setProducts((prev) => [newShoe, ...prev]);
    setSuccessMessage(`"${name.trim()}" published successfully!`);

    // Reset form
    setName('');
    setBrand('Nike');
    setPrice('');
    setDescription('');
    setImageUrl('');
    setSelectedSizes([]);
  };

  const handleDeleteProduct = (id: string, productTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${productTitle}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const filteredProducts = products.filter((shoe) => {
    const title = shoe.title || shoe.name || '';
    const shoeBrand = shoe.brand || '';
    const query = searchQuery.toLowerCase();
    return title.toLowerCase().includes(query) || shoeBrand.toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage sneaker inventory, publish drops, and edit active listings.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm self-start sm:self-auto">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Store Admin Mode</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Create New Product Form */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <PlusCircle className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-bold text-slate-900">Add New Drop</h2>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200/80 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Shoe Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="e.g., Travis Scott x Air Jordan 1 Low"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Brand
                  </label>
                  <select
                    value={brand}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                  >
                    <option value="Nike">Nike</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Adidas">Adidas</option>
                    <option value="Yeezy">Yeezy</option>
                    <option value="New Balance">New Balance</option>
                    <option value="Asics">Asics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                    placeholder="220.00"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detail sneaker materials, colorway, and condition..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition resize-none"
                />
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Available US Sizes <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {AVAILABLE_SIZES.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`py-2 text-xs font-bold rounded-lg border transition ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
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
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                Publish Listing
              </button>
            </form>
          </div>

          {/* Current Inventory Listing */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-slate-700" />
                <h2 className="text-lg font-bold text-slate-900">Current Inventory</h2>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full self-start sm:self-auto border border-slate-200/60">
                {products.length} {products.length === 1 ? 'Item' : 'Items'} Listed
              </span>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings by title or brand..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
              />
            </div>

            {/* Product List */}
            <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-semibold text-slate-500">No sneakers matched your search.</p>
                </div>
              ) : (
                filteredProducts.map((shoe) => {
                  const title = shoe.title || shoe.name || 'Untitled Sneaker';
                  const img = shoe.imageUrl || shoe.image;
                  const itemPrice = shoe.price || 0;
                  const sizesList = Array.isArray(shoe.sizes) ? shoe.sizes.join(', ') : 'N/A';

                  return (
                    <div key={shoe.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200/60 flex-shrink-0 overflow-hidden">
                        {img ? (
                          <img src={img} alt={title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                            👟
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          {shoe.brand || 'Unbranded'}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 truncate">{title}</h3>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">${itemPrice.toFixed(2)}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Sizes: <span className="font-medium text-slate-700">{sizesList}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteProduct(shoe.id, title)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex-shrink-0"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};