import { db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const debounceMap = new Map<string, NodeJS.Timeout>();
const pendingWrites = new Set<string>();

export const syncDataToFirestore = async (userId: string, key: string, data: any) => {
  if (!userId) return;
  
  const mapKey = `${userId}_${key}`;
  
  pendingWrites.add(mapKey);
  
  if (debounceMap.has(mapKey)) {
    clearTimeout(debounceMap.get(mapKey));
  }
  
  const timeoutId = setTimeout(async () => {
    try {
      const payload = { data, updatedAt: Date.now() };
      const jsonString = JSON.stringify(payload);
              
      // Firestore max document size is 1,048,576 bytes (~1MB)
      if (jsonString.length > 850000) {
        console.warn(`Data for key "${key}" (${jsonString.length} chars) exceeds limit.`);
        return;
      }
          
      const docRef = doc(db, 'users', userId, 'appData', key);
      await setDoc(docRef, payload);
    } catch (error) {
      console.error(`Error syncing ${key} to Firestore:`, error);
    }
    debounceMap.delete(mapKey);
    
    // Keep pending write flag active briefly to ignore immediate stale snapshots
    setTimeout(() => {
      pendingWrites.delete(mapKey);
    }, 500);
  }, 1000); // 1 second debounce
  
  debounceMap.set(mapKey, timeoutId);
};

export const listenToFirestoreData = (userId: string, key: string, callback: (data: any) => void) => {
  if (!userId) return () => {};
  const docRef = doc(db, 'users', userId, 'appData', key);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const mapKey = `${userId}_${key}`;
      if (!pendingWrites.has(mapKey) && !docSnap.metadata.hasPendingWrites) {
        callback(docSnap.data().data);
      }
    }
  });
};

export const resetFirestoreData = async (userId: string, keys: string[]) => {
  if (!userId) return;
  try {
    await Promise.all(keys.map(key => {
      const docRef = doc(db, 'users', userId, 'appData', key);
      return deleteDoc(docRef);
    }));
  } catch (error) {
    console.error('Error resetting Firestore data:', error);
  }
};
