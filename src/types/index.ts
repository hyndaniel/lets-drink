export type EmotionState = 'great' | 'okay' | 'bad' | 'terrible';

export interface MediaItem {
  id: string;
  name: string;
  type: string; // e.g., 'image/jpeg', 'video/mp4', 'audio/mpeg'
  file?: File;
  url?: string;
}

export interface DrinkRecord {
  id: string;
  date: string; // YYYY-MM-DD format
  people: string[];
  location: string;
  alcoholAmount: string;
  notes?: string;
  stateToday: EmotionState;
  stateTomorrow: EmotionState;
  media: MediaItem[];
}
