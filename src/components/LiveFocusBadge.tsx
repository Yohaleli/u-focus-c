import React from 'react';
import { useLiveFocusCount } from '../hooks/useLiveFocusCount';

interface LiveFocusBadgeProps {
  userId: string | null | undefined;
  isSessionActive: boolean;
}

export default function LiveFocusBadge({ userId, isSessionActive }: LiveFocusBadgeProps) {
  const count = useLiveFocusCount(userId, isSessionActive);

  /*
   * FIRESTORE SECURITY RULES FOR 'focus_status'
   * 
   * To secure this feature, you should add the following rule to your firestore.rules:
   * 
   * match /focus_status/{userId} {
   *   // Anyone can read the focus status to calculate the total count
   *   allow read: if request.auth != null;
   *   // Users can only write to their own focus status document
   *   allow write: if request.auth != null && request.auth.uid == userId;
   * }
   */

  if (count <= 0) return null;

  return (
    <div className="flex items-center gap-2 bg-[#EFEBE6] border-2 border-black rounded-none px-3 py-1 shadow-[2px_2px_0_0_#000]">
      <div className="w-2.5 h-2.5 bg-red-500 border border-black rounded-none animate-pulse" />
      <span className="font-mono text-xs md:text-sm font-bold text-black uppercase tracking-wider">
        {count} {count === 1 ? 'User' : 'Users'} IN DEEP WORK
      </span>
    </div>
  );
}
