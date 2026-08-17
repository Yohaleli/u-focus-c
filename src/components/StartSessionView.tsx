import React, { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import { Task } from '../types';

interface StartSessionViewProps {
  onStartSession: (minutes: number, subject: string, tasks: Task[]) => void;
}

const DURATIONS = [
  { label: '25m', value: 25 },
  { label: '50m', value: 50 },
  { label: '1h 30m', value: 90 },
];

export default function StartSessionView({ onStartSession }: StartSessionViewProps) {
  const [subject, setSubject] = useState('Maths, Coding, Hacking, Practice Terminal Commands');
  const [duration, setDuration] = useState(25);
  const [isCustom, setIsCustom] = useState(false);
  const [customDuration, setCustomDuration] = useState(60);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([...tasks, { id: `t-${Date.now()}`, title: newTaskTitle, durationMinutes: 0, completed: false }]);
    setNewTaskTitle('');
  };

  const activeDuration = isCustom ? customDuration : duration;

  return (
    <div className="w-full max-w-xl mx-auto space-y-8">
      {/* Session Config */}
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-serif text-white mb-1">Start a session</h2>
          <p className="text-white/50 text-sm">Subject, duration, go.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-white/40 block mb-2">Subject</label>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 focus-within:border-white/30 transition-colors">
              <Tag className="w-4 h-4 text-white/40" />
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full text-sm"
                placeholder="What are you focusing on?"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-white/40 block mb-2">Duration</label>
            <div className="flex flex-wrap gap-3">
              {DURATIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => { setDuration(d.value); setIsCustom(false); }}
                  className={`flex-1 py-4 rounded-2xl border transition-all flex items-center justify-center font-mono text-lg ${
                    !isCustom && duration === d.value 
                      ? 'bg-white/10 border-white/30 text-white' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {d.label}
                </button>
              ))}
              <button
                onClick={() => setIsCustom(true)}
                className={`flex-1 py-4 rounded-2xl border transition-all flex items-center justify-center font-mono text-lg ${
                  isCustom 
                    ? 'bg-white/10 border-white/30 text-white' 
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                }`}
              >
                Custom
              </button>
            </div>
          </div>
          
          {isCustom && (
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-white/40 block mb-2">Custom Minutes</label>
              <input
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                min="1"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-white/30 outline-none transition-colors"
              />
            </div>
          )}

          <button
            onClick={() => onStartSession(activeDuration, subject, tasks)}
            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-[0.98]"
          >
            Start session
          </button>
          <div className="text-center text-xs text-white/30 mt-2 font-mono">
            ~ {activeDuration} min
          </div>
        </div>
      </div>
    </div>
  );
}
