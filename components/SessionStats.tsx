import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { Clock, User as UserIcon, X, TrendingUp } from 'lucide-react';

interface SessionStatsProps {
  users: User[];
  isOpen: boolean;
  onClose: () => void;
}

const formatDuration = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
};

export const SessionStats: React.FC<SessionStatsProps> = ({ users, isOpen, onClose }) => {
    // Force re-render every second to update timers
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [isOpen]);

    if (!isOpen) return null;

    // Filter only REAL humans (no ghosts) and sort by longest session
    const humanUsers = users
        .filter(u => !u.isGhost)
        .sort((a, b) => {
            const startA = a.joinedAt || Date.now();
            const startB = b.joinedAt || Date.now();
            return startA - startB; // Oldest timestamp (longest session) first
        });

    const activeCount = users.filter(u => u.status !== 'idle').length;
    const totalFocus = Math.floor(activeCount / (users.length || 1) * 100);
    const me = users.find(u => u.isMe);
    const sprintCountToday = me?.sprintCountToday ?? 0;
    const pomodoroCountToday = me?.pomodoroState?.completedCycles ?? 0;

    return (
        <div className="fixed top-24 left-4 md:left-8 z-40 w-72 glass-panel rounded-lg border border-[#f70b28]/20 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#f70b28]/5">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f70b28]">
                        Performance
                    </span>
                    <span className="text-sm font-bold text-white tracking-tight">
                        Live Stats
                    </span>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                    <X size={14} />
                </button>
            </div>
            
            {/* KPI Row */}
            <div className="grid grid-cols-2 border-b border-white/5">
                <div className="p-3 border-r border-white/5 flex flex-col">
                    <span className="text-[9px] uppercase text-zinc-500 mb-1">Human Presence</span>
                    <span className="text-xl font-mono font-medium text-white">{humanUsers.length}</span>
                </div>
                 <div className="p-3 flex flex-col">
                    <span className="text-[9px] uppercase text-zinc-500 mb-1">Office Energy</span>
                    <span className="text-xl font-mono font-medium text-[#f70b28]">{totalFocus}%</span>
                </div>
            </div>

            <div className="grid grid-cols-2 border-b border-white/5">
                <div className="p-3 border-r border-white/5 flex flex-col">
                    <span className="text-[9px] uppercase text-zinc-500 mb-1">Sprints Today</span>
                    <span className="text-lg font-mono font-medium text-white">{sprintCountToday}</span>
                </div>
                <div className="p-3 flex flex-col">
                    <span className="text-[9px] uppercase text-zinc-500 mb-1">Pomodoros Today</span>
                    <span className="text-lg font-mono font-medium text-white">{pomodoroCountToday}</span>
                </div>
            </div>

            <div className="p-2 max-h-[350px] overflow-y-auto scrollbar-hide">
                 <div className="text-[10px] uppercase text-zinc-600 mb-2 px-2 font-bold tracking-wider mt-1">Leaderboard</div>
                <div className="space-y-1">
                    {humanUsers.map((user) => {
                        const sessionDuration = user.joinedAt ? Date.now() - user.joinedAt : 0;
                        
                        return (
                            <div key={user.id} className={`flex items-center justify-between p-2 rounded-md transition-colors ${user.isMe ? 'bg-white/5 border border-[#f70b28]/30' : 'hover:bg-white/5 border border-transparent'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img 
                                            src={`https://i.pravatar.cc/150?u=${user.id}`} 
                                            alt="avatar" 
                                            className="w-7 h-7 rounded-full grayscale opacity-80"
                                        />
                                        {/* Activity dot */}
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${user.status === 'idle' ? 'bg-zinc-600' : 'bg-[#f70b28]'}`}></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold ${user.isMe ? 'text-white' : 'text-zinc-400'}`}>
                                            {user.isMe ? 'YOU' : (user.activityLabel || 'Unknown')}
                                        </span>
                                        {user.currentGoal && (
                                            <span className="text-[9px] text-[#f70b28] truncate max-w-[100px] font-medium">
                                                {user.currentGoal}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-mono tabular-nums text-zinc-300">
                                        {formatDuration(sessionDuration)}
                                    </span>
                                    {user.status !== 'idle' && (
                                         <TrendingUp size={10} className="text-[#f70b28] mt-0.5" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};