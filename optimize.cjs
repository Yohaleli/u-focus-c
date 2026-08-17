const fs = require('fs');
let content = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

const regex = /  const getHabitProgress = \(habitId: string\) => \{[\s\S]*?    return \{ current: currentStreak, best: bestStreak \};\n  \};\n/m;

const replacement = `  const habitStats = useMemo(() => {
    const stats: Record<string, { progress: { completed: number, total: number, percent: number }, streak: { current: number, best: number } }> = {};
    const prefixStr = \`\${selectedYear}-\${String(selectedMonthIdx + 1).padStart(2, '0')}\`;
    const today = new Date();
    today.setHours(0,0,0,0);

    habits.forEach(h => {
      const records = history[h.id] || {};
      
      // Calculate Progress
      let count = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = \`\${prefixStr}-\${String(d).padStart(2, '0')}\`;
        if (records[dateKey] === 'done') count++;
      }
      const progress = { completed: count, total: daysInMonth, percent: daysInMonth > 0 ? Math.round((count / daysInMonth) * 100) : 0 };

      // Calculate Streak
      const doneDates = Object.keys(records)
        .filter(k => records[k] === 'done')
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      
      let currentStreak = 0;
      let bestStreak = 0;

      if (doneDates.length > 0) {
        currentStreak = 1;
        bestStreak = 1;
        
        for (let i = 1; i < doneDates.length; i++) {
          const prevDate = new Date(doneDates[i-1]);
          const currDate = new Date(doneDates[i]);
          const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
             currentStreak++;
             bestStreak = Math.max(bestStreak, currentStreak);
          } else if (diffDays > 1) {
             currentStreak = 1;
          }
        }
        
        const lastDate = new Date(doneDates[doneDates.length - 1]);
        const diffFromToday = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffFromToday > 1) {
          currentStreak = 0;
        }
      }

      stats[h.id] = { progress, streak: { current: currentStreak, best: bestStreak } };
    });
    return stats;
  }, [history, habits, selectedYear, selectedMonthIdx, daysInMonth]);
`;

content = content.replace(regex, replacement);

content = content.replace(/getStreak\(habit\.id\)/g, "habitStats[habit.id]?.streak");
content = content.replace(/getHabitProgress\(habit\.id\)/g, "habitStats[habit.id]?.progress");

fs.writeFileSync('src/components/HabitTracker.tsx', content);
console.log("Optimization complete");
