import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, X, Music, CheckCircle2, Circle, Settings,
  Volume2, VolumeX, SkipForward,
  ListTodo, Maximize, ZoomIn, ZoomOut, SlidersHorizontal, Minimize2,
  CloudRain, Snowflake, Sparkles, Moon,
  Flame, Zap
} from 'lucide-react';
import { Task, TimerMode, SessionLog } from '../types';
import { playCompletionSound } from '../utils/audioSynth';
import { User } from 'firebase/auth';

interface FullScreenRoomProps {
  backgroundImage: string;
  durationMinutes: number;
  subject: string;
  tasks: Task[];
  onEndSession: (log?: SessionLog) => void;
  onFocusStateChange?: (isActive: boolean) => void;
  ambientSound: 'off' | 'rain' | 'brown' | 'white' | 'drone' | 'coffee';
  setAmbientSound: (sound: 'off' | 'rain' | 'brown' | 'white' | 'drone' | 'coffee') => void;
  volume: number;
  setVolume: (v: number) => void;
  audioSourceType: 'spotify' | 'local' | 'ambient';
  spotifyUrl: string;
  localAudioUrl: string | null;
}


const BACKGROUND_OPTIONS = [
  { id: 'rain', name: 'rain', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2187&auto=format&fit=crop' },
  { id: 'morning', name: 'morning', url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=2070&auto=format&fit=crop' },
  { id: 'man-in-smoke', name: 'man-in-smoke', url: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=2128&auto=format&fit=crop' },
  { id: 'image-tree', name: 'image-tree', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2070&auto=format&fit=crop' },
  { id: 'anime', name: 'anime', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2187&auto=format&fit=crop' },
  { id: 'cloud', name: 'cloud', url: 'https://images.unsplash.com/photo-1534088568595-a066f410cbda?q=80&w=2102&auto=format&fit=crop' },
  { id: 'anime2', name: 'anime2', url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=2070&auto=format&fit=crop' },
  { id: 'anime7', name: 'anime7', url: 'https://images.unsplash.com/photo-1554147090-e1221a04a025?q=80&w=2048&auto=format&fit=crop' },
  { id: 'anime1', name: 'anime1', url: 'https://images.unsplash.com/photo-1620173834206-c025ba6222b0?q=80&w=2072&auto=format&fit=crop' }
];

const FONTS = [
  { id: 'font-sans', name: 'Aa Sans' },
  { id: 'font-serif', name: 'Aa Serif' },
  { id: 'font-sans', name: 'Aa Mono' },
  { id: 'font-lexend', name: 'Lexend' },
  { id: 'font-jetbrains', name: 'JetBrains' },
  { id: 'font-fira', name: 'Fira Code' },
  { id: 'font-hack', name: 'Hack' }
];

const AMBIENT_EFFECTS = [
  { id: 'None', icon: X, label: 'None' },
  { id: 'Rain', icon: CloudRain, label: 'Rain' },
  { id: 'Snow', icon: Snowflake, label: 'Snow' },
  { id: 'Fireflies', icon: Sparkles, label: 'Fireflies' },
  { id: 'Aurora', icon: Moon, label: 'Aurora' }
];

export default function FullScreenRoom({
  backgroundImage,
  durationMinutes,
  subject,
  tasks: initialTasks,
  onEndSession,
  onFocusStateChange,
  ambientSound, setAmbientSound,
  volume, setVolume,
  audioSourceType, spotifyUrl, localAudioUrl
}: FullScreenRoomProps) {
  const [minutes, setMinutes] = useState(durationMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true); // Auto start
  
  useEffect(() => {
    if (onFocusStateChange) {
      onFocusStateChange(isActive);
    }
  }, [isActive, onFocusStateChange]);

  const [tasks, setTasks] = useState(initialTasks);
  const [showTasks, setShowTasks] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");

  const [showMusic, setShowMusic] = useState(false);
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [currentBg, setCurrentBg] = useState(backgroundImage);
  const [timerFont, setTimerFont] = useState('font-sans');
  const [ambient, setAmbient] = useState('None');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const [newTaskTitle, setNewTaskTitle] = useState('');


const handleEndEarly = () => {
    setIsActive(false);
    const spentMinutes = durationMinutes - minutes;
    
    const completedCount = tasks.filter(t => t.completed).length;
    const defaultNote = `Session Summary:
- Duration: ${spentMinutes} minutes (ended early)
- Subject: ${subject}
- Tasks Completed: ${completedCount}/${tasks.length}`;
    
    onEndSession({
      id: `log-${Date.now()}`,
      completedAt: new Date().toISOString(),
      durationSeconds: (durationMinutes * 60) - (minutes * 60 + seconds),
      taskTitle: subject,
      planTitle: "Custom Session",
      notes: defaultNote
    });
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => {
          if (s === 0) {
            if (minutes === 0) {
              clearInterval(interval);
              setIsActive(false);
              playCompletionSound();
              
              const completedCount = tasks.filter(t => t.completed).length;
              const defaultNote = `Session Summary:
- Duration: ${durationMinutes} minutes
- Subject: ${subject}
- Tasks Completed: ${completedCount}/${tasks.length}`;
              
              onEndSession({
                id: `log-${Date.now()}`,
                completedAt: new Date().toISOString(),
                durationSeconds: durationMinutes * 60,
                taskTitle: subject,
                planTitle: "Custom Session",
                notes: defaultNote
              });
              return 0;
            }
            setMinutes((m) => m - 1);
            return 59;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, durationMinutes, subject, onEndSession]);

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      setTasks([...tasks, { id: `t-${Date.now()}`, title: newTaskTitle, durationMinutes: 0, completed: false }]);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[9999] bg-[#161514]">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-[#161514]/40" />
      {/* Top Left - Fullscreen toggle */}
      <div className="absolute top-6 left-6 z-10">
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
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#161514]/50 hover:bg-[#161514]/70 backdrop-blur-md border border-white/20 text-white transition-all"
          title="Toggle Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>


      {/* Top right - To-do toggle & End Session */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-4">
        <button
          onClick={() => setShowTasks(!showTasks)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 transition-all ${showTasks ? 'bg-white text-black' : 'bg-[#161514]/50 text-white hover:bg-[#161514]/70'}`}
        >
          <ListTodo className="w-4 h-4" />
          <span className="text-sm font-bold">To-do</span>
        </button>
        <button
          onClick={handleEndEarly}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#161514]/50 hover:bg-[#161514]/70 backdrop-blur-md border border-white/20 text-white transition-all"
          title="End Session"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks Panel */}
      {showTasks && (
        <div className="absolute top-20 right-6 w-80 bg-[#161514]/20 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 z-20  shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">To-do</h3>
          </div>
          {tasks.length === 0 ? (
            <div className="text-white/50 text-sm py-4">Nothing yet. Add your first task below.</div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto mb-4">
              {tasks.map(t => (
                <div key={t.id} className="flex items-start gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group cursor-pointer" onClick={() => handleToggleTask(t.id)}>
                  <div className="mt-0.5 shrink-0">
                    {t.completed ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Circle className="w-5 h-5 text-white/40 group-hover:text-white/60" />}
                  </div>
                  <span className={`text-sm break-words ${t.completed ? 'text-white/40 line-through' : 'text-white/90'}`}>
                    {t.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {isAddingTask ? (
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input 
                type="text" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                autoFocus
                className="flex-1 min-w-0 bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-white/40"
              />
              <button 
                type="submit"
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors"
              >
                Add
              </button>
              <button 
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button 
              onClick={() => setIsAddingTask(true)}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              + Add a task
            </button>
          )}
        </div>
      )}

      {/* Center - Timer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none">
        <div className="bg-[#161514]/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mb-8 pointer-events-auto">
          <span className="text-white/90 text-sm font-medium tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
            {subject}
          </span>
        </div>

        <motion.div
          key={`${minutes}:${seconds}`}
          initial={{ scale: 0.95 * (zoomLevel / 100), opacity: 0.8 }}
          animate={{ scale: zoomLevel / 100, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`text-[140px] md:text-[200px] leading-none font-light ${timerFont} text-white tracking-tight tabular-nums drop-shadow-2xl pointer-events-auto select-none`}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </motion.div>
        
        <div className="mt-12 flex items-center gap-4 pointer-events-auto">
          <button
            onClick={() => setIsActive(!isActive)}
            className="px-8 h-12 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 rounded-full font-bold text-sm transition-all flex items-center gap-2"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'PAUSE' : 'RESUME'}
          </button>
          <button
            onClick={handleEndEarly}
            className="px-8 h-12 bg-white/10 hover:bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-full font-bold text-sm transition-all"
          >
            END EARLY
          </button>
        </div>
      </div>

      {/* Bottom - Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4 bg-[#161514]/80 backdrop-blur-xl border border-white/10 rounded-full p-2 px-6 pointer-events-auto shadow-2xl">
          <button 
            onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
            className="text-white/70 hover:text-white p-1 transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white font-sans text-sm w-12 text-center">{zoomLevel}%</span>
          <button 
            onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
            className="text-white/70 hover:text-white p-1 transition-colors"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-2" />

          <button 
            onClick={() => setShowSettings(true)}
            className="text-white/70 hover:text-white p-1 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-2" />

          <button 
            onClick={toggleFullscreen}
            className="text-white/70 hover:text-white p-1 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-2" />

          <button onClick={() => setShowMusic(!showMusic)} className="flex items-center gap-2 text-white/70 hover:text-white px-2 py-1 transition-colors">
            <Music className="w-5 h-5" />
          </button>
          
          <button className="text-white/70 hover:text-white p-1 transition-colors">
            <Volume2 className="w-5 h-5" />
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-20 accent-white"
          />
        </div>

        {/* Floating Music Player */}
        {showMusic && (
          <div className="w-80 bg-[#161514]/80 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 overflow-hidden  pointer-events-auto">
            {audioSourceType === 'spotify' && spotifyUrl ? (
              <iframe 
                className="w-full h-[152px] border-0 rounded-lg" 
                src={spotifyUrl} 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy" 
              />
            ) : audioSourceType === 'local' && localAudioUrl ? (
              <audio src={localAudioUrl} controls autoPlay loop className="w-full invert opacity-80 mix-blend-screen" />
            ) : (
              <div className="text-white/50 text-sm text-center py-4">No audio configured.</div>
            )}
          </div>
        )}
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-[1000] bg-[#161514]/60 backdrop-blur-xl flex flex-col pointer-events-auto ">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1">Focus</div>
                  <h2 className="text-2xl font-light text-white">Choose a background</h2>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center gap-2 text-sm transition-colors border border-white/10"
                >
                  <X className="w-4 h-4" /> DONE
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                {BACKGROUND_OPTIONS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setCurrentBg(bg.url)}
                    className={`relative aspect-video rounded-2xl overflow-hidden group border-2 transition-all ${currentBg === bg.url ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-transparent hover:border-white/30'}`}
                  >
                    <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity" />
                    <div className="absolute bottom-3 left-3 text-white text-sm font-medium">{bg.name}</div>
                    {currentBg === bg.url && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-white/30 backdrop-blur-xl border border-white/40 text-white rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#161514]/80 border-t border-white/10 p-6 shrink-0">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest mb-3">Ambient Effect</div>
                <div className="flex flex-wrap gap-2">
                  {AMBIENT_EFFECTS.map((eff) => (
                    <button
                      key={eff.id}
                      onClick={() => setAmbient(eff.id)}
                      className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-colors border ${ambient === eff.id ? 'bg-white/30 backdrop-blur-xl border border-white/40 text-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-transparent text-white/70 border-white/20 hover:border-white/40'}`}
                    >
                      <eff.icon className="w-4 h-4" />
                      {eff.label}
                    </button>
                  ))}
                </div>
              </div>


            </div>
          </div>
        </div>
      )}

          </div>
  );
}
