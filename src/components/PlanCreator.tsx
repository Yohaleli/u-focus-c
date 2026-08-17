import React, { useState } from 'react';
import { Plus, Trash2, AlignLeft, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { LearningPlan, Module, Task } from '../types';

interface PlanCreatorProps {
  onPlanCreated: (plan: LearningPlan) => void;
  onCancel?: () => void;
  hasExistingPlans: boolean;
}

const PLAN_CATEGORIES = [
  { name: 'Programming', color: '#3b82f6' },
  { name: 'Language', color: '#10b981' },
  { name: 'Academic', color: '#8b5cf6' },
  { name: 'Design', color: '#ec4899' },
  { name: 'Business', color: '#f59e0b' },
  { name: 'Health', color: '#14b8a6' },
  { name: 'Other', color: '#94a3b8' },
];

export default function PlanCreator({ onPlanCreated, onCancel, hasExistingPlans }: PlanCreatorProps) {

  const [aiTopic, setAiTopic] = useState('');
  const [aiDetails, setAiDetails] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleGenerateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    
    setIsGeneratingAI(true);
    setAiError('');
    
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, details: aiDetails })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }
      
      const formattedPlan: LearningPlan = {
        id: `plan-${Date.now()}`,
        title: data.title,
        description: data.description || '',
        duration: data.duration || 'Flexible',
        createdAt: new Date().toISOString(),
        isActive: true,
        modules: data.modules.map((m: any, mIdx: number) => ({
          id: m.id || `mod-${mIdx}-${Date.now()}`,
          title: m.title,
          description: m.description,
          tasks: m.tasks.map((t: any, tIdx: number) => ({
            id: t.id || `task-${mIdx}-${tIdx}-${Date.now()}`,
            title: t.title,
            durationMinutes: t.durationMinutes || 25,
            completed: false,
            resources: t.resources || []
          }))
        }))
      };
      
      onPlanCreated(formattedPlan);
    } catch (error: any) {
      setAiError(error.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Manual builder state
  const [manualTitle, setManualTitle] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualDuration, setManualDuration] = useState('2 Weeks');
  const [manualCategory, setManualCategory] = useState(PLAN_CATEGORIES[0]);
  const [manualMilestones, setManualMilestones] = useState<{
    title: string;
    rewardBadge: string;
    targetModuleIndex: number;
  }[]>([]);
  const [manualModules, setManualModules] = useState<{
    title: string;
    description: string;
    tasks: { title: string; duration: number | '' }[];
  }[]>(
  [
    {
      title: 'Module 1: Foundations',
      description: 'Understanding the basic building blocks and setup.',
      tasks: [{ title: 'Overview & Key Concepts', duration: 25 }]
    }
  ]);

  const addManualMilestone = () => {
    setManualMilestones([
      ...manualMilestones,
      { title: '', rewardBadge: '🏆', targetModuleIndex: 0 }
    ]);
  };

  const updateManualMilestone = (idx: number, field: 'title' | 'rewardBadge' | 'targetModuleIndex', val: string | number) => {
    const next = [...manualMilestones];
    next[idx] = { ...next[idx], [field]: val };
    setManualMilestones(next);
  };

  const removeManualMilestone = (idx: number) => {
    const next = [...manualMilestones];
    next.splice(idx, 1);
    setManualMilestones(next);
  };

  // Manual configuration helpers
  const addManualModule = () => {
    setManualModules([
      ...manualModules,
      {
        title: `Module ${manualModules.length + 1}`,
        description: '',
        tasks: [{ title: 'New Task', duration: 25 }]
      }
    ]);
  };

  const removeManualModule = (idx: number) => {
    if (manualModules.length <= 1) return;
    const next = [...manualModules];
    next.splice(idx, 1);
    setManualModules(next);
  };

  const updateManualModule = (idx: number, field: 'title' | 'description', val: string) => {
    const next = [...manualModules];
    next[idx] = { ...next[idx], [field]: val };
    setManualModules(next);
  };

  const addManualTask = (modIdx: number) => {
    const next = [...manualModules];
    next[modIdx].tasks.push({ title: 'New Task', duration: 25 });
    setManualModules(next);
  };

  const removeManualTask = (modIdx: number, taskIdx: number) => {
    const next = [...manualModules];
    if (next[modIdx].tasks.length <= 1) return;
    next[modIdx].tasks.splice(taskIdx, 1);
    setManualModules(next);
  };

  const updateManualTask = (modIdx: number, taskIdx: number, field: 'title' | 'duration', val: string) => {
    const next = [...manualModules];
    if (field === 'title') {
      next[modIdx].tasks[taskIdx].title = val;
    } else {
      next[modIdx].tasks[taskIdx].duration = val === '' ? '' : (parseInt(val) || 0);
    }
    setManualModules(next);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const formattedPlan: LearningPlan = {
      id: `plan-${Date.now()}`,
      title: manualTitle.trim(),
      description: manualDesc.trim() || 'A custom learning blueprint.',
      duration: manualDuration || 'Flexible',
      category: manualCategory,
      createdAt: new Date().toISOString(),
      isActive: true,
      modules: manualModules.map((m, mIdx) => ({
        id: `mod-${mIdx}-${Date.now()}`,
        title: m.title || `Module ${mIdx + 1}`,
        description: m.description,
        tasks: m.tasks.map((t, tIdx) => ({
          id: `task-${mIdx}-${tIdx}-${Date.now()}`,
          title: t.title || 'Untitled Task',
          durationMinutes: t.duration || 25,
          completed: false,
          resources: []
        }))
      })),
      milestones: manualMilestones.map((m, idx) => ({
        id: `milestone-${idx}-${Date.now()}`,
        title: m.title || `Milestone ${idx + 1}`,
        rewardBadge: m.rewardBadge || '🏆',
        targetModuleIndex: m.targetModuleIndex,
        completed: false
      }))
    };

    onPlanCreated(formattedPlan);
  };

  return (
    <div id="plan-creator-root" className="w-full max-w-3xl mx-auto bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl shadow-sm overflow-hidden">
      {/* Header Tabs (Removed) - Just title */}
      <div className="flex border-b border-white/20 bg-transparent p-1">
        <div className="flex-1 flex items-center justify-center gap-2 py-3 font-mono text-[10px] uppercase tracking-wider rounded-full text-white shadow-sm border border-white/20 bg-white/5">
          <Plus className="w-3.5 h-3.5 text-white" />
          Custom Manual Planner
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8">
        <form id="manual-planner-form" onSubmit={handleManualSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6">
              <label htmlFor="manual-title" className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-2.5">
                Plan Title
              </label>
              <input
                type="text"
                id="manual-title"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g., Master TypeScript Generics"
                required
                className="w-full rounded-full px-4 py-3 text-xs bg-white/5 border border-white/20 text-white placeholder-white/20 focus:bg-transparent focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-all font-light"
              />
            </div>
            <div className="md:col-span-3">
              <label htmlFor="manual-duration" className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-2.5">
                Duration (Approx)
              </label>
              <input
                type="text"
                id="manual-duration"
                value={manualDuration}
                onChange={(e) => setManualDuration(e.target.value)}
                placeholder="e.g., 2 Weeks"
                className="w-full rounded-full px-4 py-3 text-xs bg-white/5 border border-white/20 text-white placeholder-white/20 focus:bg-transparent focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-all font-light"
              />
            </div>
            <div className="md:col-span-3 relative">
              <label htmlFor="manual-category" className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-2.5">
                Category
              </label>
              <select
                id="manual-category"
                value={manualCategory.name}
                onChange={(e) => {
                  const cat = PLAN_CATEGORIES.find(c => c.name === e.target.value);
                  if (cat) setManualCategory(cat);
                }}
                className="w-full rounded-full px-4 py-3 text-xs bg-white/5 border border-white/20 text-white focus:bg-transparent focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-all font-light appearance-none pr-10"
              >
                {PLAN_CATEGORIES.map(c => (
                  <option key={c.name} value={c.name} className="bg-[#161514] text-white">{c.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none top-[26px]">
                <ChevronDown className="w-4 h-4 text-white/40" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="manual-desc" className="block font-mono text-[9px] uppercase tracking-widest text-white/40 mb-2.5">
              Summary / Objective
            </label>
            <input
              type="text"
              id="manual-desc"
              value={manualDesc}
              onChange={(e) => setManualDesc(e.target.value)}
              placeholder="Briefly describe what you'll achieve in this track"
              className="w-full rounded-full px-4 py-3 text-xs bg-white/5 border border-white/20 text-white placeholder-white/20 focus:bg-transparent focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-all font-light"
            />
          </div>

          {/* Modules and tasks list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 font-semibold">
                Modules & Chapters Blueprint
              </span>
              <button
                type="button"
                onClick={addManualModule}
                className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-white hover:brightness-110 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Module
              </button>
            </div>
            {manualModules.map((module, mIdx) => (
              <div key={mIdx} className="p-4 border border-white/20 bg-white/5 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-4">
                {/* Module Details */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      placeholder="Module Title (e.g., Basics & Tooling)"
                      value={module.title}
                      onChange={(e) => updateManualModule(mIdx, 'title', e.target.value)}
                      className="w-full rounded-full px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/20 text-white placeholder-white/20 focus:bg-transparent focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-all font-light"
                    />
                    <input
                      type="text"
                      placeholder="Short Module Description"
                      value={module.description}
                      onChange={(e) => updateManualModule(mIdx, 'description', e.target.value)}
                      className="w-full rounded-full px-3 py-1.5 text-xs bg-white/5 border border-white/20 text-white placeholder-white/20 focus:bg-transparent focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-all font-light"
                    />
                  </div>
                  {manualModules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeManualModule(mIdx)}
                      className="p-1.5 hover:bg-white/5 text-white/30 hover:text-white rounded-full cursor-pointer transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Tasks List */}
                <div className="pl-4 border-l-2 border-white/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 font-bold">
                      Study Chapters / Focus Blocks
                    </span>
                    <button
                      type="button"
                      onClick={() => addManualTask(mIdx)}
                      className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-white hover:brightness-110 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Study Block
                    </button>
                  </div>
                  {module.tasks.map((task, tIdx) => (
                    <div key={tIdx} className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="What will you study/practice? (e.g., Set up sandbox)"
                        value={task.title}
                        onChange={(e) => updateManualTask(mIdx, tIdx, 'title', e.target.value)}
                        required
                        className="flex-1 rounded-full px-3 py-1.5 text-xs bg-white/5 border border-white/20 text-white placeholder-white/20 focus:bg-transparent focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-all font-light"
                      />
                      <div className="flex items-center gap-1.5 w-24">
                        <input
                          type="number"
                          value={task.duration}
                          onChange={(e) => updateManualTask(mIdx, tIdx, 'duration', e.target.value)}
                          required
                          className="w-14 rounded-full px-2 py-1.5 text-xs text-center font-mono bg-white/5 border border-white/20 text-white placeholder-white/20 focus:bg-transparent focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white transition-all font-light"
                        />
                        <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">min</span>
                      </div>
                      {module.tasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeManualTask(mIdx, tIdx)}
                          className="p-1 text-white/30 hover:text-white cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Milestones</h3>
              <button
                type="button"
                onClick={addManualMilestone}
                className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-white hover:brightness-110 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Milestone
              </button>
            </div>
            {manualMilestones.map((milestone, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                <input
                  type="text"
                  placeholder="Milestone Title (e.g., Fundamentals Mastered)"
                  value={milestone.title}
                  onChange={(e) => updateManualMilestone(idx, 'title', e.target.value)}
                  className="flex-1 rounded-full px-3 py-1.5 text-xs bg-white/5 border border-white/20 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:border-white"
                />
                <input
                  type="text"
                  placeholder="Badge (e.g., 🏆)"
                  value={milestone.rewardBadge}
                  onChange={(e) => updateManualMilestone(idx, 'rewardBadge', e.target.value)}
                  className="w-20 rounded-full px-3 py-1.5 text-xs text-center bg-white/5 border border-white/20 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:border-white"
                />
                <select
                  value={milestone.targetModuleIndex}
                  onChange={(e) => updateManualMilestone(idx, 'targetModuleIndex', parseInt(e.target.value))}
                  className="rounded-full px-3 py-1.5 text-xs bg-black border border-white/20 text-white focus:outline-none focus:ring-1 focus:border-white"
                >
                  {manualModules.map((m, mIdx) => (
                    <option key={mIdx} value={mIdx}>After Module {mIdx + 1}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeManualMilestone(idx)}
                  className="p-1.5 text-white/30 hover:text-white"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!manualTitle.trim()}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 font-bold uppercase text-[10px] tracking-widest rounded-full cursor-pointer transition-all shadow-sm ${
                manualTitle.trim()
                  ? 'bg-white/5 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/20 hover:border-white/40 text-white hover:brightness-110 shadow-white/5'
                  : 'bg-white/5 backdrop-blur-md text-white/20 border border-white/20 cursor-not-allowed'
              }`}
            >
              Compile Learning Blueprint
            </button>
            {hasExistingPlans && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3.5 bg-white/[0.05] backdrop-blur-md border border-white/10 hover:bg-white/5 hover:border-white/20 font-bold uppercase text-[10px] tracking-widest text-white/60 rounded-full cursor-pointer transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
