// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import axiosClient from '../api/axiosClient';

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
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('token');
    return saved && saved !== 'undefined' && saved !== 'null' ? saved : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Clean helper to extract token regardless of backend payload structure
  const extractTokenAndUser = (responseData: any) => {
    const payload = responseData?.data || responseData;

    const extractedToken =
      payload?.token ||
      payload?.accessToken ||
      payload?.jwt ||
      responseData?.token ||
      responseData?.accessToken;

    const extractedUser = payload?.user || responseData?.user || null;

    if (!extractedToken || typeof extractedToken !== 'string' || extractedToken === 'undefined') {
      console.error('Login/Register API response payload:', responseData);
      throw new Error('Authentication succeeded, but no valid token string was returned by the server.');
    }

    return { newToken: extractedToken, userData: extractedUser };
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token && token !== 'undefined') {
        try {
          const res = await axiosClient.get('/auth/me');
          setUser(res.data.data?.user || res.data.user || res.data);
        } catch {
          logout();
        }
      } else if (token === 'undefined') {
        logout();
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    const { newToken, userData } = extractTokenAndUser(res.data);

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const register = async (payload: RegisterPayload) => {
    const res = await axiosClient.post('/auth/register', payload);
    const { newToken, userData } = extractTokenAndUser(res.data);

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

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