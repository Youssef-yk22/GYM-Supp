'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { toast } from 'react-hot-toast';

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

interface Cart {
  _id: string;
  items: CartItem[];
  total: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    paymentMethod: 'cash_on_delivery',
  });

  const DELIVERY_FEE = 10;

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get<Cart>('/cart');
      setCart(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        router.push('/login');
        return;
      }
      setError('Failed to load cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Format items array to match backend expectations
      const formattedItems = cart?.items.map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
        image: item.productId.image
      }));
      
      const subtotal = cart?.items?.reduce((total, item) => 
        total + ((item.productId?.price || 0) * item.quantity), 0) || 0;
      
      const orderData = {
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode
        },
        paymentMethod: formData.paymentMethod,
        items: formattedItems,
        total: subtotal + DELIVERY_FEE
      };
      
      console.log('Sending order data:', orderData);
      
      try {
        const response = await api.post('/orders/create', orderData);
        console.log('Response:', response.data);
        
        if (response.data) {
          toast.success('Order placed successfully!');
          setTimeout(() => {
            router.push('/Orders');
          }, 1500);
        }
      } catch (error: any) {
        console.error('Full error details:', error);
        console.error('Error response:', error.response?.data);
        
        if (error.response?.data?.message) {
          toast.error(`Error: ${error.response.data.message}`);
        } else {
          toast.error('Failed to place order. Please try again.');
        }
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">Add some products to your cart</p>
          <button
            onClick={() => router.push('/Products')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-indigo-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
            <h2 className="text-2xl font-semibold text-indigo-900 mb-6">Shipping Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-2">Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                  placeholder="Enter your street address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-2">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                  placeholder="Enter your city"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-2">State</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                  placeholder="Enter your state"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-2">Country</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                  placeholder="Enter your country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-2">Zip Code</label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                  placeholder="Enter your zip code"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-2">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 bg-white"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                Place Order
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
            <h2 className="text-2xl font-semibold text-indigo-900 mb-6">Order Summary</h2>
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item.productId._id} className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-indigo-900">{item.productId.name}</h4>
                      <p className="text-sm text-indigo-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-purple-600">
                    ${(item.productId.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              
              <div className="border-t border-indigo-100 pt-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-indigo-700">Subtotal</span>
                  <span className="text-indigo-900 font-medium">
                    ${cart?.items?.reduce((total, item) => total + ((item.productId?.price || 0) * item.quantity), 0)?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-700">Delivery Fee</span>
                  <span className="text-indigo-900 font-medium">${DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-indigo-100">
                  <span className="text-xl font-semibold text-indigo-900">Total</span>
                  <span className="text-2xl font-bold text-purple-600">
                    ${((cart?.items?.reduce((total, item) => total + ((item.productId?.price || 0) * item.quantity), 0) || 0) + DELIVERY_FEE).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}