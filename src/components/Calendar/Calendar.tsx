import React, { useEffect } from 'react';
import './Calendar.css';
import type { DrinkRecord } from '../../types';
import CalendarDay from './CalendarDay';

interface CalendarProps {
  records: DrinkRecord[];
  initialDate?: Date;
  onDayClick: (date: string, record?: DrinkRecord) => void;
}

const Calendar: React.FC<CalendarProps> = ({ records, initialDate = new Date(), onDayClick }) => {
  const [currentMonth, setCurrentMonth] = React.useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = React.useState(initialDate.getFullYear());

  useEffect(() => {
    setCurrentMonth(initialDate.getMonth());
    setCurrentYear(initialDate.getFullYear());
  }, [initialDate]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const record = records.find(r => r.date === dateStr);
    days.push(
      <CalendarDay 
        key={dateStr} 
        date={dateStr} 
        dayNumber={i} 
        record={record} 
        onClick={() => onDayClick(dateStr, record)} 
      />
    );
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="calendar-container glass-panel">
      <div className="calendar-header">
        <button className="nav-btn hover-lift" onClick={handlePrevMonth}>&lt;</button>
        <h2 className="month-title">{monthNames[currentMonth]} {currentYear}</h2>
        <button className="nav-btn hover-lift" onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="calendar-grid-header">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {days}
      </div>
    </div>
  );
};

export default Calendar;
