cat << 'INNER_EOF' > replacement.txt
  const [isTodoOpen, setIsTodoOpen] = useState(false); 
  const [newTodoText, setNewTodoText] = useState(""); 
INNER_EOF
sed -i -e '54,56c\' -e "$(cat replacement.txt | sed 's/$/\\/')" src/components/FocusTimer.tsx
sed -i 's/\\$//g' src/components/FocusTimer.tsx

cat << 'INNER_EOF2' > replacement2.txt
                    {todos.length === 0 ? (
                      <div className="text-xs text-white/40 text-center py-4">No tasks yet. Add one below.</div>
                    ) : (
                      todos.map(todo => (
                        <div key={todo.id} className="flex items-start gap-2 group">
                          <button onClick={() => setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t))} className="mt-0.5 shrink-0 text-white/40 hover:text-white transition-colors">
                            {todo.completed ? <CheckSquare className="w-4 h-4 text-green-400" /> : <Square className="w-4 h-4" />}
                          </button>
                          <span className={`text-sm flex-1 break-words transition-all ${todo.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
                            {todo.text}
                          </span>
                          <button onClick={() => setTodos(todos.filter(t => t.id !== todo.id))} className="shrink-0 text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTodoText.trim()) {
                          setTodos([...todos, { id: Date.now().toString(), text: newTodoText.trim(), completed: false }]);
                          setNewTodoText("");
                        }
                      }}
                      placeholder="Add a task..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-white/30"
                    />
                    <button
                      onClick={() => {
                        if (newTodoText.trim()) {
                          setTodos([...todos, { id: Date.now().toString(), text: newTodoText.trim(), completed: false }]);
                          setNewTodoText("");
                        }
                      }}
                      disabled={!newTodoText.trim()}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg px-3 py-2 transition-colors flex items-center justify-center shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
INNER_EOF2
sed -i -e '542,608c\' -e "$(cat replacement2.txt | sed 's/$/\\/')" src/components/FocusTimer.tsx
sed -i 's/\\$//g' src/components/FocusTimer.tsx
