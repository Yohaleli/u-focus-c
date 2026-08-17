const fs = require('fs');
let content = fs.readFileSync('src/components/TopNav.tsx', 'utf8');

// Remove scrolling visibility logic
content = content.replace(/  const \[isVisible, setIsVisible\] = useState\(true\);\n[\s\S]*?\}, \[\]\);\n/m, '');
content = content.replace(/import React, \{ useState, useEffect, useRef \} from 'react';/, "import React from 'react';");
content = content.replace(/  const lastScrollY = useRef\(0\);\n/, '');

// Remove backdrop blur and transitions from header
content = content.replace(
  /<header className=\{`sticky top-0 z-50 border-b border-white\/10 bg-black\/20 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 transition-transform duration-300 \$\{isVisible \? 'translate-y-0' : '-translate-y-full'\}`\}>/,
  '<header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">'
);

// Remove backdrop blur from nav
content = content.replace(
  /nav className="flex items-center gap-1 bg-white\/5 backdrop-blur-xl p-1 rounded-full border border-white\/10 overflow-x-auto scrollbar-hide max-w-full"/,
  'nav className="flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/10 overflow-x-auto scrollbar-hide max-w-full"'
);

fs.writeFileSync('src/components/TopNav.tsx', content);
console.log("TopNav patched");
