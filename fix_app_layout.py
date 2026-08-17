import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Replace the activeTab === 'focus' section
# The current focus tab starts with `<div className="space-y-8 animate-fade-in">`

start_marker = "          {activeTab === 'focus' && ("
end_marker = "          {activeTab === 'habits' && ("

start_idx = text.find(start_marker)
end_idx = text.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find markers")
    exit(1)

old_section = text[start_idx:end_idx]

# We need to construct the new section
new_section = """          {activeTab === 'focus' && (
            <div className="animate-fade-in">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left Column: Focus Desk */}
                <div className="xl:col-span-4 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono text-xs uppercase text-white/60 font-bold tracking-widest">
                      Focus Desk
                    </h3>
                  </div>
                  
                  <div id="timer-card-root">
                    <FocusTimer 
                      currentTask={currentTask}
                      planTitle={currentTaskPlanTitle}
                      onSessionComplete={(log) => {
                        setSessionLogs(prev => [...prev, log]);
                        setCurrentTask(null);
                        setCurrentTaskPlanTitle(null);
                        setFocusTarget(null);
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
                    />
                  </div>

                  <SessionStats logs={sessionLogs} userId={currentUser?.uid || null} />
                </div>

                {/* Right Columns: Learning Blueprints */}
                <div className="xl:col-span-8 space-y-6">
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
                  
                  <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    {showCreator ? (
                      <PlanCreator
                        onPlanCreated={handlePlanCreated}
                        onCancel={() => setShowCreator(false)}
                        hasExistingPlans={plans.length > 0}
                      />
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
          )}
"""

text = text[:start_idx] + new_section + text[end_idx:]

with open('src/App.tsx', 'w') as f:
    f.write(text)

print("Replaced layout successfully")
