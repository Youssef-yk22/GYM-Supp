'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  slug: string;
  images: string[];
}

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface CreateProductForm {
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  slug: string;
  images: string[];
}

export default function Dashboard() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [userForm, setUserForm] = useState<CreateUserForm>({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [productForm, setProductForm] = useState<CreateProductForm>({
    name: '',
    price: 0,
    stock: 0,
    category: 'proteins',
    description: '',
    slug: '',
    images: [],
  });
  const [imageError, setImageError] = useState<string>('');

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

        // Fetch users and products
        const [usersRes, productsRes] = await Promise.all([
          api.get<User[]>('/admin/users'),
          api.get<Product[]>('/admin/products'),
        ]);

        setUsers(usersRes.data);
        setProducts(productsRes.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setIsCheckingAuth(false);
          router.push('/login');
          return;
        }
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleUserStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive } : user
      ));
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/admin/products/${productId}`);
      setProducts(products.filter(product => product._id !== productId));
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post<User>('/admin/users', userForm);
      setUsers([...users, response.data]);
      setUserForm({ name: '', email: '', password: '', role: 'user' });
      setShowUserForm(false);
    } catch (err: any) {
      if (err.response?.data?.message?.includes('duplicate key error')) {
        setError('Email already exists. Please use a different email address.');
      } else {
        setError('Failed to create user');
      }
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post<Product>('/admin/products', productForm);
      setProducts([...products, response.data]);
      setProductForm({ 
        name: '', 
        price: 0, 
        stock: 0, 
        category: 'proteins',
        description: '', 
        slug: '',
        images: [] 
      });
      setShowProductForm(false);
    } catch (err) {
      setError('Failed to create product');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '', // Password is not pre-filled for security
      role: user.role,
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      description: product.description,
      slug: product.slug,
      images: product.images || [],
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      // Create update payload with only non-empty fields
      const updatePayload: any = {};
      if (userForm.name) updatePayload.name = userForm.name;
      if (userForm.email) updatePayload.email = userForm.email;
      if (userForm.password) updatePayload.password = userForm.password;
      if (userForm.role) updatePayload.role = userForm.role;

      const response = await api.put<User>(`/admin/users/${editingUser._id}`, updatePayload);
      setUsers(users.map(user => 
        user._id === editingUser._id ? response.data : user
      ));
      setEditingUser(null);
      setUserForm({ name: '', email: '', password: '', role: 'user' });
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const response = await api.put<Product>(`/admin/products/${editingProduct._id}`, productForm);
      setProducts(products.map(product => 
        product._id === editingProduct._id ? response.data : product
      ));
      setEditingProduct(null);
      setProductForm({ 
        name: '', 
        price: 0, 
        stock: 0, 
        category: 'proteins',
        description: '', 
        slug: '',
        images: [] 
      });
    } catch (err) {
      setError('Failed to update product');
    }
  };

  const validateImageUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Image URL is not accessible');
      }
      const contentType = response.headers.get('content-type');
      if (!contentType?.startsWith('image/')) {
        throw new Error('URL does not point to an image');
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleImageUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setProductForm({ ...productForm, images: [url] });
    
    if (url) {
      setImageError('Validating image...');
      const isValid = await validateImageUrl(url);
      if (!isValid) {
        setImageError('Invalid image URL or image is not accessible');
      } else {
        setImageError('');
      }
    } else {
      setImageError('');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-[95%] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/admin/orders')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
            >
              Manage Orders
            </button>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">User Management</h2>
              <button
                onClick={() => setShowUserForm(!showUserForm)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {showUserForm ? 'Cancel' : 'Add New User'}
              </button>
            </div>
          </div>

          {showUserForm && (
            <form onSubmit={handleCreateUser} className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleUserStatusChange(user._id, !user.isActive)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          user.isActive
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="px-3 py-1 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editingUser && (
          <form onSubmit={handleUpdateUser} className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (Leave empty to keep current)</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update User
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({ name: '', email: '', password: '', role: 'user' });
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Product Management */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Product Management</h2>
              <button
                onClick={() => setShowProductForm(!showProductForm)}
                className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
              >
                {showProductForm ? 'Cancel' : 'Add New Product'}
              </button>
            </div>
          </div>

          {showProductForm && (
            <form onSubmit={handleCreateProduct} className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="proteins" className="bg-blue-100 text-blue-800">Proteins</option>
                      <option value="creatine" className="bg-green-100 text-green-800">Creatine</option>
                      <option value="pre-workout" className="bg-purple-100 text-purple-800">Pre-Workout</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                        className="w-full pl-8 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      placeholder="product-name-url"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                    <input
                      type="url"
                      value={productForm.images[0] || ''}
                      onChange={handleImageUrlChange}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        imageError ? 'border-red-500' : 'border-gray-300'
                      } bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {imageError && (
                      <p className="mt-1 text-sm text-red-500">{imageError}</p>
                    )}
                    {productForm.images[0] && !imageError && (
                      <div className="mt-2">
                        <img
                          src={productForm.images[0]}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg shadow-md"
                          onError={() => setImageError('Failed to load image')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Create Product
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.category === 'proteins' ? 'bg-blue-100 text-blue-800' :
                        product.category === 'creatine' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="px-3 py-1 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {editingProduct && (
          <form onSubmit={handleUpdateProduct} className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="proteins" className="bg-blue-100 text-blue-800">Proteins</option>
                  <option value="creatine" className="bg-green-100 text-green-800">Creatine</option>
                  <option value="pre-workout" className="bg-purple-100 text-purple-800">Pre-Workout</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  min="0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={productForm.slug}
                  onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  placeholder="product-name-url"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={productForm.images[0] || ''}
                  onChange={handleImageUrlChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    imageError ? 'border-red-500' : 'border-gray-300'
                  } bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="https://example.com/image.jpg"
                />
                {imageError && (
                  <p className="mt-1 text-sm text-red-500">{imageError}</p>
                )}
                {productForm.images[0] && !imageError && (
                  <div className="mt-2">
                    <img
                      src={productForm.images[0]}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg shadow-md"
                      onError={() => setImageError('Failed to load image')}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Update Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ 
                    name: '', 
                    price: 0, 
                    stock: 0, 
                    category: 'proteins',
                    description: '', 
                    slug: '',
                    images: [] 
                  });
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 