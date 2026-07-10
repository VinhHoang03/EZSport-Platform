import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username?: string;
  email?: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role?: string;
  loyaltyPoints?: number;
  createdAt?: string;
  venueIds?: string[];
  shopAddress?: string;
  shopLat?: number;
  shopLng?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankQrCode?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_BASE = rawBase.replace(/\/$/, '') + (rawBase.endsWith('/api') ? '' : '/api');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // On mount: re-fetch user profile from server to sync latest changes (venueIds, etc.)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return;

    axios.get(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then(res => {
        const serverUser = res.data?.data;
        if (!serverUser) return;
        const normalized: User = {
          id: serverUser._id || serverUser.id,
          username: serverUser.username,
          email: serverUser.email,
          fullName: serverUser.fullName,
          phone: serverUser.phone,
          avatar: serverUser.avatar,
          role: serverUser.role,
          loyaltyPoints: serverUser.loyaltyPoints,
          createdAt: serverUser.createdAt,
          venueIds: serverUser.venueIds?.map((v: any) => (typeof v === 'string' ? v : v._id || v.toString())) || [],
          shopAddress: serverUser.shopAddress,
          shopLat: serverUser.shopLat,
          shopLng: serverUser.shopLng,
        };
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify(normalized));
      })
      .catch(() => {
        // If token is invalid/expired, silently ignore — user will be asked to re-login
      });
  }, []); // run once on mount

  const login = (userData: User, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
