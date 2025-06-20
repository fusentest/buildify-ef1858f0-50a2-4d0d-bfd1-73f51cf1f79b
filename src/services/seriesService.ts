
import { supabase } from '../lib/supabase';
import { Series } from '../types';

export const seriesService = {
  async getAllSeries(): Promise<Series[]> {
    try {
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .order('id');
        
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Get all series error:', error);
      throw error;
    }
  }
};