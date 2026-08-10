import React from 'react';
import type { OrderStatus } from '../types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const styles: Record<OrderStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100 border-yellow-200', text: 'text-yellow-800', label: 'Pending' },
    processing: { bg: 'bg-blue-100 border-blue-200', text: 'text-blue-800', label: 'Processing' },
    shipped: { bg: 'bg-purple-100 border-purple-200', text: 'text-purple-800', label: 'Shipped' },
    delivered: { bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-800', label: 'Delivered' },
    cancelled: { bg: 'bg-rose-100 border-rose-200', text: 'text-rose-800', label: 'Cancelled' },
  };

  const current = styles[status] || styles.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${current.bg} ${current.text} uppercase tracking-wider`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {current.label}
    </span>
  );
};