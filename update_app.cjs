const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `<HabitTracker calendarType={calendarType} userId={currentUser?.uid || null} />`;

const replacementStr = `<HabitTracker 
                calendarType={calendarType} 
                userId={currentUser?.uid || null} 
                onHabitCompleted={() => {
                  setUserProgress((prev) => {
                    let newXp = prev.xp + 10;
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
                      coins: prev.coins + 5
                    };
                  });
                }}
                onHabitIncompleted={() => {
                  setUserProgress((prev) => {
                    let newXp = Math.max(0, prev.xp - 10);
                    return { ...prev, xp: newXp };
                  });
                }}
              />`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('src/App.tsx', content);
    console.log("App.tsx updated");
} else {
    console.log("Could not find HabitTracker component in App.tsx");
}

