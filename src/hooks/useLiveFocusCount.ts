import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export function useLiveFocusCount(userId: string | null | undefined, isSessionActive: boolean) {
  const [liveCount, setLiveCount] = useState<number>(0);

  // Effect to update the current user's focus status in Firestore
  useEffect(() => {
    if (!userId) return;

    const statusRef = doc(db, 'focus_status', userId);

    if (isSessionActive) {
      setDoc(statusRef, { 
        isFocusing: true, 
        lastActive: serverTimestamp() 
      }, { merge: true }).catch(err => console.error('Failed to set focus status:', err));
    } else {
      setDoc(statusRef, { 
        isFocusing: false 
      }, { merge: true }).catch(err => console.error('Failed to set focus status:', err));
    }

    // Cleanup function when component unmounts
    return () => {
      setDoc(statusRef, { 
        isFocusing: false 
      }, { merge: true }).catch(err => console.error('Failed to set focus status:', err));
    };
  }, [userId, isSessionActive]);

  // Effect to listen for all focusing users
  useEffect(() => {
    const q = query(
      collection(db, 'focus_status'),
      where('isFocusing', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLiveCount(snapshot.size);
    }, (error) => {
      console.error('Error listening to live focus count:', error);
    });

    return () => unsubscribe();
  }, []);

  return liveCount;
}
