import type { DrinkRecord } from '../types';

const today = new Date();
const formatDate = (date: Date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const getRelativeDate = (daysAgo: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  return formatDate(d);
};

export const mockRecords: DrinkRecord[] = [
  {
    id: '1',
    date: getRelativeDate(2),
    gatheringType: 'friends',
    people: ['Alice', 'Bob'],
    location: 'Downtown Bar',
    alcoholAmount: '3 Beers, 1 Cocktail',
    stateToday: 'great',
    stateTomorrow: 'okay',
    media: [] // Reverted to empty to satisfy File object types
  },
  {
    id: '2',
    date: getRelativeDate(5),
    gatheringType: 'family',
    people: ['Charlie'],
    location: 'Home',
    alcoholAmount: '2 Glasses of Wine',
    stateToday: 'okay',
    stateTomorrow: 'great',
    media: []
  },
  {
    id: '3',
    date: getRelativeDate(12),
    gatheringType: 'friends',
    people: ['Dave', 'Eve', 'Frank'],
    location: 'Club 55',
    alcoholAmount: '5 Shots, 3 Mixed Drinks',
    stateToday: 'great',
    stateTomorrow: 'terrible',
    media: []
  },
];
