
import { supabase } from '../lib/supabase';

export interface ApiKey {
  id: number;
  user_id: string;
  service_name: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const apiKeyService = {
  /**
   * Get all API keys for the current user
   */
  async getUserApiKeys(): Promise<ApiKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
    
    return data || [];
  },

  /**
   * Get a specific API key by service name
   */
  async getApiKeyByService(serviceName: string): Promise<ApiKey | null> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('service_name', serviceName)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error(`Error fetching API key for ${serviceName}:`, error);
      throw error;
    }
    
    return data;
  },

  /**
   * Save an API key
   */
  async saveApiKey(serviceName: string, apiKey: string): Promise<ApiKey> {
    // Check if the API key already exists for this service
    const existingKey = await this.getApiKeyByService(serviceName);
    
    if (existingKey) {
      // Update existing key
      const { data, error } = await supabase
        .from('api_keys')
        .update({
          api_key: apiKey,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingKey.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating API key:', error);
        throw error;
      }
      
      return data;
    } else {
      // Insert new key
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          service_name: serviceName,
          api_key: apiKey,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting API key:', error);
        throw error;
      }
      
      return data;
    }
  },

  /**
   * Delete an API key
   */
  async deleteApiKey(id: number): Promise<void> {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  },

  /**
   * Toggle API key active status
   */
  async toggleApiKeyStatus(id: number, isActive: boolean): Promise<ApiKey> {
    const { data, error } = await supabase
      .from('api_keys')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error toggling API key status:', error);
      throw error;
    }
    
    return data;
  }
};