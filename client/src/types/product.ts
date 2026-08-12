export interface ShoeVariant {
  id: string; // Must be string to hold PostgreSQL UUIDs
  size: number | string;
  stock_quantity?: number;
}

export interface ShoeProduct {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  sizes: (string | number)[];
  description?: string;
  variants?: ShoeVariant[]; // 👈 Added variants array
}