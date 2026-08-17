const fs = require('fs');
let content = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

const oldToggleCell = `  const toggleCell = (habitId: string, day: number) => {
    const dateKey = getDateKey(day);
    setHistory((prev) => {
      const habitRecord = prev[habitId] || {};
      const currentStatus = habitRecord[dateKey] || 'empty';
      let nextStatus: 'done' | 'missed' | 'empty' = 'empty';

      if (currentStatus === 'empty') {
        nextStatus = 'done';
      } else if (currentStatus === 'done') {
        nextStatus = 'missed';
      } else {
        nextStatus = 'empty';
      }

      return {
        ...prev,
        [habitId]: {
          ...habitRecord,
          [dateKey]: nextStatus,
        },
      };
    });
  };`;

const newToggleCell = `  const toggleCell = (habitId: string, day: number) => {
    const dateKey = getDateKey(day);
    setHistory((prev) => {
      const habitRecord = prev[habitId] || {};
      let currentStatus = habitRecord[dateKey] || 'empty';
      
      if (currentStatus === 'empty' && isPastDay(day)) {
         currentStatus = 'missed';
      }

      let nextStatus: 'done' | 'missed' | 'empty' = 'empty';

      if (currentStatus === 'empty') {
        nextStatus = 'done';
      } else if (currentStatus === 'done') {
        nextStatus = 'missed';
      } else {
        nextStatus = 'empty';
      }

      return {
        ...prev,
        [habitId]: {
          ...habitRecord,
          [dateKey]: nextStatus,
        },
      };
    });
  };`;

if (content.includes(oldToggleCell)) {
    content = content.replace(oldToggleCell, newToggleCell);
    fs.writeFileSync('src/components/HabitTracker.tsx', content);
    console.log('Fixed toggleCell');
} else {
    console.log('Could not find toggleCell');
}
