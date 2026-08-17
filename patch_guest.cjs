const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);',
  'const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);\n  const [isGuest, setIsGuest] = useState(false);'
);

content = content.replace(
  ') : !currentUser ? (',
  ') : !currentUser && !isGuest ? ('
);

content = content.replace(
  '<IntroPage onLoginClick={() => setShowAuthModal(true)} />',
  '<IntroPage \n          onLoginClick={() => setShowAuthModal(true)} \n          onTryWithoutSignup={() => setIsGuest(true)} \n        />'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Guest mode patched");
