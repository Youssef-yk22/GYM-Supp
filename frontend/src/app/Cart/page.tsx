'use client';

import { useEffect, useState } from 'react';
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
  price?: number;
  addedAt?: string;
}

interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  total: number;
  lastUpdated: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await api.get<Cart>('/cart');
      console.log('Cart data:', data);
      setCart(data.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        router.push('/login');
        return;
      }
      setError('Failed to fetch your cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (updatingItems[productId]) return;
    
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    try {
      const newQuantity = Math.max(1, Math.min(10, quantity));
      
      await api.put(`/cart/${encodeURIComponent(productId)}`, {
        quantity: newQuantity
      });
      await fetchCart();
      setError(null);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized')) {
          router.push('/login');
          return;
        }
        if (error.message.includes('stock')) {
          setError('Not enough stock available');
          return;
        }
        if (error.message.includes('Maximum quantity')) {
          setError('Maximum quantity per item is 10');
          return;
        }
        if (error.message.includes('Invalid product ID')) {
          setError('Invalid product ID. Please try again.');
          return;
        }
      }
      setError('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const removeItem = async (productId: string) => {
    if (updatingItems[productId]) return;

    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    try {
      await api.delete(`/cart/${encodeURIComponent(productId)}`);
      await fetchCart();
      setError(null);
    } catch (error) {
      console.error('Failed to remove item:', error);
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        router.push('/login');
        return;
      }
      setError('Failed to remove item. Please try again.');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
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

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-indigo-900 mb-8">Shopping Cart</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}
          
          {!cart || !cart.items || cart.items.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-indigo-100">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mb-4">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">Your cart is empty</h2>
              <p className="text-indigo-700 mb-6">Looks like you haven't added any products to your cart yet.</p>
              <button
                onClick={() => router.push('/Products')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
              <div className="px-6 py-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="text-lg font-semibold text-indigo-900">Cart Items ({cart.items.length})</h3>
              </div>
              
              <div className="divide-y divide-indigo-100">
                {cart.items.map((item) => (
                  <div key={item.productId._id} className="p-6 hover:bg-indigo-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-indigo-900">{item.productId.name}</h4>
                        <p className="text-lg font-semibold text-purple-600">
                          ${(item.productId.price || 0).toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border-2 border-indigo-200 rounded-lg overflow-hidden bg-white shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.productId._id, Math.max(1, item.quantity - 1))}
                            disabled={updatingItems[item.productId._id]}
                            className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId._id, parseInt(e.target.value))}
                            disabled={updatingItems[item.productId._id]}
                            className="w-20 text-center border-x-2 border-indigo-200 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-lg font-semibold text-indigo-900"
                          />
                          <button
                            onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                            disabled={updatingItems[item.productId._id]}
                            className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.productId._id)}
                          disabled={updatingItems[item.productId._id]}
                          className="p-2 text-indigo-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-indigo-900">Order Summary</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    ${cart.items.reduce((total, item) => total + ((item.productId.price || 0) * item.quantity), 0).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-indigo-900 mb-8">Shopping Cart</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
        
        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-indigo-100">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mb-4">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">Your cart is empty</h2>
            <p className="text-indigo-700 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <button
              onClick={() => router.push('/Products')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
            <div className="px-6 py-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-lg font-semibold text-indigo-900">Cart Items ({cart.items.length})</h3>
            </div>
            
            <div className="divide-y divide-indigo-100">
              {cart.items.map((item) => (
                <div key={item.productId._id} className="p-6 hover:bg-indigo-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-indigo-900">{item.productId.name}</h4>
                      <p className="text-lg font-semibold text-purple-600">
                        ${(item.productId.price || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border-2 border-indigo-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.productId._id, Math.max(1, item.quantity - 1))}
                          disabled={updatingItems[item.productId._id]}
                          className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId._id, parseInt(e.target.value))}
                          disabled={updatingItems[item.productId._id]}
                          className="w-20 text-center border-x-2 border-indigo-200 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-lg font-semibold text-indigo-900"
                        />
                        <button
                          onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                          disabled={updatingItems[item.productId._id]}
                          className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 transition-colors disabled:opacity-50"
                        >
                          <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.productId._id)}
                        disabled={updatingItems[item.productId._id]}
                        className="p-2 text-indigo-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-indigo-900">Order Summary</h3>
                <p className="text-2xl font-bold text-purple-600">
                  ${cart.items.reduce((total, item) => total + ((item.productId.price || 0) * item.quantity), 0).toFixed(2)}
                </p>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
