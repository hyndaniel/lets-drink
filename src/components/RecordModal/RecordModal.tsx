import React, { useEffect, useRef, useState } from 'react';
import './RecordModal.css';
import type { DrinkRecord, EmotionState } from '../../types';

interface RecordModalProps {
  record: DrinkRecord | null;
  date: string;
  onEdit: (record: DrinkRecord) => void;
  onAdd?: () => void;
  onClose: () => void;
}

const emojiMap: Record<EmotionState, string> = {
  great: '🤩',
  okay: '🙂',
  bad: '🤢',
  terrible: '🤮'
};

const stateLabels: Record<EmotionState, string> = {
  great: 'Feels Great',
  okay: 'Felt Okay',
  bad: 'Kinda Bad',
  terrible: 'Terrible'
};

const RecordModal: React.FC<RecordModalProps> = ({ record, date, onEdit, onAdd, onClose }) => {
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);

  // On open, instantly scroll to the clicked thumbnail's position
  useEffect(() => {
    if (expandedIndex !== null && trackRef.current && !initialScrollDone.current) {
      initialScrollDone.current = true;
      trackRef.current.scrollLeft = expandedIndex * trackRef.current.clientWidth;
    }
    if (expandedIndex === null) initialScrollDone.current = false;
  }, [expandedIndex]);

  // Keyboard navigation — delegates to native scrollTo so snap physics apply
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (expandedIndex === null || !record?.media || !trackRef.current) return;
      const el = trackRef.current;
      if (e.key === 'ArrowRight' && expandedIndex < record.media.length - 1)
        el.scrollTo({ left: (expandedIndex + 1) * el.clientWidth, behavior: 'smooth' });
      if (e.key === 'ArrowLeft' && expandedIndex > 0)
        el.scrollTo({ left: (expandedIndex - 1) * el.clientWidth, behavior: 'smooth' });
      if (e.key === 'Escape') setExpandedIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedIndex, record]);

  // Sync indicator dots with scroll position
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== expandedIndex) setExpandedIndex(idx);
  };

  useEffect(() => {
    if (record && record.media) {
      const urls: Record<string, string> = {};
      record.media.forEach(item => {
        if (item.file) {
          urls[item.id] = URL.createObjectURL(item.file as Blob);
        }
      });
      setObjectUrls(urls);

      return () => {
        Object.values(urls).forEach(url => URL.revokeObjectURL(url));
      };
    }
  }, [record]);

  if (!date && !record) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ marginBottom: 0 }}>
                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              {record && (
                <button
                  className="edit-btn hover-lift"
                  onClick={() => onEdit(record)}
                  style={{
                    background: 'var(--surface-color-medium)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  ✏️ Edit
                </button>
              )}
            </div>
            {!record && (
              <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>
                <p className="no-record" style={{ marginBottom: 'var(--spacing-xl)' }}>No drinking recorded on this day. Sober day! 💧</p>
                {onAdd && (
                  <button
                    className="add-btn hover-lift"
                    onClick={onAdd}
                    style={{
                      background: 'var(--text-primary)',
                      color: 'var(--bg-color)',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '1rem',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    + Add Record
                  </button>
                )}
              </div>
            )}
          </div>

          {record && (
            <div className="modal-body">
              <div style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: 'var(--spacing-md)',
                background: record.gatheringType === 'family' ? 'var(--accent-pink-glow)' : 'var(--accent-green-glow)',
                color: record.gatheringType === 'family' ? 'var(--accent-pink)' : 'var(--accent-green)',
                border: `1px solid ${record.gatheringType === 'family' ? 'var(--accent-pink)' : 'var(--accent-green)'}`,
              }}>
                {record.gatheringType === 'family' ? '🏠 家庭聚会' : '🍻 朋友小聚'}
              </div>
              <div className="info-grid">
                <div className="info-item glass-panel">
                  <span className="icon">📍</span>
                  <div>
                    <div className="label">Location</div>
                    <div className="value">{record.location}</div>
                  </div>
                </div>
                <div className="info-item glass-panel">
                  <span className="icon">👥</span>
                  <div>
                    <div className="label">With</div>
                    <div className="value">{record.people.join(', ') || 'Solo'}</div>
                  </div>
                </div>
                <div className="info-item glass-panel full-width">
                  <span className="icon">🍷</span>
                  <div>
                    <div className="label">Consumed</div>
                    <div className="value">{record.alcoholAmount}</div>
                  </div>
                </div>

                {record.notes && (
                  <div className="info-item glass-panel full-width">
                    <span className="icon">📝</span>
                    <div>
                      <div className="label">Notes & Remarks</div>
                      <div className="value" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.95rem' }}>{record.notes}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="state-section">
                <h3>Fatigue & State</h3>
                <div className="state-cards">
                  <div className="state-card glass-panel hover-lift">
                    <span className="state-emoji">{emojiMap[record.stateToday]}</span>
                    <div className="state-info">
                      <span className="state-title">Day Of</span>
                      <span className="state-desc">{stateLabels[record.stateToday]}</span>
                    </div>
                  </div>
                  <div className="state-card glass-panel hover-lift">
                    <span className="state-emoji">{emojiMap[record.stateTomorrow]}</span>
                    <div className="state-info">
                      <span className="state-title">Next Day</span>
                      <span className="state-desc">{stateLabels[record.stateTomorrow]}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="media-section">
                <h3>Media Gallery</h3>
                {record.media && record.media.length > 0 ? (
                  <div className="media-grid">
                    {record.media.map((item, idx) => {
                      const url = item.url || objectUrls[item.id];
                      if (!url) return null;

                      return (
                        <div key={item.id} className="media-item" onClick={() => setExpandedIndex(idx)}>
                          {item.type.startsWith('image/') && <img src={url} alt={item.name} loading="lazy" />}
                          {item.type.startsWith('video/') && <video src={url} className="media-vid" preload="metadata" />}
                          {item.type.startsWith('audio/') && (
                            <div className="audio-item-wrapper" onClick={e => e.stopPropagation()}>
                              <audio src={url} controls className="media-audio" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-media glass-panel">No media recorded for this day.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {expandedIndex !== null && record && record.media && (
        <div
          className="lightbox-overlay"
          onClick={() => setExpandedIndex(null)}
        >
          <div
            className="lightbox-track"
            ref={trackRef}
            onScroll={handleScroll}
            onClick={e => e.stopPropagation()}
          >
            {record.media.map((item, idx) => {
              const url = item.url || objectUrls[item.id];
              if (!url) return null;
              return (
                <div key={`full-${item.id}`} className="lightbox-slide">
                  {item.type.startsWith('image/') && <img src={url} alt={item.name} />}
                  {item.type.startsWith('video/') && (
                    <video src={url} controls autoPlay={expandedIndex === idx} loop muted playsInline />
                  )}
                </div>
              );
            })}
          </div>

          <div className="lightbox-indicators" onClick={e => e.stopPropagation()}>
            <div className="indicator-pill">
              {record.media.map((_, idx) => (
                <div
                  key={`ind-${idx}`}
                  className={`indicator-dot ${idx === expandedIndex ? 'active' : ''}`}
                  onClick={() => trackRef.current?.scrollTo({ left: idx * trackRef.current.clientWidth, behavior: 'smooth' })}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecordModal;
