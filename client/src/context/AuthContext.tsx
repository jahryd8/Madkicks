import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axiosClient from '../api/axiosClient';

// 1. Add register payload & method to the Interface
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>; // 👈 Added register method
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state on load
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await axiosClient.get('/auth/me');
          setUser(res.data.data.user || res.data.user);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  // Login Method
  const login = async (email: string, password: string) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data || res.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  // 2. Implement Register Method
  const register = async (payload: RegisterPayload) => {
    const res = await axiosClient.post('/auth/register', payload);
    const { token: newToken, user: userData } = res.data.data || res.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  // Logout Method
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};