const fs = require('fs');
let code = fs.readFileSync('src/components/FullScreenRoom.tsx', 'utf-8');
code = code.replace(
  /import \{\n  Play, Pause, X, Music, CheckCircle2, Circle, Settings,\n  Volume2, VolumeX, SkipForward,\n  ListTodo, Maximize\n\} from 'lucide-react';/,
  `import {
  Play, Pause, X, Music, CheckCircle2, Circle, Settings,
  Volume2, VolumeX, SkipForward,
  ListTodo, Maximize, ZoomIn, ZoomOut, SlidersHorizontal, Minimize2,
  CloudRain, Snowflake, Sparkles, Moon
} from 'lucide-react';`
);
fs.writeFileSync('src/components/FullScreenRoom.tsx', code);
