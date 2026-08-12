// src/data/shoes.ts
import type { ShoeProduct } from '../types/product';

export const MOCK_SHOES: ShoeProduct[] = [
  {
    // PostgreSQL Product ID: Air Jordan 1 Retro High OG
    id: 'd3c1575a-9c72-4156-9509-2a2ee4dd868e',
    name: 'Air Jordan 1 Retro High OG',
    brand: 'Jordan',
    price: 180.0,
    description: 'The sneaker that started it all. Premium leather, iconic color blocking, and classic Air cushioning.',
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
    sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 12],
    variants: [
      { size: 8, id: 'b646c310-dd30-4571-92c6-35d3eab3e63b' },
      { size: 8.5, id: 'ddcde438-5637-4b22-ae29-13b05faf18df' },
      { size: 9, id: '88fd1788-147f-4f76-bb2e-65c3abe1682f' },
      { size: 9.5, id: 'b591e2ff-3565-4c70-a9ab-af7ec4f9c8e9' },
      { size: 10, id: '211ed2fc-997f-4d29-aac3-15ef10518729' },
      { size: 10.5, id: 'abf81438-6831-4f77-8719-1d639afc5034' },
      { size: 11, id: '8c19dd35-5c2c-4a3c-80e0-e6ad89b61f7d' },
      { size: 12, id: 'e90a81b5-3767-4f07-b68f-c50d4d493f93' },
    ],
  },
  {
    // PostgreSQL Product ID: Yeezy Boost 350 V2
    id: '2e0a673d-1ed2-4f42-a026-3e917151b960',
    name: 'Yeezy Boost 350 V2',
    brand: 'Adidas',
    price: 230.0,
    description: 'Re-engineered Primeknit upper paired with full-length Boost midsole technology for peak comfort.',
    imageUrl: '/images/shoes/adidas_YEEZY_350_V2_RB.webp',
    sizes: [7.5, 8, 9, 9.5, 10, 11],
    variants: [
      { size: 7.5, id: '330fc377-60a7-40fe-8c66-618264b81fb2' },
      { size: 8, id: 'bdeae57f-fabd-4d42-b06f-3d1bf2dfd6c8' },
      { size: 9, id: '6a3085a9-dbd5-4c66-b27f-fd033e893781' },
      { size: 9.5, id: '58951c06-5d0c-4a72-9005-70c2c348cbd1' },
      { size: 10, id: '28b7fd18-563c-48f4-bdb6-876ed0631108' },
      { size: 11, id: 'a179249f-ae06-497d-b72f-912e12678f9a' },
    ],
  },
  {
    // PostgreSQL Product ID: Nike Dunk Low Retro
    id: '27bdfa7f-c5b6-443c-b878-d8f43cec09f1',
    name: 'Nike Dunk Low Retro',
    brand: 'Nike',
    price: 115.0,
    description: 'Created for the hardwood but taken to the streets, returning with crisp overlays and original team colors.',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    sizes: [8, 8.5, 9, 10, 10.5, 11, 11.5, 12],
    variants: [
      { size: 8, id: '667ce59d-9703-4af3-8e48-b06eb6dc6860' },
      { size: 8.5, id: '4bd3dd79-e92f-4c2d-aefa-01d38db1606e' },
      { size: 9, id: '0f123232-86e0-42ff-8960-a5ab6608b5ec' },
      { size: 10, id: '2ebddca7-3237-4ec8-95df-0b5e5e63918b' },
      { size: 10.5, id: 'ab00bf17-3f5c-4ff0-afc7-452877ba8f41' },
      { size: 11, id: '956201c6-020c-4154-8fb4-36a7968ded96' },
      { size: 11.5, id: '39c0154a-b4ae-467d-ad02-14307cde4f3c' },
      { size: 12, id: '2aca75e7-daca-419d-9580-9ffdb44ad88a' },
    ],
  },
];