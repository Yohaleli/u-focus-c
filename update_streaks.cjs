const fs = require('fs');
let content = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

const streakFuncStr = `
  const getStreak = (habitId: string) => {
    const records = history[habitId] || {};
    const doneDates = Object.keys(records)
      .filter(k => records[k] === 'done')
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    if (doneDates.length === 0) return { current: 0, best: 0 };
    
    let currentStreak = 1;
    let bestStreak = 1;
    
    for (let i = 1; i < doneDates.length; i++) {
      const prevDate = new Date(doneDates[i-1]);
      const currDate = new Date(doneDates[i]);
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
         currentStreak++;
         bestStreak = Math.max(bestStreak, currentStreak);
      } else {
         currentStreak = 1;
      }
    }
    
    const lastDate = new Date(doneDates[doneDates.length - 1]);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffFromToday = Math.ceil((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffFromToday > 1) {
      currentStreak = 0;
    }
    
    return { current: currentStreak, best: bestStreak };
  };
`;

content = content.replace('  const toggleCell = (habitId: string, day: number) => {', streakFuncStr + '\n  const toggleCell = (habitId: string, day: number) => {');

const renderStreak = `                        <div className="flex flex-col truncate flex-1 min-w-0" title="Click to edit" onClick={() => handleStartEdit(habit)}>
                          <span className="truncate cursor-text hover:text-white/70 transition-colors">
                            {habit.name}
                          </span>
                          {getStreak(habit.id).current > 0 && (
                            <span className="text-[10px] text-orange-400 font-mono flex items-center gap-1 mt-0.5" title={\`Best Streak: \${getStreak(habit.id).best}\`}>
                              🔥 {getStreak(habit.id).current}
                            </span>
                          )}
                        </div>`;

content = content.replace(
`<span 
                          className="truncate cursor-text hover:text-white/70 transition-colors" 
                          title="Click to edit"
                          onClick={() => handleStartEdit(habit)}
                        >
                          {habit.name}
                        </span>`, renderStreak);

fs.writeFileSync('src/components/HabitTracker.tsx', content);
console.log("Streaks added");
