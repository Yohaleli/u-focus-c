const fs = require('fs');

const filesToUpdate = [
  'src/components/ErrorBoundary.tsx',
  'src/components/FocusTimer.tsx',
  'src/components/FullScreenRoom.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\bbg-black\b/g, 'bg-[#161514]');
    fs.writeFileSync(file, content);
  }
});

console.log("Colors updated");
