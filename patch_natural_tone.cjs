const fs = require('fs');

// Update IntroPage
let intro = fs.readFileSync('src/components/IntroPage.tsx', 'utf8');
intro = intro.replace(/bg-\[#0a0a0a\]/g, 'bg-[#161514]');
intro = intro.replace(/bg-\[#111\]/g, 'bg-[#22201e]');
fs.writeFileSync('src/components/IntroPage.tsx', intro);

// Update index.css
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/background-color: #000;/, 'background-color: #161514;');
css = css.replace(/color: #fff;/, 'color: #f2f0ed;');
fs.writeFileSync('src/index.css', css);

console.log("Natural tone applied");
