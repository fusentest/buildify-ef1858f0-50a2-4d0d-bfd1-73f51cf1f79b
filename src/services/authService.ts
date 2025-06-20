
import { supabase } from '../lib/supabase';

export const authService = {
  async signUp(email: string, password: string, username: string) {
    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('Failed to create user');
      }
      
      // Then create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
      if (profileError) {
        throw profileError;
      }
      
      return authData;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      return { message: "Signed out successfully" };
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return { message: "Password reset email sent" };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Get current user error:', error);
      return null;
    }
    
    if (!data.user) {
      return null;
    }
    
    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) {
      console.error('Get profile error:', profileError);
      return null;
    }
    
    return {
      ...data.user,
      ...profile
    };
  }
};