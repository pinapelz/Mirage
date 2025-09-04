import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../utils/authApi';
import type { User as ApiUser, SessionResponse } from '../utils/authApi';

interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { username: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const transformApiUser = (apiUser: ApiUser): User => ({
    id: apiUser.id,
    username: apiUser.username,
    email: apiUser.email,
    isAdmin: apiUser.isAdmin,
  });

  const checkAuth = async () => {
    try {
      const response = await authApi.getSession();

      if (response.error || !response.data) {
        setUser(null);
        return;
      }

      const sessionData = response.data as SessionResponse;

      if (sessionData.authenticated && sessionData.user) {
        setUser(transformApiUser(sessionData.user));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password });

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data) {
        setUser(transformApiUser(response.data as ApiUser));
      }

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (userData: { username: string; email: string; password: string }) => {
    try {
      const response = await authApi.register(userData);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data) {
        setUser(transformApiUser(response.data as ApiUser));
      }

      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
