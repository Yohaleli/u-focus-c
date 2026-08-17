cat << 'INNER_EOF' > replacement.txt
                    {todos.length === 0 ? (
                      <div className="text-xs text-white/40 text-center py-4">No tasks yet. Add one below.</div>
                    ) : (
                      todos.map(todo => (
INNER_EOF
sed -i -e '543,545c\' -e "$(cat replacement.txt | sed 's/$/\\/')" src/components/FocusTimer.tsx
sed -i 's/\\$//g' src/components/FocusTimer.tsx
