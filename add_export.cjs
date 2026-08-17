const fs = require('fs');
let content = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

const exportBtnStr = `
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 px-4 py-2 rounded-full text-white/50 hover:text-white transition-colors"
              title="Export data to CSV"
            >
              <FileText className="w-4 h-4" />Export CSV</button>`;

content = content.replace('<RotateCcw className="w-4 h-4" />Reset All</button></>', '<RotateCcw className="w-4 h-4" />Reset All</button>' + exportBtnStr + '</>');

const exportFuncStr = `
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Habit,Date,Status\\n";
    habits.forEach(h => {
      const records = history[h.id] || {};
      Object.keys(records).forEach(dateKey => {
        csvContent += \`"\${h.name}",\${dateKey},\${records[dateKey]}\\n\`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "habit_tracker_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;

content = content.replace('const toggleCell = (habitId: string, day: number) => {', exportFuncStr + '\n  const toggleCell = (habitId: string, day: number) => {');

fs.writeFileSync('src/components/HabitTracker.tsx', content);
console.log("Export added");
