const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');
css = css.replace(/@import url\('https:\/\/fonts.googleapis.com\/css2\?family=[^;]+'\);/, "@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap');");
css = css.replace(/@theme {[^}]+}/m, `@theme {
  --font-sans: "Lexend", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Lexend", ui-monospace, SFMono-Regular, monospace;
  --font-serif: "Lexend", Georgia, serif;
  --font-handwritten: "Lexend", cursive, sans-serif;
}`);
fs.writeFileSync('src/index.css', css);
