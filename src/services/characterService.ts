
import { supabase } from '../lib/supabase';
import { Character, CharacterDetail } from '../types';

export const characterService = {
  async getAllCharacters(seriesId?: number): Promise<Character[]> {
    try {
      const params = new URLSearchParams({
        action: 'getAllCharacters'
      });
      
      if (seriesId) {
        params.append('seriesId', seriesId.toString());
      }
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/characters?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`
        }
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Get all characters error:', error);
      throw error;
    }
  },

  async getCharacter(characterId: number): Promise<CharacterDetail> {
    try {
      const params = new URLSearchParams({
        action: 'getCharacter',
        characterId: characterId.toString()
      });
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/characters?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`
        }
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Get character error:', error);
      throw error;
    }
  }
};