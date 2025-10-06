import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../config/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - in production this would come from your backend
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@theloftscreening.com',
    role: {
      id: 'admin',
      name: 'Administrator',
      permissions: [
        { id: '1', name: 'All Access', resource: '*', action: '*' }
      ]
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Manager',
    email: 'manager@theloftscreening.com',
    role: {
      id: 'manager',
      name: 'Manager',
      permissions: [
        { id: '2', name: 'Orders Management', resource: 'orders', action: 'read,write' },
        { id: '3', name: 'Reports Access', resource: 'reports', action: 'read' },
        { id: '4', name: 'Menu Management', resource: 'menu', action: 'read,write' }
      ]
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Cashier',
    email: 'cashier@theloftscreening.com',
    role: {
      id: 'cashier',
      name: 'Cashier',
      permissions: [
        { id: '5', name: 'POS Access', resource: 'pos', action: 'read,write' },
        { id: '6', name: 'Orders Create', resource: 'orders', action: 'read,write' }
      ]
    },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      debugger
      const response = await apiClient.login(email, password);
      setUser(response.user);
      localStorage.setItem('userData', JSON.stringify(response.user));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    apiClient.clearToken();
    localStorage.removeItem('userData');
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;

    // Admin has all permissions
    if (user.role.name === 'Administrator') return true;

    return user.role.permissions.some(permission => {
      if (permission.resource === '*') return true;
      if (permission.resource === resource) {
        if (permission.action === '*') return true;
        return permission.action.split(',').some(a => a.trim() === action);
      }
      return false;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission }}>
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