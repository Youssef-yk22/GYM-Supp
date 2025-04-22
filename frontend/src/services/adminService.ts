import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for admin token
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for admin routes
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  topProducts: Product[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  phoneNumber?: string;
  address?: string;
  profilePicture?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  images?: string[];
  rating?: number;
  numReviews?: number;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  items: {
    productId: {
      _id: string;
      name: string;
      price: number;
      image?: string;
    };
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'superadmin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
  phoneNumber?: string;
  address?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  phoneNumber?: string;
  address?: string;
}

class AdminService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await adminApi.get<DashboardStats>('/admin/dashboard');
    return response.data;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await adminApi.get<User[]>('/admin/users');
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await adminApi.get<User>(`/admin/users/${id}`);
    return response.data;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const response = await adminApi.patch<User>(`/admin/users/${id}/status`, { isActive });
    return response.data;
  }

  async getAllProducts(): Promise<Product[]> {
    const response = await adminApi.get<Product[]>('/admin/products');
    return response.data;
  }

  async createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await adminApi.post<Product>('/admin/products', productData);
    return response.data;
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const response = await adminApi.put<Product>(`/admin/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await adminApi.delete(`/admin/products/${id}`);
  }

  async getAllOrders(): Promise<Order[]> {
    const response = await adminApi.get<Order[]>('/admin/orders');
    return response.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await adminApi.get<Order>(`/admin/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const response = await adminApi.patch<Order>(`/admin/orders/${id}/status`, { status });
    return response.data;
  }

  async createOrder(orderData: any): Promise<Order> {
    try {
      const response = await adminApi.post<Order>('/admin/orders/create', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async login(username: string, password: string): Promise<{ admin: Admin; token: string }> {
    const response = await adminApi.post<{ admin: Admin; token: string }>('/admin/login', {
      username,
      password,
    });
    return response.data;
  }

  async createAdmin(adminData: { username: string; email: string; password: string }): Promise<Admin> {
    const response = await adminApi.post<Admin>('/admin/accounts', adminData);
    return response.data;
  }

  async getCurrentAdmin(): Promise<Admin> {
    const response = await adminApi.get<Admin>('/admin/me');
    return response.data;
  }

  async getAllAdmins(): Promise<Admin[]> {
    const response = await adminApi.get<Admin[]>('/admin/accounts');
    return response.data;
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    const response = await adminApi.post<User>('/admin/users', userData);
    return response.data;
  }

  async updateUser(userId: string, userData: UpdateUserDto): Promise<User> {
    const response = await adminApi.put<User>(`/admin/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await adminApi.delete(`/admin/users/${userId}`);
  }
}

export const adminService = new AdminService(); 