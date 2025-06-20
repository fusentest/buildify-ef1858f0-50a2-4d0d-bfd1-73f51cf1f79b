
import { supabase } from '../lib/supabase';
import { LoreEntry, LoreEntryDetail, Comment } from '../types';

export const loreService = {
  async getLoreEntries(seriesId?: number, tag?: string): Promise<LoreEntry[]> {
    try {
      const params = new URLSearchParams({
        action: 'getLoreEntries'
      });
      
      if (seriesId) {
        params.append('seriesId', seriesId.toString());
      }
      
      if (tag) {
        params.append('tag', tag);
      }
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/lore?${params}`, {
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
      console.error('Get lore entries error:', error);
      throw error;
    }
  },

  async getLoreEntry(loreId: number): Promise<LoreEntryDetail> {
    try {
      const params = new URLSearchParams({
        action: 'getLoreEntry',
        loreId: loreId.toString()
      });
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/lore?${params}`, {
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
      console.error('Get lore entry error:', error);
      throw error;
    }
  },

  async createLoreEntry(
    title: string,
    content: string,
    seriesId: number,
    tags: string[],
    sources: string[],
    creatorId: string,
    characterIds: number[]
  ): Promise<LoreEntry> {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/lore?action=createLoreEntry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          title,
          content,
          seriesId,
          tags,
          sources,
          creatorId,
          characterIds
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Create lore entry error:', error);
      throw error;
    }
  },

  async addComment(
    content: string,
    userId: string,
    loreEntryId: number
  ): Promise<Comment> {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/lore?action=addComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          content,
          userId,
          loreEntryId
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  }
};