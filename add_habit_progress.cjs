const fs = require('fs');
let content = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

const streakFuncStr = `
  const getHabitProgress = (habitId: string) => {
    const records = history[habitId] || {};
    let count = 0;
    const prefixStr = \`\${selectedYear}-\${String(selectedMonthIdx + 1).padStart(2, '0')}\`;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = \`\${prefixStr}-\${String(d).padStart(2, '0')}\`;
      if (records[dateKey] === 'done') count++;
    }
    return { completed: count, total: daysInMonth, percent: Math.round((count / daysInMonth) * 100) };
  };
`;

content = content.replace('  const getStreak = (habitId: string) => {', streakFuncStr + '\n  const getStreak = (habitId: string) => {');

const renderStreak = `                        <div className="flex flex-col truncate flex-1 min-w-0" title="Click to edit" onClick={() => handleStartEdit(habit)}>
                          <span className="truncate cursor-text hover:text-white/70 transition-colors">
                            {habit.name}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            {getStreak(habit.id).current > 0 && (
                              <span className="text-[9px] text-orange-400 font-mono flex items-center gap-0.5 whitespace-nowrap" title={\`Best Streak: \${getStreak(habit.id).best}\`}>
                                <Flame className="w-2.5 h-2.5" /> {getStreak(habit.id).current}
                              </span>
                            )}
                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden" title={\`\${getHabitProgress(habit.id).percent}% completed this month\`}>
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: \`\${getHabitProgress(habit.id).percent}%\` }} />
                            </div>
                          </div>
                        </div>`;

content = content.replace(
`<div className="flex flex-col truncate flex-1 min-w-0" title="Click to edit" onClick={() => handleStartEdit(habit)}>
                          <span className="truncate cursor-text hover:text-white/70 transition-colors">
                            {habit.name}
                          </span>
                          {getStreak(habit.id).current > 0 && (
                            <span className="text-[10px] text-orange-400 font-mono flex items-center gap-1 mt-0.5" title={\`Best Streak: \${getStreak(habit.id).best}\`}>
                              <Flame className="w-3 h-3" /> {getStreak(habit.id).current} day streak
                            </span>
                          )}
                        </div>`, renderStreak);

fs.writeFileSync('src/components/HabitTracker.tsx', content);
console.log("Habit progress added");
