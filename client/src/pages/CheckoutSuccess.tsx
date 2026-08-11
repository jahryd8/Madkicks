import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient'; // Use configured client
import { useCart } from '../context/CartContext';

interface OrderItem {
  title: string;
  size: string;
  quantity: number;
  price_at_purchase: number | string;
}

interface Order {
  id: number | string;
  status: string;
  total_amount: number | string;
  items?: OrderItem[];
}

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const { clearCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        // Path is /orders/${orderId} because axiosClient base URL already ends in /api
        const response = await axiosClient.get(`/orders/${orderId}`);
        setOrder(response.data.data || response.data.order);
        clearCart();
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError('Could not retrieve order details. Please check your order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center text-zinc-100">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">
          Payment Successful!
        </h1>
        <p className="mt-2 text-xs text-zinc-400">
          Thank you for your order at <span className="text-white font-bold">MadKicks</span>.
        </p>

        {orderId && (
          <div className="mt-6 bg-zinc-950/60 rounded-xl p-4 border border-zinc-800 text-left">
            <div className="flex justify-between items-center text-xs py-1">
              <span className="text-zinc-400">Order Number</span>
              <span className="font-mono text-white">#{orderId}</span>
            </div>
            {order && (
              <>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-zinc-400">Status</span>
                  <span className="capitalize text-emerald-400 font-semibold">{order.status}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1 border-t border-zinc-800 mt-2 pt-2">
                  <span className="text-zinc-300 font-medium">Total Paid</span>
                  <span className="font-bold text-white">${Number(order.total_amount).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        )}

        {error && <p className="mt-4 text-xs text-red-400">{error}</p>}

        <div className="mt-8 space-y-3">
          <Link
            to="/orders"
            className="block w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 px-4 rounded-xl transition"
          >
            View My Orders
          </Link>
          <Link
            to="/catalog"
            className="block w-full bg-zinc-800 text-zinc-300 font-medium py-3 px-4 rounded-xl hover:bg-zinc-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}