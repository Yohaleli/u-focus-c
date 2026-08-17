import React, { useMemo } from 'react';
import { SessionLog } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface FocusDistributionProps {
  logs: SessionLog[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function FocusDistribution({ logs }: FocusDistributionProps) {
  const data = useMemo(() => {
    const distribution: Record<string, number> = {};
    
    logs.forEach(log => {
      // If planTitle is empty, it might be an ad-hoc session
      const title = log.planTitle || 'Uncategorized';
      // Normalize duration to minutes
      const mins = log.durationMinutes || Math.round(log.durationSeconds / 60) || 0;
      
      if (!distribution[title]) {
        distribution[title] = 0;
      }
      distribution[title] += mins;
    });

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  if (data.length === 0) {
    return null; // Don't show if no data
  }

  // Format tooltip to show hours and minutes
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#161514]/95 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-sm">
          <p className="text-white font-medium text-sm mb-1">{payload[0].name}</p>
          <p className="text-white/70 text-xs">
            {formatTime(payload[0].value)} total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/5 border border-white/20 shadow-xl rounded-2xl p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <PieChartIcon className="w-5 h-5 text-white/60" />
        <h2 className="text-xl font-serif text-white">Focus Distribution</h2>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              content={(props) => {
                const { payload } = props;
                return (
                  <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                    {payload?.map((entry, index) => (
                      <li key={`item-${index}`} className="flex items-center gap-1.5 text-xs text-white/70">
                        <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: entry.color }}></span>
                        <span className="truncate max-w-[120px]">{entry.value}</span>
                      </li>
                    ))}
                  </ul>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
