import { api } from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await api.get<Product[]>('/products');
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const response = await api.get<Product[]>(`/products/category/${category}`);
    return response;
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    return [];
  }
} 