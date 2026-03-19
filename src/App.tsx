import { useState, useEffect } from 'react';
import './App.css';
import Calendar from './components/Calendar/Calendar';
import YearOverview from './components/YearOverview/YearOverview';
import RecordModal from './components/RecordModal/RecordModal';
import RecordForm from './components/RecordForm/RecordForm';
import { loadRecords, addRecord } from './data/store';
import type { DrinkRecord } from './types';

function App() {
  const [records, setRecords] = useState<DrinkRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<DrinkRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DrinkRecord | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // New states for the Year Overview routing
  const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
  const [activeMonth, setActiveMonth] = useState<Date>(new Date());

  useEffect(() => {
    loadRecords().then(data => {
      setRecords(data);
      setIsLoading(false);
    });
  }, []);

  const handleDayClick = (date: string, record?: DrinkRecord) => {
    setSelectedDate(date);
    setSelectedRecord(record || null);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedRecord(null);
  };

  const openEditForm = (record: DrinkRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleSaveRecord = async (newRecord: DrinkRecord) => {
    const updated = await addRecord(newRecord);
    setRecords(updated);

    // After saving, always show the saved record details in the modal
    const saved = updated.find(r => r.id === newRecord.id) || newRecord;
    setSelectedRecord(saved);
    setSelectedDate(saved.date);

    setIsFormOpen(false);
    setEditingRecord(undefined);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div 
          onClick={() => setViewMode('year')} 
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
          title="Return to Year Overview"
        >
          <h1 className="app-title">🍷 Let's Drink</h1>
          <p className="app-subtitle">Track your libations, locations, and how you feel.</p>
        </div>
        <button 
          className="add-btn hover-lift" 
          onClick={() => {
            setEditingRecord(undefined);
            setIsFormOpen(true);
          }}
          style={{
            background: 'var(--text-primary)',
            color: 'var(--bg-color)',
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          + Add Record
        </button>
      </header>
      
      <main>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-tertiary)'}}>
            Loading Records...
          </div>
        ) : viewMode === 'year' ? (
          <YearOverview 
            records={records} 
            onMonthClick={(date) => {
              setActiveMonth(date);
              setViewMode('month');
            }} 
          />
        ) : (
          <div className="month-view-container" style={{ animation: 'fadeIn 0.3s ease' }}>
            <button 
              className="back-btn hover-lift" 
              onClick={() => setViewMode('year')}
              style={{
                marginBottom: 'var(--spacing-md)',
                background: 'var(--surface-color-medium)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              &larr; Overview
            </button>
            <Calendar records={records} initialDate={activeMonth} onDayClick={handleDayClick} />
          </div>
        )}
      </main>

      {selectedDate && !isFormOpen && (
        <RecordModal 
          date={selectedDate} 
          record={selectedRecord} 
          onEdit={openEditForm}
          onAdd={() => {
            setEditingRecord(undefined);
            setIsFormOpen(true);
          }}
          onClose={closeModal} 
        />
      )}

      {isFormOpen && (
        <RecordForm 
          initialData={editingRecord}
          initialDate={selectedDate || undefined}
          onSave={handleSaveRecord}
          onClose={() => {
            setIsFormOpen(false);
            setEditingRecord(undefined);
          }}
        />
      )}
    </div>
  );
}

export default App;
