import { useState } from 'react';
import axiosClient from '../api/axiosClient';

export interface CheckoutPayload {
  cartItems: Array<{
    variant_id?: number;
    productId: string;
    size: number;
    quantity: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    postalCode?: string;
    parish_or_state?: string;
    country?: string;
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
      // 1. Map client payload to Express orderController expects
      const orderPayload = {
        items: payload.cartItems.map((item) => ({
          variant_id: item.variant_id || item.productId,
          quantity: item.quantity,
        })),
        shipping_address_line1: payload.shippingAddress.street,
        city: payload.shippingAddress.city,
        parish_or_state: payload.shippingAddress.parish_or_state || payload.shippingAddress.postalCode || 'Kingston',
        country: payload.shippingAddress.country || 'Jamaica',
      };

      // 2. Create Pending Order in PostgreSQL
      const orderRes = await axiosClient.post('/orders', orderPayload);
      const orderId = orderRes.data?.data?.order?.id || orderRes.data?.orderId;

      if (!orderId) {
        throw new Error('Failed to retrieve Order ID from server.');
      }

      // 3. Request Stripe Checkout Session URL
      const paymentRes = await axiosClient.post('/payments/create-checkout-session', {
        order_id: orderId,
      });

      const checkoutUrl = paymentRes.data?.data?.url || paymentRes.data?.url;

      if (!checkoutUrl) {
        throw new Error('No Stripe checkout URL returned from server.');
      }

      // 4. Redirect user to Stripe's Hosted Checkout page
      window.location.href = checkoutUrl;

      return {
        orderId: orderId.toString(),
        checkoutUrl,
        status: 'pending',
      };
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Failed to process checkout.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { processCheckout, loading, error };
};