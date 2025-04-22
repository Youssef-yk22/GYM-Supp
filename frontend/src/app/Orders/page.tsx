'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Order } from '@/types/order';
import { formatDate } from '@/utils/date';
import { getOrders } from '@/services/orderService';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        console.log('Orders data:', data); // Add this for debugging
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders. Please try again later.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-indigo-900 mb-8">Your Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-indigo-100">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mb-4">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">No Orders Yet</h2>
            <p className="text-indigo-700 mb-6">You haven't placed any orders yet.</p>
            <Link 
              href="/Products" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-900">Order #{order._id}</h3>
                        <p className="text-sm text-indigo-600">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-purple-600">
                        ${order.total.toFixed(2)}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-indigo-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-indigo-700 mb-2">Shipping Address</h4>
                        <p className="text-indigo-900">
                          {order.shippingAddress.street}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                          {order.shippingAddress.country} {order.shippingAddress.zipCode}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-indigo-700 mb-2">Payment Method</h4>
                        <p className="text-indigo-900 capitalize">
                          {order.paymentMethod.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
