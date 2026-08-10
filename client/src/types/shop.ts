export interface CartItem {
  variant_id: string;
  product_title: string;
  size: number | string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface ShippingAddress {
  shipping_address_line1: string;
  shipping_address_line2?: string;
  city: string;
  parish_or_state: string;
  country: string;
}

export interface CartContextType {
  cartItems: CartItem[];
  clearCart: () => void;
  subtotal: number;
}