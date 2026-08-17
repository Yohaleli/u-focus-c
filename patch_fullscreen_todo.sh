cat << 'INNER_EOF' > replacement.txt
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
INNER_EOF
sed -i -e '47,48c\' -e "$(cat replacement.txt | sed 's/$/\\/')" src/components/FullScreenRoom.tsx
sed -i 's/\\$//g' src/components/FullScreenRoom.tsx

cat << 'INNER_EOF2' > replacement2.txt
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      setTasks([...tasks, { id: `t-${Date.now()}`, title: newTaskTitle, durationMinutes: 0, completed: false, priority: newTaskPriority }]);
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
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <span className={`text-sm break-words ${t.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
                      {t.title}
                    </span>
                    {t.priority && (
                      <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm font-mono w-fit ${
                        t.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                        t.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {t.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAddingTask ? (
            <form onSubmit={handleAddTask} className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  autoFocus
                  className="flex-1 min-w-0 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-white/40"
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                  className="bg-white/5 border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white outline-none focus:border-white/40 w-24 shrink-0"
                >
                  <option value="Low" className="bg-zinc-800 text-white">Low</option>
                  <option value="Medium" className="bg-zinc-800 text-white">Medium</option>
                  <option value="High" className="bg-zinc-800 text-white">High</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          ) : (
INNER_EOF3
sed -i -e '162,199c\' -e "$(cat replacement3.txt | sed 's/$/\\/')" src/components/FullScreenRoom.tsx
sed -i 's/\\$//g' src/components/FullScreenRoom.tsx
