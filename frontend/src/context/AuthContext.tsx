'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  userRole: string | null;
  setUserRole: (value: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(tokenPayload.role);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing token:', error);
        localStorage.removeItem('token');
        setUserRole(null);
        setIsLoggedIn(false);
      }
    } else {
      setUserRole(null);
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 