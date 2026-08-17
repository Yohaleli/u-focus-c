const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import confetti from "canvas-confetti"')) {
    content = content.replace("import TopNav from './components/TopNav';", "import TopNav from './components/TopNav';\nimport confetti from 'canvas-confetti';");
}

const toggleOld = `  const handleToggleTask = (planId: string, moduleId: string, taskId: string, forceComplete?: boolean) => {
    setPlans((prevPlans) => {`;

const toggleNew = `  const handleToggleTask = (planId: string, moduleId: string, taskId: string, forceComplete?: boolean) => {
    // Check old state to award XP and Confetti
    const plan = plans.find((p) => p.id === planId);
    const mod = plan?.modules.find((m) => m.id === moduleId);
    const task = mod?.tasks.find((t) => t.id === taskId);
    
    if (task) {
      const isNowCompleted = forceComplete !== undefined ? forceComplete : !task.completed;
      if (isNowCompleted && !task.completed) {
         // award XP & confetti
         confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#fbbf24', '#8b5cf6', '#ec4899']
          });
          
          try {
             const audio = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3');
             audio.volume = 0.5;
             audio.play().catch(() => {});
          } catch(e) {}
          
          setUserProgress((prev) => {
            let newXp = prev.xp + 25; // 25 XP for a task
            let newLevel = prev.level;
            let newNext = prev.nextLevelXp;
            let leveledUp = false;
      
            while (newXp >= newNext) {
              newXp -= newNext;
              newLevel += 1;
              newNext = 300 + (newLevel - 1) * 50;
              leveledUp = true;
            }
            
            if (leveledUp) {
              setShowLevelUpForLevel(newLevel);
            }
            
            return {
              ...prev,
              xp: newXp,
              level: newLevel,
              nextLevelXp: newNext,
              coins: prev.coins + 10
            };
          });
      } else if (!isNowCompleted && task.completed) {
         // deduct XP
         setUserProgress((prev) => {
            let newXp = Math.max(0, prev.xp - 25);
            return { ...prev, xp: newXp };
         });
      }
    }

    setPlans((prevPlans) => {`;

if (content.includes(toggleOld)) {
    content = content.replace(toggleOld, toggleNew);
    fs.writeFileSync('src/App.tsx', content);
    console.log("App.tsx toggleTask updated");
} else {
    console.log("Could not find toggleTask");
}
