'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  address?: string;
  profilePicture?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get<UserProfile>('/auth/profile');
        setProfile(data.data);
        setEditForm({
          name: data.data.name,
          email: data.data.email,
          phoneNumber: data.data.phoneNumber || '',
          address: data.data.address || '',
        });
        setError(null);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch profile');
        if (error instanceof Error && error.message.includes('login')) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.put<UserProfile>('/auth/profile', editForm);
      setProfile(response.data);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete('/auth/profile');
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear cookies by setting an expired date
      const pastDate = new Date(0).toUTCString();
      document.cookie = `token=;expires=${pastDate};path=/`;
      document.cookie = `token=;expires=${pastDate};path=/admin`;
      document.cookie = `token=;expires=${pastDate};path=/admin/dashboard`;
      document.cookie = `user=;expires=${pastDate};path=/`;
      document.cookie = `user=;expires=${pastDate};path=/admin`;
      document.cookie = `user=;expires=${pastDate};path=/admin/dashboard`;
      
      // Update auth state to trigger navbar update
      setIsLoggedIn(false);
      
      router.push('/login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete profile');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-indigo-100">
          <div className="px-6 py-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-semibold text-indigo-900">Profile Information</h3>
                <p className="mt-1 text-indigo-600">Manage your personal details</p>
              </div>
              <div className="flex space-x-4">
                {!isEditing ? (
                  <>
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                    >
                      Delete Account
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-indigo-700 mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-indigo-700 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-indigo-700 mb-2">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="address" className="block text-sm font-medium text-indigo-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      id="address"
                      rows={3}
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <h4 className="text-sm font-medium text-indigo-700">Full name</h4>
                    <p className="mt-1 text-lg text-indigo-900">{profile?.name}</p>
                  </div>
                  <div className="sm:col-span-3">
                    <h4 className="text-sm font-medium text-indigo-700">Email address</h4>
                    <p className="mt-1 text-lg text-indigo-900">{profile?.email}</p>
                  </div>
                  <div className="sm:col-span-3">
                    <h4 className="text-sm font-medium text-indigo-700">Role</h4>
                    <p className="mt-1 text-lg text-indigo-900 capitalize">{profile?.role}</p>
                  </div>
                  {profile?.phoneNumber && (
                    <div className="sm:col-span-3">
                      <h4 className="text-sm font-medium text-indigo-700">Phone Number</h4>
                      <p className="mt-1 text-lg text-indigo-900">{profile.phoneNumber}</p>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="sm:col-span-6">
                      <h4 className="text-sm font-medium text-indigo-700">Address</h4>
                      <p className="mt-1 text-lg text-indigo-900">{profile.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 