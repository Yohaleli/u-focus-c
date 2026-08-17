const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/\{showAuthModal && <AuthModal onClose=\{\(\) => setShowAuthModal\(false\)\} \/>\}/g, '');
content = content.replace(/import AuthModal from '.\/components\/AuthModal';/g, '');

fs.writeFileSync('src/App.tsx', content);
console.log("AuthModal removed from App.tsx");
