cat << 'INNER_EOF' > replacement.txt
        setSeconds((s) => {
          if (s === 0) {
            if (minutes === 0) {
              clearInterval(interval);
              setIsActive(false);
              playCompletionSound();
              
              const completedCount = tasks.filter(t => t.completed).length;
              const defaultNote = `Session Summary:
- Duration: ${durationMinutes} minutes
- Subject: ${subject}
- Tasks Completed: ${completedCount}/${tasks.length}`;
              
              setSessionNotes(defaultNote);
              setShowCompletion(true);
              return 0;
            }
            setMinutes((m) => m - 1);
            return 59;
          }
          return s - 1;
        });
INNER_EOF
sed -i -e '72,92c\' -e "$(cat replacement.txt | sed 's/$/\\/')" src/components/FullScreenRoom.tsx
sed -i 's/\\$//g' src/components/FullScreenRoom.tsx
