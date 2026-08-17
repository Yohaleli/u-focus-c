import sys
import re

with open('src/components/FocusTimer.tsx', 'r') as f:
    content = f.read()

btn1 = """<button onClick={onCloseTimerTask} className="p-1 rounded bg-black/40 border border-white/20 text-white/50 hover:text-white"><X className="w-3 h-3" /></button>"""

btn2 = """<button onClick={() => setIsFocusOverlayOpen(false)} className="w-[48px] h-[48px] flex items-center justify-center bg-black/30 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white/60 hover:text-white rounded-full transition-all shadow-lg"><Minimize2 className="w-4 h-4" /></button>"""

btn3 = """<button onClick={handleStartPause} className="px-8 py-3 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 hover:bg-white/10 text-white font-bold rounded-full transition-all shadow-xl">{isActive ? 'PAUSE' : 'START'}</button>"""

content = re.sub(r'\{currentTask && \(\s*<button\s*<\/button>\s*\)\}', '{currentTask && (' + btn1 + ')}', content)

content = re.sub(r'<div className="absolute top-8 right-8">\s*<button\s*<\/button>\s*<\/div>', '<div className="absolute top-8 right-8">' + btn2 + '</div>', content)

content = re.sub(r'<div className="mt-12 flex items-center justify-center">\s*<button\s*<\/button>\s*<\/div>', '<div className="mt-12 flex items-center justify-center">' + btn3 + '</div>', content)

with open('src/components/FocusTimer.tsx', 'w') as f:
    f.write(content)
