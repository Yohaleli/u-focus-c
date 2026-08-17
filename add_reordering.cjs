const fs = require('fs');
let content = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

content = content.replace("List, ChevronDown, Flame } from 'lucide-react';", "List, ChevronDown, Flame, ChevronUp, ChevronDown as ChevronDownIcon } from 'lucide-react';");

const reorderFunc = `
  const moveHabit = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === habits.length - 1)) return;
    const newHabits = [...habits];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newHabits[index], newHabits[swapIndex]] = [newHabits[swapIndex], newHabits[index]];
    setHabits(newHabits);
  };
`;

content = content.replace('  const handleDeleteHabit = (id: string) => {', reorderFunc + '\n  const handleDeleteHabit = (id: string) => {');

const buttonsJSX = `                      <div className="flex flex-col items-center ml-1 shrink-0">
                        <button onClick={() => moveHabit(habits.findIndex(h => h.id === habit.id), 'up')} className="text-white/20 hover:text-white/70 transition-colors p-0.5"><ChevronUp className="w-3 h-3" /></button>
                        <button onClick={() => moveHabit(habits.findIndex(h => h.id === habit.id), 'down')} className="text-white/20 hover:text-white/70 transition-colors p-0.5"><ChevronDownIcon className="w-3 h-3" /></button>
                      </div>
                      <button`;

content = content.replace('<button\n                        onClick={() => handleDeleteHabit(habit.id)}', buttonsJSX + '\n                        onClick={() => handleDeleteHabit(habit.id)}');

fs.writeFileSync('src/components/HabitTracker.tsx', content);
console.log("Reordering added");
