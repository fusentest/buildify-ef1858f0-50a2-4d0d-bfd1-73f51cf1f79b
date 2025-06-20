
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    checkUser();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      await authService.signUp(email, password, username);
      // The auth state change listener will update the user
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.signIn(email, password);
      // The auth state change listener will update the user
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};