const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

const injection = `
const originalError = console.error;
const originalWarn = console.warn;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('[vite]')) return;
  originalError.call(console, ...args);
};
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('[vite]')) return;
  originalWarn.call(console, ...args);
};
`;

if (!code.includes('originalError.call')) {
  code = code.replace(
    "import {createRoot} from 'react-dom/client';",
    "import {createRoot} from 'react-dom/client';\n" + injection
  );
  fs.writeFileSync('src/main.tsx', code);
}
