const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

const waveBgCSS = `
.wave-bg {
  background-color: #5c258d;
  background-image: 
    radial-gradient(100% 100% at 10% 0%, #ff9800 0%, transparent 50%),
    radial-gradient(120% 120% at 90% 90%, #6600ff 0%, transparent 60%),
    radial-gradient(100% 100% at 10% 90%, #00d2ff 0%, transparent 50%),
    radial-gradient(120% 120% at 80% 10%, #d500f9 0%, transparent 50%),
    radial-gradient(100% 100% at 50% 50%, #f50057 0%, transparent 60%);
  background-size: cover;
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  filter: blur(40px) saturate(1.5);
  transform: scale(1.1);
}
`;

content = content.replace(/\.wave-bg \{[\s\S]*?\}\n/m, waveBgCSS);

fs.writeFileSync('src/index.css', content);
console.log("CSS patched");
