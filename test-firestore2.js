import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, config.firestoreDatabaseId);

async function test() {
  try {
    const docRef = doc(db, 'users', 'test');
    await getDoc(docRef);
    console.log('Success!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
test();
