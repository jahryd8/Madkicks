import axiosClient from './axiosClient';
import type { User } from '../types/auth';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosClient.get<{ user: User }>('/auth/me');
    return response.data.user;
  },
};