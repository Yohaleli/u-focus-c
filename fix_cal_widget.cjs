const fs = require('fs');
let code = fs.readFileSync('src/components/CalendarWidget.tsx', 'utf8');

code = code.replace(
  "let ethSub = '';",
  "let ethSub: string | number = '';"
);

fs.writeFileSync('src/components/CalendarWidget.tsx', code);
