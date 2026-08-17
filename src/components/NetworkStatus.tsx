import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-neutral-700/50 rounded-full shadow-lg text-xs font-medium text-neutral-300 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <WifiOff className="w-3.5 h-3.5 text-white" />
      <span>Working Offline (Sync Paused)</span>
    </div>
  );
}
