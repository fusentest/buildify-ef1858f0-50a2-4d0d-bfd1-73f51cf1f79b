
// User and Auth Types
export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  role: 'user' | 'moderator' | 'admin';
}

// Series Types
export interface Series {
  id: number;
  name: string;
  description?: string;
  start_year?: string;
  end_year?: string;
  color_code: string;
}

// Timeline Types
export interface Timeline {
  id: number;
  title: string;
  description?: string;
  is_official: boolean;
  creator_id?: string;
  created_at: string;
  updated_at: string;
  creator?: User;
}

export interface TimelineEvent {
  id: number;
  timeline_id: number;
  title: string;
  description?: string;
  year: string;
  series_id: number;
  importance: number;
  created_at: string;
  series?: Series;
}

// Character Types
export interface Character {
  id: number;
  name: string;
  alias?: string;
  portrait_url?: string;
  sprite_url?: string;
  description?: string;
  first_appearance?: string;
  series_id: number;
  is_robot_master: boolean;
  is_maverick: boolean;
  is_human: boolean;
  is_reploid: boolean;
  created_by?: string;
  status?: string;
  series?: Series;
}

export interface Relationship {
  id: number;
  relationshipType: string;
  description?: string;
  character: Character;
  direction: 'incoming' | 'outgoing';
}

export interface CharacterDetail extends Character {
  relationships: Relationship[];
  loreEntries: LoreEntry[];
}

// Lore Types
export interface LoreEntry {
  id: number;
  title: string;
  content: string;
  series_id?: number;
  tags: string[];
  sources?: string[];
  creator_id?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  series?: Series;
  creator?: User;
}

export interface LoreEntryDetail extends LoreEntry {
  relatedCharacters: Character[];
  comments: Comment[];
}

// Fan Theory Types
export interface FanTheory {
  id: number;
  title: string;
  description: string;
  branching_point: string;
  alternate_timeline: string;
  creator_id: string;
  is_approved: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
  creator?: User;
}

export interface FanTheoryDetail extends FanTheory {
  comments: Comment[];
  hasUpvoted: boolean;
}

// Comment Type
export interface Comment {
  id: number;
  content: string;
  user_id: string;
  lore_entry_id?: number;
  fan_theory_id?: number;
  created_at: string;
  user: User;
}