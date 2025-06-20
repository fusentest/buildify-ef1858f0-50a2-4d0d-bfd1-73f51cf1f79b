
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const profileService = {
  async getProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  },

  async getUserContributions(userId: string) {
    try {
      // Get user's lore entries
      const { data: loreEntries, error: loreError } = await supabase
        .from('lore_entries')
        .select(`
          *,
          series:series_id(id, name, color_code)
        `)
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });
        
      if (loreError) {
        throw loreError;
      }
      
      // Get user's fan theories
      const { data: theories, error: theoriesError } = await supabase
        .from('fan_theories')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });
        
      if (theoriesError) {
        throw theoriesError;
      }
      
      // Get user's comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          lore_entry:lore_entry_id(id, title),
          fan_theory:fan_theory_id(id, title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (commentsError) {
        throw commentsError;
      }
      
      return {
        loreEntries,
        theories,
        comments
      };
    } catch (error) {
      console.error('Get user contributions error:', error);
      throw error;
    }
  }
};