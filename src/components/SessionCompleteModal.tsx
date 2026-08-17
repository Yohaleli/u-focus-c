import React, { useEffect, useState } from 'react';
import { SessionLog } from '../types';
import { ArrowRight, Trophy, Star, Target, Sparkles, Calendar, Clock } from 'lucide-react';

interface SessionCompleteModalProps {
  log: SessionLog;
  backgroundImage: string;
  onClose: () => void;
}

export default function SessionCompleteModal({ log, backgroundImage, onClose }: SessionCompleteModalProps) {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 50);
    const t2 = setTimeout(() => setStep(1), 300);
    const t3 = setTimeout(() => setStep(2), 600);
    const t4 = setTimeout(() => setStep(3), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const ds = log.durationSeconds || (log.durationMinutes * 60) || 0;
  
  let timeValue = ds.toString();
  let timeUnit = 'SEC';

  if (ds >= 3600) {
    if (ds % 3600 === 0) {
      timeValue = Math.floor(ds / 3600).toString();
      timeUnit = 'HR';
    } else {
      timeValue = `${Math.floor(ds / 3600)}h ${Math.floor((ds % 3600) / 60)}m`;
      timeUnit = 'TIME';
    }
  } else if (ds >= 60) {
    if (ds % 60 === 0) {
      timeValue = Math.floor(ds / 60).toString();
      timeUnit = 'MIN';
    } else {
      timeValue = `${Math.floor(ds / 60)}m ${ds % 60}`;
      timeUnit = 'S';
    }
  }

  const dateFormatted = new Date(log.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`fixed inset-0 z-[10000] flex flex-col transition-all duration-1000 ${show ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Full Screen Background Image (blurred) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[30s] ease-out hover:scale-110" 
        style={{ backgroundImage: `url(${backgroundImage})` }} 
      />
      
      {/* Dark / Glass Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(0,0,0,0.8)_120%)]" />
      
      {/* Ambient Top Glow */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

      {/* Top Header */}
      <div className={`absolute z-20 top-0 inset-x-0 p-6 md:p-8 flex items-center justify-between transform transition-all duration-1000 delay-300 ${show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-emerald-400/80" />
          <span className="text-white/70 text-sm font-bold tracking-widest uppercase hidden sm:block">Ufocus</span>
        </div>
        <div className="flex items-center gap-2 border-b border-white/20 pb-1 px-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-white/90 text-[10px] font-mono tracking-widest uppercase">Session Complete</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto px-6">
          
        {/* Duration Hero */}
        <div className={`flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full mb-16 transition-all duration-700 delay-100 transform ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex flex-col items-center md:items-end">
            <div className="flex items-baseline gap-4">
              <span className="text-[100px] md:text-[140px] font-light text-white tracking-tighter leading-none" style={{ textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>{timeValue}</span>
              <span className="text-xl md:text-3xl text-white/40 font-light tracking-wide">{timeUnit}</span>
            </div>
          </div>
          
          <div className="w-24 h-px md:w-px md:h-32 bg-gradient-to-r md:bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent" />
          
          <div className="flex flex-col items-center md:items-start max-w-md">
            <p className="text-lg md:text-2xl text-white/90 font-mono uppercase tracking-[0.3em] leading-relaxed text-center md:text-left" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {log.taskTitle || "Focus Session"}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`flex flex-wrap items-center justify-center gap-8 w-full mb-20 transition-all duration-700 transform ${step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            
            {/* Date Stat */}
            <div className="flex flex-col items-center">
                <span className="text-[10px] md:text-xs text-white/40 font-mono uppercase tracking-[0.2em] mb-3">Date</span>
                <span className="text-base md:text-lg text-white/90 font-medium tracking-widest uppercase">{dateFormatted}</span>
            </div>
            
        </div>

        {/* Action Button */}
        <div className={`transition-all duration-700 transform ${step >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <button
                onClick={onClose}
                className="group relative flex items-center justify-center gap-4 px-10 py-5 bg-white text-black rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
                <span className="font-bold text-sm md:text-base tracking-[0.2em] uppercase">Continue</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

      </div>
    </div>
  );
}
