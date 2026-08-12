// src/api/ordersApi.ts
import axiosClient from './axiosClient';

export interface OrderItem {
  id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  product_name?: string;
}

export interface CreateOrderPayload {
  items: Array<{
    variant_id: string;
    quantity: number;
  }>;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  city: string;
  parish_or_state: string;
  country: string;
}

export interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
  checkoutUrl?: string; // Optional field when backend creates hosted Stripe session
}

export interface CreateOrderResponse extends Order {
  checkoutUrl?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ordersApi = {
  getMyOrders: async (): Promise<Order[]> => {
    const response = await axiosClient.get('/orders');
    
    const rawData = response.data;
    if (Array.isArray(rawData)) return rawData;
    if (Array.isArray(rawData?.data?.orders)) return rawData.data.orders;
    if (Array.isArray(rawData?.orders)) return rawData.orders;
    if (Array.isArray(rawData?.data)) return rawData.data;

    return [];
  },

  createOrder: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
    // Client-side guard check for valid UUID formats
    const invalidItem = payload.items.find((item) => !UUID_REGEX.test(item.variant_id));
    if (invalidItem) {
      throw new Error(
        `Cannot submit order: Variant ID "${invalidItem.variant_id}" is not a valid database UUID. Check mock data or seed DB values.`
      );
    }

    const response = await axiosClient.post('/orders', payload);
    const data = response.data;

    // Handle nested response structures (e.g., { data: { order, checkoutUrl } } or direct payloads)
    const baseOrder = data?.data?.order || data?.order || data;
    const checkoutUrl = data?.data?.checkoutUrl || data?.checkoutUrl || baseOrder?.checkoutUrl;

    return {
      ...baseOrder,
      ...(checkoutUrl ? { checkoutUrl } : {}),
    };
  },
};