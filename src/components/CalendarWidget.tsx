import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EthDateTime } from 'ethiopian-calendar-date-converter';

interface CalendarWidgetProps {
  calendarType: 'gregorian' | 'ethiopian';
  year: number;
  monthIdx: number; // 0-based
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const ETH_MONTH_NAMES_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yakatit',
  'Maggabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehasa', 'Pagume'
];
const ETH_MONTH_NAMES_AM = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];
const GREG_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = [
  { am: 'እሑድ', en: 'Sun' },
  { am: 'ሰኞ', en: 'Mon' },
  { am: 'ማክሰኞ', en: 'Tue' },
  { am: 'ረቡዕ', en: 'Wed' },
  { am: 'ሐሙስ', en: 'Thu' },
  { am: 'አርብ', en: 'Fri' },
  { am: 'ቅዳሜ', en: 'Sat' },
];

export default function CalendarWidget({
  calendarType,
  year,
  monthIdx,
  onPrevMonth,
  onNextMonth
}: CalendarWidgetProps) {
  const days = useMemo(() => {
    const grid = [];
    if (calendarType === 'ethiopian') {
      const isPagume = monthIdx === 12;
      let daysInMonth = 30;
      if (isPagume) {
        daysInMonth = (year % 4 === 3) ? 6 : 5;
      }
      
      const firstDayEth = new EthDateTime(year, monthIdx + 1, 1);
      const firstDayGreg = firstDayEth.toEuropeanDate();
      const startWeekday = firstDayGreg.getDay(); // 0 = Sun
      
      // Pad empty cells
      for (let i = 0; i < startWeekday; i++) {
        grid.push(null);
      }
      
      for (let d = 1; d <= daysInMonth; d++) {
        const ethDate = new EthDateTime(year, monthIdx + 1, d);
        const gregDate = ethDate.toEuropeanDate();
        grid.push({
          main: d,
          sub: gregDate.getDate(),
          isToday: false // We will calculate this
        });
      }
    } else {
      const firstDay = new Date(year, monthIdx, 1);
      const startWeekday = firstDay.getDay();
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
      
      for (let i = 0; i < startWeekday; i++) {
        grid.push(null);
      }
      
      for (let d = 1; d <= daysInMonth; d++) {
        const gDate = new Date(year, monthIdx, d);
        let ethSub: string | number = '';
        try {
          const eDate = EthDateTime.fromEuropeanDate(gDate);
          ethSub = eDate.date;
        } catch (e) {}
        grid.push({
          main: d,
          sub: ethSub,
          isToday: false
        });
      }
    }
    
    // Check today
    const now = new Date();
    let currentMainStr = '';
    if (calendarType === 'ethiopian') {
      try {
        const ethNow = EthDateTime.fromEuropeanDate(now);
        if (ethNow.year === year && ethNow.month === monthIdx + 1) {
          const todayCell = grid.find(c => c && c.main === ethNow.date);
          if (todayCell) todayCell.isToday = true;
        }
      } catch(e){}
    } else {
      if (now.getFullYear() === year && now.getMonth() === monthIdx) {
        const todayCell = grid.find(c => c && c.main === now.getDate());
        if (todayCell) todayCell.isToday = true;
      }
    }
    
    return grid;
  }, [calendarType, year, monthIdx]);

  // Determine header sub-text
  const subText = useMemo(() => {
    if (calendarType === 'ethiopian') {
      const firstDayEth = new EthDateTime(year, monthIdx + 1, 1);
      const gregStart = firstDayEth.toEuropeanDate();
      let daysInMonth = 30;
      if (monthIdx === 12) daysInMonth = (year % 4 === 3) ? 6 : 5;
      const lastDayEth = new EthDateTime(year, monthIdx + 1, daysInMonth);
      const gregEnd = lastDayEth.toEuropeanDate();
      
      const startMonth = GREG_MONTH_NAMES[gregStart.getMonth()];
      const endMonth = GREG_MONTH_NAMES[gregEnd.getMonth()];
      const startYear = gregStart.getFullYear();
      const endYear = gregEnd.getFullYear();
      
      if (startMonth === endMonth && startYear === endYear) {
        return `${startMonth} ${startYear}`;
      } else if (startYear === endYear) {
        return `${startMonth} - ${endMonth} ${startYear}`;
      } else {
        return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
      }
    } else {
      try {
        const firstDay = new Date(year, monthIdx, 1);
        const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
        const lastDay = new Date(year, monthIdx, daysInMonth);
        
        const ethStart = EthDateTime.fromEuropeanDate(firstDay);
        const ethEnd = EthDateTime.fromEuropeanDate(lastDay);
        
        const startMonth = ETH_MONTH_NAMES_EN[ethStart.month - 1];
        const endMonth = ETH_MONTH_NAMES_EN[ethEnd.month - 1];
        const startYear = ethStart.year;
        const endYear = ethEnd.year;
        
        if (startMonth === endMonth && startYear === endYear) {
          return `${startMonth} ${startYear}`;
        } else if (startYear === endYear) {
          return `${startMonth} - ${endMonth} ${startYear}`;
        } else {
          return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
        }
      } catch (e) {
        return '';
      }
    }
  }, [calendarType, year, monthIdx]);

  const mainTitle = calendarType === 'ethiopian' 
    ? `${ETH_MONTH_NAMES_AM[monthIdx]} ${year}`
    : `${GREG_MONTH_NAMES[monthIdx]} ${year}`;

  return (
    <div className="flex flex-col bg-transparent text-white w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <button onClick={onPrevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{mainTitle}</h2>
          {subText && <p className="text-sm sm:text-base font-semibold text-white/60">{subText}</p>}
        </div>
        <button onClick={onNextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 border-b border-white/10 bg-white/5">
        {WEEKDAYS.map((wd, i) => (
          <div key={i} className="text-center py-2 sm:py-3 border-r border-white/10 last:border-r-0">
            {calendarType === 'ethiopian' ? (
              <>
                <div className="text-white font-bold text-xs sm:text-sm">{wd.am}</div>
                <div className="text-white/60 font-semibold text-[10px] sm:text-xs">{wd.en}</div>
              </>
            ) : (
              <div className="text-white font-bold text-xs sm:text-sm">{wd.en}</div>
            )}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-auto">
        {days.map((cell, i) => (
          <div 
            key={i} 
            className={`border-r border-b border-white/10 flex flex-col items-center justify-center p-2 sm:p-4
              ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}
              ${cell?.isToday ? 'bg-white/10 text-white' : 'hover:bg-white/5 transition-colors'}
            `}
          >
            {cell ? (
              <>
                <div className="text-xl sm:text-3xl font-bold text-white">
                  {cell.main}
                </div>
                {cell.sub && (
                  <div className={`text-xs sm:text-sm font-semibold ${cell.isToday ? 'text-white/90' : 'text-white/40'}`}>
                    {cell.sub}
                  </div>
                )}
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
