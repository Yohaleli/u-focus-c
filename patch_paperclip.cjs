const fs = require('fs');
let content = fs.readFileSync('src/components/IntroPage.tsx', 'utf8');

const paperclipSVG = `
            {/* Paperclip accent */}
            <div className="absolute -top-12 right-12 z-20">
              <svg width="40" height="80" viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 70C12 70 6 64 6 56V20C6 14.5 10.5 10 16 10C21.5 10 26 14.5 26 20V56C26 59.3 23.3 62 20 62C16.7 62 14 59.3 14 56V24" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="square"/>
              </svg>
            </div>`;

content = content.replace(
  /{[^}]*Paperclip accent mock[^}]*}[\s\S]*?<div className="absolute -top-4 right-8 w-4 h-12 border-2 border-\[#1a1a1a\] rounded-full bg-\[#EFEBE6\] z-10" \/>/,
  paperclipSVG
);

fs.writeFileSync('src/components/IntroPage.tsx', content);
console.log("Paperclip patched");
