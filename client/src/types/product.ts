export interface ShoeVariant {
  id: number | string;
  size: number | string;
  stock_quantity?: number;
}

export interface ShoeProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  sizes: (number | string)[];
  variants?: ShoeVariant[]; // Added to map database variant IDs
}