import React, { useEffect, useRef, useState } from 'react';
import { User } from '../types';
import { Coffee, LogOut, Mic, MicOff } from 'lucide-react';

interface BreakRoomProps {
    users: User[]; // All users (will filter for break room internally)
    onLeave: () => void;
}

export const BreakRoom: React.FC<BreakRoomProps> = ({ users, onLeave }) => {
    // Filter only REAL users who are IN THE BREAK ROOM
    const participants = users.filter(u => !u.isGhost && u.isInBreakRoom);
    
    // Timer
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatDuration = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Calculate grid columns based on participant count
    const getGridClass = (count: number) => {
        if (count <= 1) return 'grid-cols-1';
        if (count <= 2) return 'grid-cols-2';
        if (count <= 4) return 'grid-cols-2 md:grid-cols-2';
        if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
        return 'grid-cols-3 md:grid-cols-4';
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#050505] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/5 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#f70b28] rounded-lg">
                        <Coffee size={24} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-white tracking-tight uppercase">Break Room</h1>
                        <span className="text-xs text-zinc-400 font-mono tracking-wider">Social Mode Active</span>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-[10px] text-[#f70b28] uppercase tracking-[0.3em] font-bold">Session Time</span>
                    <span className="text-4xl font-mono font-light text-white">{formatDuration(seconds)}</span>
                </div>

                <button 
                    onClick={onLeave}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-[#f70b28] text-white rounded-full transition-all border border-white/10 group"
                >
                    <span className="text-sm font-bold uppercase tracking-wider">Back to Work</span>
                    <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Video Grid */}
            <div className={`flex-1 p-4 md:p-8 grid gap-4 ${getGridClass(participants.length)} auto-rows-fr overflow-y-auto`}>
                {participants.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center text-zinc-500">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                             <Coffee size={32} />
                        </div>
                        <p className="uppercase tracking-widest text-sm">Waiting for others to join...</p>
                    </div>
                )}
                
                {participants.map((user) => (
                    <ParticipantCard key={user.id} user={user} />
                ))}
            </div>
            
            <div className="pointer-events-none absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-0"></div>
        </div>
    );
};

const ParticipantCard: React.FC<{ user: User }> = ({ user }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && user.stream) {
            videoRef.current.srcObject = user.stream;
            // Ensure video plays (may be blocked by browser autoplay policy)
            videoRef.current.play().catch(console.error);
        }
    }, [user.stream]);

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl group">
             {user.stream ? (
                 <video 
                    ref={videoRef} 
                    data-peer-id={user.id}
                    autoPlay 
                    playsInline
                    muted={user.isMe}
                    className="w-full h-full object-cover transform scale-x-[-1]"
                 />
             ) : (
                 <div className="w-full h-full flex items-center justify-center">
                     <img src={`https://i.pravatar.cc/400?u=${user.id}`} className="w-32 h-32 rounded-full grayscale opacity-50" />
                 </div>
             )}

             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
             
             <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                 <div className="flex flex-col">
                     <span className="text-xl font-bold text-white">{user.isMe ? 'You' : (user.activityLabel || 'Participant')}</span>
                     {user.currentGoal && <span className="text-xs text-[#f70b28] uppercase font-bold tracking-wide">{user.currentGoal}</span>}
                 </div>
                 <div className={`p-2 rounded-full ${user.isMicOn ? 'bg-[#f70b28] text-white' : 'bg-black/50 text-zinc-500'}`}>
                     {user.isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                 </div>
             </div>
        </div>
    );
};