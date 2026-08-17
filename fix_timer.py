import sys
with open('src/components/FocusTimer.tsx', 'r') as f:
    content = f.read()

import re

new_controls = """          {/* Core Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
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

            {isActive && mode === 'focus' && (
              <button
                onClick={handleTimerExpiry}
                className="px-6 h-[48px] flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-full transition-all shadow-xl"
              >
                <CheckCircle2 className="w-4 h-4" />
                DONE
              </button>
            )}

            <button
              onClick={handleReset}
              className="w-[48px] h-[48px] flex items-center justify-center bg-white/[0.05] backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 text-white/60 hover:text-white rounded-full transition-all cursor-pointer shrink-0"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsFocusOverlayOpen(true)}
              id="btn-enter-immersive"
              className="w-[48px] h-[48px] flex items-center justify-center bg-white/[0.05] backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 text-white/60 hover:text-white rounded-full transition-all cursor-pointer shrink-0"
              title="Fullscreen Immersive Mode"
            >
              <Minimize2 className="w-3.5 h-3.5 transform rotate-180" />
            </button>
          </div>"""

# Replace the broken controls block
content = re.sub(r'\{\/\* Core Controls \*\/\}.*?<\/div>', new_controls, content, flags=re.DOTALL)

# Remove the isRoomPanelOpen block
content = re.sub(r'\{isRoomPanelOpen && \(.*?\)\} \/\* IMMERSIVE FOCUS OVERLAY \*\/', '{/* IMMERSIVE FOCUS OVERLAY */}', content, flags=re.DOTALL)


with open('src/components/FocusTimer.tsx', 'w') as f:
    f.write(content)
