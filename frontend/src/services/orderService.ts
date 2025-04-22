import { api } from '@/utils/api';
import { Order } from '@/types/order';

export const getOrders = async () => {
  try {
    const { data } = await api.get<Order[]>('/orders/history');
    return data;
  } catch (error) {
    throw error;
  }
};

export async function getOrder(id: string): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
}

export async function createOrder(orderData: any): Promise<Order> {
  try {
    const { data } = await api.post<Order>('/orders/create', orderData);
    return data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
  return data;
} 