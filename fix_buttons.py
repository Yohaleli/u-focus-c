import re

with open('src/components/FocusTimer.tsx', 'r') as f:
    text = f.read()

to_replace = """          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleStartPause}
              className={`px-8 h-[48px] rounded-full font-bold text-sm transition-all shadow-xl flex items-center gap-2 ${
                isActive
                  ? 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/20'
                  : 'bg-white text-black hover:bg-neutral-200'
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
              className="w-[48px] h-[48px] flex items-center justify-center bg-white/[0.05] backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 text-white/60 hover:text-white rounded-full transition-all cursor-pointer shrink-0"
              title="Fullscreen Immersive Mode"
            >
              <Minimize2 className="w-3.5 h-3.5 transform rotate-180" />
            </button>
          </div>"""

replacement = """          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleStartPause}
              className="px-6 py-2.5 bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
            >
              {isActive ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />} 
              {isActive ? 'PAUSE' : 'START'}
            </button>
            <button
              onClick={handleReset}
              className="w-10 h-10 flex items-center justify-center bg-white/[0.05] backdrop-blur-md border border-white/10 hover:bg-white/10 text-white/60 hover:text-white rounded-full transition-all cursor-pointer shrink-0 active:scale-[0.98]"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEnterFullScreen ? onEnterFullScreen() : setIsFocusOverlayOpen(true)}
              className="px-5 py-2.5 flex items-center justify-center bg-transparent backdrop-blur-md border border-white/20 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer shrink-0 active:scale-[0.98] gap-2"
              title="Fullscreen Immersive Mode"
            >
              <Wind className="w-4 h-4" />
              ROOM
            </button>
          </div>"""

text = text.replace(to_replace, replacement)

with open('src/components/FocusTimer.tsx', 'w') as f:
    f.write(text)

