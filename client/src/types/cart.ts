export interface CartItem {
  id: string; // Unique combination key (e.g. "variant-101")
  productId: string | number;
  variantId: number | string; // DB product_variants.id needed for POST /api/orders
  title: string;
  price: number;
  size: number | string;
  quantity: number;
  imageUrl?: string;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    item: Omit<CartItem, 'id' | 'quantity'>,
    quantityToAdd?: number
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalAmount: number; // Added to satisfy CheckoutPage.tsx
  totalItemCount: number;
}