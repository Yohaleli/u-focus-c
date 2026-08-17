const fs = require('fs');
let code = fs.readFileSync('src/components/HabitTracker.tsx', 'utf8');

const replacement = `
          <tbody>
            {habits.length === 0 ? (
              <tr>
                <td colSpan={visibleDaysCount + 1} className="py-12 text-center text-white/50 text-sm font-light">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 mb-2">
                      <Plus className="w-5 h-5 text-white/40" />
                    </div>
                    <p>No habits tracked yet.</p>
                    <button onClick={handleAddHabit} className="text-white hover:text-white/80 transition-colors underline decoration-white/30 underline-offset-4">Add your first habit</button>
                  </div>
                </td>
              </tr>
            ) : habits.map((habit) => {`;

code = code.replace(
  `          <tbody>
            {habits.map((habit) => {`,
  replacement
);

fs.writeFileSync('src/components/HabitTracker.tsx', code);
