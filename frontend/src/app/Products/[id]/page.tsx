'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  rating: number;
  numReviews: number;
  reviews: Array<{
    userId: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Invalid product ID');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching product with ID:', id);
        const response = await api.get<Product>(`/products/${id}`);
        console.log('API Response:', response);
        
        if (!response?.data) {
          throw new Error('No product data received from server');
        }

        const productData = response.data;
        console.log('Raw Product Data:', productData);

        // Create a new product object with default values
        const processedProduct: Product = {
          _id: productData._id || '',
          name: productData.name || '',
          slug: productData.slug || '',
          description: productData.description || '',
          price: productData.price || 0,
          category: productData.category || '',
          stock: productData.stock || 0,
          images: productData.images || [],
          rating: productData.rating || 0,
          numReviews: productData.numReviews || 0,
          reviews: productData.reviews || [],
          featured: productData.featured || false,
          tags: productData.tags || [],
          createdAt: productData.createdAt || '',
          updatedAt: productData.updatedAt || ''
        };

        console.log('Processed Product:', processedProduct);

        // Validate required fields
        if (!processedProduct._id || !processedProduct.name || !processedProduct.price) {
          throw new Error('Invalid product data: missing required fields');
        }

        setProduct(processedProduct);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(error instanceof Error ? error.message : 'Failed to load product details');
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      await api.post('/cart', {
        productId: product._id,
        quantity: 1
      });
      router.push('/Cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        router.push('/login');
      } else {
        setError('Failed to add product to cart. Please try again.');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Product not found'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => router.push('/')} 
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Home
            </button>
            <span className="text-gray-400">/</span>
            <button 
              onClick={() => router.push('/Products')} 
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Products
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Product Images */}
            <div className="lg:w-1/2 p-6">
              <div className="bg-gray-50 rounded-xl overflow-hidden">
                <div className="aspect-square relative group">
                  <img
                    src={product.images?.[selectedImage] || product.images?.[0] || '/placeholder-image.jpg'}
                    alt={product.name}
                    className="w-full h-full object-contain p-8 transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">Out of Stock</span>
                    </div>
                  )}
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded-lg overflow-hidden transition-all duration-200
                          ${selectedImage === index 
                            ? 'ring-2 ring-indigo-500 ring-offset-2 transform scale-105' 
                            : 'border-2 border-gray-100 hover:border-indigo-300'}`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="lg:w-1/2 p-6 lg:p-8 space-y-8">
              {/* Category & Title */}
              <div className="space-y-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                  <span className="text-sm font-semibold text-indigo-700">
                    {product.category}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price & Stock */}
              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-indigo-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm font-medium text-gray-500">/unit</span>
                </div>
                <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-50 border border-gray-100">
                  <div className={`w-2.5 h-2.5 rounded-full mr-2 ${
                    product.stock > 10 ? 'bg-green-500' :
                    product.stock > 0 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className={`text-sm font-semibold ${
                    product.stock > 10 ? 'text-green-700' :
                    product.stock > 0 ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  Product Description
                </h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Product Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="pt-6">
                <button
                  onClick={addToCart}
                  disabled={isAddingToCart || product.stock <= 0}
                  className={`w-full px-6 py-4 rounded-lg font-medium transition-all duration-200 ${
                    isAddingToCart
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : product.stock > 0
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isAddingToCart ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding to cart...
                    </div>
                  ) : product.stock > 0 ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart
                    </div>
                  ) : (
                    'Out of Stock'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
