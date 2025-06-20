
import { supabase } from '../lib/supabase';

export const authService = {
  async signUp(email: string, password: string, username: string) {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          action: 'signup',
          email,
          password,
          username
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          action: 'signin',
          email,
          password
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          action: 'signout'
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async resetPassword(email: string) {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          action: 'reset',
          email
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
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