import React, { useState } from 'react';
import './RecordForm.css';
import type { DrinkRecord, EmotionState, GatheringType, MediaItem } from '../../types';

interface RecordFormProps {
  initialData?: DrinkRecord;
  initialDate?: string;
  onSave: (record: DrinkRecord) => void;
  onClose: () => void;
}

const emotionOptions: EmotionState[] = ['great', 'okay', 'bad', 'terrible'];
const emojiMap: Record<EmotionState, string> = {
  great: '🤩',
  okay: '🙂',
  bad: '🤢',
  terrible: '🤮'
};

const RecordForm: React.FC<RecordFormProps> = ({ initialData, initialDate, onSave, onClose }) => {
  const [date, setDate] = useState(initialData?.date || initialDate || new Date().toISOString().split('T')[0]);
  const [gatheringType, setGatheringType] = useState<GatheringType>(initialData?.gatheringType || 'friends');
  const [location, setLocation] = useState(initialData?.location || '');
  const [people, setPeople] = useState(initialData?.people.join(', ') || '');
  const [alcoholAmount, setAlcoholAmount] = useState(initialData?.alcoholAmount || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [stateToday, setStateToday] = useState<EmotionState>(initialData?.stateToday || 'great');
  const [stateTomorrow, setStateTomorrow] = useState<EmotionState>(initialData?.stateTomorrow || 'okay');
  
  // State for tracking media files
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>(initialData?.media || []);
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const mediaItems: MediaItem[] = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(),
      name: file.name,
      type: file.type,
      file: file
    }));

    const newRecord: DrinkRecord = {
      id: initialData ? initialData.id : Date.now().toString(),
      date,
      gatheringType,
      location,
      people: people.split(',').map(p => p.trim()).filter(Boolean),
      alcoholAmount,
      notes,
      stateToday,
      stateTomorrow,
      media: [...existingMedia, ...mediaItems]
    };
    await onSave(newRecord);
    setIsSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <button type="button" className="close-btn hover-lift" onClick={onClose}>&times;</button>
        <div className="modal-header">
          <h2>{initialData ? 'Edit Drink Record' : 'Log Drink Record'}</h2>
        </div>
        
        <form className="record-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Gathering Type</label>
            <div className="emoji-selector">
              <button
                type="button"
                className={`emoji-btn ${gatheringType === 'friends' ? 'selected-friends' : ''}`}
                onClick={() => setGatheringType('friends')}
                style={{ fontSize: '0.85rem', padding: '8px 16px', flex: 1 }}
              >
                🍻 朋友小聚
              </button>
              <button
                type="button"
                className={`emoji-btn ${gatheringType === 'family' ? 'selected-family' : ''}`}
                onClick={() => setGatheringType('family')}
                style={{ fontSize: '0.85rem', padding: '8px 16px', flex: 1 }}
              >
                🏠 家庭聚会
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input type="text" placeholder="Where were you?" required value={location} onChange={e => setLocation(e.target.value)} />
          </div>

          <div className="form-group">
            <label>People (comma separated)</label>
            <input type="text" placeholder="Alice, Bob..." value={people} onChange={e => setPeople(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Alcohol Consumed</label>
            <input 
              type="text" 
              placeholder="3 beers, 1 shot..."
              required
              value={alcoholAmount} 
              onChange={e => setAlcoholAmount(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Notes (Write something...)</label>
            <textarea 
              placeholder="How was the vibe? Any funny stories or remarks?" 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Feeling Today</label>
            <div className="emoji-selector">
              {emotionOptions.map(e => (
                <button 
                  key={`today-${e}`}
                  type="button" 
                  className={`emoji-btn ${stateToday === e ? 'selected' : ''}`}
                  onClick={() => setStateToday(e)}
                >
                  {emojiMap[e]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Feeling Day After</label>
            <div className="emoji-selector">
              {emotionOptions.map(e => (
                <button 
                  key={`tmrw-${e}`}
                  type="button" 
                  className={`emoji-btn ${stateTomorrow === e ? 'selected' : ''}`}
                  onClick={() => setStateTomorrow(e)}
                >
                  {emojiMap[e]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Media (Photos, Videos, Audio) {existingMedia.length ? `[${existingMedia.length} existing]` : ''}</label>
            <input 
              type="file" 
              multiple 
              accept="image/*,video/*,audio/*" 
              onChange={e => {
                if (e.target.files) {
                  // Append new files without overwriting pending new files
                  setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                }
              }} 
            />
            {(existingMedia.length > 0 || files.length > 0) && (
              <div className="file-list">
                {existingMedia.map(item => (
                  <div key={item.id} className="file-item">
                    <span>📁 {item.name} <span style={{color: 'var(--text-tertiary)', fontSize: '0.75rem'}}>(Saved)</span></span>
                    <button type="button" className="remove-btn" onClick={() => setExistingMedia(existingMedia.filter(m => m.id !== item.id))}>&times;</button>
                  </div>
                ))}
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="file-item">
                    <span>📁 {f.name} <span style={{color: 'var(--accent-blue)', fontSize: '0.75rem'}}>(New)</span></span>
                    <button type="button" className="remove-btn" onClick={() => setFiles(files.filter((_, index) => index !== i))}>&times;</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="submit-btn hover-lift" disabled={isSaving}>
            {isSaving ? '⏳ Saving...' : (initialData ? 'Update Record' : 'Save Record')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecordForm;
