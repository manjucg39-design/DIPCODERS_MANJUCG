import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../types/domain';
import { MOCK_CUSTOMER, MOCK_WORKER_USER } from '../lib/mock-data';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'CUSTOMER' | 'WORKER';
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Dev Mock Auth Store ────────────────────────────────────────────────────
const MOCK_ACCOUNTS: Record<string, { user: User; password: string }> = {
  'priya.sharma@example.com': { user: MOCK_CUSTOMER, password: 'Customer@123' },
  'raju.plumber@example.com': { user: MOCK_WORKER_USER, password: 'Worker@123' },
  'admin@kaamwala.example.com': {
    user: {
      id: 'admin-1',
      email: 'admin@kaamwala.example.com',
      name: 'Platform Admin',
      role: 'ADMIN',
      is_suspended: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    password: 'Admin@Secure123',
  },
};

let mockRegistered: Record<string, { user: User; password: string }> = {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Persist mock session in sessionStorage for dev convenience
    const saved = sessionStorage.getItem('kw_mock_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 800));

      const combined = { ...MOCK_ACCOUNTS, ...mockRegistered };
      const account = combined[email.toLowerCase()];

      if (!account || account.password !== password) {
        throw new Error('Invalid email or password.');
      }

      if (account.user.is_suspended) {
        throw new Error('Your account has been suspended. Please contact support.');
      }

      setUser(account.user);
      sessionStorage.setItem('kw_mock_user', JSON.stringify(account.user));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 1000));

      const existing = { ...MOCK_ACCOUNTS, ...mockRegistered };
      if (existing[data.email.toLowerCase()]) {
        throw new Error('An account with this email already exists.');
      }

      if ((data.role as string) === 'ADMIN') {
        throw new Error('Administrator accounts cannot be created through registration.');
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        email: data.email.toLowerCase(),
        name: data.name,
        phone: data.phone,
        role: data.role,
        is_suspended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRegistered[data.email.toLowerCase()] = {
        user: newUser,
        password: data.password,
      };

      setUser(newUser);
      sessionStorage.setItem('kw_mock_user', JSON.stringify(newUser));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed.');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      setUser(null);
      sessionStorage.removeItem('kw_mock_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
