sed -i '/const \[showTasks, setShowTasks\] = useState(false);/a \
  const [todos, setTodos] = useState<TodoItem[]>(() => { const saved = localStorage.getItem("immersiveTodos"); if (saved) { try { return JSON.parse(saved); } catch (e) { return []; } } return []; }); \
  const [isTodoOpen, setIsTodoOpen] = useState(false); \
  const [newTodoText, setNewTodoText] = useState(""); \
  useEffect(() => { localStorage.setItem("immersiveTodos", JSON.stringify(todos)); }, [todos]);' src/components/FocusTimer.tsx
