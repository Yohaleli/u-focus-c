const fs = require('fs');

let content = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

if (!content.includes('import confetti from "canvas-confetti"')) {
    content = content.replace("import CalendarWidget from './CalendarWidget';", "import CalendarWidget from './CalendarWidget';\nimport confetti from 'canvas-confetti';");
}

if (!content.includes('onHabitCompleted')) {
    content = content.replace("export default function HabitTracker({ calendarType = 'gregorian', userId }: { calendarType?: 'gregorian' | 'ethiopian', userId: string | null }) {", "export default function HabitTracker({ calendarType = 'gregorian', userId, onHabitCompleted, onHabitIncompleted }: { calendarType?: 'gregorian' | 'ethiopian', userId: string | null, onHabitCompleted?: () => void, onHabitIncompleted?: () => void }) {");
}

const oldToggleCell = `      if (currentStatus === 'empty') {
        nextStatus = 'done';
      } else if (currentStatus === 'done') {
        nextStatus = 'missed';
      } else {
        nextStatus = 'empty';
      }

      return {`;

const newToggleCell = `      if (currentStatus === 'empty') {
        nextStatus = 'done';
      } else if (currentStatus === 'done') {
        nextStatus = 'missed';
      } else {
        nextStatus = 'empty';
      }

      // Gamification Hooks
      if (nextStatus === 'done' && currentStatus !== 'done') {
        onHabitCompleted?.();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#fbbf24', '#8b5cf6', '#ec4899']
        });
        
        // Try to play sound if possible
        try {
           const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3');
           audio.volume = 0.5;
           audio.play().catch(() => {});
        } catch(e) {}
      } else if (currentStatus === 'done' && nextStatus !== 'done') {
        onHabitIncompleted?.();
      }

      return {`;

if (content.includes(oldToggleCell)) {
    content = content.replace(oldToggleCell, newToggleCell);
    fs.writeFileSync('src/components/HabitTracker.tsx', content);
    console.log("HabitTracker updated successfully");
} else {
    console.log("Could not find the target string in HabitTracker");
}

