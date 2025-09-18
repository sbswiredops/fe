'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../../services/authService';
import { User } from '@/types/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<{
    data: any; success: boolean; needsVerification?: boolean; message?: string
  }>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  verifyPasswordOtp: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  getCurrentUser: () => Promise<User | null>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getCurrentUserFromStorage<User>();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          }

          try {
            const currentUser = await authService.getCurrentUser();
            const normalizedUser = (currentUser as any)?.data ?? (currentUser as any)?.user ?? currentUser;
            if (normalizedUser) {
              setUser(normalizedUser as User);
              setIsAuthenticated(true);
            }
          } catch (error: any) {
            console.error('Error fetching current user:', error?.message || error);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Forced logout listener (session replaced / refresh failed) + cross-tab sync
  useEffect(() => {
    const onForcedLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      if (typeof window !== 'undefined') {
        // optional redirect
        window.location.href = '/';
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'access_token' && e.newValue == null) {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', onForcedLogout as EventListener);
      window.addEventListener('storage', onStorage);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:logout', onForcedLogout as EventListener);
        window.removeEventListener('storage', onStorage);
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      const data = (response as any)?.data ?? response;
      const u: User | null = data?.user ?? null;

      if (u) {
        setUser(u);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error?.message || error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ data: any; success: boolean; needsVerification?: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      return {
        data: (response as any)?.data || null,
        success: true,
        needsVerification: (response as any)?.needsVerification || false,
        message: (response as any)?.message || 'Registration successful',
      };
    } catch (error: any) {
      console.error('Registration error:', error?.message || error);
      return {
        data: null,
        success: false,
        message: error?.message || 'Registration failed',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.verifyOtp({ email, otp });
      const success = (response as any)?.success ?? false;

      const data = (response as any)?.data ?? response;
      if (data?.user) {
        setUser(data.user as User);
        setIsAuthenticated(true);
      }
      return !!success;
    } catch (error: any) {
      console.error('OTP verification error:', error?.message || error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPasswordOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.verifyPasswordOtp({ email, otp });
      const success = (response as any)?.success ?? false;

      const data = (response as any)?.data ?? response;
      if (data?.user) {
        setUser(data.user as User);
        setIsAuthenticated(true);
      }
      return !!success;
    } catch (error: any) {
      console.error('Password OTP verification error:', error?.message || error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error: any) {
      console.error('Logout error:', error?.message || error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authService.forgotPassword({ email });
      return true;
    } catch (error: any) {
      console.error('Forgot password error:', error?.message || error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authService.resetPassword({ email, otp, newPassword });
      return true;
    } catch (error: any) {
      console.error('Reset password error:', error?.message || error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authService.changePassword({ currentPassword, newPassword });
      return true;
    } catch (error: any) {
      console.error('Change password error:', error?.message || error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string): Promise<boolean> => {
    try {
      await authService.resendOtp({ email });
      return true;
    } catch (error: any) {
      console.error('Resend OTP error:', error?.message || error);
      return false;
    }
  };

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const response = await authService.getCurrentUser();
      const currentUser = (response as any)?.data ?? (response as any)?.user ?? response;
      if (currentUser) {
        console.log('Current user:', currentUser);
        setUser(currentUser as User);
        setIsAuthenticated(true);
        return currentUser as User;
        
      }
      return null;
    } catch (error: any) {
      console.error('Get current user error:', error?.message || error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        verifyOtp,
        verifyPasswordOtp,
        logout,
        forgotPassword,
        resetPassword,
        changePassword,
        resendOtp,
        getCurrentUser,
        isLoading,
        isAuthenticated,
      }}
    >
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