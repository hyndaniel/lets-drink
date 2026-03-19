import React from 'react';
import type { DrinkRecord, EmotionState } from '../../types';

interface CalendarDayProps {
  date: string;
  dayNumber: number;
  record?: DrinkRecord;
  onClick: () => void;
}

const emojiMap: Record<EmotionState, string> = {
  great: '🤩',
  okay: '🙂',
  bad: '🤢',
  terrible: '🤮'
};

const CalendarDay: React.FC<CalendarDayProps> = ({ dayNumber, record, onClick }) => {
  return (
    <div 
      className={`calendar-day hover-lift ${record ? 'has-record' : ''}`} 
      onClick={onClick}
    >
      <div className="day-header">
        <span className="day-number">{dayNumber}</span>
        {record && <span className="day-emoji">{emojiMap[record.stateToday]}</span>}
      </div>
      
      {record && (
        <div className="day-summary">
          {record.location && (
            <div className="summary-item trunc" title={record.location}>📍 {record.location}</div>
          )}
          {record.alcoholAmount && (
            <div className="summary-item trunc" title={record.alcoholAmount}>🍷 {record.alcoholAmount}</div>
          )}
          {record.people.length > 0 && (
            <div className="summary-item trunc" title={record.people.join(', ')}>👥 {record.people.length}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarDay;
