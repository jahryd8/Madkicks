import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

interface OrderItem {
  item_id: number;
  title: string;
  size: string;
  image_url: string;
  quantity: number;
  price_at_purchase: string | number;
}

interface OrderDetails {
  id: number;
  status: string;
  total_amount: string | number;
  shipping_address_line1: string;
  city: string;
  parish_or_state: string;
  created_at: string;
  items: OrderItem[];
}

interface CheckoutSuccessProps {
  clearCart?: () => void;
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({ clearCart }) => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear cart in state/localStorage upon successful checkout return
    if (clearCart) {
      clearCart();
    }

    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve order confirmation details.');
        }

        const data = await response.json();
        setOrder(data.data.order);
      } catch (err: any) {
        setError(err.message || 'Error fetching order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, clearCart]);

  return (
    <div className="max-w-3xl mx-auto my-12 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold">Payment Successful!</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Thank you for your purchase with MadKicks. Your order is being processed.
        </p>
      </div>

      {loading && (
        <div className="text-center py-8 text-zinc-500">Loading order summary...</div>
      )}

      {error && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {order && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400">Order Number</p>
              <p className="font-bold text-lg">#{order.id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400">Total Paid</p>
              <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                ${Number(order.total_amount).toFixed(2)} USD
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400">Status</p>
              <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {order.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">Order Summary</h2>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {order.items.map((item) => (
                <div key={item.item_id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-md border border-zinc-200 dark:border-zinc-700"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-xs text-zinc-500">Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">${(Number(item.price_at_purchase) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <h3 className="text-sm font-semibold text-zinc-500">Shipping Address</h3>
            <p className="text-sm mt-1">
              {order.shipping_address_line1}, {order.city}, {order.parish_or_state}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <Link
          to="/products"
          className="px-6 py-3 text-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold hover:opacity-90 transition"
        >
          Continue Shopping
        </Link>
        <Link
          to="/orders"
          className="px-6 py-3 text-center rounded-lg border border-zinc-300 dark:border-zinc-700 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          View All Orders
        </Link>
      </div>
    </div>
  );
};

export default CheckoutSuccess;