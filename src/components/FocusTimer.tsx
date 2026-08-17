import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Minimize2, Timer, 
  X, Check, CheckCircle2, Coffee, Brain, Sparkles, Sliders, Wind, Users, Music, Settings, ListTodo, CheckSquare, Square, Trash2, Plus,
  ZoomIn, ZoomOut, SlidersHorizontal, Maximize, CloudRain, Snowflake, Moon
} from 'lucide-react';
import { Task, TimerMode, TimerConfig, SessionLog } from '../types';
import { startAmbientSound, stopAmbientSound, playCompletionSound, setAmbientVolume } from '../utils/audioSynth';
import { User } from 'firebase/auth';
import { useSyncedState } from '../hooks/useSyncedState';

interface TodoItem { id: string; text: string; completed: boolean; }
interface FocusTimerProps {
  ambientSound: 'rain' | 'brown' | 'drone' | 'off' | 'white' | 'coffee';
  setAmbientSound: (sound: 'rain' | 'brown' | 'drone' | 'off' | 'white' | 'coffee') => void;
  volume: number;
  setVolume: (v: number | ((prev: number) => number)) => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentTask: Task | null;
  planTitle: string | null;
  onSessionComplete: (log: SessionLog) => void;
  onCloseTimerTask?: () => void;
  currentUser: User | null;
  backgroundImage?: string;
  systemFocusMode?: boolean;
  onEnterFullScreen?: () => void;
  autoTransition?: boolean;
  sessionLogs?: SessionLog[];
  onFocusStateChange?: (isActive: boolean) => void;
}


export default function FocusTimer({
  currentTask,
  planTitle,
  onSessionComplete,
  onCloseTimerTask,
  ambientSound, setAmbientSound, volume, setVolume, handleVolumeChange,
  currentUser,
  backgroundImage,
  systemFocusMode = false,
  onEnterFullScreen,
  autoTransition = false,
  sessionLogs = [],
  onFocusStateChange
}: FocusTimerProps) {
  // Timer configurations (in minutes)
  const [config, setConfig] = useState<TimerConfig>({
    focus: 25,
    shortBreak: 5,
    longBreak: 15
  });

  const [mode, setMode] = useState<TimerMode>('focus');
  const [autoStartNext, setAutoStartNext] = useState(false);
  const [minutes, setMinutes] = useState(() => Math.floor(Math.round(config.focus * 60) / 60));
  const [seconds, setSeconds] = useState(() => Math.round(config.focus * 60) % 60);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    if (onFocusStateChange) {
      onFocusStateChange(isActive);
    }
  }, [isActive, onFocusStateChange]);

  const [isFocusOverlayOpen, setIsFocusOverlayOpen] = useState(false);

  const [showTasks, setShowTasks] = useState(false);
  const [todos, setTodos] = useSyncedState<TodoItem[]>('ufocus_immersiveTodos', [], currentUser?.uid || null); 
  const [isTodoOpen, setIsTodoOpen] = useState(false); 
  const [newTodoText, setNewTodoText] = useState("");
  const [zoomLevel, setZoomLevel] = useState(100);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
      }
    }
  };
 
  
  // Ambient Sound State
  
  

  // Breathing guide state for immersive mode
  const [breathingPhase, setBreathingPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editMinutes, setEditMinutes] = useState("");


  const handleTimeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActive) {
      setIsEditingTime(true);
      setEditMinutes(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    } else {
      handleStartPause();
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditMinutes(e.target.value);
  };

  const handleTimeBlurOrEnter = () => {
    setIsEditingTime(false);
    let parsedMinutes = 0;
    let parsedSeconds = 0;
    
    if (editMinutes.includes(':')) {
      const parts = editMinutes.split(':');
      parsedMinutes = parseInt(parts[0]) || 0;
      parsedSeconds = parseInt(parts[1]) || 0;
    } else {
      parsedMinutes = parseInt(editMinutes) || 0;
    }
    
    if (parsedMinutes >= 0 && parsedSeconds >= 0 && (parsedMinutes > 0 || parsedSeconds > 0)) {
      parsedMinutes += Math.floor(parsedSeconds / 60);
      parsedSeconds = parsedSeconds % 60;
      
      setMinutes(parsedMinutes);
      setSeconds(parsedSeconds);
      totalSecondsRef.current = parsedMinutes * 60 + parsedSeconds;
      if (!currentTask) {
        setConfig(prev => ({...prev, [mode]: parsedMinutes + (parsedSeconds / 60)}));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTimeBlurOrEnter();
    }
  };


  // Motivational Quotes
  const focusQuotes = [
    "Deep focus is the superpower of the 21st century.",
    "Small steady steps lead to monumental achievements.",
    "Be present with this task. Everything else can wait.",
    "Amateurs wait for inspiration. Professionals get to work.",
    "Your mind is for having ideas, not holding them."
  ];
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);

  // Starry sky particles memo for immersive focus view
  const stars = React.useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 80}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() > 0.65 ? 'w-1 h-1' : 'w-0.5 h-0.5',
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`
    }));
  }, []);

  // Timers and Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalSecondsRef = useRef(config.focus * 60);

  // Synchronize timer values when currentTask or configs change
  useEffect(() => {
    if (currentTask) {
      setMode('focus');
      setMinutes(currentTask.durationMinutes);
      setSeconds(0);
      totalSecondsRef.current = currentTask.durationMinutes * 60;
    } else {
      const totalSec = Math.round(config[mode] * 60);
      setMinutes(Math.floor(totalSec / 60));
      setSeconds(totalSec % 60);
      totalSecondsRef.current = totalSec;
    }
    
    if (autoStartNext) {
      setIsActive(true);
      setAutoStartNext(false);
    } else {
      setIsActive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTask, mode]);

  

  // Main countdown timer loop
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds((prev) => prev - 1);
        } else if (minutes > 0) {
          setMinutes((prev) => prev - 1);
          setSeconds(59);
        } else {
          // Timer finished!
          handleTimerExpiry();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, minutes, seconds]);

  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err: any) {
        console.error(`Wake Lock error: ${err.name}, ${err.message}`);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {
          console.error(`Wake Lock release error:`, err);
        }
      }
    };

    if (isActive && systemFocusMode) {
      requestWakeLock();
      
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && isActive && systemFocusMode) {
          requestWakeLock();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        releaseWakeLock();
      };
    } else {
      releaseWakeLock();
    }
  }, [isActive, systemFocusMode]);

  // Handle Fullscreen mode for immersive overlay
  useEffect(() => {
    if (isFocusOverlayOpen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => console.error(err));
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.error(err));
      }
    }
  }, [isFocusOverlayOpen]);

  // Breathing guide loop in immersive mode
  useEffect(() => {
    let breathInterval: NodeJS.Timeout;
    if (isFocusOverlayOpen && isActive) {
      breathInterval = setInterval(() => {
        setBreathingSeconds((prev) => {
          if (prev <= 1) {
            if (breathingPhase === 'in') {
              setBreathingPhase('hold');
              return 4;
            } else if (breathingPhase === 'hold') {
              setBreathingPhase('out');
              return 4;
            } else {
              setBreathingPhase('in');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(breathInterval);
  }, [isFocusOverlayOpen, isActive, breathingPhase]);

  // Shift focus quotes every 20 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIdx((prev) => (prev + 1) % focusQuotes.length);
    }, 20000);
    return () => clearInterval(quoteInterval);
  }, []);

  const handleTimerExpiry = () => {
    setIsActive(false);
    playCompletionSound();
    stopAmbientSound();
    setAmbientSound('off');

    // Create completed session log
    const durationMin = currentTask ? currentTask.durationMinutes : config[mode];
    
    const log: SessionLog = {
      id: `session-${Date.now()}`,
      taskTitle: currentTask ? currentTask.title : `${mode === 'focus' ? 'Custom Focus Study' : 'Rest Break'}`,
      planTitle: planTitle || 'General Session',
      durationSeconds: totalSecondsRef.current,
      completedAt: new Date().toISOString()
    };

    onSessionComplete(log);
    setIsFocusOverlayOpen(false);

    // Switch timer mode automatically
    if (autoTransition) {
      setAutoStartNext(true);
    }
    
    if (mode === 'focus') {
      setMode('shortBreak');
    } else {
      setMode('focus');
    }
  };

  const handleEndEarly = () => {
    setIsActive(false);
    stopAmbientSound();
    setAmbientSound('off');
    
    const totalMin = currentTask ? currentTask.durationMinutes : config[mode];
    const spentMinutes = totalMin - minutes;
    
    if (totalSecondsRef.current - (minutes * 60 + seconds) > 0 && mode === 'focus') {
      const log: SessionLog = {
        id: `session-${Date.now()}`,
        taskTitle: currentTask ? currentTask.title : 'Custom Focus Study',
        planTitle: planTitle || 'General Session',
        durationSeconds: totalSecondsRef.current - (minutes * 60 + seconds),
        completedAt: new Date().toISOString()
      };
      onSessionComplete(log);
    }
    
    setIsFocusOverlayOpen(false);
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsActive(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleReset = () => {
    setIsActive(false);
    if (currentTask) {
      setMinutes(currentTask.durationMinutes);
    } else {
      const totalSec = Math.round(config[mode] * 60);
      setMinutes(Math.floor(totalSec / 60));
      setSeconds(totalSec % 60);
      return; // return early to skip setSeconds(0)
    }
    setSeconds(0);
  };

  const selectMode = (newMode: TimerMode) => {
    if (currentTask && newMode !== 'focus') {
      if (!confirm("Discard current task session to switch to break mode?")) {
        return;
      }
      if (onCloseTimerTask) onCloseTimerTask();
    }
    setMode(newMode);
    const totalSec = Math.round(config[newMode] * 60);
    setMinutes(Math.floor(totalSec / 60));
    setSeconds(totalSec % 60);
    setIsActive(false);
    totalSecondsRef.current = totalSec;
  };
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayPomodoros = sessionLogs.filter(log => 
    new Date(log.completedAt) >= todayStart && 
    (log.taskTitle !== 'Rest Break')
  ).length;

  // Percent calculation for SVG stroke offset
  const getProgressPercent = () => {
    const totalSec = totalSecondsRef.current || (currentTask ? currentTask.durationMinutes * 60 : config[mode] * 60);
    const currentSec = minutes * 60 + seconds;
    return totalSec === 0 ? 0 : ((totalSec - currentSec) / totalSec) * 100;
  };

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div id="focus-timer-container" className="w-full">
      {/* Main Standard Timer Widget */}
      <div id="timer-card-root" className={`bg-white/5 backdrop-blur-md border relative overflow-hidden rounded-2xl p-6 transition-all duration-1000 ${isActive ? (minutes * 60 + seconds < 60 ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : (minutes * 60 + seconds < 300 ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]')) : 'border-white/20 shadow-xl'}`}>
        <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-white" />
            <h3 className=" font-sans text-[9px] uppercase tracking-widest text-white/60 font-bold">
              Focus Desk
            </h3>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row xl:flex-col items-center justify-center gap-6">
        {/* Progress Circular SVG Display */}
        <div className="relative w-64 h-64 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              r="120"
              className="stroke-white/[0.03] fill-none"
              strokeWidth="5"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              className="stroke-white fill-none transition-all duration-300"
              strokeWidth="5"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - getProgressPercent() / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            {isEditingTime ? (
              <input
                type="text"
                value={editMinutes}
                onChange={handleTimeChange}
                onBlur={handleTimeBlurOrEnter}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-48 text-center bg-transparent border-b border-white/20 text-6xl font-sans font-semibold text-white tracking-tight tabular-nums outline-none"
              />
            ) : (
              <motion.span
                key={formattedTime}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                id="timer-clock-display"
                onClick={handleTimeClick}
                className={`text-6xl font-sans font-semibold text-white tracking-tight tabular-nums ${!isActive ? 'cursor-pointer hover:text-white/80' : ''}`}
                title={!isActive ? "Click to edit time" : ""}
              >
                {formattedTime}
              </motion.span>
            )}
            <span className="font-sans text-[16px] uppercase tracking-widest text-white mt-1 font-bold block">
              {mode === 'focus' ? 'FOCUS' : 'BREAK'}
            </span>
          </div>
        </div>

        {/* Configurations and Operations Panel */}
        <div className="flex-1 space-y-4 w-full min-w-0">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              

              
              <div className="flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
                <button
                  onClick={() => selectMode('focus')}
                  className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${mode === 'focus' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'}`}
                >
                  Focus
                </button>
                <button
                  onClick={() => selectMode('shortBreak')}
                  className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${mode === 'shortBreak' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'}`}
                >
                  Short
                </button>
                <button
                  onClick={() => selectMode('longBreak')}
                  className={`px-4 py-1.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${mode === 'longBreak' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'}`}
                >
                  Long
                </button>
              </div>
              {currentTask && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-white/80"></div>
                  <span className="text-xs text-white/80">{currentTask.title}</span>
                  <button onClick={onCloseTimerTask} className="ml-2 text-white/40 hover:text-white/80">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                onClick={handleStartPause}
                className={`px-8 h-[48px] rounded-full font-bold text-sm transition-all shadow-xl flex items-center gap-2 ${
                  isActive
                    ? 'bg-white/10 hover:bg-white/20 border border-white/20 text-white'
                    : 'bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    PAUSE
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    START
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="w-[48px] h-[48px] flex items-center justify-center bg-white/[0.05] backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 text-white/60 hover:text-white rounded-full transition-all cursor-pointer shrink-0"
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onEnterFullScreen ? onEnterFullScreen() : setIsFocusOverlayOpen(true)}
                id="btn-enter-immersive"
                className="w-[48px] h-[48px] flex items-center justify-center bg-white/[0.05] backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 text-white/60 hover:text-white rounded-full transition-all cursor-pointer shrink-0"
                title="Fullscreen Immersive Mode"
              >
                <Minimize2 className="w-3.5 h-3.5 transform rotate-180" />
              </button>

            </div>
            
            {/* Break Ideas (Standard View) */}
            {mode !== 'focus' && (
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl ">
                <span className=" font-sans text-[9px] uppercase tracking-widest text-white/70 block mb-3 font-semibold">
                  Active Break Ideas
                </span>
                <ul className="space-y-2.5">
                   <li className="text-xs text-white/60 flex items-center gap-2.5"><Wind className="w-3.5 h-3.5 text-white/40" /> Stretch your legs & body</li>
                   <li className="text-xs text-white/60 flex items-center gap-2.5"><Coffee className="w-3.5 h-3.5 text-white/40" /> Hydrate / Get some water</li>
                   <li className="text-xs text-white/60 flex items-center gap-2.5"><Sparkles className="w-3.5 h-3.5 text-white/40" /> Rest your eyes (20-20-20 rule)</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
        {/* Subtle Linear Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full transition-all duration-1000 ease-linear">
          <div className={`h-full rounded-r-full transition-all duration-1000 ease-linear ${getProgressPercent() >= 99.9 ? 'bg-white shadow-[0_0_15px_5px_rgba(255,255,255,0.7)]' : 'bg-white/80'}`} style={{ width: `${getProgressPercent()}%` }}></div>
        </div>
        </div>
      {/* IMMERSIVE FOCUS OVERLAY */}
      {isFocusOverlayOpen && createPortal(
        <div
          id="immersive-focus-overlay"
          className="fixed inset-0 z-50 text-white flex flex-col justify-between  bg-[#161514]"
          style={{
            backgroundImage: backgroundImage ? `url("${backgroundImage}")` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Overlay gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80"></div>
          
          <div className="absolute inset-0 pointer-events-none">
            {stars.map((star) => (
              <div
                key={star.id}
                className={`absolute rounded-full bg-white opacity-80 animate-pulse ${star.size}`}
                style={{
                  top: star.top,
                  left: star.left,
                  animationDelay: star.delay,
                  animationDuration: star.duration
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex justify-between items-center p-6 sm:p-8 shrink-0">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-2xl">
              <Sparkles className="w-5 h-5 text-white" />
              <span className=" text-xs uppercase tracking-widest font-bold">Immersive Mode</span>
            </div>
            
            <button 
              onClick={() => setIsFocusOverlayOpen(false)}
              className="text-white/60 hover:text-white bg-[#161514]/40 backdrop-blur-md p-3 rounded-full border border-white/10 transition-colors shadow-2xl"
              title="Exit Immersive Mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute top-24 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-2xl border border-white/20 shadow-xl px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-white/80"></div>
              <span className="text-sm font-medium text-white/90">
                {currentTask ? currentTask.title : 'No specific task'}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-12 relative z-10">
            {isEditingTime ? (
              <input
                type="text"
                value={editMinutes}
                onChange={handleTimeChange}
                onBlur={handleTimeBlurOrEnter}
                onKeyDown={handleKeyDown}
                autoFocus
                className={`w-28 sm:w-48 md:w-64 text-center bg-transparent border-b-4 border-white/30 text-[2rem] sm:text-[3rem] md:text-[4rem]  tabular-nums font-medium tracking-tight text-white outline-none drop-shadow-2xl`}
                style={{ transform: `scale(${(zoomLevel / 100) * (1 + (getProgressPercent() / 100) * 1.5)})` }}
              />
            ) : (
              <motion.h1
                key={formattedTime}
                initial={{ scale: 0.95 * ((zoomLevel / 100) * (1 + (getProgressPercent() / 100) * 1.5)), opacity: 0.8 }}
                animate={{ scale: ((zoomLevel / 100) * (1 + (getProgressPercent() / 100) * 1.5)), opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={handleTimeClick}
                className={`text-6xl font-sans font-semibold text-white tracking-tight tabular-nums ${!isActive ? 'cursor-pointer hover:text-white/80' : ''}`}
                title={isActive ? "Click to Pause" : "Click to Edit Time"}
                style={{ textShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
              >
                {formattedTime}
              </motion.h1>
            )}
            
            {/* Progress Bar */}
            <div className="w-1/4 h-1.5 bg-white/20 rounded-full mt-10 overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.2)] border border-white/10 backdrop-blur-sm relative">
              <div className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${getProgressPercent()}%`, boxShadow: getProgressPercent() >= 99.9 ? '0 0 25px 10px rgba(255,255,255,0.9)' : '0 0 10px rgba(255,255,255,0.8)' }}></div>
            </div>

            {/* End Early / Start Button */}
            <div className="mt-12 flex items-center justify-center gap-4">
              <button onClick={handleStartPause} className="px-8 py-3 w-40 flex items-center justify-center bg-[#161514]/40 backdrop-blur-md border border-white/20 hover:bg-white/10 text-white font-bold rounded-full transition-all shadow-xl">
                {isActive ? 'PAUSE' : 'START'}
              </button>
              <button onClick={handleEndEarly} className="px-8 py-3 flex items-center justify-center bg-[#161514]/40 backdrop-blur-md border border-white/20 hover:bg-white/10 text-white font-bold rounded-full transition-all shadow-xl">
                END EARLY
              </button>
            </div>
          </div>


          {/* To-do Panel */}
          {isTodoOpen && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80 max-w-[90vw] bg-[#161514]/80 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl z-20  pointer-events-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Tasks</h3>
                <button onClick={() => setIsTodoOpen(false)} className="text-white/50 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-[40vh] overflow-y-auto mb-4 pr-1">
                {todos.length === 0 ? (
                  <div className="text-xs text-white/40 text-center py-4">No tasks yet. Add one below.</div>
                ) : (
                  todos.map(todo => (
                    <div key={todo.id} className="flex items-start gap-2 group">
                      <button onClick={() => setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t))} className="mt-0.5 shrink-0 text-white/40 hover:text-white transition-colors">
                        {todo.completed ? <CheckSquare className="w-4 h-4 text-white" /> : <Square className="w-4 h-4" />}
                      </button>
                      <span className={`flex-1 text-sm ${todo.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
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
            </div>
          )}

          {/* Bottom - Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 bg-[#161514]/80 backdrop-blur-xl border border-white/10 rounded-full p-2 px-6 pointer-events-auto shadow-2xl">
              <button 
                onClick={() => setIsTodoOpen(!isTodoOpen)}
                className={`p-1.5 rounded-full transition-colors ${isTodoOpen ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}
                title="To-do List"
              >
                <ListTodo className="w-5 h-5" />
              </button>
              
              <div className="w-px h-6 bg-white/20 mx-2"></div>
              
              <button 
                onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                className="text-white/70 hover:text-white p-1 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white  text-sm w-12 text-center">{zoomLevel}%</span>
              <button 
                onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                className="text-white/70 hover:text-white p-1 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-white/20 mx-2"></div>
              <button 
                onClick={toggleFullscreen}
                className="text-white/70 hover:text-white p-1 transition-colors"
                title="Toggle Fullscreen"
              >
                {document.fullscreenElement ? <Minimize2 className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>
      , document.body)}
    </div>
  );
}
