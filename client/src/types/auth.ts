export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}