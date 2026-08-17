const fs = require('fs');
let content = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

const weeklyChartDataStr = `
  const weeklyChartData = useMemo(() => {
    const data = [];
    const prefixStr = \`\${selectedYear}-\${String(selectedMonthIdx + 1).padStart(2, '0')}\`;
    let currentWeekSum = 0;
    
    for (let d = 1; d <= daysInMonth; d++) {
      let count = 0;
      habits.forEach(h => {
        const habitRecords = history[h.id] || {};
        const dateKey = \`\${prefixStr}-\${String(d).padStart(2, '0')}\`;
        if (habitRecords[dateKey] === 'done') count++;
      });
      currentWeekSum += count;
      
      if (d % 7 === 0 || d === daysInMonth) {
        const weekNum = Math.ceil(d / 7);
        data.push({ week: \`W\${weekNum}\`, completed: currentWeekSum });
        currentWeekSum = 0;
      }
    }
    return data;
  }, [habits, history, selectedYear, selectedMonthIdx, daysInMonth]);
`;

content = content.replace('  // Calculate Overall Progress Stats', weeklyChartDataStr + '\n  // Calculate Overall Progress Stats');

const weeklyChartJSX = `
            <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg">
              <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-4">Weekly Trend</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#a855f7' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                      labelStyle={{ display: 'none' }}
                      formatter={(value) => [\`\${value} Habits\`, 'Completed']}
                    />
                    <Line type="monotone" dataKey="completed" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
`;

content = content.replace('<div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg">\n              <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-4">Yearly Completion Trend</h4>', weeklyChartJSX + '\n            <div className="flex-1 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg">\n              <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-4">Yearly Completion Trend</h4>');

fs.writeFileSync('src/components/HabitTracker.tsx', content);
console.log("Weekly chart added");
