
import { supabase } from '../lib/supabase';
import { Timeline, TimelineEvent } from '../types';

export const timelineService = {
  async getTimelines(isOfficial?: boolean): Promise<Timeline[]> {
    try {
      const params = new URLSearchParams({
        action: 'getTimelines'
      });
      
      if (isOfficial !== undefined) {
        params.append('isOfficial', isOfficial.toString());
      }
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/timeline?${params}`, {
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
      console.error('Get timelines error:', error);
      throw error;
    }
  },

  async getTimelineEvents(timelineId: number, seriesId?: number): Promise<TimelineEvent[]> {
    try {
      const params = new URLSearchParams({
        action: 'getTimelineEvents',
        timelineId: timelineId.toString()
      });
      
      if (seriesId) {
        params.append('seriesId', seriesId.toString());
      }
      
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/timeline?${params}`, {
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
      console.error('Get timeline events error:', error);
      throw error;
    }
  },

  async createFanTimeline(title: string, description: string, creatorId: string): Promise<Timeline> {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/timeline?action=createFanTimeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          title,
          description,
          creatorId
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Create fan timeline error:', error);
      throw error;
    }
  },

  async addTimelineEvent(
    timelineId: number,
    title: string,
    description: string,
    year: string,
    seriesId: number,
    importance: number
  ): Promise<TimelineEvent> {
    try {
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/timeline?action=addTimelineEvent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          timelineId,
          title,
          description,
          year,
          seriesId,
          importance
        })
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Add timeline event error:', error);
      throw error;
    }
  }
};