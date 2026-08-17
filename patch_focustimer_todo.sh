cat << 'INNER_EOF' > replacement.txt
  const [isTodoOpen, setIsTodoOpen] = useState(false); 
  const [newTodoText, setNewTodoText] = useState(""); 
  const [newTodoPriority, setNewTodoPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
INNER_EOF
sed -i -e '54,55c\' -e "$(cat replacement.txt | sed 's/$/\\/')" src/components/FocusTimer.tsx
sed -i 's/\\$//g' src/components/FocusTimer.tsx

cat << 'INNER_EOF2' > replacement2.txt
                      todos.map(todo => (
                        <div key={todo.id} className="flex items-start gap-2 group">
                          <button onClick={() => setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t))} className="mt-0.5 shrink-0 text-white/40 hover:text-white transition-colors">
                            {todo.completed ? <CheckSquare className="w-4 h-4 text-green-400" /> : <Square className="w-4 h-4" />}
                          </button>
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            <span className={`text-sm break-words transition-all ${todo.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
                              {todo.text}
                            </span>
                            {todo.priority && (
                              <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm font-mono shrink-0 ${
                                todo.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                                todo.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}>
                                {todo.priority}
                              </span>
                            )}
                          </div>
                          <button onClick={() => setTodos(todos.filter(t => t.id !== todo.id))} className="shrink-0 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTodoText.trim()) {
                            setTodos([...todos, { id: Date.now().toString(), text: newTodoText.trim(), completed: false, priority: newTodoPriority }]);
                            setNewTodoText("");
                          }
                        }}
                        placeholder="Add a task..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-white/30"
                      />
                      <select
                        value={newTodoPriority}
                        onChange={(e) => setNewTodoPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-white/30"
                      >
                        <option value="Low" className="bg-zinc-800 text-white">Low</option>
                        <option value="Medium" className="bg-zinc-800 text-white">Med</option>
                        <option value="High" className="bg-zinc-800 text-white">High</option>
                      </select>
                      <button
                        onClick={() => {
                          if (newTodoText.trim()) {
                            setTodos([...todos, { id: Date.now().toString(), text: newTodoText.trim(), completed: false, priority: newTodoPriority }]);
                            setNewTodoText("");
                          }
                        }}
                        disabled={!newTodoText.trim()}
                        className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg px-3 py-2 transition-colors flex items-center justify-center shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
INNER_EOF2
sed -i -e '545,586c\' -e "$(cat replacement2.txt | sed 's/$/\\/')" src/components/FocusTimer.tsx
sed -i 's/\\$//g' src/components/FocusTimer.tsx
