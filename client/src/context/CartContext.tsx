import { createContext, useContext, useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import type { CartItem, CartContextType } from '../types/cart';

const CART_STORAGE_KEY = 'madkicks_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cartItems]);

  // Unique ID by variantId
  const createCartItemId = (variantId: number | string): string => {
    return `var-${variantId}`;
  };

  const addToCart = (
    item: Omit<CartItem, 'id' | 'quantity'>,
    quantityToAdd: number = 1
  ): void => {
    const targetId = createCartItemId(item.variantId);

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((i) => i.id === targetId);

      if (existingItemIndex > -1) {
        const updated = [...prevItems];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: updated[existingItemIndex].quantity + quantityToAdd,
        };
        return updated;
      }

      return [
        ...prevItems,
        {
          ...item,
          id: targetId,
          quantity: quantityToAdd,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string): void => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number): void => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Clears state and cleans up local storage immediately
  const clearCart = (): void => {
    setCartItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear cart from localStorage:', error);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        totalAmount: subtotal, // Exposing totalAmount as alias to subtotal
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};