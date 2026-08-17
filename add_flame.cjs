const fs = require('fs');
let content = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

content = content.replace("ZoomIn, ZoomOut, Check, X, Plus, Trash2, RotateCcw, Sparkles, FileText, LayoutGrid, Calendar, List, ChevronDown } from 'lucide-react';", "ZoomIn, ZoomOut, Check, X, Plus, Trash2, RotateCcw, Sparkles, FileText, LayoutGrid, Calendar, List, ChevronDown, Flame } from 'lucide-react';");

content = content.replace("🔥 {getStreak(habit.id).current}", "<Flame className=\"w-3 h-3\" /> {getStreak(habit.id).current} day streak");

fs.writeFileSync('src/components/HabitTracker.tsx', content);
console.log("Flame imported");
