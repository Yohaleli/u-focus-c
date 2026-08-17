const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

code = code.replace(
  `export const db = initializeFirestore(app, {
  databaseId: firebaseConfig.firestoreDatabaseId,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});`,
  `export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, firebaseConfig.firestoreDatabaseId);`
);

fs.writeFileSync('src/firebase.ts', code);
