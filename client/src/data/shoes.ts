import type { ShoeProduct } from '../types/product';

export const MOCK_SHOES: ShoeProduct[] = [
  {
    id: 'shoe-1',
    name: 'Air Jordan 1 Retro High OG',
    brand: 'Jordan',
    price: 180.0,
    description: 'The sneaker that started it all. Premium leather, iconic color blocking, and classic Air cushioning.',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
    sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 12],
  },
  {
    id: 'shoe-2',
    name: 'Yeezy Boost 350 V2',
    brand: 'Adidas',
    price: 230.0,
    description: 'Re-engineered Primeknit upper paired with full-length Boost midsole technology for peak comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    sizes: [7.5, 8, 9, 9.5, 10, 11],
  },
  {
    id: 'shoe-3',
    name: 'Nike Dunk Low Retro',
    brand: 'Nike',
    price: 115.0,
    description: 'Created for the hardwood but taken to the streets, returning with crisp overlays and original team colors.',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    sizes: [8, 8.5, 9, 10, 10.5, 11, 11.5, 12],
  },
];