const fs = require('fs');
let content = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

const toggleCellStr = `
  const toggleCell = (habitId: string, day: number) => {
    const dateKey = getDateKey(day);
    setHistory((prev) => {
      const habitRecord = prev[habitId] || {};
      const currentStatus = habitRecord[dateKey] || 'empty';
      let nextStatus: 'done' | 'missed' | 'empty' = 'empty';

      if (currentStatus === 'empty') {
        nextStatus = 'done';
      } else if (currentStatus === 'done') {
        nextStatus = 'missed';
      }

      const newState = {
        ...prev,
        [habitId]: {
          ...habitRecord,
          [dateKey]: nextStatus,
        },
      };

      // Check if all habits are completed for this day
      if (nextStatus === 'done') {
        const allCompleted = habits.every(h => {
          if (h.id === habitId) return true; // because nextStatus is 'done'
          const hRec = prev[h.id] || {};
          return hRec[dateKey] === 'done';
        });
        
        if (allCompleted && habits.length > 0) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#34d399', '#60a5fa', '#a855f7']
          });
        }
      }

      return newState;
    });
  };
`;

content = content.replace(/  const toggleCell = \(habitId: string, day: number\) => \{[\s\S]*?return newState;\n    \}\);\n  \};\n/m, toggleCellStr);

fs.writeFileSync('src/components/HabitTracker.tsx', content);
console.log("Confetti trigger added");
