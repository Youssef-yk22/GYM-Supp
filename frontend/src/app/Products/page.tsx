'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/utils/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  products: Product[];
  total: number;
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get<ApiResponse>('/products');
        console.log('API Response:', response); // Debug log
        const productsArray = Array.isArray(response.data.products) ? response.data.products : [];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
      filterProducts(category);
    } else {
      setSelectedCategory('all');
      setFilteredProducts(products);
    }
  }, [searchParams, products]);

  const filterProducts = (category: string) => {
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
      setFilteredProducts(filtered);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterProducts(category);
    router.push(`/Products${category !== 'all' ? `?category=${category}` : ''}`);
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
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Premium Fitness Supplements
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            Discover our carefully curated selection of high-quality supplements to support your fitness journey.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filters */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-indigo-200'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => handleCategoryChange('proteins')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'proteins'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-blue-200'
              }`}
            >
              Protein Powders
            </button>
            <button
              onClick={() => handleCategoryChange('pre-workout')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'pre-workout'
                  ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-purple-200'
              }`}
            >
              Pre-Workouts
            </button>
            <button
              onClick={() => handleCategoryChange('creatine')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'creatine'
                  ? 'bg-green-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-green-200'
              }`}
            >
              Creatine
            </button>
            <button
              onClick={() => handleCategoryChange('amino-acids')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'amino-acids'
                  ? 'bg-red-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-red-200'
              }`}
            >
              Amino Acids
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <div 
              key={product._id} 
              className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
            >
              <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-400 text-sm font-medium">No Image Available</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.stock > 10 ? 'bg-green-100 text-green-800' :
                    product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.stock} in stock
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.category === 'proteins' ? 'bg-blue-100 text-blue-800' :
                    product.category === 'creatine' ? 'bg-green-100 text-green-800' :
                    product.category === 'pre-workout' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.category}
                  </span>
                  <p className="text-2xl font-bold text-indigo-600">${product.price.toFixed(2)}</p>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2">{product.description}</p>
                <button
                  onClick={() => router.push(`/Products/${product._id}`)}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  View Details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {Array.isArray(filteredProducts) && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">No products found</h3>
            <p className="mt-3 text-base text-gray-500 max-w-md mx-auto">
              Try changing your filters or check back later for new products.
            </p>
            <button
              onClick={() => handleCategoryChange('all')}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
