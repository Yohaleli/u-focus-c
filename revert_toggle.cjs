const fs = require('fs');
let content = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

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

if (content.includes(newToggleCell)) {
    content = content.replace(newToggleCell, oldToggleCell);
    fs.writeFileSync('src/components/HabitTracker.tsx', content);
    console.log('Reverted toggleCell');
} else {
    console.log('Could not find toggleCell to revert');
}
