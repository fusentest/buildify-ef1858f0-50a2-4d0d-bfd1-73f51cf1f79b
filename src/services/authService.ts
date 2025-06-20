
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const authService = {
  async signUp(email: string, password: string, username: string) {
    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        console.error('Auth error during signup:', authError);
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
        console.error('Profile creation error:', profileError);
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
        console.error('Sign in error:', error);
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
        console.error('Sign out error:', error);
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
        console.error('Reset password error:', error);
        throw error;
      }
      
      return { message: "Password reset email sent" };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // First get the auth user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Get current user auth error:', authError);
        return null;
      }
      
      if (!authData.user) {
        return null;
      }
      
      // Then get the profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
        
      if (profileError) {
        console.error('Get profile error:', profileError);
        // If profile doesn't exist but auth user does, create a default profile
        if (profileError.code === 'PGRST116') {
          const username = authData.user.email?.split('@')[0] || 'user';
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              username,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Create profile error:', createError);
            return null;
          }
          
          return {
            ...authData.user,
            ...newProfile
          };
        }
        return null;
      }
      
      return {
        ...authData.user,
        ...profileData
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
};