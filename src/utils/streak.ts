import { SessionLog } from '../types';

/**
 * Calculates the number of consecutive days a user has completed a study session.
 * @param sessionLogs Array of SessionLog items with completedAt timestamp strings
 * @returns number of consecutive days streak
 */
export function calculateStudyStreak(sessionLogs: SessionLog[]): number {
  if (!sessionLogs || sessionLogs.length === 0) return 0;

  // Helper to format date as YYYY-MM-DD in local timezone
  const toLocalDateString = (dateObj: Date): string => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Extract unique study dates (YYYY-MM-DD) sorted descending (newest first)
  const uniqueDateStrings = Array.from(
    new Set(
      sessionLogs
        .map((log) => {
          if (!log.completedAt) return null;
          const d = new Date(log.completedAt);
          if (isNaN(d.getTime())) return null;
          return toLocalDateString(d);
        })
        .filter((d): d is string => d !== null)
    )
  ).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

  if (uniqueDateStrings.length === 0) return 0;

  const todayStr = toLocalDateString(new Date());

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = toLocalDateString(yesterdayDate);

  const newestDateStr = uniqueDateStrings[0];

  // If the newest session was before yesterday, streak is broken
  if (newestDateStr !== todayStr && newestDateStr !== yesterdayStr) {
    return 0;
  }

  let streak = 1;

  for (let i = 0; i < uniqueDateStrings.length - 1; i++) {
    // Parse YYYY-MM-DD as UTC to avoid timezone shift issue during date math
    const [y1, m1, d1] = uniqueDateStrings[i].split('-').map(Number);
    const [y2, m2, d2] = uniqueDateStrings[i + 1].split('-').map(Number);

    const dateCurrent = Date.UTC(y1, m1 - 1, d1);
    const dateNext = Date.UTC(y2, m2 - 1, d2);

    const diffDays = Math.round((dateCurrent - dateNext) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break;
    }
  }

  return streak;
}
