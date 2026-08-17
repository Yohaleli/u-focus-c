import React, { useState, useEffect, useRef } from 'react';
import { syncDataToFirestore, listenToFirestoreData } from '../lib/firebase-sync';

export function useSyncedState<T>(
  key: string,
  initialValue: T,
  userId: string | null
): [T, React.Dispatch<React.SetStateAction<T>>] {
  
  // Read from local storage initially
  const readValue = (): T => {
    try {
      if (!userId) return initialValue;
      const item = window.localStorage.getItem(`${userId}_${key}`);
      if (!item) return initialValue;
      try {
        if (item === "undefined") return initialValue;
        // Only try to parse if it looks like JSON
        if (item.startsWith('{') || item.startsWith('[') || item.startsWith('"') || item === 'true' || item === 'false' || item === 'null' || (item.trim() !== '' && !isNaN(Number(item)))) {
            return JSON.parse(item);
        }
        return item as unknown as T;
      } catch (e) {
        // Fallback for un-stringified legacy data
        return item as unknown as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage item ${key}:`, error);
      return initialValue;
    }
  };

  const [state, setState] = useState<T>(readValue);
  const isInitialMount = useRef(true);
  const isUpdatingFromRemote = useRef(false);
  const isUpdatingFromLocalEvent = useRef(false);
  const prevUserId = useRef(userId);

  // Listen for local custom events (cross-component sync in same window)
  useEffect(() => {
    const handleLocalSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.key === `${userId}_${key}`) {
        setState((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(customEvent.detail.value)) {
            isUpdatingFromLocalEvent.current = true;
            return customEvent.detail.value;
          }
          return prev;
        });
      }
    };
    window.addEventListener('use-synced-state-update', handleLocalSync);
    return () => window.removeEventListener('use-synced-state-update', handleLocalSync);
  }, [userId, key]);

  // Update state when userId changes (e.g. from null to a user on auth init)
  useEffect(() => {
    if (prevUserId.current !== userId) {
      if (!userId) {
        setState(initialValue);
      } else {
        try {
          const item = window.localStorage.getItem(`${userId}_${key}`);
          if (item) {
            const parsed = (item.startsWith('{') || item.startsWith('[') || item.startsWith('"') || item === 'true' || item === 'false' || item === 'null' || (item.trim() !== '' && !isNaN(Number(item)))) ? JSON.parse(item) : item;
            setState(parsed);
          } else {
            setState(initialValue);
          }
        } catch (e) {
          setState(initialValue);
        }
      }
      prevUserId.current = userId;
    }
  }, [userId, key, initialValue]);

  // Listen to Firestore
  useEffect(() => {
    if (!userId) return;
    
    const unsubscribe = listenToFirestoreData(userId, key, (remoteData) => {
      if (remoteData !== undefined && remoteData !== null) {
        isUpdatingFromRemote.current = true;
        setState(remoteData);
        window.localStorage.setItem(`${userId}_${key}`, JSON.stringify(remoteData));
        
        // Reset the flag in the next tick
        setTimeout(() => {
          isUpdatingFromRemote.current = false;
        }, 50);
      }
    });

    return () => unsubscribe();
  }, [userId, key]);

  // Sync to local storage and Firestore on state change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (userId) {
      try {
        window.localStorage.setItem(`${userId}_${key}`, JSON.stringify(state));
        
        // If the change wasn't triggered by a remote update or a cross-component event, upload and broadcast
        if (!isUpdatingFromRemote.current && !isUpdatingFromLocalEvent.current) {
          // Broadcast to other components in the same window
          window.dispatchEvent(new CustomEvent('use-synced-state-update', {
            detail: { key: `${userId}_${key}`, value: state }
          }));

          syncDataToFirestore(userId, key, state);
        }

        // Reset the local event flag
        isUpdatingFromLocalEvent.current = false;
      } catch (error) {
        console.warn(`Error setting localStorage item ${key}:`, error);
      }
    }
  }, [key, state, userId]);

  return [state, setState];
}
