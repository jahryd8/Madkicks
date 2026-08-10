export interface CartItem {
  id: string;
  productId: string | number;
  variantId: string | number;
  name: string;
  brand: string;
  price: number;
  size: string;
  imageUrl: string;
  quantity: number;
}

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>, quantityToAdd?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalAmount: number;
  totalItemCount: number;
}