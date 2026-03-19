import React, { useState } from 'react';
import './YearOverview.css';
import type { DrinkRecord } from '../../types';

interface YearOverviewProps {
  records: DrinkRecord[];
  onMonthClick: (date: Date) => void;
}

const YearOverview: React.FC<YearOverviewProps> = ({ records, onMonthClick }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const months = Array.from({ length: 12 }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="year-overview">
      <div className="year-header">
        <button className="year-nav hover-lift" onClick={() => setCurrentYear(y => y - 1)}>&lt;</button>
        <h2 className="year-title">{currentYear} In Review</h2>
        <button className="year-nav hover-lift" onClick={() => setCurrentYear(y => y + 1)}>&gt;</button>
      </div>
      <div className="months-grid">
        {months.map(month => {
          const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
          const firstDay = new Date(currentYear, month, 1).getDay();
          
          const days = [];
          for (let i = 0; i < firstDay; i++) {
             days.push(<div key={`empty-${i}`} className="mini-day empty" />);
          }
          
          let drinkCount = 0;

          for (let i = 1; i <= daysInMonth; i++) {
             const dateStr = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
             const hasRecord = records.some(r => r.date === dateStr);
             if (hasRecord) drinkCount++;
             days.push(
               <div key={dateStr} className={`mini-day ${hasRecord ? 'has-record' : ''}`} title={`${dateStr}${hasRecord ? ' - Drink Logged' : ''}`} />
             );
          }

          return (
            <div 
               key={month} 
               className="mini-month glass-panel hover-lift" 
               onClick={() => onMonthClick(new Date(currentYear, month, 1))}
            >
               <div className="mini-month-header">
                 <h3>{monthNames[month]}</h3>
                 {drinkCount > 0 && <span className="mini-count">{drinkCount} record{drinkCount !== 1 ? 's' : ''}</span>}
               </div>
               <div className="mini-calendar-grid">
                 {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} className="mini-weekday">{d}</div>
                 ))}
                 {days}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearOverview;
