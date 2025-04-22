'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/utils/api';
import { RegisterFormData } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';

export default function RegisterPage() {
  const router = useRouter();
  const { setIsLoggedIn, setUserRole } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post<{ token: string }>('/auth/register', formData);
      const token = response.data.token;
      
      // Store token in both localStorage and cookies
      localStorage.setItem('token', token);
      Cookies.set('token', token, { expires: 7 }); // Expires in 7 days
      
      // Decode the token to get user role
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userRole = tokenPayload.role;
      
      // Update auth state
      setIsLoggedIn(true);
      setUserRole(userRole);
      
      // Redirect based on role
      router.push(userRole === 'admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('409')) {
          setError('This email is already registered. Please try logging in or use a different email.');
        } else if (err.message.includes('400')) {
          setError('Please check your input. Make sure your password is strong enough and all fields are filled correctly.');
        } else if (err.message.includes('422')) {
          setError('Invalid email format. Please enter a valid email address.');
        } else {
          setError('An error occurred during registration. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      localStorage.removeItem('token');
      Cookies.remove('token');
      setIsLoggedIn(false);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
          <div className="px-6 py-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-2xl font-semibold text-indigo-900 text-center">
              Create Your Account
            </h2>
            <p className="mt-1 text-center text-sm text-indigo-600">
              Join our fitness community
            </p>
          </div>
          
          <div className="px-6 py-8">
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}>
              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-indigo-700 mb-1">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-indigo-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-indigo-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    'Create account'
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-indigo-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 