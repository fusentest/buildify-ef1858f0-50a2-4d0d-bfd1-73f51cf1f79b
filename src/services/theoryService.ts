
import { supabase } from '../lib/supabase';
import { FanTheory, FanTheoryDetail, Comment } from '../types';

export const theoryService = {
  async getTheories(): Promise<FanTheory[]> {
    try {
      const params = new URLSearchParams({
        action: 'getTheories'
      });
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/theories?${params}`, {
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
      console.error('Get theories error:', error);
      throw error;
    }
  },

  async getTheory(theoryId: number): Promise<FanTheoryDetail> {
    try {
      const params = new URLSearchParams({
        action: 'getTheory',
        theoryId: theoryId.toString()
      });
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/theories?${params}`, {
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
      console.error('Get theory error:', error);
      throw error;
    }
  },

  async createTheory(
    title: string,
    description: string,
    branchingPoint: string,
    alternateTimeline: string,
    creatorId: string
  ): Promise<FanTheory> {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/theories?action=createTheory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          title,
          description,
          branchingPoint,
          alternateTimeline,
          creatorId
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Create theory error:', error);
      throw error;
    }
  },

  async upvoteTheory(
    userId: string,
    theoryId: number
  ): Promise<{ upvoted: boolean; upvotes: number }> {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/theories?action=upvoteTheory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          userId,
          theoryId
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Upvote theory error:', error);
      throw error;
    }
  },

  async addComment(
    content: string,
    userId: string,
    fanTheoryId: number
  ): Promise<Comment> {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/theories?action=addComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          content,
          userId,
          fanTheoryId
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