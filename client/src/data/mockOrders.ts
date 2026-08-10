import type { Order } from '../types/order';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-84920',
    createdAt: '2026-08-01T14:32:00Z',
    status: 'shipped',
    items: [
      {
        id: 'item-1',
        productId: 'shoe-1',
        title: 'Air Jordan 1 Retro High OG',
        price: 180.0,
        size: '10.5',
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'item-2',
        productId: 'shoe-3',
        title: 'Nike Dunk Low Retro',
        price: 115.0,
        size: '10.5',
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80',
      },
    ],
    shippingAddress: {
      fullName: 'Alex Morgan',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      postalCode: '97477',
      country: 'United States',
    },
    subtotal: 295.0,
    shippingFee: 0.0,
    tax: 23.6,
    totalAmount: 318.6,
  },
  {
    id: 'ORD-72109',
    createdAt: '2026-07-15T09:12:00Z',
    status: 'delivered',
    items: [
      {
        id: 'item-3',
        productId: 'shoe-2',
        title: 'Yeezy Boost 350 V2',
        price: 230.0,
        size: '11',
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=400&q=80',
      },
    ],
    shippingAddress: {
      fullName: 'Alex Morgan',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      postalCode: '97477',
      country: 'United States',
    },
    subtotal: 230.0,
    shippingFee: 0.0,
    tax: 18.4,
    totalAmount: 248.4,
  },
];