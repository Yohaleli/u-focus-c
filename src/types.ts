export interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  resources?: string[];
  completedAt?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
}

export interface Milestone {
  id: string;
  title: string;
  rewardBadge: string;
  targetModuleIndex?: number;
  completed: boolean;
}

export interface LearningPlan {
  id: string;
  title: string;
  description: string;
  duration: string;
  category?: { name: string; color: string };
  modules: Module[];
  milestones?: Milestone[];
  createdAt: string;
  isActive: boolean;
}

export interface SessionLog {
  id: string;
  taskTitle: string;
  planTitle: string;
  durationSeconds: number;
  durationMinutes?: number;
  completedAt: string;
  notes?: string;
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerConfig {
  focus: number;       // in minutes
  shortBreak: number;  // in minutes
  longBreak: number;   // in minutes
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  title: string;
  description: string;
  levelRequired: number;
  image: string;
  unlocked: boolean;
  progressPercent: number;
}

export type AppTab = 'focus' | 'habits' | 'notes';



export interface UFocusNotification {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  type?: 'system' | 'streak' | 'battle' | 'achievement';
}

export interface UserProgress {
  allTimeStreakBest: number;
}

