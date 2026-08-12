import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi } from '../api/ordersApi';

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
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      const payloadItems = cartItems.map((item: any) => {
        const rawVariantId =
          item.variant_id ||
          item.variantId ||
          item.variant?.id ||
          item.id;

        if (!uuidRegex.test(rawVariantId)) {
          console.warn('Invalid UUID detected in cart item:', item);
        }

        return {
          variant_id: rawVariantId,
          quantity: item.quantity,
        };
      });

      const orderPayload = {
        items: payloadItems,
        shipping_address_line1: formData.shippingAddressLine1,
        shipping_address_line2: formData.shippingAddressLine2 || undefined,
        city: formData.city,
        parish_or_state: formData.parishOrState,
        country: formData.country,
      };

      // ordersApi.createOrder already returns CreateOrderResponse directly (unwrapped from response.data)
      const response = await ordersApi.createOrder(orderPayload);

      // Clear local shopping cart state prior to external redirect
      if (clearCart) clearCart();

      // Check checkoutUrl directly on the returned object
      if (response?.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        // Fallback for unpaid/COD orders or standard confirmations
        navigate('/orders', { state: { orderSuccess: true } });
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrorMessage('Your session has expired or you are unauthorized. Please log in again.');
      } else {
        setErrorMessage(
          err.response?.data?.message || err.message || 'An unexpected error occurred while placing your order.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] bg-slate-50/50 flex flex-col items-center justify-center p-4 font-sans text-center">
        <div className="bg-white p-10 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100 max-w-md w-full">
          <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Add items to your cart before proceeding to checkout.
          </p>
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-medium py-3 px-5 rounded-xl hover:bg-slate-800 transition text-sm shadow-sm active:scale-[0.99]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Cart
          </button>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Checkout</h1>

        {errorMessage && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200/80 text-rose-800 text-sm rounded-2xl flex items-start gap-3 shadow-sm">
            <svg className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold">Unable to process order</p>
              <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmitOrder} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1e1 1 0 011 1h2m-6-1a2 2 0 002 2h2a2 2 0 002-2m0 0h2a1 1 0 001-1v-3.586a1 1 0 00-.293-.707l-2.828-2.828A1 1 0 0015.586 9H13" />
                </svg>
                <h2 className="text-lg font-bold text-slate-900">Shipping Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Address Line 1 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shippingAddressLine1"
                    required
                    value={formData.shippingAddressLine1}
                    onChange={handleInputChange}
                    placeholder="e.g., 12 Hope Road"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Address Line 2 <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="shippingAddressLine2"
                    value={formData.shippingAddressLine2}
                    onChange={handleInputChange}
                    placeholder="e.g., Apt 4B, Building C"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      City / Town <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., Kingston"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Parish / State <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="parishOrState"
                      required
                      value={formData.parishOrState}
                      onChange={handleInputChange}
                      placeholder="e.g., St. Andrew"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    disabled
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 active:scale-[0.99] transition disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Redirecting to Payment...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Proceed to Payment (${totalAmount?.toFixed(2) || '0.00'})
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">
                Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </h2>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-3 mb-4">
                {cartItems.map((item: any, index: number) => {
                  const rawSrc = item.imageUrl || item.image;
                  const hasValidImage = typeof rawSrc === 'string' && rawSrc.trim() !== '';

                  return (
                    <div key={item.variant_id || item.id || index} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-lg border border-slate-200/60 flex-shrink-0 overflow-hidden">
                        {hasValidImage ? (
                          <img 
                            src={rawSrc} 
                            alt={item.title || item.name || 'Product Image'} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                            👟
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.title || item.name || 'Item'}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Qty: {item.quantity} {item.size && `| Size: ${item.size}`}
                        </p>
                      </div>

                      <p className="text-xs font-bold text-slate-900">
                        ${((item.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-800">${totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-xl font-extrabold text-slate-900">${totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Encrypted Stripe Payment Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Direct Order Tracking & History Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};