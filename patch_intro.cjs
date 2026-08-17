const fs = require('fs');
let content = fs.readFileSync('src/components/IntroPage.tsx', 'utf8');

// Replace vibrant mesh background with solid black
content = content.replace(
  /<div className="fixed inset-0 pointer-events-none z-\[-1\] wave-bg" \/>/,
  '<div className="fixed inset-0 pointer-events-none z-[-1] bg-[#0a0a0a]" />'
);

content = content.replace(
  /<div className="fixed inset-0 bg-black\/10 pointer-events-none z-\[-1\]" \/>/,
  ''
);

// Remove drop-shadows and backdrop-blurs
content = content.replace(
  /bg-white\/20 flex items-center justify-center shadow-lg backdrop-blur-xl/,
  'bg-white/10 flex items-center justify-center border border-white/20'
);

content = content.replace(
  /drop-shadow-md/g,
  ''
);

content = content.replace(
  /drop-shadow-xl/g,
  ''
);

content = content.replace(
  /bg-white\/10 backdrop-blur-2xl border border-white\/20 rounded-\[2rem\] p-8 shadow-2xl/,
  'bg-[#111] border border-white/10 rounded-2xl p-8'
);

fs.writeFileSync('src/components/IntroPage.tsx', content);
console.log("IntroPage patched");
