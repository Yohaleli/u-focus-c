const fs = require('fs');
let code = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

code = code.replace(
  "visibleDaysCount + 1",
  "daysInMonth + 2"
);

fs.writeFileSync('src/components/HabitTracker.tsx', code);
