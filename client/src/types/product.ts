export interface ShoeVariant {
  id: number | string;
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
  description?: string; // 👈 Add optional description
}