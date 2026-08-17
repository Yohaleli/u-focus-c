import React, { useState } from 'react';
import { Bell, Check, Sparkles, Trophy, Flame, Swords, ShieldCheck, CheckCheck } from 'lucide-react';
import { UFocusNotification } from '../types';

const INITIAL_NOTIFICATIONS: UFocusNotification[] = [
  {
    id: 'n-1',
    title: 'Profile updated',
    description: 'You updated your avatar and study goal settings.',
    timeAgo: '2m ago',
    read: false,
    type: 'system'
  },
  {
    id: 'n-2',
    title: 'Onboarding completed',
    description: 'You completed the onboarding flow! Welcome to the dashboard.',
    timeAgo: '1h ago',
    read: false,
    type: 'achievement'
  },
  {
    id: 'n-3',
    title: 'Streak Milestone!',
    description: 'You completed 3 consecutive days of focus study sessions!',
    timeAgo: '1d ago',
    read: true,
    type: 'streak'
  },
  {
    id: 'n-4',
    title: 'Welcome to UFocus',
    description: 'You created your account. Get started by exploring the study desk and chapters.',
    timeAgo: '2d ago',
    read: true,
    type: 'system'
  }
];

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<UFocusNotification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = filter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  return (
    <div className="space-y-6  max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-black/40 border border-white/20 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-white" />
            <span className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              INBOX & ALERTS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Notifications</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/15 rounded-2xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                filter === 'all' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
                filter === 'unread' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              Unread
            </button>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-white" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-black/20 border border-white/10 rounded-3xl p-12 text-center space-y-3">
            <Bell className="w-8 h-8 text-white/20 mx-auto" />
            <div className="text-sm font-bold text-white/60">You're all caught up!</div>
            <p className="text-xs text-white/40 max-w-xs mx-auto">
              Prospects will show invite requests, mentions, and streak warnings here.
            </p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleToggleRead(n.id)}
              className={`p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 backdrop-blur-xl ${
                !n.read
                  ? 'bg-black/40 border-white/20 text-white shadow-lg'
                  : 'bg-black/20 border-white/5 text-white/60 hover:bg-black/40/50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl mt-0.5 ${!n.read ? 'bg-white text-black' : 'bg-white/10 text-white/50'}`}>
                  {n.type === 'streak' ? <Flame className="w-4 h-4" /> : n.type === 'achievement' ? <Trophy className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{n.title}</span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed font-light">{n.description}</p>
                  <div className="text-[10px] font-mono text-white/40 pt-1">{n.timeAgo}</div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleRead(n.id);
                }}
                className="text-[10px] font-mono text-white/40 hover:text-white px-2 py-1 rounded-md"
              >
                {n.read ? 'Mark Unread' : 'Mark Read'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
