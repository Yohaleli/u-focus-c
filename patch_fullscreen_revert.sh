cat << 'INNER_EOF' > replacement.txt
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
INNER_EOF
sed -i -e '47,49c\' -e "$(cat replacement.txt | sed 's/$/\\/')" src/components/FullScreenRoom.tsx
sed -i 's/\\$//g' src/components/FullScreenRoom.tsx

cat << 'INNER_EOF2' > replacement2.txt
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      setTasks([...tasks, { id: `t-${Date.now()}`, title: newTaskTitle, durationMinutes: 0 }]);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };
INNER_EOF2
sed -i -e '104,111c\' -e "$(cat replacement2.txt | sed 's/$/\\/')" src/components/FullScreenRoom.tsx
sed -i 's/\\$//g' src/components/FullScreenRoom.tsx

cat << 'INNER_EOF3' > replacement3.txt
              {tasks.map(t => (
                <div key={t.id} className="flex items-start gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group cursor-pointer" onClick={() => handleToggleTask(t.id)}>
                  <div className="mt-0.5 shrink-0">
                    {t.completed ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5 text-white/40 group-hover:text-white/60" />}
                  </div>
                  <span className={`text-sm break-words ${t.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
                    {t.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {isAddingTask ? (
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input 
                type="text" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                autoFocus
                className="flex-1 min-w-0 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-white/40"
              />
              <button 
                type="submit"
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors"
              >
                Add
              </button>
              <button 
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button 
              onClick={() => setIsAddingTask(true)}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              + Add a task
            </button>
          )}
INNER_EOF3
sed -i -e '161,232c\' -e "$(cat replacement3.txt | sed 's/$/\\/')" src/components/FullScreenRoom.tsx
sed -i 's/\\$//g' src/components/FullScreenRoom.tsx
