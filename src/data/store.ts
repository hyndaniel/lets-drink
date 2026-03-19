import type { DrinkRecord } from '../types';

const API_URL = '/api';

export const loadRecords = async (): Promise<DrinkRecord[]> => {
  try {
    const res = await fetch(`${API_URL}/records`);
    if (!res.ok) throw new Error('Failed to fetch records');
    return await res.json();
  } catch (error) {
    console.error('Error loading records from server:', error);
    return []; // Return empty gracefully if server is dead
  }
};

export const addRecord = async (record: DrinkRecord): Promise<DrinkRecord[]> => {
  try {
    const formData = new FormData();
    
    // Separate pending locally-selected files from the JSON info
    const pendingFiles = record.media.map(m => m.file).filter(Boolean) as File[];
    
    // Strip the raw File blobs before serializing metadata
    const recordMeta = {
      ...record,
      media: record.media.filter(m => !m.file) 
    };

    formData.append('record', JSON.stringify(recordMeta));
    
    pendingFiles.forEach(file => {
      formData.append('files', file);
    });

    const res = await fetch(`${API_URL}/records`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to save record API');
    
    // Hard refresh from server to ensure URLs are properly wired
    return await loadRecords();
  } catch (error) {
    console.error('Error saving record to server:', error);
    throw error;
  }
};
