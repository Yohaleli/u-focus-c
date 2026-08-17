import React, { useState } from 'react';
import { 
  CheckSquare, Square, Play, Sparkles, BookOpen, Clock, 
  Trash2, ChevronDown, ChevronRight, Folder, FolderOpen, Search,
  Plus, Calendar, BarChart3, HelpCircle, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LearningPlan, Module, Task } from '../types';

interface PlanViewerProps {
  plans: LearningPlan[];
  activePlanId: string | null;
  onSelectPlan: (id: string) => void;
  onToggleTask: (planId: string, moduleId: string, taskId: string) => void;
  onStartFocusSession: (task: Task, planTitle: string) => void;
  onUpdateTaskDuration?: (planId: string, moduleId: string, taskId: string, duration: number) => void;
  onUpdatePlanTitle: (id: string, newTitle: string) => void;
  onUpdateModuleTitle?: (planId: string, moduleId: string, newTitle: string) => void;
  onDeletePlan: (id: string) => void;
  onAddNewPlanTrigger: () => void;
}

export default function PlanViewer({
  plans,
  activePlanId,
  onSelectPlan,
  onToggleTask,
  onStartFocusSession,
  onUpdatePlanTitle,
  onUpdateModuleTitle,
  onDeletePlan,
  onAddNewPlanTrigger,
  onUpdateTaskDuration
}: PlanViewerProps) {
  const [editingDurationTaskId, setEditingDurationTaskId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [editPlanTitle, setEditPlanTitle] = useState('');
  const [editDurationValue, setEditDurationValue] = useState<string>('');
  const [justCompletedTaskId, setJustCompletedTaskId] = useState<string | null>(null);

  const handleTaskToggle = (e: React.MouseEvent, planId: string, moduleId: string, taskId: string, isCurrentlyCompleted: boolean) => {
    if (!isCurrentlyCompleted) {
      setJustCompletedTaskId(taskId);
      setTimeout(() => setJustCompletedTaskId(null), 1200);
    }
    onToggleTask(planId, moduleId, taskId);
  };

  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0] || null;
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate task statistics
  const getPlanStats = (plan: LearningPlan) => {
    let totalTasks = 0;
    let completedTasks = 0;
    let totalMinutes = 0;

    plan.modules.forEach((mod) => {
      mod.tasks.forEach((task) => {
        totalTasks++;
        if (task.completed) completedTasks++;
        totalMinutes += task.durationMinutes;
      });
    });

    const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    return { totalTasks, completedTasks, percent, totalMinutes };
  };

  const handleSaveModuleTitle = (moduleId: string) => {
    if (editModuleTitle.trim() && onUpdateModuleTitle) {
      onUpdateModuleTitle(activePlanId!, moduleId, editModuleTitle.trim());
    }
    setEditingModuleId(null);
  };

  const handleSaveTitle = (planId: string) => {
    if (editPlanTitle.trim()) {
      onUpdatePlanTitle(planId, editPlanTitle.trim());
    }
    setEditingPlanId(null);
  };

  const toggleModuleExpand = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  if (plans.length === 0) {
    return (
      <div id="no-plans-container" className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/20 shadow-xl w-full py-12 space-y-4">
        <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">No Learning Blueprints</h3>
          <p className="text-xs text-white/70 max-w-xs leading-relaxed">
            Generate an expert AI curriculum customized to your specific study targets, or build a custom curriculum block by block.
          </p>
        </div>
        <button
          onClick={onAddNewPlanTrigger}
          className="px-6 py-2.5 bg-white/5 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/20 hover:border-white/40 text-white font-bold uppercase text-[10px] tracking-widest rounded-full hover:brightness-110 transition-all cursor-pointer shadow-sm shadow-white/10 active:scale-[0.98]"
        >
          + Start Planning
        </button>
      </div>
    );
  }

  const activePlanStats = activePlan ? getPlanStats(activePlan) : { totalTasks: 0, completedTasks: 0, percent: 0, totalMinutes: 0 };

  return (
    <div className="flex flex-col gap-6">
      <div id="plan-viewer-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Sidebar / Plan Selector */}
      <div className="lg:col-span-4 bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/20">
          <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 font-semibold">
            My Curriculums
          </span>
          <button
            onClick={onAddNewPlanTrigger}
            className="p-1.5 text-white bg-white/[0.05] backdrop-blur-md hover:bg-white/5 rounded-full border border-white/10 cursor-pointer transition-all"
            title="Create new plan"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {plans.map((plan) => {
            const stats = getPlanStats(plan);
            const isSelected = plan.id === activePlan?.id;
            return (
              <div
                key={plan.id}
                onClick={() => onSelectPlan(plan.id)}
                className={`group flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white/5 backdrop-blur-md border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                    : 'bg-white/5 backdrop-blur-md border-white/20 hover:border-white/10 hover:bg-white/20 hover:border-white/30'
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  {editingPlanId === plan.id ? (
                    <input
                      type="text"
                      value={editPlanTitle}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditPlanTitle(e.target.value)}
                      onBlur={() => handleSaveTitle(plan.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle(plan.id);
                        if (e.key === 'Escape') setEditingPlanId(null);
                      }}
                      className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-xs text-white outline-none focus:border-white/50"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>
                        {plan.title}
                      </h4>
                      {plan.category && (
                        <span 
                          className="px-1.5 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase tracking-widest border shrink-0"
                          style={{ color: plan.category.color, borderColor: `${plan.category.color}80`, backgroundColor: `${plan.category.color}30` }}
                        >
                          {plan.category.name}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 font-mono text-[9px] uppercase tracking-wider text-white/30">
                    <span className="text-white/80">{stats.percent}% Complete</span>
                    <span>•</span>
                    <span>{stats.totalTasks} sessions</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPlanId(plan.id);
                      setEditPlanTitle(plan.title);
                    }}
                    className="p-1 hover:bg-white/5 text-white/20 hover:text-white rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Edit Title"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {confirmDeleteId === plan.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePlan(plan.id);
                          setConfirmDeleteId(null);
                        }}
                        className="text-[9px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded font-bold uppercase tracking-wider"
                      >
                        Del
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="text-[9px] bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded font-bold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(plan.id);
                      }}
                      className="p-1 hover:bg-white/5 text-white/20 hover:text-white rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Plan Display */}
      {activePlan && (
        <div className="lg:col-span-8 bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 space-y-6">
          {/* Plan Header */}
          <div className="border-b border-white/20 pb-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-light text-white tracking-tight leading-snug">
                    {activePlan.title}
                  </h2>
                  {activePlan.category && (
                    <span 
                      className="px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-widest border shrink-0"
                      style={{ color: activePlan.category.color, borderColor: `${activePlan.category.color}80`, backgroundColor: `${activePlan.category.color}30` }}
                    >
                      {activePlan.category.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  {activePlan.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 backdrop-blur-md text-white/70 text-[9px] font-mono uppercase tracking-widest rounded-full border border-white/20 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                <span>{activePlan.duration}</span>
              </div>
            </div>

            {/* Overall Progress Tracker */}
            <div className="space-y-2">
              <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-white/40">
                <span>Progress Checklist</span>
                <span>{activePlanStats.completedTasks}/{activePlanStats.totalTasks} sessions done ({activePlanStats.percent}%)</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 backdrop-blur-md rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-white/80 to-white rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ width: `${activePlanStats.percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Modules Grid */}
          <div className="space-y-4">
            {activePlan.modules.map((module, mIdx) => {
              const filteredTasks = module.tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
              if (searchQuery && filteredTasks.length === 0) return null;
              const isCollapsed = expandedModules[module.id] === true;
              const moduleCompletedTasks = module.tasks.filter(t => t.completed).length;
              const moduleTotalTasks = module.tasks.length;
              const isModuleCompleted = moduleCompletedTasks === moduleTotalTasks && moduleTotalTasks > 0;
              const milestone = activePlan.milestones?.find(m => m.targetModuleIndex === mIdx);

              return (
                <div key={module.id} className="space-y-4">
                <div
                  className={`border rounded-2xl transition-all ${
                    isModuleCompleted
                      ? 'border-white/20 bg-white/5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                      : 'border-white/20 hover:border-white/20 bg-white/5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  {/* Module Accordion Trigger */}
                  <div
                    onClick={() => toggleModuleExpand(module.id)}
                    className="flex items-center justify-between p-4 cursor-pointer select-none group"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        {isCollapsed ? (
                          <Folder className="w-4 h-4 text-white shrink-0" />
                        ) : (
                          <FolderOpen className="w-4 h-4 text-white shrink-0" />
                        )}
                        {editingModuleId === module.id ? (
                          <div className="flex-1 max-w-[200px]">
                            <input
                              type="text"
                              value={editModuleTitle}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => setEditModuleTitle(e.target.value)}
                              onBlur={() => handleSaveModuleTitle(module.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveModuleTitle(module.id);
                                if (e.key === 'Escape') setEditingModuleId(null);
                              }}
                              className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-xs text-white outline-none focus:border-white/50"
                            />
                          </div>
                        ) : (
                          <h3 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${isModuleCompleted ? 'text-white/40 line-through' : 'text-white'}`}>
                            {module.title}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingModuleId(module.id);
                                setEditModuleTitle(module.title);
                              }}
                              className="p-1 hover:bg-white/5 text-white/40 hover:text-white rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                              title="Edit Module Title"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </h3>
                        )}
                        {isModuleCompleted && (
                          <span className="bg-white/5 text-white border border-white/20 text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/40 mt-1 font-light truncate max-w-md">
                        {module.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-white/50">
                          {moduleCompletedTasks}/{moduleTotalTasks}
                        </span>
                        <div className="relative w-5 h-5 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              className="stroke-white/10"
                              strokeWidth="3"
                              fill="none"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              className="stroke-white transition-all duration-1000 ease-out"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray={2 * Math.PI * 10}
                              strokeDashoffset={2 * Math.PI * 10 * (1 - (moduleTotalTasks === 0 ? 0 : moduleCompletedTasks / moduleTotalTasks))}
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-white/30" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/30" />
                      )}
                    </div>
                  </div>

                  {/* Tasks List (when expanded/uncollapsed) */}
                  {!isCollapsed && (
                    <div className="border-t border-white/20 p-4 space-y-3 bg-white/5 backdrop-blur-md">
                      {filteredTasks.map((task) => {
                        const isJustCompleted = justCompletedTaskId === task.id;
                        return (
                          <motion.div
                            key={task.id}
                            layout
                            animate={{
                              scale: isJustCompleted ? [1, 1.015, 1] : 1,
                              borderColor: isJustCompleted ? 'rgba(52, 211, 153, 0.6)' : 'rgba(255, 255, 255, 0.2)',
                              backgroundColor: isJustCompleted ? 'rgba(52, 211, 153, 0.08)' : undefined
                            }}
                            transition={{ duration: 0.4 }}
                            className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white/5 backdrop-blur-md border rounded-xl hover:bg-white/20 hover:border-white/30 transition-all ${
                              task.completed ? 'opacity-60' : ''
                            }`}
                          >
                            {isJustCompleted && (
                              <motion.span
                                initial={{ opacity: 0, y: 5, scale: 0.8 }}
                                animate={{ opacity: 1, y: -18, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute right-4 -top-3 pointer-events-none text-[9px] font-mono font-bold uppercase tracking-wider text-white bg-white/20 border border-white/20 px-2.5 py-0.5 rounded-full shadow-lg z-10 flex items-center gap-1"
                              >
                                ✨ Completed!
                              </motion.span>
                            )}
                            {/* Task Checkbox & Label */}
                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                              <button
                                onClick={(e) => handleTaskToggle(e, activePlan.id, module.id, task.id, task.completed)}
                                className="text-white/20 hover:text-white cursor-pointer mt-0.5 shrink-0 transition-colors relative flex items-center justify-center w-5 h-5"
                                title={task.completed ? "Mark as incomplete" : "Mark as complete"}
                              >
                                {task.completed ? (
                                  <motion.div
                                    key="checked"
                                    initial={{ scale: 0.2, rotate: -25, opacity: 0 }}
                                    animate={{ scale: [1.4, 1], rotate: 0, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                  >
                                    <CheckSquare className="w-4 h-4 text-white font-bold" />
                                    {isJustCompleted && (
                                      <motion.span
                                        initial={{ scale: 0.8, opacity: 0.9 }}
                                        animate={{ scale: 2.2, opacity: 0 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className="absolute inset-0 rounded-md border border-white/30 bg-white/10 pointer-events-none"
                                      />
                                    )}
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="unchecked"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                  >
                                    <Square className="w-4 h-4" />
                                  </motion.div>
                                )}
                              </button>
                            <div className="min-w-0">
                              <span className={`text-xs font-light block leading-normal ${task.completed ? 'text-white/30 line-through' : 'text-white/90'}`}>
                                {task.title}
                              </span>
                              
                              {/* Reference Resources */}
                              {task.resources && task.resources.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                                  <span className="font-mono text-[9px] uppercase tracking-wider text-white/30 flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 text-white" /> Research Topics:
                                  </span>
                                  {task.resources.map((resStr, rIdx) => (
                                    <a
                                      key={rIdx}
                                      href={`https://www.google.com/search?q=${encodeURIComponent(resStr)}`}
                                      target="_blank"
                                      referrerPolicy="no-referrer"
                                      rel="noopener noreferrer"
                                      className="text-[9px] text-white/50 bg-white/5 backdrop-blur-md hover:bg-white/5 hover:text-white hover:border-white/30 border border-white/20 px-2 py-0.5 rounded font-mono transition-all"
                                      title="Search this reference topic"
                                    >
                                      {resStr}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Task Actions */}
                          <div className="flex items-center gap-3.5 self-end sm:self-auto">
                            {editingDurationTaskId === task.id ? (
                              <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-white/50">
                                <Clock className="w-3.5 h-3.5 text-white/20" />
                                <input 
                                  type="number"
                                  min="1"
                                  max="999"
                                  value={editDurationValue}
                                  autoFocus
                                  className="w-8 bg-transparent border-b border-white/50 text-white outline-none text-center"
                                  onChange={(e) => setEditDurationValue(e.target.value)}
                                  onBlur={() => {
                                    const val = parseInt(editDurationValue, 10);
                                    if (!isNaN(val) && val > 0 && onUpdateTaskDuration) {
                                      onUpdateTaskDuration(activePlan.id, module.id, task.id, val);
                                    }
                                    setEditingDurationTaskId(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.currentTarget.blur();
                                    } else if (e.key === 'Escape') {
                                      setEditingDurationTaskId(null);
                                    }
                                  }}
                                />
                                <span>min</span>
                              </div>
                            ) : (
                              <div 
                                onClick={() => {
                                  setEditingDurationTaskId(task.id);
                                  setEditDurationValue(task.durationMinutes.toString());
                                }}
                                className="font-mono text-[9px] uppercase tracking-widest text-white/30 flex items-center gap-1 cursor-pointer hover:text-white/70 transition-colors"
                                title="Click to edit time"
                              >
                                <Clock className="w-3.5 h-3.5 text-white/20" />
                                <span>{task.durationMinutes} min</span>
                              </div>
                            )}
                            
                            {!task.completed && (
                              <button
                                onClick={() => onStartFocusSession(task, activePlan.title)}
                                className="flex items-center gap-1 py-1.5 px-3 bg-white hover:bg-white/90 text-black font-bold text-[9px] uppercase tracking-widest rounded-full transition-all cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-black" /> Start
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                    </div>
                  )}
                </div>
                
                {milestone && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border ${
                      isModuleCompleted 
                        ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      isModuleCompleted ? 'bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 opacity-50'
                    }`}>
                      {milestone.rewardBadge}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-bold uppercase tracking-wider ${isModuleCompleted ? 'text-emerald-400' : 'text-white/50'}`}>
                        Milestone
                      </h4>
                      <p className={`text-base ${isModuleCompleted ? 'text-white' : 'text-white/70'}`}>
                        {milestone.title}
                      </p>
                    </div>
                    {isModuleCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                        className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
                      >
                        <CheckSquare className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
