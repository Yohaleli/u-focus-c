const fs = require('fs');
let content = fs.readFileSync('src/components/TopNav.tsx', 'utf8');

content = content.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);

content = content.replace(
  "  const [lastScrollY, setLastScrollY] = useState(0);",
  "  const lastScrollY = useRef(0);"
);

content = content.replace(
  "if (currentScrollY > lastScrollY && currentScrollY > 50) {",
  "if (currentScrollY > lastScrollY.current && currentScrollY > 50) {"
);

content = content.replace(
  "setLastScrollY(currentScrollY);",
  "lastScrollY.current = currentScrollY;"
);

content = content.replace(
  "}, [lastScrollY]);",
  "}, []);"
);

fs.writeFileSync('src/components/TopNav.tsx', content);
console.log("TopNav state fixed to ref");
