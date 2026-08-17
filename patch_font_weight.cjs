const fs = require('fs');

const filesToUpdate = [
  'src/components/IntroPage.tsx',
  'src/components/TopNav.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // For monospaced font, maybe we should not use tracking-tighter since it's already spaced
    content = content.replace(/tracking-tighter/g, 'tracking-normal');
    fs.writeFileSync(file, content);
  }
});

console.log("Font weights updated");
