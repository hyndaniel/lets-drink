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
      className={`calendar-day hover-lift ${record ? 'has-record' : ''} ${record ? (record.gatheringType === 'family' ? 'type-family' : 'type-friends') : ''}`} 
      onClick={onClick}
    >
      <div className="day-header">
        <span className="day-number">{dayNumber}</span>
        {record && <span className="day-emoji">{emojiMap[record.stateToday]}</span>}
      </div>
    </div>
  );
};

export default CalendarDay;
