import re

with open('src/components/FocusTimer.tsx', 'r') as f:
    text = f.read()

to_replace = """        {/* Configurations and Operations Panel */}
        <div className="flex-1 space-y-4 w-full min-w-0">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
                 
              {currentTask && (<button onClick={onCloseTimerTask} className="p-1 rounded bg-black/40 border border-white/20 text-white/50 hover:text-white"><X className="w-3 h-3" /></button>)}
            </div>"""

replacement = """        {/* Configurations and Operations Panel */}
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
              {currentTask && (<button onClick={onCloseTimerTask} className="p-1.5 rounded-full bg-black/40 border border-white/20 text-white/50 hover:text-white transition-colors cursor-pointer"><X className="w-3 h-3" /></button>)}
            </div>"""

text = text.replace(to_replace, replacement)

# Replace the START/ROOM button line to match screenshot
# In screenshot: Start button is white pill, Restart is a circular button, Room is a border pill.

to_replace_buttons = """            <button 
              onClick={handleStartPause}
              id="btn-start-timer"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isActive ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />} 
              {isActive ? 'PAUSE' : 'START'}
            </button>
            <button 
              onClick={handleReset}
              id="btn-reset-timer"
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
            </button>"""

replacement_buttons = """            <button 
              onClick={handleStartPause}
              id="btn-start-timer"
              className="px-6 py-2.5 bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
            >
              {isActive ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />} 
              {isActive ? 'PAUSE' : 'START'}
            </button>
            <button 
              onClick={handleReset}
              id="btn-reset-timer"
              className="w-10 h-10 flex items-center justify-center bg-white/[0.05] backdrop-blur-md border border-white/10 hover:bg-white/10 text-white/60 hover:text-white rounded-full transition-all cursor-pointer shrink-0 active:scale-[0.98]"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEnterFullScreen ? onEnterFullScreen() : setIsFocusOverlayOpen(true)}
              id="btn-enter-immersive"
              className="px-5 py-2.5 flex items-center justify-center bg-transparent backdrop-blur-md border border-white/20 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer shrink-0 active:scale-[0.98] gap-2"
              title="Fullscreen Immersive Mode"
            >
              <Wind className="w-4 h-4" />
              ROOM
            </button>"""

text = text.replace(to_replace_buttons, replacement_buttons)

with open('src/components/FocusTimer.tsx', 'w') as f:
    f.write(text)
