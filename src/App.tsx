import React, { useState, useEffect, useRef } from 'react';
import { Brain, Edit2, Check, X, Plus, Sparkles, Home, BookOpen, Flame, Award, Volume2, VolumeX, Image as ImageIcon, LogIn, LogOut, User, Upload, Music, FolderOpen, Settings, Droplets, Waves, Wind, Coffee, Menu, Play, Zap, Shield, Swords, Users, Trophy, ShoppingBag, Bell } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import { startAmbientSound, stopAmbientSound, setAmbientVolume } from './utils/audioSynth';
import { LearningPlan, Task, SessionLog, UserProgress, AppTab } from './types';
import PlanCreator from './components/PlanCreator';
import PlanViewer from './components/PlanViewer';
import StartSessionView from './components/StartSessionView';
import FocusTimer from './components/FocusTimer';
import FullScreenRoom from './components/FullScreenRoom';
import SessionStats from './components/SessionStats';
import FocusDistribution from './components/FocusDistribution';
import SessionCompleteModal from './components/SessionCompleteModal';
import HabitTracker from './components/HabitTracker';
import TasksAndNotesHub from './components/TasksAndNotesHub';
import DailyInspiration from './components/DailyInspiration';
import LocalAudioPlayer from './components/LocalAudioPlayer';
import IntroPage from './components/IntroPage';
import TopNav from './components/TopNav';
import NotificationsView from './components/NotificationsView';

import NetworkStatus from './components/NetworkStatus';
import IdleSoftNotification from './components/IdleSoftNotification';
import { auth, logOut } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useSyncedState } from './hooks/useSyncedState';

import { calculateStudyStreak } from './utils/streak';
import { compressImage } from './utils/imageCompressor';

const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1506744626753-1fa7673b9666?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=2000&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=2000&q=80'
];

const SPOTIFY_PRESETS = [
  { name: 'Lofi Beats', url: 'https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4Zsnsnj' },
  { name: 'Deep Focus', url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ' },
  { name: 'Classical', url: 'https://open.spotify.com/playlist/37i9dQZF1DWWEJlAGA9gs0' },
  { name: 'White Noise', url: 'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn' }
];

const formatSpotifyUrl = (input: string) => {
  if (!input) return '';
  
  // Check if it's an iframe embed code and extract the src
  let url = input;
  const srcMatch = input.match(/src="([^"]+)"/);
  if (srcMatch && srcMatch[1]) {
    url = srcMatch[1];
  }

  if (url.includes('/embed/')) return url;
  
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'open.spotify.com') {
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        const type = pathParts[0]; // playlist, track, album, etc.
        const id = pathParts[1].split('?')[0]; // remove query params if any
        return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
      }
    }
  } catch (e) {
    // Ignore invalid URL
  }
  return url;
};

import LiveFocusBadge from './components/LiveFocusBadge';

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Load state from local storage with safe initializers
  const [plans, setPlans] = useSyncedState<LearningPlan[]>('focus_learn_plans', [], currentUser?.uid || null);

  const [activePlanId, setActivePlanId] = useSyncedState<string | null>('focus_learn_active_plan_id', null, currentUser?.uid || null);

  const [sessionLogs, setSessionLogs] = useSyncedState<SessionLog[]>('focus_learn_session_logs', [], currentUser?.uid || null);

  // Calculate current study streak
  const currentStreak = calculateStudyStreak(sessionLogs);
  
  const todayStudyMinutes = sessionLogs.reduce((acc, log) => {
    if (!log.completedAt) return acc;
    const logDate = new Date(log.completedAt);
    const today = new Date();
    if (logDate.getDate() === today.getDate() && 
        logDate.getMonth() === today.getMonth() && 
        logDate.getFullYear() === today.getFullYear()) {
      return acc + (log.durationSeconds || (log.durationMinutes * 60) || 0);
    }
    return acc;
  }, 0);

  // Track the current study block active in FocusTimer
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isGlobalTimerRunning, setIsGlobalTimerRunning] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25);
  const [sessionSubject, setSessionSubject] = useState('');
  const [sessionTasks, setSessionTasks] = useState<Task[]>([]);

  const [currentTaskPlanTitle, setCurrentTaskPlanTitle] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<{ planId: string; moduleId: string; taskId: string } | null>(null);
  const [completedSessionLog, setCompletedSessionLog] = useState<SessionLog | null>(null);

  const [customBg, setCustomBg] = useSyncedState<string | null>('ufocus_customBg', null, currentUser?.uid || null);
  const [bgBlur, setBgBlur] = useSyncedState<number>('ufocus_bgBlur', 4, currentUser?.uid || null);
  const [quoteCategory, setQuoteCategory] = useSyncedState<'motivational' | 'christian' | 'islamic'>('ufocus_quoteCategory', 'motivational', currentUser?.uid || null);
  const [calendarType, setCalendarType] = useSyncedState<'gregorian' | 'ethiopian'>('ufocus_calendarType', 'gregorian', currentUser?.uid || null);
  
  
  
  const [quoteLanguage, setQuoteLanguage] = useSyncedState<'am' | 'en'>('ufocus_quoteLanguage', 'en', currentUser?.uid || null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [systemFocusMode, setSystemFocusMode] = useSyncedState<boolean>('ufocus_systemFocusMode', false, currentUser?.uid || null);
  const [autoTransition, setAutoTransition] = useSyncedState<boolean>('ufocus_autoTransition', false, currentUser?.uid || null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await compressImage(file, 1920, 1080, 0.75);
        setCustomBg(compressedDataUrl);
      } catch (err) {
        console.error('Failed to compress background image:', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          setCustomBg(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Keep track to avoid infinite compression loops
  const hasAttemptedCompression = useRef(false);

  // Automatically compress legacy customBg if it exceeds Firestore size limit
  useEffect(() => {
    if (customBg && customBg.length > 800000 && !hasAttemptedCompression.current) {
      hasAttemptedCompression.current = true;
      compressImage(customBg, 1920, 1080, 0.7)
        .then((compressed) => {
          setCustomBg(compressed);
        })
        .catch((err) => {
          console.warn('Could not compress existing customBg:', err);
        });
    }
  }, [customBg, setCustomBg]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  // Toggle Plan Creator view
  const [showCreator, setShowCreator] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setIsNavVisible((prev) => prev ? false : prev);
          } else {
            setIsNavVisible((prev) => !prev ? true : prev);
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

  // Active Tab: 'study' for Study Desk & Focus, 'habits' for Habit Journal
  
  const [ambientSound, setAmbientSound] = useSyncedState<'rain' | 'brown' | 'drone' | 'off' | 'white' | 'coffee'>('ufocus_ambientSound', 'off', currentUser?.uid || null);
  const [volume, setVolume] = useSyncedState<number>('ufocus_volume', 0.5, currentUser?.uid || null);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setAmbientVolume(val);
  };


  

  

  

  

  

  useEffect(() => {
    if (ambientSound !== 'off') {
      startAmbientSound(ambientSound, volume);
    } else {
      stopAmbientSound();
    }
  }, [ambientSound]);

  
  const [spotifyUrl, setSpotifyUrl] = useSyncedState<string>('focus_learn_spotify_url', 'https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0', currentUser?.uid || null);
  const [isEditingSpotify, setIsEditingSpotify] = useState(false);
  const [tempSpotifyUrl, setTempSpotifyUrl] = useState('');

  

  
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [localAudioName, setLocalAudioName] = useState<string | null>(null);
  const [audioSourceType, setAudioSourceType] = useState<'spotify' | 'local' | 'ambient'>('spotify');
  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleLocalAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalAudioUrl(url);
      setLocalAudioName(file.name);
      setAudioSourceType('local');
    }
  };

  const [activeTab, setActiveTab] = useSyncedState<AppTab>('ufocus_active_tab', 'focus', currentUser?.uid || null);

  const [layoutMode, setLayoutMode] = useState<'split' | 'desk' | 'blueprints'>('split');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Shortcut 's' or 'S'
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        setLayoutMode(prev => {
          if (prev === 'split') return 'desk';
          if (prev === 'desk') return 'blueprints';
          return 'split';
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [userProgress, setUserProgress] = useSyncedState<UserProgress>('ufocus_user_progress', {
    allTimeStreakBest: 0
  }, currentUser?.uid || null);

  const [bgIndex, setBgIndex] = useSyncedState<number>('focus_learn_bg_index', 0, currentUser?.uid || null);

  const safeUserProgress = React.useMemo(() => ({
    ...userProgress
  }), [userProgress]);

  React.useEffect(() => {
    // Keep this empty or just removed if it's no longer checking xp/level
  }, [userProgress, setUserProgress, safeUserProgress]);


  // Sync active tab to local storage
  

  

  // Sync to local storage
  

  // Migration: Remove 'Full Stack Web Foundations' if it exists
  useEffect(() => {
    if (plans.some(p => p.title.toLowerCase().replace('-', ' ').includes('full stack web foundations'))) {
      const updatedPlans = plans.filter(p => !p.title.toLowerCase().replace('-', ' ').includes('full stack web foundations'));
      setPlans(updatedPlans);
      if (activePlanId && !updatedPlans.find(p => p.id === activePlanId)) {
        setActivePlanId(updatedPlans.length > 0 ? updatedPlans[0].id : null);
      }
    }
  }, [plans, activePlanId]);

  

  

  // Handle plan creation
  const handlePlanCreated = (newPlan: LearningPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
    setActivePlanId(newPlan.id);
    setShowCreator(false);
  };

  // Toggle complete state of a task
  const handleToggleTask = (planId: string, moduleId: string, taskId: string, forceComplete?: boolean) => {
    // Check old state to play sound if completing
    const plan = plans.find((p) => p.id === planId);
    const mod = plan?.modules.find((m) => m.id === moduleId);
    const task = mod?.tasks.find((t) => t.id === taskId);
    
    if (task) {
      const isNowCompleted = forceComplete !== undefined ? forceComplete : !task.completed;
    }

    setPlans((prevPlans) => {
      return prevPlans.map((plan) => {
        if (plan.id !== planId) return plan;

        return {
          ...plan,
          modules: plan.modules.map((mod) => {
            if (mod.id !== moduleId) return mod;

            return {
              ...mod,
              tasks: mod.tasks.map((task) => {
                if (task.id !== taskId) return task;

                const isCompleted = forceComplete !== undefined ? forceComplete : !task.completed;
                return {
                  ...task,
                  completed: isCompleted,
                  completedAt: isCompleted ? new Date().toISOString() : undefined
                };
              })
            };
          })
        };
      });
    });
  };

  // Trigger focus study session
  const handleStartFocusSession = (task: Task, planTitle: string) => {
    let targetInfo: { planId: string; moduleId: string; taskId: string } | null = null;
    
    plans.forEach((p) => {
      p.modules.forEach((m) => {
        m.tasks.forEach((t) => {
          if (t.id === task.id) {
            targetInfo = { planId: p.id, moduleId: m.id, taskId: t.id };
          }
        });
      });
    });

    setCurrentTask(task);
    setCurrentTaskPlanTitle(planTitle);
    setFocusTarget(targetInfo);
    setActiveTab('focus');
    
    setTimeout(() => {
      const element = document.getElementById('timer-card-root');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Session Logging
  const handleSessionComplete = (log: SessionLog) => {
    setSessionLogs((prev) => [log, ...prev]);
    setCompletedSessionLog(log);

    // If studying a task target, automatically check it off
    if (focusTarget) {
      handleToggleTask(focusTarget.planId, focusTarget.moduleId, focusTarget.taskId, true);
    }

    // Clean up focus session target
    setCurrentTask(null);
    setCurrentTaskPlanTitle(null);
    setFocusTarget(null);
  };

    const handleUpdateTaskDuration = (planId: string, moduleId: string, taskId: string, newDuration: number) => {
    setPlans((prevPlans) => {
      return prevPlans.map((plan) => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          modules: plan.modules.map((mod) => {
            if (mod.id !== moduleId) return mod;
            return {
              ...mod,
              tasks: mod.tasks.map((task) => {
                if (task.id !== taskId) return task;
                return { ...task, durationMinutes: newDuration };
              })
            };
          })
        };
      });
    });
  };

  // Delete plan
  const handleUpdateModuleTitle = (planId: string, moduleId: string, newTitle: string) => {
    setPlans(prevPlans => prevPlans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          modules: plan.modules.map(mod => {
            if (mod.id === moduleId) {
              return { ...mod, title: newTitle };
            }
            return mod;
          })
        };
      }
      return plan;
    }));
  };

  const handleUpdatePlanTitle = (planId: string, newTitle: string) => {
    setPlans(prevPlans => prevPlans.map(plan => {
      if (plan.id === planId) {
        return { ...plan, title: newTitle };
      }
      return plan;
    }));
  };

  // Delete plan
  const handleDeletePlan = (planId: string) => {
    const updated = plans.filter((p) => p.id !== planId);
    setPlans(updated);
    if (activePlanId === planId) {
      setActivePlanId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Clear focused task context
  const handleCloseTimerTask = () => {
    setCurrentTask(null);
    setCurrentTaskPlanTitle(null);
    setFocusTarget(null);
  };

  return (
    <>
    {!authInitialized ? (
      <div className="min-h-screen bg-[#161514]/40 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
      </div>
    ) : !currentUser && !isGuest ? (
      <>
        <IntroPage 
          onLoginClick={() => setShowAuthModal(true)} 
          onTryWithoutSignup={() => setIsGuest(true)} 
        />
      </>
    ) : (
    <div className="min-h-screen flex flex-col relative text-white antialiased selection:bg-white/10 selection:text-white">
      
      {isSessionActive && (
        <FullScreenRoom
          onFocusStateChange={setIsGlobalTimerRunning}
          backgroundImage={(customBg && customBg !== "null") ? customBg : BACKGROUNDS[bgIndex]}
          durationMinutes={sessionDuration}
          subject={sessionSubject}
          tasks={sessionTasks}
          onEndSession={(log) => {
            setIsSessionActive(false);
            if (log) {
               setSessionLogs(prev => [log, ...prev]);
               if (systemFocusMode) setSystemFocusMode(false);
            }
          }}
          ambientSound={ambientSound}
          setAmbientSound={setAmbientSound}
          volume={volume}
          setVolume={setVolume}
          audioSourceType={audioSourceType}
          spotifyUrl={spotifyUrl}
          localAudioUrl={localAudioUrl}
        />
      )}

      <NetworkStatus />

      {/* Custom Background Image */}
      <div 
        className="fixed inset-0 z-[-2] transition-all duration-1000 ease-in-out opacity-100"
        style={{
          backgroundImage: `url("${(customBg && customBg !== "null") ? customBg : BACKGROUNDS[bgIndex]}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="fixed inset-0 z-[-1] bg-[#0a0d0b]/60" />

      {/* Persistent Live Focus Badge - Bottom Left */}
      {!isGuest && (
        <div className="fixed bottom-6 left-6 z-50">
          <LiveFocusBadge userId={currentUser?.uid} isSessionActive={isGlobalTimerRunning} />
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        {!isSessionActive && (
        <TopNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'settings') {
              setShowSettingsModal(true);
            } else {
              setActiveTab(tab);
            }
          }}
          userProgress={safeUserProgress}
          userName={currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Guest'}
          userAvatar={currentUser?.photoURL || ''}
          onLogout={() => {
            if (isGuest) {
              setIsGuest(false);
            } else {
              logOut();
            }
          }}
          currentStreak={currentStreak}
          isGuest={isGuest}
          isSessionActive={isSessionActive}
        />
        )}

        {/* View Switcher Main Content */}
        <main className={`flex-1 mx-auto w-full ${activeTab === 'habits' ? 'max-w-full px-2 sm:px-4 md:px-6 pt-6 min-h-0 flex flex-col' : 'p-4 sm:p-6 md:p-8 max-w-[1500px]'}`}>

          <div className={activeTab === 'focus' ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left Column: Focus Desk */}
                <div className={`${layoutMode === 'blueprints' ? 'hidden' : layoutMode === 'desk' ? 'xl:col-span-12' : 'xl:col-span-4'} space-y-6`}>
                  <DailyInspiration category={quoteCategory} language={quoteLanguage} />
                  
                  <div id="timer-card-root">
                    <FocusTimer 
                      onFocusStateChange={setIsGlobalTimerRunning}
                      currentTask={currentTask}
                      planTitle={currentTaskPlanTitle}
                      backgroundImage={(customBg && customBg !== "null") ? customBg : BACKGROUNDS[bgIndex]}
                      onSessionComplete={(log) => {
                        handleSessionComplete(log);
                      }}
                      onCloseTimerTask={() => {
                        setCurrentTask(null);
                        setCurrentTaskPlanTitle(null);
                        setFocusTarget(null);
                      }}
                      ambientSound={ambientSound}
                      setAmbientSound={setAmbientSound}
                      volume={volume}
                      setVolume={setVolume}
                      handleVolumeChange={handleVolumeChange}
                      currentUser={currentUser}
                      autoTransition={autoTransition}
                      sessionLogs={sessionLogs}
                    />
                  </div>

                  <SessionStats logs={sessionLogs} userId={currentUser?.uid || null} />
                  <FocusDistribution logs={sessionLogs} />
                  
                  {/* Soundscape Section */}
                  <div className="bg-white/5 border border-white/20 shadow-xl rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-serif text-white flex items-center gap-2">
                        <Music className="w-5 h-5 text-white/60" /> Soundscape
                      </h2>
                      <div className="flex bg-white/5 rounded-lg p-1">
                        <button
                          onClick={() => setAudioSourceType('spotify')}
                          className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${audioSourceType === 'spotify' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                        >
                          Spotify
                        </button>
                        <button
                          onClick={() => setAudioSourceType('local')}
                          className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${audioSourceType === 'local' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                        >
                          Local
                        </button>
                      </div>
                    </div>

                    {audioSourceType === 'spotify' && (
                      <div className="space-y-4 ">
                        {isEditingSpotify ? (
                          <div className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={tempSpotifyUrl}
                                onChange={(e) => setTempSpotifyUrl(e.target.value)}
                                placeholder="Paste Spotify embed URL..."
                                className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2 font-mono"
                              />
                              <button
                                onClick={() => {
                                  setSpotifyUrl(formatSpotifyUrl(tempSpotifyUrl));
                                  setIsEditingSpotify(false);
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setIsEditingSpotify(false)}
                                className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-xs text-white/40 px-2 mt-1 mb-1 font-mono uppercase tracking-wider">Recommended</div>
                            <div className="flex flex-wrap gap-2 px-2">
                              {SPOTIFY_PRESETS.map((preset, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSpotifyUrl(formatSpotifyUrl(preset.url));
                                    setIsEditingSpotify(false);
                                  }}
                                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/5 rounded-md text-xs transition-colors cursor-pointer text-white/80"
                                >
                                  {preset.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="relative group rounded-xl overflow-hidden bg-[#161514]/40 h-[352px]">
                            <iframe 
                              className="w-full h-full border-0" 
                              src={formatSpotifyUrl(spotifyUrl)} 
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                              loading="lazy" 
                            />
                            <button
                              onClick={() => {
                                setTempSpotifyUrl(spotifyUrl);
                                setIsEditingSpotify(true);
                              }}
                              className="absolute bottom-2 right-2 p-2 bg-[#161514]/60 hover:bg-[#161514] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl border border-white/10 cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {audioSourceType === 'local' && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 ">
                        {localAudioUrl ? (
                          <LocalAudioPlayer url={localAudioUrl} name={localAudioName || 'Local Audio'} />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 px-4 text-center border-2 border-dashed border-white/10 rounded-xl">
                            <Music className="w-8 h-8 text-white/20 mb-3" />
                            <p className="text-white/60 mb-4 text-sm">Select an audio file from your device</p>
                            <label className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-2">
                              <FolderOpen className="w-4 h-4" /> Choose File
                              <input
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    setLocalAudioUrl(url);
                                    setLocalAudioName(file.name);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Columns: Learning Blueprints */}
                <div className={`${layoutMode === 'desk' ? 'hidden' : layoutMode === 'blueprints' ? 'xl:col-span-12' : 'xl:col-span-8'} space-y-6`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs uppercase text-white/60 font-bold tracking-widest">
                      Learning Blueprints
                    </h3>
                    {plans.length > 0 && (
                      <span className="font-mono text-[10px] text-white/40 italic">
                        Select Curriculum to inspect
                      </span>
                    )}
                  </div>
                  
                  <div>
                    {showCreator ? (
                      <div className="bg-white/5 border border-white/20 shadow-xl rounded-2xl p-6">
                        <PlanCreator
                          onPlanCreated={handlePlanCreated}
                          onCancel={() => setShowCreator(false)}
                          hasExistingPlans={plans.length > 0}
                        />
                      </div>
                    ) : (
                      <PlanViewer
                        plans={plans}
                        activePlanId={activePlanId}
                        onSelectPlan={setActivePlanId}
                        onToggleTask={handleToggleTask}
                        onStartFocusSession={handleStartFocusSession}
                        onUpdateTaskDuration={handleUpdateTaskDuration}
                        onUpdatePlanTitle={handleUpdatePlanTitle}
                        onUpdateModuleTitle={handleUpdateModuleTitle}
                        onDeletePlan={handleDeletePlan}
                        onAddNewPlanTrigger={() => setShowCreator(true)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          <div className={activeTab === 'habits' ? 'block space-y-8' : 'hidden'}>
              <HabitTracker 
                calendarType={calendarType} 
                userId={currentUser?.uid || null} 
              />
            </div>

          <div className={activeTab === 'notes' ? 'block' : 'hidden'}>
            <TasksAndNotesHub userId={currentUser?.uid} />
          </div>

        </main>

        <IdleSoftNotification 
          activeTab={activeTab} 
          isSessionActive={isSessionActive} 
          sessionLogs={sessionLogs}
        />
        
      </div>

      {completedSessionLog && (
        <SessionCompleteModal log={completedSessionLog} backgroundImage={(customBg && customBg !== "null") ? customBg : BACKGROUNDS[bgIndex]} onClose={() => setCompletedSessionLog(null)} />
      )}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onUploadCustomBg={handleFileUpload}
          onChangeBg={() => {
            setCustomBg(null);
            setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
          }}
          bgBlur={bgBlur}
          setBgBlur={setBgBlur}
          quoteCategory={quoteCategory}
          setQuoteCategory={setQuoteCategory}
          quoteLanguage={quoteLanguage}
          setQuoteLanguage={setQuoteLanguage}
          systemFocusMode={systemFocusMode}
          setSystemFocusMode={setSystemFocusMode}
          autoTransition={autoTransition}
          setAutoTransition={setAutoTransition}
          calendarType={calendarType}
          setCalendarType={setCalendarType}
          ambientSound={ambientSound}
          setAmbientSound={setAmbientSound}
          volume={volume}
          setVolume={setVolume}
          
        />
      )}
    </div>
    )}
    </>
  );
}
