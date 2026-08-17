const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase-sync.ts', 'utf8');

const debounceSync = `
const debounceMap = new Map<string, NodeJS.Timeout>();

export const syncDataToFirestore = async (userId: string, key: string, data: any) => {
  if (!userId) return;
  
  const mapKey = \`\${userId}_\${key}\`;
  
  if (debounceMap.has(mapKey)) {
    clearTimeout(debounceMap.get(mapKey));
  }
  
  const timeoutId = setTimeout(async () => {
    try {
      const payload = { data, updatedAt: Date.now() };
      const jsonString = JSON.stringify(payload);
          
      // Firestore max document size is 1,048,576 bytes (~1MB)
      if (jsonString.length > 850000) {
        console.warn(\`Data for key "\${key}" (\${jsonString.length} chars) exceeds limit.\`);
        return;
      }
      
      const docRef = doc(db, 'users', userId, 'appData', key);
      await setDoc(docRef, payload);
    } catch (error) {
      console.error(\`Error syncing \${key} to Firestore:\`, error);
    }
    debounceMap.delete(mapKey);
  }, 1000); // 1 second debounce
  
  debounceMap.set(mapKey, timeoutId);
};
`;

content = content.replace(/export const syncDataToFirestore = async \([\s\S]*?\};/m, debounceSync);
fs.writeFileSync('src/lib/firebase-sync.ts', content);
console.log("Firebase sync debounced");
