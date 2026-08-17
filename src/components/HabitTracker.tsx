import { EthDateTime } from 'ethiopian-calendar-date-converter';
import React, { useState, useEffect, useMemo } from 'react';
import { useSyncedState } from '../hooks/useSyncedState';
import { ZoomIn, ZoomOut, Check, X, Plus, Trash2, RotateCcw, Sparkles, FileText, LayoutGrid, Calendar, List, ChevronDown, Flame, ChevronUp, ChevronDown as ChevronDownIcon, Edit2 } from 'lucide-react';
import CalendarWidget from './CalendarWidget';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Habit {
  id: string;
  name: string;
  isCustom?: boolean;
}

// Record mapping HabitID to DateKey (YYYY-MM-DD) to status: 'done' | 'missed' | 'empty'
type HabitHistory = Record<string, Record<string, 'done' | 'missed' | 'empty'>>;

const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', name: 'Wake up early' },
  { id: 'h2', name: 'Cold shower' },
  { id: 'h3', name: 'Workout' },
  { id: 'h4', name: 'Read 20 pages' },
  { id: 'h5', name: 'No sugar' },
  { id: 'h6', name: 'Meditate 10 min' },
  { id: 'h7', name: 'Drink 3L water' },
  { id: 'h8', name: 'No phone first hour' },
  { id: 'h9', name: 'Journaling' },
  { id: 'h10', name: 'Eat clean' },
  { id: 'h11', name: 'Daily walk' },
  { id: 'h12', name: 'Push through hard days' },
  { id: 'h13', name: 'No alcohol' },
  { id: 'h14', name: 'Sleep by 10:30' },
  { id: 'h15', name: 'Plan tomorrow today' },
];

const GREGORIAN_MONTHS = [
  { name: 'January', value: 0, days: 31 },
  { name: 'February', value: 1, days: 28 },
  { name: 'March', value: 2, days: 31 },
  { name: 'April', value: 3, days: 30 },
  { name: 'May', value: 4, days: 31 },
  { name: 'June', value: 5, days: 30 },
  { name: 'July', value: 6, days: 31 },
  { name: 'August', value: 7, days: 31 },
  { name: 'September', value: 8, days: 30 },
  { name: 'October', value: 9, days: 31 },
  { name: 'November', value: 10, days: 30 },
  { name: 'December', value: 11, days: 31 },
];

const ETHIOPIAN_MONTHS = [
  { name: 'መስከረም', value: 0, days: 30 },
  { name: 'ጥቅምት', value: 1, days: 30 },
  { name: 'ኅዳር', value: 2, days: 30 },
  { name: 'ታኅሣሥ', value: 3, days: 30 },
  { name: 'ጥር', value: 4, days: 30 },
  { name: 'የካቲት', value: 5, days: 30 },
  { name: 'መጋቢት', value: 6, days: 30 },
  { name: 'ሚያዝያ', value: 7, days: 30 },
  { name: 'ግንቦት', value: 8, days: 30 },
  { name: 'ሰኔ', value: 9, days: 30 },
  { name: 'ሐምሌ', value: 10, days: 30 },
  { name: 'ነሐሴ', value: 11, days: 30 },
  { name: 'ጳጉሜን', value: 12, days: 5 },
];

export default function HabitTracker({ calendarType = 'gregorian', userId, onHabitCompleted, onHabitIncompleted }: { calendarType?: 'gregorian' | 'ethiopian', userId: string | null, onHabitCompleted?: () => void, onHabitIncompleted?: () => void }) {
  const currentLocalDate = useMemo(() => new Date(), []);
  
  const currentMonthsList = calendarType === 'ethiopian' ? ETHIOPIAN_MONTHS : GREGORIAN_MONTHS;

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (calendarType === 'ethiopian') {
      try {
        const ethNow = EthDateTime.fromEuropeanDate(currentLocalDate);
        return ethNow.year;
      } catch(e) {}
    }
    return currentLocalDate.getFullYear();
  });
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(() => {
    if (calendarType === 'ethiopian') {
      try {
        const ethNow = EthDateTime.fromEuropeanDate(currentLocalDate);
        return ethNow.month - 1;
      } catch(e) {}
    }
    return currentLocalDate.getMonth();
  });
  const [isCalendarView, setIsCalendarView] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const prevCalendarTypeRef = React.useRef(calendarType);
  useEffect(() => {
    if (prevCalendarTypeRef.current !== calendarType) {
      const now = new Date();
      if (calendarType === 'ethiopian') {
        try {
          const ethNow = EthDateTime.fromEuropeanDate(now);
          setSelectedYear(ethNow.year);
          setSelectedMonthIdx(ethNow.month - 1);
        } catch(e) {}
      } else {
        setSelectedYear(now.getFullYear());
        setSelectedMonthIdx(now.getMonth());
      }
      prevCalendarTypeRef.current = calendarType;
    } else {
      if (calendarType === 'ethiopian' && selectedMonthIdx > 12) {
        setSelectedMonthIdx(12);
      } else if (calendarType === 'gregorian' && selectedMonthIdx > 11) {
        setSelectedMonthIdx(11);
      }
    }
  }, [calendarType, selectedMonthIdx]);
  
  // Custom & Default Habits list state
  const [habits, setHabits] = useSyncedState<Habit[]>('aura_habits_list', DEFAULT_HABITS, userId);

  // Habit history cell logs state
  const [history, setHistory] = useSyncedState<HabitHistory>('aura_habits_history', {}, userId);

  const [newHabitName, setNewHabitName] = useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingHabitName, setEditingHabitName] = useState('');
  const [confirmDeleteHabitId, setConfirmDeleteHabitId] = useState<string | null>(null);
  const [confirmResetMonth, setConfirmResetMonth] = useState(false);
  const [weekNames, setWeekNames] = useSyncedState<Record<number, string>>('aura_week_names', {}, userId);
  const [editingWeekIdx, setEditingWeekIdx] = useState<number | null>(null);
  const [editingWeekName, setEditingWeekName] = useState('');

  

  const handleStartEditWeek = (idx: number) => {
    setEditingWeekIdx(idx);
    setEditingWeekName(weekNames[idx] || `Week ${idx + 1}`);
  };

  const handleSaveEditWeek = (idx: number) => {
    if (editingWeekName.trim()) {
      setWeekNames(prev => ({ ...prev, [idx]: editingWeekName.trim() }));
    }
    setEditingWeekIdx(null);
  };


    // Persist habits list
  

  // Persist history
  

  // Persist chosen tracker style
  // Handle leap years dynamically
  const daysInMonth = useMemo(() => {
    if (calendarType === 'gregorian' && selectedMonthIdx === 1) {
      const isLeapYear = (selectedYear % 4 === 0 && selectedYear % 100 !== 0) || (selectedYear % 400 === 0);
      return isLeapYear ? 29 : 28;
    }
    if (calendarType === 'ethiopian' && selectedMonthIdx === 12) {
      // Simplistic leap year for Ethiopian
      return (selectedYear % 4 === 3) ? 6 : 5;
    }
    return currentMonthsList[selectedMonthIdx]?.days || 30;
  }, [selectedMonthIdx, selectedYear, calendarType, currentMonthsList]);

  // Format Helper for date keys (YYYY-MM-DD)
  const getDateKey = (day: number) => {
    const y = selectedYear;
    const m = String(selectedMonthIdx + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Cell status toggling: 'empty' -> 'done' -> 'missed' -> 'empty'
  const handlePrevMonth = () => {
    if (selectedMonthIdx === 0) {
      setSelectedMonthIdx(calendarType === 'ethiopian' ? 12 : 11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonthIdx(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    const maxIdx = calendarType === 'ethiopian' ? 12 : 11;
    if (selectedMonthIdx === maxIdx) {
      setSelectedMonthIdx(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonthIdx(m => m + 1);
    }
  };

  const handleResetMonth = () => {
    setHistory((prev) => {
      const newHistory = { ...prev };
      Object.keys(newHistory).forEach((habitId) => {
        const habitRecord = { ...newHistory[habitId] };
        for (let day = 1; day <= daysInMonth; day++) {
          const dateKey = getDateKey(day);
          delete habitRecord[dateKey];
        }
        newHistory[habitId] = habitRecord;
      });
      return newHistory;
    });
    setConfirmResetMonth(false);
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to clear ALL tracking history for all time?')) {
      setHistory({});
    }
  };

  
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Habit,Date,Status\n";
    habits.forEach(h => {
      const records = history[h.id] || {};
      Object.keys(records).forEach(dateKey => {
        csvContent += `"${h.name}",${dateKey},${records[dateKey]}\n`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "habit_tracker_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  const habitStats = useMemo(() => {
    const stats: Record<string, { progress: { completed: number, total: number, percent: number }, streak: { current: number, best: number } }> = {};
    const prefixStr = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}`;
    const today = new Date();
    today.setHours(0,0,0,0);

    habits.forEach(h => {
      const records = history[h.id] || {};
      
      // Calculate Progress
      let count = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${prefixStr}-${String(d).padStart(2, '0')}`;
        if (records[dateKey] === 'done') count++;
      }
      const progress = { completed: count, total: daysInMonth, percent: daysInMonth > 0 ? Math.round((count / daysInMonth) * 100) : 0 };

      // Calculate Streak
      const doneDates = Object.keys(records)
        .filter(k => records[k] === 'done')
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      
      let currentStreak = 0;
      let bestStreak = 0;

      if (doneDates.length > 0) {
        currentStreak = 1;
        bestStreak = 1;
        
        for (let i = 1; i < doneDates.length; i++) {
          const prevDate = new Date(doneDates[i-1]);
          const currDate = new Date(doneDates[i]);
          const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
             currentStreak++;
             bestStreak = Math.max(bestStreak, currentStreak);
          } else if (diffDays > 1) {
             currentStreak = 1;
          }
        }
        
        const lastDate = new Date(doneDates[doneDates.length - 1]);
        const diffFromToday = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffFromToday > 1) {
          currentStreak = 0;
        }
      }

      stats[h.id] = { progress, streak: { current: currentStreak, best: bestStreak } };
    });
    return stats;
  }, [history, habits, selectedYear, selectedMonthIdx, daysInMonth]);

  const toggleCell = (habitId: string, day: number) => {
    const dateKey = getDateKey(day);
    const habitRecord = history[habitId] || {};
    const currentStatus = habitRecord[dateKey] || 'empty';

    let nextStatus: 'done' | 'missed' | 'empty' = 'empty';
    const isPast = isPastDay(day);
    const displayedStatus = (currentStatus === 'empty' && isPast) ? 'missed' : currentStatus;

    if (displayedStatus === 'empty') {
      nextStatus = 'done';
    } else if (displayedStatus === 'done') {
      nextStatus = 'missed';
    } else if (displayedStatus === 'missed') {
      nextStatus = isPast ? 'done' : 'empty';
    }

    // Gamification Hooks
    if (nextStatus === 'done' && currentStatus !== 'done') {
      onHabitCompleted?.();
    } else if (currentStatus === 'done' && nextStatus !== 'done') {
      onHabitIncompleted?.();
    }

    setHistory((prev) => {
      return {
        ...prev,
        [habitId]: {
          ...(prev[habitId] || {}),
          [dateKey]: nextStatus,
        },
      };
    });
  };

  // Add a brand new habit

  const handleSaveEdit = (habitId: string) => {
    if (editingHabitName.trim()) {
      setHabits(prev => prev.map(h => h.id === habitId ? { ...h, name: editingHabitName.trim() } : h));
    }
    setEditingHabitId(null);
    setEditingHabitName('');
  };

  const handleStartEdit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditingHabitName(habit.name);
  };


  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < daysInMonth; i += 7) {
      const chunk = [];
      for (let j = i; j < i + 7 && j < daysInMonth; j++) {
        chunk.push(j + 1);
      }
      w.push({ index: Math.floor(i / 7), days: chunk });
    }
    return w;
  }, [daysInMonth]);

  const weekColors = [
    'text-cyan-400',
    'text-purple-400',
    'text-pink-400',
    'text-orange-400',
    'text-emerald-400',
    'text-cyan-400',
    'text-purple-400',
    'text-pink-400',
    'text-orange-400',
    'text-emerald-400',
    'text-cyan-400',
    'text-purple-400',
    'text-pink-400',
    'text-orange-400',
    'text-emerald-400',
    'text-cyan-400',
    'text-purple-400',
    'text-pink-400',
    'text-orange-400',
    'text-emerald-400',
    'text-cyan-400',
    'text-purple-400',
    'text-pink-400',
    'text-orange-400',
    'text-emerald-400',
    'text-white'
  ];

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) {
      inputRef.current?.focus();
      return;
    }

    const newHabit: Habit = {
      id: `custom-${Date.now()}`,
      name: newHabitName.trim(),
      isCustom: true,
    };

    setHabits((prev) => [...prev, newHabit]);
    setNewHabitName('');
  };

  // Delete custom habit

  const moveHabit = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === habits.length - 1)) return;
    const newHabits = [...habits];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newHabits[index], newHabits[swapIndex]] = [newHabits[swapIndex], newHabits[index]];
    setHabits(newHabits);
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setHistory((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };


  const currentEthDate = useMemo(() => {
    if (calendarType === 'ethiopian') {
      try {
        return EthDateTime.fromEuropeanDate(currentLocalDate);
      } catch(e) {}
    }
    return null;
  }, [calendarType, currentLocalDate]);

  const currentGregDate = useMemo(() => ({
    year: currentLocalDate.getFullYear(),
    month: currentLocalDate.getMonth(),
    date: currentLocalDate.getDate(),
  }), [currentLocalDate]);

  const isPastDay = React.useCallback((dayNum: number, mIdx = selectedMonthIdx, y = selectedYear) => {
    if (calendarType === 'ethiopian') {
      if (currentEthDate) {
        if (y < currentEthDate.year) return true;
        if (y === currentEthDate.year && mIdx + 1 < currentEthDate.month) return true;
        if (y === currentEthDate.year && mIdx + 1 === currentEthDate.month && dayNum < currentEthDate.date) return true;
      }
      return false;
    } else {
      if (y < currentGregDate.year) return true;
      if (y === currentGregDate.year && mIdx < currentGregDate.month) return true;
      if (y === currentGregDate.year && mIdx === currentGregDate.month && dayNum < currentGregDate.date) return true;
      return false;
    }
  }, [calendarType, currentEthDate, currentGregDate, selectedMonthIdx, selectedYear]);

  // Stats calculation for the chosen view context
  
  const monthlyStats = useMemo(() => {
    let totalDone = 0;
    let totalMissed = 0;
    let totalTracked = 0;

    const prefix = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}`;

    habits.forEach((habit) => {
      const records = history[habit.id] || {};
      for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${prefix}-${String(d).padStart(2, '0')}`;
        const stored = records[dateKey];
        if (stored === 'done') {
          totalTracked++;
          totalDone++;
        } else if (stored === 'missed') {
          totalTracked++;
          totalMissed++;
        } else if (isPastDay(d)) {
          totalTracked++;
          totalMissed++;
        }
      }
    });

    const completionRate = totalTracked > 0 ? Math.round((totalDone / (totalDone + totalMissed || 1)) * 100) : 0;

    return {
      totalDone,
      totalMissed,
      completionRate,
    };
  }, [history, habits, selectedMonthIdx, selectedYear, daysInMonth, isPastDay]);



  
  // Highlight active today column
  const todayDayNum = useMemo(() => {
    if (calendarType === 'ethiopian') {
      if (currentEthDate) {
        if (currentEthDate.year === selectedYear && currentEthDate.month === selectedMonthIdx + 1) {
          return currentEthDate.date;
        }
      }
      return null;
    } else {
      const isCurrentYear = currentGregDate.year === selectedYear;
      const isCurrentMonth = currentGregDate.month === selectedMonthIdx;
      return isCurrentYear && isCurrentMonth ? currentGregDate.date : null;
    }
  }, [calendarType, currentEthDate, currentGregDate, selectedMonthIdx, selectedYear]);

  const activeMonthName = useMemo(() => {
    return currentMonthsList[selectedMonthIdx]?.name || '';
  }, [selectedMonthIdx, currentMonthsList]);

  
    // Daily data for chart
  const dailyChartData = useMemo(() => {
    const data = [];
    const prefixStr = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}`;
    for (let d = 1; d <= daysInMonth; d++) {
      let count = 0;
      habits.forEach(h => {
        const habitRecords = history[h.id] || {};
        const dateKey = `${prefixStr}-${String(d).padStart(2, '0')}`;
        if (habitRecords[dateKey] === 'done') count++;
      });
      data.push({ day: String(d), completed: count });
    }
    return data;
  }, [habits, history, selectedYear, selectedMonthIdx, daysInMonth]);


  const yearlyChartData = useMemo(() => {
    const data = [];
    currentMonthsList.forEach((monthObj, mIdx) => {
      let count = 0;
      const mPrefix = `${selectedYear}-${String(mIdx + 1).padStart(2, '0')}`;
      let mDays = monthObj.days || 30;
      if (calendarType === 'ethiopian' && mIdx === 12) {
         mDays = (selectedYear % 4 === 3) ? 6 : 5;
      } else if (calendarType === 'gregorian') {
         mDays = new Date(selectedYear, mIdx + 1, 0).getDate();
      }
      habits.forEach(h => {
        const habitRecords = history[h.id] || {};
        for (let d = 1; d <= mDays; d++) {
          const dateKey = `${mPrefix}-${String(d).padStart(2, '0')}`;
          if (habitRecords[dateKey] === 'done') count++;
        }
      });
      data.push({ month: monthObj.name.substring(0, 3), completed: count });
    });
    return data;
  }, [habits, history, selectedYear, currentMonthsList, calendarType]);


  const weeklyChartData = useMemo(() => {
    const data = [];
    const prefixStr = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}`;
    let currentWeekSum = 0;
    
    for (let d = 1; d <= daysInMonth; d++) {
      let count = 0;
      habits.forEach(h => {
        const habitRecords = history[h.id] || {};
        const dateKey = `${prefixStr}-${String(d).padStart(2, '0')}`;
        if (habitRecords[dateKey] === 'done') count++;
      });
      currentWeekSum += count;
      
      if (d % 7 === 0 || d === daysInMonth) {
        const weekNum = Math.ceil(d / 7);
        data.push({ week: `W${weekNum}`, completed: currentWeekSum });
        currentWeekSum = 0;
      }
    }
    return data;
  }, [habits, history, selectedYear, selectedMonthIdx, daysInMonth]);

  // Calculate Overall Progress Stats
  let totalMonthlyDays = 0;
  let completedMonthlyDays = 0;
  const currentMonthPrefix = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}`;
  
  habits.forEach(h => {
    const habitRecords = history[h.id] || {};
    for (let d = 1; d <= daysInMonth; d++) {
      totalMonthlyDays++;
      const dateKey = `${currentMonthPrefix}-${String(d).padStart(2, '0')}`;
      if (habitRecords[dateKey] === 'done') completedMonthlyDays++;
    }
  });
  const monthlyPercent = totalMonthlyDays > 0 ? Math.round((completedMonthlyDays / totalMonthlyDays) * 100) : 0;

  let totalYearlyDays = 0;
  let completedYearlyDays = 0;
  
  habits.forEach(h => {
    const habitRecords = history[h.id] || {};
    currentMonthsList.forEach((monthObj, mIdx) => {
      const mPrefix = `${selectedYear}-${String(mIdx + 1).padStart(2, '0')}`;
      let mDays = monthObj.days || 30;
      if (calendarType === 'ethiopian' && mIdx === 12) {
         mDays = (selectedYear % 4 === 3) ? 6 : 5;
      } else if (calendarType === 'gregorian') {
         mDays = new Date(selectedYear, mIdx + 1, 0).getDate();
      }
      for (let d = 1; d <= mDays; d++) {
        totalYearlyDays++;
        const dateKey = `${mPrefix}-${String(d).padStart(2, '0')}`;
        if (habitRecords[dateKey] === 'done') completedYearlyDays++;
      }
    });
  });
  const yearlyPercent = totalYearlyDays > 0 ? Math.round((completedYearlyDays / totalYearlyDays) * 100) : 0;

  return (
    <div 
      id="habit-tracker-container" 
      className="relative w-full h-full flex-1 flex flex-col transition-all duration-500 bg-transparent text-white overflow-hidden"
    >
      {/* Utility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4 px-4 sm:px-8 pt-4 shrink-0">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="flex items-center gap-2 text-white">
            
              {calendarType === 'ethiopian' ? (
              <span className="font-mono text-xs tracking-wider opacity-60">ወር:</span>
            ) : (
              <span className="font-mono text-xs uppercase tracking-wider opacity-60">Month:</span>
            )}
            
            <div className="relative flex items-center gap-1 cursor-pointer">
              <span className="font-mono text-sm uppercase tracking-wider font-bold text-white">
                {currentMonthsList.find(m => m.value === selectedMonthIdx)?.name || ''}
              </span>
              <ChevronDown className="w-4 h-4 opacity-60" />
              <select
                value={selectedMonthIdx}
                onChange={(e) => setSelectedMonthIdx(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {currentMonthsList.map((m) => (
                  <option key={m.value} value={m.value} className="bg-black/60 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white">
            
              {calendarType === 'ethiopian' ? (
              <span className="font-mono text-xs tracking-wider opacity-60">ዓመት:</span>
            ) : (
              <span className="font-mono text-xs uppercase tracking-wider opacity-60">Year:</span>
            )}
            
            <div className="relative flex items-center gap-1 cursor-pointer">
              <span className="font-mono text-sm uppercase tracking-wider font-bold text-white">
                {selectedYear}
              </span>
              <ChevronDown className="w-4 h-4 opacity-60" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  let y = new Date().getFullYear() - 2 + i;
                  if (calendarType === 'ethiopian') {
                    try {
                      const ethNow = EthDateTime.fromEuropeanDate(new Date());
                      y = ethNow.year - 2 + i;
                    } catch(e) {}
                  }
                  return (
                    <option key={y} value={y} className="bg-black/60 text-white">
                      {y}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-center flex-1 min-w-[200px]">
          <form onSubmit={handleAddHabit} className="flex items-center relative w-56 sm:w-72 border-b border-white/20 hover:border-white/50 focus-within:border-white transition-colors pb-1 group">
            <input
              ref={inputRef}
              type="text"
              placeholder={calendarType === 'ethiopian' ? 'አዲስ ልማድ ጨምር...' : 'Add new habit...'}
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none text-sm text-white placeholder-white/40 pl-2 pr-8 font-medium"
            />
            <button
              type="submit"
              className="absolute right-0 p-1 text-white/40 group-focus-within:text-white/80 hover:!text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))}
            className="flex items-center justify-center p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(z => Math.min(2, z + 0.1))}
            className="flex items-center justify-center p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
              onClick={() => setIsCalendarView(!isCalendarView)}
              className="flex items-center justify-center p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Toggle View"
            >
              {isCalendarView ? <List className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
            </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative w-full rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md shadow-inner text-white flex flex-col">
        {/* CHECKLIST TABLE: Monthly Grid */}
        <div className="flex-1 overflow-auto custom-scrollbar w-full">
          <table className="w-full border-separate border-spacing-0 select-none" style={{ zoom: zoomLevel } as React.CSSProperties}>
          <thead className="sticky top-0 z-40 shadow-md">
            <tr className="border-b border-white/10 h-8">
              <th rowSpan={2} className="p-2 sm:p-4 text-left text-[14px] font-bold uppercase tracking-widest sticky left-0 z-50 min-w-[160px] max-w-[200px] border border-white/10 font-mono text-white/50 bg-[#151515]">Habits</th>
              {weeks.map((w) => (
                <th
                  key={`week-${w.index}`}
                  colSpan={w.days.length}
                  className={`p-1 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-white/10 bg-[#151515] ${weekColors[w.index % weekColors.length]}`}
                >
                  {editingWeekIdx === w.index ? (
                    <input
                      type="text"
                      value={editingWeekName}
                      onChange={(e) => setEditingWeekName(e.target.value)}
                      onBlur={() => handleSaveEditWeek(w.index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEditWeek(w.index);
                        if (e.key === 'Escape') setEditingWeekIdx(null);
                      }}
                      autoFocus
                      className="w-full max-w-[100px] bg-white/10 border border-white/30 rounded text-white focus:outline-none focus:border-white px-1 py-0.5 text-center transition-colors font-sans"
                    />
                  ) : (
                    <span 
                      className="cursor-text hover:brightness-125 transition-colors inline-block"
                      title="Click to rename"
                      onClick={() => handleStartEditWeek(w.index)}
                    >
                      {weekNames[w.index] || `WEEK ${w.index + 1}`}
                    </span>
                  )}
                </th>
              ))}
            </tr>
            <tr className="border-b border-white/10 h-8">
              {weeks.map((w) => 
                w.days.map((dayNum) => {
                  const isToday = dayNum === todayDayNum;
                  return (
                    <th
                      key={dayNum}
                      className={`p-1 sm:p-2 text-center font-mono text-[12px] font-bold min-w-[24px] border border-white/10 bg-[#151515] ${
                        isToday ? 'text-white' : 'text-white/40'
                      }`}
                    >
                      {dayNum}
                    </th>
                  );
                })
              )}
            </tr>
          </thead>

          <tbody>
            {habits.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth + 2} className="py-12 text-center text-white/50 text-sm font-light">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 mb-2">
                      <Plus className="w-5 h-5 text-white/40" />
                    </div>
                    <p>No habits tracked yet.</p>
                    <button onClick={handleAddHabit} className="text-white hover:text-white/80 transition-colors underline decoration-white/30 underline-offset-4">Add your first habit</button>
                  </div>
                </td>
              </tr>
            ) : habits.map((habit) => {
              const records = history[habit.id] || {};
              return (
                <tr
                  key={habit.id}
                  className="transition-colors hover:bg-white/5"
                >
                  <td className="p-2 sm:p-3.5 text-sm font-semibold sticky left-0 z-20 border border-white/10 transition-colors font-sans text-white/95 bg-[#151515]">
                    <div className="flex items-center justify-between gap-2 max-w-[150px] sm:max-w-[190px]">
                      {editingHabitId === habit.id ? (
                        <input
                          type="text"
                          value={editingHabitName}
                          onChange={(e) => setEditingHabitName(e.target.value)}
                          onBlur={() => handleSaveEdit(habit.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(habit.id);
                            if (e.key === 'Escape') setEditingHabitId(null);
                          }}
                          autoFocus
                          className="w-full bg-white/10 border border-white/30 rounded text-white focus:outline-none focus:border-white focus:bg-white/10 px-2 py-1 text-sm transition-colors"
                        />
                      ) : (
                                                                        <div className="flex flex-col truncate flex-1 min-w-0" title="Click to edit" onClick={() => handleStartEdit(habit)}>
                          <span className="truncate cursor-text hover:text-white/70 transition-colors">
                            {habit.name}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            {habitStats[habit.id]?.streak.current > 0 && (
                              <span className="text-[9px] text-orange-400 font-mono flex items-center gap-0.5 whitespace-nowrap" title={`Best Streak: ${habitStats[habit.id]?.streak.best}`}>
                                <Flame className="w-2.5 h-2.5" /> {habitStats[habit.id]?.streak.current}
                              </span>
                            )}
                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden" title={`${habitStats[habit.id]?.progress.percent}% completed this month`}>
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${habitStats[habit.id]?.progress.percent}%` }} />
                            </div>
                          </div>
                        </div>
                      )}
                                            <div className="flex flex-col items-center ml-1 shrink-0">
                        <button onClick={() => moveHabit(habits.findIndex(h => h.id === habit.id), 'up')} className="text-white/20 hover:text-white/70 transition-colors p-0.5"><ChevronUp className="w-3 h-3" /></button>
                        <button onClick={() => moveHabit(habits.findIndex(h => h.id === habit.id), 'down')} className="text-white/20 hover:text-white/70 transition-colors p-0.5"><ChevronDownIcon className="w-3 h-3" /></button>
                      </div>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="hover:bg-white/5 text-white/20 hover:text-white p-1 rounded transition-colors shrink-0"
                        title="Delete habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {weeks.map((w) => 
                    w.days.map((dayNum) => {
                      const dateKey = getDateKey(dayNum);
                      let status = records[dateKey] || 'empty';
                      if (status === 'empty' && isPastDay(dayNum)) {
                        status = 'missed';
                      }
                      const isToday = dayNum === todayDayNum;
                      const checkColor = weekColors[w.index % weekColors.length];
                      return (
                        <td
                          key={dayNum}
                          onClick={() => { if (isToday || isPastDay(dayNum)) toggleCell(habit.id, dayNum); }}
                          className={`p-2 text-center transition-all border border-white/10 relative ${(isToday || isPastDay(dayNum)) ? 'cursor-pointer hover:bg-white/5 bg-white/10' : ''} ${
                            isToday 
                              ? '' 
                              : ''
                          }`}
                        >
                          <div className="w-5 h-5 sm:w-7 sm:h-7 mx-auto flex items-center justify-center select-none">
                            {status === 'done' && (
                              <span className="text-green-500 text-base sm:text-lg font-bold drop-shadow-md">✓</span>
                            )}
                            {status === 'missed' && (
                              <span className="text-red-500 text-base sm:text-lg font-bold drop-shadow-md select-none">x</span>
                            )}
                            {status === 'empty' && (
                              <span className="opacity-0">·</span>
                            )}
                          </div>
                        </td>
                      );
                    })
                  )}
                </tr>
              );
            })}
          </tbody>

          <tfoot className="bg-transparent z-20 shadow-inner">
            <tr className="bg-transparent border-none"><td colSpan={100} className="h-6 border-none bg-transparent"></td></tr>
            <tr>
              <td className="p-2 sm:p-4 text-center font-bold uppercase tracking-widest sticky left-0 z-30 border border-white/10 font-serif text-white bg-[#151515]">
                Weekly Progress
              </td>
              {weeks.map((w) => {
                let completed = 0;
                let total = 0;
                
                const prefixStr = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}`;

                habits.forEach(h => {
                  const habitRecords = history[h.id] || {};
                  w.days.forEach(d => {
                    total++;
                    const dateKey = `${prefixStr}-${d.toString().padStart(2, '0')}`;
                    if (habitRecords[dateKey] === 'done') completed++;
                  });
                });
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                const colorClass = weekColors[w.index % weekColors.length];
                
                return (
                  <td key={`prog-${w.index}`} colSpan={w.days.length} className={`p-4 border border-white/10 text-center ${colorClass}`}>
                    <div className="flex justify-center items-center">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-white/10"
                            strokeWidth="4"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="transition-all duration-1000 ease-out"
                            strokeWidth="4"
                            strokeDasharray={`${percent}, 100`}
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-sm sm:text-lg">
                          {percent}%
                        </div>
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="p-1 sm:p-2 pr-4 text-right text-[10px] sm:text-xs font-semibold sticky left-0 z-30 border border-white/10 font-sans text-white/70 bg-[#151515]">Habits Completed</td>
              {weeks.map(w => w.days.map(d => {
                let count = 0;
                const prefixStr = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}`;
                habits.forEach(h => {
                  const habitRecords = history[h.id] || {};
                  const dateKey = `${prefixStr}-${d.toString().padStart(2, '0')}`;
                  if (habitRecords[dateKey] === 'done') count++;
                });
                return (
                  <td key={`comp-${d}`} className="p-1 text-center font-mono text-[10px] sm:text-[11px] border border-white/10 text-white/80 font-bold bg-[#151515]">
                    {count}
                  </td>
                );
              }))}
            </tr>
            <tr>
              <td className="p-1 sm:p-2 pr-4 text-right text-[10px] sm:text-xs font-semibold sticky left-0 z-30 border border-white/10 font-sans text-white/70 bg-[#151515]">Habits Incompleted</td>
              {weeks.map(w => w.days.map(d => {
                let count = 0;
                const prefixStr = `${selectedYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}`;
                habits.forEach(h => {
                  const habitRecords = history[h.id] || {};
                  const dateKey = `${prefixStr}-${d.toString().padStart(2, '0')}`;
                  if (habitRecords[dateKey] !== 'done') count++;
                });
                return (
                  <td key={`inc-${d}`} className="p-1 text-center font-mono text-[10px] sm:text-[11px] border border-white/10 text-white/50 bg-[#151515]">
                    {count}
                  </td>
                );
              }))}
            </tr>
          </tfoot>

        </table>
          <div className="flex flex-col sm:flex-row gap-4 mt-6 mb-2 mx-2">
            {/* Monthly Progress */}
            <div className="flex-1 flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 border border-white/10 shadow-lg">
               <div className="relative w-14 h-14 shrink-0">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/10"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="transition-all duration-1000 ease-out text-white"
                      strokeWidth="3"
                      strokeDasharray={`${monthlyPercent}, 100`}
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-white">
                    {monthlyPercent}%
                  </div>
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Monthly Progress</span>
                 <span className="text-sm font-bold text-white">{completedMonthlyDays} / {totalMonthlyDays} Habits</span>
               </div>
            </div>

            {/* Yearly Progress */}
            <div className="flex-1 flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-4 border border-white/10 shadow-lg">
               <div className="relative w-14 h-14 shrink-0">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/10"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="transition-all duration-1000 ease-out text-white"
                      strokeWidth="3"
                      strokeDasharray={`${yearlyPercent}, 100`}
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-white">
                    {yearlyPercent}%
                  </div>
               </div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Yearly Progress</span>
                 <span className="text-sm font-bold text-white">{completedYearlyDays} / {totalYearlyDays} Habits</span>
               </div>
            </div>
          </div>
          <div className="flex flex-col xl:flex-row gap-4 mx-2 mb-6">
            <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10 shadow-lg">
              <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-4">Daily Completion Trend</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#34d399' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                      labelStyle={{ display: 'none' }}
                      formatter={(value) => [`${value} Habits`, 'Completed']}
                    />
                    <Line type="monotone" dataKey="completed" stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: '#34d399', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            
            <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10 shadow-lg">
              <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-4">Weekly Trend</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="week" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#a855f7' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                      labelStyle={{ display: 'none' }}
                      formatter={(value) => [`${value} Habits`, 'Completed']}
                    />
                    <Line type="monotone" dataKey="completed" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10 shadow-lg">
              <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-widest mb-4">Yearly Completion Trend</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearlyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#60a5fa' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                      labelStyle={{ display: 'none' }}
                      formatter={(value) => [`${value} Habits`, 'Completed']}
                    />
                    <Line type="monotone" dataKey="completed" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: '#60a5fa', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>


      {isCalendarView && (
        <div className="absolute top-16 right-4 sm:right-8 z-50 w-full max-w-[320px] sm:max-w-[400px] max-h-[70vh] overflow-y-auto  shadow-2xl rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl border border-white/20 custom-scrollbar">
          <CalendarWidget 
            calendarType={calendarType} 
            year={selectedYear} 
            monthIdx={selectedMonthIdx}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
        </div>
      )}
    </div>
  );
}
