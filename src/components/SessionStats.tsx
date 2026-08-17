import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, Flame, Hourglass, Calendar, CheckCircle2, Trophy, Clock, Target, Edit2, Check } from 'lucide-react';
import { SessionLog } from '../types';
import { useSyncedState } from '../hooks/useSyncedState';
import { calculateStudyStreak } from '../utils/streak';

interface SessionStatsProps {
  userId: string | null;
  logs: SessionLog[];
}

export default function SessionStats({ logs, userId }: SessionStatsProps) {

  // Aggregate stats
  const totalSeconds = logs.reduce((acc, curr) => acc + (curr.durationSeconds || (curr.durationMinutes * 60) || 0), 0);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalSessions = logs.length;

  // Calculate today's minutes
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySeconds = logs
    .filter((log) => {
      const date = new Date(log.completedAt);
      const logDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return logDateStr === todayStr;
    })
    .reduce((acc, curr) => acc + (curr.durationSeconds || (curr.durationMinutes * 60) || 0), 0);
  const todayMinutes = Number.isNaN(todaySeconds) ? 0 : Math.floor(todaySeconds / 60);

  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const localDateStr = `${year}-${month}-${day}`;
      
      const dayLogs = logs.filter(log => {
        const ld = new Date(log.completedAt);
        const lyear = ld.getFullYear();
        const lmonth = String(ld.getMonth() + 1).padStart(2, '0');
        const lday = String(ld.getDate()).padStart(2, '0');
        return `${lyear}-${lmonth}-${lday}` === localDateStr;
      });
      const seconds = dayLogs.reduce((acc, curr) => acc + (curr.durationSeconds || (curr.durationMinutes * 60) || 0), 0);
      const minutes = Math.floor(seconds / 60);
      data.push({
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        minutes,
        date: localDateStr
      });
    }
    return data;
  }, [logs]);

  const streak = calculateStudyStreak(logs);

  return (
    <div id="session-stats-root" className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Stat Card 1: Total Minutes */}
        <div className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/80 block mb-0.5">
              Total Focus
            </span>
            <span id="stat-total-minutes" className="text-xl font-light font-mono text-white block mt-0.5 tabular-nums">
              {totalMinutes} <span className="text-[10px] font-bold uppercase font-mono text-white/60 ml-1">min</span>
            </span>
          </div>
        </div>

        {/* Stat Card 2: Day Streak */}
        <div className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-5 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${streak > 0 ? 'bg-white/5 backdrop-blur-md border-white/20 text-white' : 'bg-white/5 backdrop-blur-md border-white/20 text-white/20'}`}>
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <div>
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/80 block mb-0.5">
              Streak
            </span>
            <span id="stat-streak-days" className="text-xl font-light font-mono text-white block mt-0.5 tabular-nums">
              {streak} <span className="text-[10px] font-bold uppercase font-mono text-white/60 ml-1">{streak === 1 ? 'day' : 'days'}</span>
            </span>
          </div>
        </div>

        {/* Stat Card 3: Completed Sessions */}
        <div className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/80 block mb-0.5">
              Blocks Completed
            </span>
            <span id="stat-total-sessions" className="text-xl font-light font-mono text-white block mt-0.5 tabular-nums">
              {totalSessions} <span className="text-[10px] font-bold uppercase font-mono text-white/60 ml-1">{totalSessions === 1 ? 'block' : 'blocks'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6">
        <div className="flex items-center gap-2 border-b border-white/20 pb-3 mb-4">
          <Award className="w-4 h-4 text-white" />
          <h3 className="font-mono text-[9px] uppercase tracking-widest text-white/60 font-bold">
            Logged Sessions
          </h3>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-10 space-y-1">
            <p className="text-xs text-white/40 font-light">No study sessions logged yet.</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-white/20">Complete a focus block to register activity</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {logs.map((log) => {
              const formattedDate = new Date(log.completedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={log.id}
                  className="flex flex-col p-3.5 bg-white/5 backdrop-blur-md hover:bg-white/5 hover:backdrop-blur-md border border-white/20 rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-3">
                      <span className="text-xs font-light text-white block truncate leading-tight">
                        {log.taskTitle}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-white/30 block truncate mt-1">
                        Curriculum: {log.planTitle}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-white block">
                        +{Math.ceil((log.durationSeconds || (log.durationMinutes * 60) || 0) / 60)}m
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-white/30 block mt-0.5">
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                  {log.notes && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-white/50 leading-relaxed whitespace-pre-wrap">
                      {log.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
