import React, { useState, useEffect, useRef } from 'react';
import { Home, Zap, BarChart2, Settings, User, LogOut, Flame, CheckCircle, Maximize, FileText } from 'lucide-react';
import { AppTab, UserProgress } from '../types';
import LiveFocusBadge from './LiveFocusBadge';
import type { User as FirebaseUser } from 'firebase/auth';

interface TopNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab | 'settings') => void;
  userProgress: UserProgress;
  userName: string;
  userAvatar: string | null;
  onLogout: () => void;
  currentStreak: number;
  isGuest?: boolean;
  currentUser?: FirebaseUser | null;
  isSessionActive: boolean;
}

const NAV_ITEMS = [
  { id: 'focus' as AppTab, label: 'Focus', icon: Zap },
  { id: 'notes' as AppTab, label: 'Notes', icon: FileText },
  { id: 'habits' as AppTab, label: 'Habits', icon: CheckCircle },
];

export default function TopNav({ activeTab, setActiveTab, userProgress, userName, userAvatar, onLogout, currentStreak, isGuest, currentUser, isSessionActive }: TopNavProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setIsVisible((prev) => prev ? false : prev);
          } else {
            setIsVisible((prev) => !prev ? true : prev);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b border-white/10 bg-[#161514]/20 backdrop-blur-xl px-2 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-1 sm:gap-4 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      
      {/* Brand & Level (Left) */}
      <div className="flex items-center gap-2 sm:gap-4 w-auto lg:flex-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center">
            <Zap className="w-4 h-4 text-black fill-black" />
          </div>
          <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-widest uppercase">UFocus</span>
        </div>
      </div>
      
      {/* Center Nav */}
      <div className="flex justify-center shrink-0">
        <nav className="flex items-center gap-1 bg-white/5 backdrop-blur-xl p-1 rounded-full border border-white/10 overflow-x-auto scrollbar-hide max-w-full">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-mono transition-all shrink-0 ${
                  isActive
                    ? 'bg-white/10 text-white font-bold border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-3.5 h-3.5 ${isActive ? 'fill-white/20' : ''}`} />
                <span className="uppercase tracking-widest hidden sm:block">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right side: Streak, Profile, Settings */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-4 w-auto lg:flex-1 ml-auto lg:ml-0">
        
        {/* Flame Streak Badge */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 border border-white/20 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-mono font-bold">
          <Flame className="w-3.5 h-3.5 text-white fill-white" />
          <span>{currentStreak}d</span>
        </div>

        {/* Profile / Logout */}
        <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full p-1 sm:pl-1.5 sm:pr-3 sm:py-1 transition-all cursor-pointer" onClick={onLogout} title="Log Out">
          {userAvatar ? (
            <img src={userAvatar} alt="Profile" className="w-6 h-6 rounded-full border border-white/20" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white/70" />
            </div>
          )}
          <span className="text-[10px] font-bold text-white uppercase tracking-wider hidden sm:block">
            {userName.split(' ')[0]}
          </span>
          <LogOut className="w-3.5 h-3.5 text-white/40 ml-1 hidden xl:block" />
        </div>

        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(err => {
                console.warn("Fullscreen not supported or blocked");
              });
            } else {
              document.exitFullscreen();
            }
          }}
          className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-full border border-white/10 transition-all hidden sm:block"
          title="Toggle Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-full border border-white/10 transition-all"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
