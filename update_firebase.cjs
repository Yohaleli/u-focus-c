const fs = require('fs');
let content = fs.readFileSync('src/firebase.ts', 'utf8');
content = content.replace('experimentalAutoDetectLongPolling: true', 'experimentalForceLongPolling: true');
fs.writeFileSync('src/firebase.ts', content);
console.log('Firebase updated');
