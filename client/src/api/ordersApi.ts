// src/api/ordersApi.ts
import axiosClient from './axiosClient';

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product_name?: string;
}

export interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

export const ordersApi = {
  getMyOrders: async (): Promise<Order[]> => {
    const response = await axiosClient.get('/orders/my-orders');
    return response.data?.data?.orders || response.data?.orders || response.data;
  },
};