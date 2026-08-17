import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Replace the layout around PlanViewer
to_replace = """                  <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
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
                  </div>"""

replacement = """                  <div>
                    {showCreator ? (
                      <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
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
                  </div>"""

text = text.replace(to_replace, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(text)

