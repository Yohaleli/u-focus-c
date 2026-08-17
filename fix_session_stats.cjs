const fs = require('fs');
let code = fs.readFileSync('src/components/SessionStats.tsx', 'utf8');

code = code.replace(
  "export default function SessionStats({ logs }: SessionStatsProps) {",
  "export default function SessionStats({ logs, userId }: SessionStatsProps) {"
);

code = code.replace(
  "interface SessionStatsProps {",
  "interface SessionStatsProps {\n  userId: string | null;"
);

fs.writeFileSync('src/components/SessionStats.tsx', code);
