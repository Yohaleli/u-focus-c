cat << 'INNER_EOF' > replacement.txt
      {/* Session Completion Overlay */}
      {showCompletion && (
        <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-black/60 border border-white/20 p-8 rounded-3xl max-w-md w-full shadow-2xl">
            <h2 className="text-3xl font-light text-white mb-2 text-center">Session Complete!</h2>
            <p className="text-white/60 text-sm mb-6 text-center">Great job focusing.</p>
            
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-6">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Time Studied</div>
                  <div className="text-2xl font-mono text-white">{durationMinutes} <span className="text-sm text-white/50">min</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Subject</div>
                  <div className="text-lg text-white truncate max-w-[150px]">{subject}</div>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2 flex items-center justify-between">
                  <span>Summary Note</span>
                  <span>{tasks.filter(t => t.completed).length}/{tasks.length} tasks</span>
                </div>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white/80 h-24 focus:outline-none focus:border-white/30 resize-none font-mono"
                  placeholder="Add any additional notes about this session..."
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  onEndSession({
                    id: `log-${Date.now()}`,
                    completedAt: new Date().toISOString(),
                    durationMinutes: durationMinutes,
                    taskTitle: subject,
                    planTitle: "Custom Session",
                    notes: sessionNotes
                  });
                }}
                className="w-full bg-white text-black py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Note & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
INNER_EOF
sed -i -e '283,284c\' -e "$(cat replacement.txt | sed 's/$/\\/')" src/components/FullScreenRoom.tsx
sed -i 's/\\$//g' src/components/FullScreenRoom.tsx
