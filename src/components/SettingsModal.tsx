import React from 'react';
import { X, Settings, Image as ImageIcon, Volume2, Globe, BookOpen, Star, FolderOpen, Droplets, Wind, Waves, Coffee } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  // Background
  bgBlur: number;
  setBgBlur: (blur: number) => void;
  onUploadCustomBg: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeBg: () => void;
  // Quote
  quoteCategory: 'christian' | 'islamic' | 'motivational';
  setQuoteCategory: (cat: 'christian' | 'islamic' | 'motivational') => void;
  quoteLanguage: 'am' | 'en';
  setQuoteLanguage: (lang: 'am' | 'en') => void;
  calendarType: 'gregorian' | 'ethiopian';
  setCalendarType: (type: 'gregorian' | 'ethiopian') => void;
  // Sound
  ambientSound: 'rain' | 'brown' | 'drone' | 'off' | 'white' | 'coffee';
  setAmbientSound: (sound: 'rain' | 'brown' | 'drone' | 'off' | 'white' | 'coffee') => void;
  volume: number;
  setVolume: (vol: number) => void;
  systemFocusMode: boolean;
  setSystemFocusMode: (mode: boolean) => void;
  autoTransition: boolean;
  setAutoTransition: (mode: boolean) => void;
}

export default function SettingsModal({
  onClose,
  bgBlur,
  setBgBlur,
  onUploadCustomBg,
  onChangeBg,
  quoteCategory,
  setQuoteCategory,
  quoteLanguage,
  setQuoteLanguage,
  calendarType,
  setCalendarType,
  ambientSound,
  setAmbientSound,
  volume,
  setVolume,
  systemFocusMode,
  setSystemFocusMode,
  autoTransition,
  setAutoTransition,
}: SettingsModalProps) {
  
const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden  text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-white/70" />
            <h2 className="font-mono text-sm uppercase tracking-widest font-semibold">Preferences</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-white/50 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          
          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Appearance</h3>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Background Theme</div>
                  <div className="text-xs text-white/50 mt-1">Change your visual environment</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="p-2.5 bg-white/5 hover:bg-white/20 border border-white/10 rounded-lg cursor-pointer transition-colors shadow-sm flex items-center justify-center">
                    <input type="file" accept="image/*" className="hidden" onChange={onUploadCustomBg} />
                    <FolderOpen className="w-4 h-4 text-white/80" />
                  </label>
                  <button
                    onClick={onChangeBg}
                    className="p-2.5 bg-white/5 hover:bg-white/20 border border-white/10 rounded-lg cursor-pointer transition-colors shadow-sm flex items-center justify-center"
                    title="Next preset background"
                  >
                    <ImageIcon className="w-4 h-4 text-white/80" />
                  </button>
                </div>
              </div>
              

            </div>
          </div>

          
          {/* Calendar Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Calendar</h3>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
              <div>
                <div className="text-sm font-medium mb-3">Calendar System</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCalendarType('gregorian')}
                    className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      calendarType === 'gregorian' ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    Gregorian Calendar
                  </button>
                  <button
                    onClick={() => setCalendarType('ethiopian')}
                    className={`flex items-center justify-center py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      calendarType === 'ethiopian' ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    Ethiopian Calendar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Inspiration Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Inspiration</h3>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
              <div>
                <div className="text-sm font-medium mb-3">Quote Category</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setQuoteCategory('motivational')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      quoteCategory === 'motivational' ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" /> Motivation
                  </button>
                  <button
                    onClick={() => setQuoteCategory('christian')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      quoteCategory === 'christian' ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Bible
                  </button>
                  <button
                    onClick={() => setQuoteCategory('islamic')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                      quoteCategory === 'islamic' ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Quran
                  </button>
                </div>
              </div>

              {quoteCategory !== 'motivational' && (
                <div className="pt-2 border-t border-white/5">
                  <div className="text-sm font-medium mb-3">Language</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setQuoteLanguage('en')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                        quoteLanguage === 'en' ? 'bg-white/20 text-white border border-white/20' : 'bg-white/5 text-white/40 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Globe className="w-3 h-3" /> English
                    </button>
                    <button
                      onClick={() => setQuoteLanguage('am')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                        quoteLanguage === 'am' ? 'bg-white/20 text-white border border-white/20' : 'bg-white/5 text-white/40 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Globe className="w-3 h-3" /> Amharic
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sound Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Audio Focus</h3>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
              <div>
                <div className="text-sm font-medium mb-3">Ambient Sound</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'off', label: 'Off', icon: Volume2 },
                    { id: 'rain', label: 'Rain', icon: Droplets },
                    { id: 'brown', label: 'Brown Noise', icon: Waves },
                    { id: 'white', label: 'White Noise', icon: Waves },
                    { id: 'drone', label: 'Deep Drone', icon: Wind },
                    { id: 'coffee', label: 'Coffee Shop', icon: Coffee },
                  ].map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => setAmbientSound(sound.id as any)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                        ambientSound === sound.id ? 'bg-white text-black font-bold' : 'bg-white/5 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      <sound.icon className="w-3 h-3" /> {sound.label}
                    </button>
                  ))}
                </div>
              </div>

              {ambientSound !== 'off' && (
                <div className="pt-2 border-t border-white/5">
                  <div className="text-sm font-medium mb-3 flex items-center justify-between">
                    <span>Volume</span>
                    <span className="text-xs text-white/50 font-mono">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* System Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-2">System</h3>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
              


              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">System Focus Mode</div>
                <div className="text-xs text-white/50 mt-1">Prevent device from sleeping during focus sessions</div>
              </div>
              <button
                onClick={() => setSystemFocusMode(!systemFocusMode)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${systemFocusMode ? 'bg-white' : 'bg-white/20'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-black shadow-sm transform transition-transform ${systemFocusMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Auto-Transition Timer</div>
                <div className="text-xs text-white/50 mt-1">Automatically start the next timer when one finishes</div>
              </div>
              <button
                onClick={() => setAutoTransition(!autoTransition)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${autoTransition ? 'bg-white' : 'bg-white/20'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-black shadow-sm transform transition-transform ${autoTransition ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              </div>

              

            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
}
