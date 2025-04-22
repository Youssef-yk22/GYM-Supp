'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/utils/api';
import { LoginFormData } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const { setIsLoggedIn, setUserRole } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token') || Cookies.get('token');
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(tokenPayload.role);
        if (tokenPayload.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } catch (err) {
        // Invalid token, clear it
        localStorage.removeItem('token');
        Cookies.remove('token');
        setIsLoggedIn(false);
        setUserRole(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, setIsLoggedIn, setUserRole]);

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post<{ token: string }>('/auth/login', formData);
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
        if (err.message.includes('401')) {
          if (err.message.includes('deactivated')) {
            setError('Your account has been deactivated. Please contact support.');
          } else {
            setError('Invalid email or password. Please try again.');
          }
        } else if (err.message.includes('404')) {
          setError('Account not found. Please check your email or register.');
        } else {
          setError('An error occurred. Please try again later.');
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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
          <div className="px-6 py-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-2xl font-semibold text-indigo-900 text-center">
              Welcome Back
            </h2>
            <p className="mt-1 text-center text-sm text-indigo-600">
              Sign in to your account
            </p>
          </div>
          
          <div className="px-6 py-8">
            <div className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              
              <div className="space-y-4">
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
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={(e) => handleLogin(e)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-indigo-600">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 