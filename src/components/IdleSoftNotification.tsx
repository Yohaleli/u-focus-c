import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, X } from 'lucide-react';
import { SessionLog } from '../types';

interface IdleSoftNotificationProps {
  activeTab: string;
  isSessionActive: boolean;
  sessionLogs: SessionLog[];
  studyHoursStart?: string; // e.g. "09:00"
  studyHoursEnd?: string; // e.g. "18:00"
  idleThresholdMinutes?: number;
}

export default function IdleSoftNotification({
  activeTab,
  isSessionActive,
  sessionLogs,
  studyHoursStart = "09:00",
  studyHoursEnd = "18:00",
  idleThresholdMinutes = 15 // Default to 15 minutes of inactivity
}: IdleSoftNotificationProps) {
  const [show, setShow] = useState(false);
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);

  useEffect(() => {
    // If they are currently in a session or NOT on the focus tab, hide it
    if (isSessionActive || activeTab !== 'focus') {
      setShow(false);
      return;
    }

    let intervalId: any;
    
    const checkIdle = () => {
      // Don't show again immediately if dismissed recently (e.g. wait an hour)
      if (dismissedAt && Date.now() - dismissedAt < 60 * 60 * 1000) {
        return;
      }

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      
      // Check if within study hours
      if (currentTimeStr >= studyHoursStart && currentTimeStr <= studyHoursEnd) {
        // Check time since last session
        let timeSinceLastSessionMinutes = Infinity;
        
        if (sessionLogs.length > 0) {
          // Sort by completedAt descending
          const sortedLogs = [...sessionLogs].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
          const lastSessionTime = new Date(sortedLogs[0].completedAt).getTime();
          timeSinceLastSessionMinutes = (Date.now() - lastSessionTime) / (1000 * 60);
        }

        // If no sessions yet, or last session was long ago, check how long they've been on the app today
        // Actually, for simplicity, if they haven't had a session in `idleThresholdMinutes`, show it.
        if (timeSinceLastSessionMinutes >= idleThresholdMinutes) {
          setShow(true);
        } else {
          setShow(false);
        }
      } else {
        setShow(false);
      }
    };

    // Check every minute
    intervalId = setInterval(checkIdle, 60 * 1000);
    // Also check immediately
    checkIdle();

    return () => clearInterval(intervalId);
  }, [activeTab, isSessionActive, sessionLogs, studyHoursStart, studyHoursEnd, idleThresholdMinutes, dismissedAt]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 z-50 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-w-sm flex items-start gap-4"
        >
          <div className="bg-orange-500/10 p-2.5 rounded-full border border-orange-500/20 shrink-0 mt-0.5">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-1 pr-2">
            <h4 className="font-semibold text-white/90 text-sm tracking-wide">Ready to focus?</h4>
            <p className="text-white/60 text-xs mt-1.5 leading-relaxed font-sans">
              It looks like you haven't started a session recently during your usual study hours. Whenever you're ready, the timer is waiting for you.
            </p>
          </div>
          <button 
            onClick={() => {
              setShow(false);
              setDismissedAt(Date.now());
            }}
            className="text-white/40 hover:text-white/80 transition-colors p-1 -mt-1 -mr-1 shrink-0"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
