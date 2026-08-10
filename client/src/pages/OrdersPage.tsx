import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  size: number | string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: 'pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: {
    streetAddress: string;
    city: string;
    state: string;
    zipCode?: string;
    country?: string;
  };
}

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const showSuccessBanner = location.state?.orderSuccess;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:5000/api/orders/my-orders', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to retrieve orders.');
        }

        // Map backend numbers and formatted dates
        const formattedOrders: Order[] = (result.data.orders || []).map((ord: any) => ({
          ...ord,
          totalAmount: Number(ord.totalAmount),
          createdAt: new Date(ord.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          items: (ord.items || []).map((item: any) => ({
            ...item,
            price: Number(item.price),
          })),
        }));

        setOrders(formattedOrders);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status: Order['status']) => {
    const normalizedStatus = status?.toLowerCase();

    switch (normalizedStatus) {
      case 'pending':
      case 'processing':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            ⏳ Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            🚚 Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✅ Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
            🚫 Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-gray-600 font-bold text-sm">
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          Loading your order history...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-center">
        <div className="bg-white p-8 rounded-xl border border-red-200 shadow-sm max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚠️
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Failed to Load Orders</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-black text-white font-bold py-3 px-6 rounded-md hover:bg-gray-800 transition text-sm w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-center">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-md w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            📦
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">No Orders Found</h2>
          <p className="text-gray-600 text-sm mb-6">
            You haven't placed any orders yet. Check out our store catalog to drop your first pair.
          </p>
          <Link
            to="/"
            className="inline-block bg-black text-white font-bold py-3 px-6 rounded-md hover:bg-gray-800 transition text-sm w-full"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order History</h1>
          <p className="text-sm text-gray-600 mt-1">Track current shipments and view previous purchases.</p>
        </div>

        {/* Success Alert Banner when coming from Checkout */}
        {showSuccessBanner && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-3">
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-sm font-bold">Thank you! Your order has been placed successfully.</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                We've sent a confirmation email and will update status when your package ships.
              </p>
            </div>
          </div>
        )}

        {/* Order Cards List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-gray-50 p-4 sm:p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div>
                    <span className="block text-xs font-bold uppercase text-gray-400">Order Number</span>
                    <span className="font-mono font-bold text-gray-900">#{order.id}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase text-gray-400">Date Placed</span>
                    <span className="font-bold text-gray-900">{order.createdAt}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase text-gray-400">Total</span>
                    <span className="font-extrabold text-gray-900">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Order Items */}
              <div className="p-4 sm:p-6 divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">👟</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Size: <span className="font-bold text-gray-800">{item.size}</span> | Qty:{' '}
                        <span className="font-bold text-gray-800">{item.quantity}</span>
                      </p>
                      <p className="text-sm font-extrabold text-gray-900 mt-2">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {order.shippingAddress && (
                      <div className="hidden sm:block text-right text-xs text-gray-500">
                        <span className="block font-bold text-gray-700 mb-1">Ships to:</span>
                        <span>{order.shippingAddress.streetAddress}</span>
                        <br />
                        <span>
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};