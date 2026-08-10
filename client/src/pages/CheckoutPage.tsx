import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Adjust import path to your CartContext

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, totalAmount } = useCart();

  const [formData, setFormData] = useState({
    shippingAddressLine1: '',
    shippingAddressLine2: '',
    city: '',
    parishOrState: '',
    country: 'Jamaica',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to place an order.');
      }

      // 1. Transform cart items to match backend expects: variant_id & quantity
      const payloadItems = cartItems.map((item) => ({
        variant_id: item.variantId || item.id,
        quantity: item.quantity,
      }));

      // 2. Prepare request payload
      const orderPayload = {
        items: payloadItems,
        shipping_address_line1: formData.shippingAddressLine1,
        shipping_address_line2: formData.shippingAddressLine2,
        city: formData.city,
        parish_or_state: formData.parishOrState,
        country: formData.country,
      };

      // 3. Dispatch POST request to Express backend
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to place order.');
      }

      // 4. Reset cart state and redirect on success
      if (clearCart) clearCart();

      navigate('/orders', { state: { orderSuccess: true } });
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-6">Checkout</h1>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-bold">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-3">Shipping Information</h2>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              name="shippingAddressLine1"
              required
              value={formData.shippingAddressLine1}
              onChange={handleInputChange}
              placeholder="e.g., 12 Hope Road"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
              Address Line 2 (Optional)
            </label>
            <input
              type="text"
              name="shippingAddressLine2"
              value={formData.shippingAddressLine2}
              onChange={handleInputChange}
              placeholder="e.g., Apt 4B"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                City / Town *
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g., Kingston"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Parish / State *
              </label>
              <input
                type="text"
                name="parishOrState"
                required
                value={formData.parishOrState}
                onChange={handleInputChange}
                placeholder="e.g., St. Andrew"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
              disabled
            />
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-base font-bold text-gray-700">Total Due</span>
              <span className="text-2xl font-black text-gray-900">${totalAmount?.toFixed(2) || '0.00'}</span>
            </div>

            <button
              type="submit"
              disabled={submitting || cartItems.length === 0}
              className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Order...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};