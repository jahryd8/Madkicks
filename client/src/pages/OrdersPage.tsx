import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  MapPin, 
  ShoppingBag,
  ChevronRight
} from 'lucide-react';

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const location = useLocation();
  const showSuccessBanner = location.state?.orderSuccess;

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to retrieve orders.');
      }

      const formattedOrders: Order[] = (result.data?.orders || result.orders || []).map((ord: any) => ({
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        activeTab === 'all' || order.status.toLowerCase() === activeTab.toLowerCase();

      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesStatus && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

  const getStatusBadge = (status: Order['status']) => {
    const normalizedStatus = status?.toLowerCase();

    switch (normalizedStatus) {
      case 'pending':
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            <Truck className="w-3.5 h-3.5 text-blue-500" />
            Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-4 w-72 bg-slate-200 rounded-md animate-pulse" />
          </div>
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="h-5 w-32 bg-slate-200 rounded" />
                <div className="h-6 w-24 bg-slate-200 rounded-full" />
              </div>
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 bg-slate-200 rounded-xl flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 bg-slate-200 rounded" />
                  <div className="h-3 w-1/4 bg-slate-200 rounded" />
                  <div className="h-4 w-1/6 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] bg-slate-50/50 flex flex-col items-center justify-center p-4 font-sans text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-100 max-w-md w-full">
          <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to load orders</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchOrders}
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-medium py-3 px-5 rounded-xl hover:bg-slate-800 active:scale-[0.99] transition text-sm shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order History</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track shipments, manage returns, and review prior purchases.
            </p>
          </div>

          {/* Search & Filter Bar */}
          {orders.length > 0 && (
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition"
              />
            </div>
          )}
        </div>

        {/* Success Alert Banner */}
        {showSuccessBanner && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200/80 text-emerald-900 rounded-2xl flex items-start gap-3 shadow-sm">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Order placed successfully!</p>
              <p className="text-xs text-emerald-700/90 mt-0.5">
                We’ve received your order and sent a confirmation email. We’ll notify you as soon as it ships.
              </p>
            </div>
          </div>
        )}

        {/* Status Filter Tabs */}
        {orders.length > 0 && (
          <div className="flex items-center gap-1 border-b border-slate-200 pb-2 mb-6 overflow-x-auto no-scrollbar">
            {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-12 text-center max-w-md mx-auto my-12">
            <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No orders found</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Looks like you haven't placed any orders yet. Explore our latest sneaker drops to get started.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-medium py-3 px-6 rounded-xl hover:bg-slate-800 transition text-sm shadow-sm active:scale-[0.99]"
            >
              Start Shopping
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center my-8">
            <p className="text-slate-500 text-sm">No orders match your search criteria.</p>
          </div>
        ) : (
          /* Order Cards List */
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:border-slate-300 transition"
              >
                {/* Order Header */}
                <div className="bg-slate-50/80 p-5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Order Identifier
                      </span>
                      <span className="font-mono font-semibold text-slate-900">#{order.id}</span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Date Placed
                      </span>
                      <span className="font-medium text-slate-800">{order.createdAt}</span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Total Amount
                      </span>
                      <span className="font-bold text-slate-900">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Order Items */}
                <div className="p-5 divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-200/60 flex-shrink-0 overflow-hidden relative group">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate hover:text-slate-700 transition">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>
                            Size: <strong className="text-slate-800 font-semibold">{item.size}</strong>
                          </span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>
                            Qty: <strong className="text-slate-800 font-semibold">{item.quantity}</strong>
                          </span>
                        </div>
                        <p className="text-sm font-extrabold text-slate-900 mt-2">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      {order.shippingAddress && (
                        <div className="hidden md:flex flex-col justify-center items-end text-right text-xs text-slate-500 pl-4 border-l border-slate-100 min-w-[180px]">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 mb-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            Shipping To:
                          </span>
                          <span className="truncate max-w-[160px]">{order.shippingAddress.streetAddress}</span>
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
        )}
      </div>
    </div>
  );
};