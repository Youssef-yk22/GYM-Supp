'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface OrderUser {
  _id: string;
  name: string;
  email: string;
}

interface OrderProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  userId: string;
  items: OrderProduct[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  total: number;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<Record<string, OrderUser>>({});

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsCheckingAuth(false);
        router.push('/login');
        return;
      }

      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        if (tokenPayload.role !== 'admin') {
          setIsCheckingAuth(false);
          router.push('/');
          return;
        }

        console.log('Fetching orders...');
        const response = await api.get<Order[]>('/admin/orders');
        console.log('Orders response:', response);

        if (!response || !response.data || !Array.isArray(response.data)) {
          console.error('Invalid response format');
          setError('Invalid response format');
          setOrders([]);
          return;
        }

        setOrders(response.data);

        // Fetch user details for each order
        const uniqueUserIds = [...new Set(response.data.map(order => order.userId))];
        const userDetailsPromises = uniqueUserIds.map(async (userId) => {
          try {
            const userResponse = await api.get<OrderUser>(`/admin/users/${userId}`);
            return { [userId]: userResponse.data };
          } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
            return { [userId]: { _id: userId, name: 'Unknown User', email: 'N/A' } };
          }
        });

        const userDetailsResults = await Promise.all(userDetailsPromises);
        const mergedUserDetails = userDetailsResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setUserDetails(mergedUserDetails);

      } catch (err: any) {
        console.error('Error fetching orders:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setIsCheckingAuth(false);
          router.push('/login');
          return;
        }
        setError('Failed to fetch orders: ' + (err.message || 'Unknown error'));
        setOrders([]);
      } finally {
        setLoading(false);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      setEditingOrderId(null);
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-red-50 p-4 rounded-lg shadow-md">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  console.log('Current orders state:', orders);

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Order Management</h1>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-500">No orders found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-[95%] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
            >
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-gray-800">Order Management</h1>
          </div>
          <div className="text-sm text-gray-500">
            Total Orders: <span className="font-semibold text-indigo-600">{orders.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-48">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-48">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-64">Shipping Address</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-96">Products</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-32">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-32">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-32">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-40">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider w-48">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-indigo-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded">
                        {order._id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {userDetails[order.userId]?.name || 'Loading...'}
                      </div>
                      <div className="text-sm text-indigo-600">
                        {userDetails[order.userId]?.email || 'Loading...'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 space-y-1">
                        <div className="font-medium break-words">{order.shippingAddress.street}</div>
                        <div className="text-gray-600 break-words">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                        <div className="text-gray-500 break-words">
                          {order.shippingAddress.country} {order.shippingAddress.zipCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium break-words">{item.name}</div>
                              <div className="text-gray-600">Qty: {item.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-indigo-600">
                        ${order.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {order.paymentMethod.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <button
                          onClick={() => setEditingOrderId(editingOrderId === order._id ? null : order._id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                        >
                          Edit
                        </button>
                        
                        {editingOrderId === order._id && (
                          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              <button
                                onClick={() => handleStatusChange(order._id, 'pending')}
                                className="block w-full text-left px-4 py-2 text-sm text-yellow-800 hover:bg-yellow-50"
                                role="menuitem"
                              >
                                Set as Pending
                              </button>
                              <button
                                onClick={() => handleStatusChange(order._id, 'processing')}
                                className="block w-full text-left px-4 py-2 text-sm text-blue-800 hover:bg-blue-50"
                                role="menuitem"
                              >
                                Set as Processing
                              </button>
                              <button
                                onClick={() => handleStatusChange(order._id, 'shipped')}
                                className="block w-full text-left px-4 py-2 text-sm text-purple-800 hover:bg-purple-50"
                                role="menuitem"
                              >
                                Set as Shipped
                              </button>
                              <button
                                onClick={() => handleStatusChange(order._id, 'delivered')}
                                className="block w-full text-left px-4 py-2 text-sm text-green-800 hover:bg-green-50"
                                role="menuitem"
                              >
                                Set as Delivered
                              </button>
                              <button
                                onClick={() => handleStatusChange(order._id, 'cancelled')}
                                className="block w-full text-left px-4 py-2 text-sm text-red-800 hover:bg-red-50"
                                role="menuitem"
                              >
                                Set as Cancelled
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 