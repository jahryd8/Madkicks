import { useState } from 'react';
import axiosClient from '../api/axiosClient';

export interface CheckoutPayload {
  cartItems: Array<{
    productId: string;
    size: number;
    quantity: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
  };
}

export interface CheckoutResponse {
  orderId: string;
  checkoutUrl?: string;
  status: string;
}

export const useCheckout = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const processCheckout = async (payload: CheckoutPayload): Promise<CheckoutResponse | undefined> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosClient.post<CheckoutResponse>('/orders/checkout', payload);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to process checkout.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { processCheckout, loading, error };
};