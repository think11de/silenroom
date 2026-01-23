import React, { useRef, useEffect, useMemo } from 'react';
import { User, RoomMode } from '../types';
import { Coffee, Monitor, MessageCircle, Flame, Brain, Mic, MicOff, Lock, Zap, Layers, BarChart3, Code2, PenTool, Hash, MonitorUp } from 'lucide-react';

interface VisualizerProps {
  users: User[];
  localStream: MediaStream | null; 
  roomMode: RoomMode; 
  onUserClick: (user: User) => void;
  focusedPeerId: string | null; 
  isWorkMuted: boolean;
}

const TOOLS = {
    marketing: ["Ads Editor", "Analytics", "Data Studio", "Excel", "Semrush"],
    coding: ["VS Code", "Terminal", "Docker", "GitHub", "StackOverflow"],
    design: ["Figma", "After Effects", "Photoshop", "Blender", "Illustrator"],
    management: ["Slack", "Jira", "Notion", "Calendar", "Zoom"]
};

// Deterministic random details
const getAgentDetails = (user: User) => {
    const seed = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rand = (offset: number) => Math.sin(seed + offset) * 10000 - Math.floor(Math.sin(seed + offset) * 10000);
    
    let category: 'marketing' | 'coding' | 'design' | 'management' = 'management';
    const label = (user.activityLabel || "").toLowerCase();
    
    if (label.includes('code') || label.includes('build')) category = 'coding';
    else if (label.includes('design') || label.includes('art')) category = 'design';
    else if (label.includes('camp') || label.includes('analy')) category = 'marketing';

    return {
        tool: TOOLS[category][Math.floor(rand(1) * TOOLS[category].length)],
        efficiency: 85 + Math.floor(rand(3) * 14),
        category
    };
};

const ProgressRing = React.memo(({ progress, size, stroke, color }: { progress: number, size: number, stroke: number, color: string }) => {
    const center = size / 2;
    const radius = size / 2 - stroke * 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - progress * circumference;
    
    return (
        <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-90 pointer-events-none transition-all duration-1000" width={size} height={size}>
            <circle stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} fill="transparent" r={radius} cx={center} cy={center} />
            <circle stroke={color} strokeWidth={stroke} strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} strokeLinecap="round" fill="transparent" r={radius} cx={center} cy={center} className="transition-all duration-1000 ease-linear" />
        </svg>
    );
});

// Heavily optimized Avatar Component
const UserAvatar = React.memo(({ user, onClick, shouldMute, isWorkMuted }: { user: User; onClick: (u: User) => void; shouldMute: boolean; isWorkMuted: boolean }) => {
  const isIdle = user.status === 'idle';
  const isVoid = user.roomMode === 'void';
  const isRealUser = !user.isGhost;
  const hasVideo = !!(user.isCameraOn && user.stream && !isVoid);
  
  // Memoize details to prevent recalculation
  const details = useMemo(() => getAgentDetails(user), [user.id, user.activityLabel]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && user.stream && !isVoid) {
        if (videoRef.current.srcObject !== user.stream) videoRef.current.srcObject = user.stream;
        if (videoRef.current.paused) videoRef.current.play().catch(console.error);
        videoRef.current.muted = user.isMe || shouldMute || isWorkMuted; 
    }
  }, [user.stream, isVoid, user.isMe, shouldMute, isWorkMuted]);

  // Determine Icon
  const CategoryIcon = details.category === 'coding' ? Code2 
                     : details.category === 'design' ? PenTool 
                     : details.category === 'marketing' ? BarChart3 
                     : Hash;

  // Sizes - Memoized inline to avoid var creation overhead
  const AvatarSize = isRealUser 
        ? (hasVideo ? "w-48 h-48 md:w-64 md:h-64" : "w-24 h-24 md:w-32 md:h-32")
        : "w-12 h-12 md:w-14 md:h-14";

  // Calculate Ring Progress (Combined Sprint + Individual Pomodoro)
  let progress = 0;
  let ringColor = '#52525b';
  
  // Individual Pomodoro takes precedence for visual ring if active
  if (user.pomodoroState?.isActive) {
      const elapsed = (Date.now() - user.pomodoroState.startTime) / 1000;
      progress = Math.min(1, Math.max(0, elapsed / user.pomodoroState.duration));
      ringColor = user.pomodoroState.mode === 'focus' ? '#f70b28' : '#10b981'; // Red for focus, Green for break
  } else if (user.isInSprint && user.sprintStartTime && user.sprintDuration) {
      const elapsed = (Date.now() - user.sprintStartTime) / 1000;
      progress = Math.min(1, Math.max(0, elapsed / user.sprintDuration));
      ringColor = '#f70b28';
  }

  // Styles
  const containerClass = isVoid 
    ? 'shadow-[0_0_0_1px_rgba(99,102,241,0.2),0_0_20px_rgba(0,0,0,0.9)]' 
    : hasVideo 
        ? 'shadow-[0_0_0_2px_rgba(247,11,40,0.8),0_10px_40px_-10px_rgba(0,0,0,0.8)]'
        : 'shadow-[0_0_0_1px_rgba(255,255,255,0.1)]';

  const isClickable = !user.isGhost && !user.isMe && !isVoid;

  return (
    <div 
      className={`absolute group flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 cubic-bezier(0.25, 1, 0.5, 1) ${isClickable ? 'cursor-pointer z-20 hover:z-50' : 'cursor-default z-0'}`}
      style={{ left: `${user.x}%`, top: `${user.y}%` }}
      onClick={() => isClickable && onClick(user)}
    >
      <div className={`relative flex flex-col items-center justify-center transition-all duration-[2000ms] avatar-drift ${isIdle ? 'scale-90 opacity-40' : 'scale-100 opacity-100'}`}>
          
          {progress > 0 && (
              <ProgressRing progress={progress} size={isRealUser ? (hasVideo ? 280 : 150) : 70} stroke={3} color={ringColor} />
          )}

          <div className={`relative rounded-full bg-black transition-all duration-[2000ms] ${containerClass}`}>
            {hasVideo ? (
                <div className={`${AvatarSize} rounded-full overflow-hidden bg-zinc-900 relative`}>
                    <video ref={videoRef} data-peer-id={user.id} autoPlay playsInline className={`w-full h-full object-cover ${user.isScreenSharing ? '' : 'transform scale-x-[-1]'}`} />
                    {!user.isMicOn && !isVoid && (
                        <div className="absolute bottom-3 right-3 bg-black/80 p-1.5 rounded-full border border-white/10"><MicOff size={10} className="text-zinc-500" /></div>
                    )}
                    {user.isScreenSharing && (
                         <div className="absolute top-3 left-3 bg-[#f70b28] p-1.5 rounded-full"><MonitorUp size={10} className="text-white" /></div>
                    )}
                </div>
            ) : (
                <img 
                    src={user.photoUrl || `https://i.pravatar.cc/300?u=${user.id}`} 
                    alt="User" 
                    className={`${AvatarSize} rounded-full object-cover bg-zinc-800 transition-[filter] duration-[2000ms]`}
                    style={{ filter: isVoid ? 'grayscale(100%) brightness(30%) contrast(150%) hue-rotate(180deg)' : (isIdle ? 'grayscale(100%) brightness(50%)' : 'grayscale(10%) contrast(110%)') }}
                />
            )}
            
            {/* Status Icon badge */}
            <div className={`absolute -bottom-1 -right-1 rounded-full p-1.5 border-2 border-[#050505] shadow-sm transition-all duration-[2000ms] ${user.status === 'idle' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'} bg-[#f70b28] text-white`}>
                {isVoid ? <Lock size={10} /> : (user.isMicOn ? <Mic size={10} /> : <Coffee size={10} />)}
            </div>
          </div>
          
          {/* Label */}
          <div className={`absolute top-full mt-4 flex flex-col items-center transition-all duration-300 group-hover:opacity-0 ${isIdle ? 'opacity-0' : 'opacity-100'}`}>
             <span className={`text-[9px] uppercase font-bold tracking-[0.2em] px-2 py-1 rounded text-zinc-500`}>
                {user.isMe ? 'You' : (user.name || user.activityLabel || 'Unknown')}
             </span>
             {user.pomodoroState?.isActive && (
                 <span className="text-[9px] font-mono text-[#f70b28] bg-black/50 px-2 rounded-full border border-[#f70b28]/30">
                     {Math.ceil(user.pomodoroState.duration - (Date.now() - user.pomodoroState.startTime)/1000)}s
                 </span>
             )}
          </div>
          
          {/* Hover Card */}
          <div className="absolute top-full mt-4 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto">
               <div className="w-48 backdrop-blur-xl bg-black/80 rounded-lg border border-[#f70b28]/30 shadow-2xl p-3 flex flex-col gap-2">
                   <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                       <div className="p-1.5 rounded bg-[#f70b28]"><CategoryIcon size={12} className="text-white" /></div>
                       <div className="flex flex-col">
                           <span className="text-[10px] text-zinc-400 uppercase font-bold">Agent</span>
                           <span className="text-xs text-white font-mono">{user.name || "GUEST"}</span>
                       </div>
                   </div>
                   <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 uppercase">
                          <Layers size={10} /> Active Stack
                      </div>
                      <div className="px-2 py-1 rounded text-[10px] font-mono border bg-zinc-900 border-white/10 text-zinc-300">
                          {details.tool}
                      </div>
                  </div>
                   {!isIdle && (
                      <div className="mt-1">
                          <div className="flex justify-between items-end mb-1">
                              <span className="text-[9px] text-[#f70b28] font-bold uppercase"><Zap size={10} className="inline mr-1" />Score</span>
                              <span className="text-[10px] font-mono text-white">{details.efficiency}%</span>
                          </div>
                          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-[#f70b28]" style={{ width: `${details.efficiency}%` }}></div>
                          </div>
                      </div>
                  )}
               </div>
          </div>

      </div>
    </div>
  );
}, (prev, next) => {
    // Custom comparison for Performance: Only re-render if vital props change
    // We ignore strict x/y equality checks handled by parent CSS transitions if possible, 
    // but React needs to know x/y changed to update the style prop.
    // However, checking all props is expensive. 
    // We simplify: if ID, status, mic, cam, sprint, pomodoro state change, update.
    // Coordinates (x/y) DO need to trigger re-render for style update.
    return (
        prev.user.x === next.user.x &&
        prev.user.y === next.user.y &&
        prev.user.status === next.user.status &&
        prev.user.isMicOn === next.user.isMicOn &&
        prev.user.isCameraOn === next.user.isCameraOn &&
        prev.user.stream === next.user.stream &&
        prev.user.pomodoroState === next.user.pomodoroState &&
        prev.shouldMute === next.shouldMute
    );
});

// Canvas Background (No logic changes, just ensuring it doesn't leak)
const NeuralBackground = React.memo(({ users, roomMode }: { users: User[], roomMode: RoomMode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isVoid = roomMode === 'void';
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true }); // optimize
        if (!ctx) return;

        let animationFrameId: number;
        let particles: any[] = [];
        
        const initParticles = () => {
             particles = [];
             const count = isVoid ? 20 : 60; 
             for(let i=0; i<count; i++) {
                 particles.push({
                     x: Math.random() * canvas.width,
                     y: Math.random() * canvas.height,
                     vx: (Math.random() - 0.5) * 0.3, 
                     vy: (Math.random() - 0.5) * 0.3,
                     s: Math.random() * 2.0
                 });
             }
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };
        window.addEventListener('resize', resize);
        resize();

        const render = () => {
            if(!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = isVoid ? "rgba(99, 102, 241, 0.05)" : "rgba(255, 255, 255, 0.05)";
            
            // Optimize: Batch particle drawing
            ctx.beginPath();
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if(p.x < 0) p.x = canvas.width; else if(p.x > canvas.width) p.x = 0;
                if(p.y < 0) p.y = canvas.height; else if(p.y > canvas.height) p.y = 0;
                ctx.moveTo(p.x, p.y);
                ctx.arc(p.x, p.y, p.s, 0, Math.PI*2);
            });
            ctx.fill();

            // Optimize: Connection drawing
            ctx.beginPath();
            // Only draw connections for real users or close ghosts to save cycles
            // actually drawing all is fine for < 50 nodes
            for(let i=0; i<users.length; i++) {
                for(let j=i+1; j<users.length; j++) {
                    const dx = users[i].x/100 * canvas.width - users[j].x/100 * canvas.width;
                    const dy = users[i].y/100 * canvas.height - users[j].y/100 * canvas.height;
                    const distSq = dx*dx + dy*dy;
                    if (distSq < 40000) { // approx 200px distance squared
                         ctx.moveTo(users[i].x/100 * canvas.width, users[i].y/100 * canvas.height);
                         ctx.lineTo(users[j].x/100 * canvas.width, users[j].y/100 * canvas.height);
                    }
                }
            }
            ctx.strokeStyle = isVoid ? "rgba(99, 102, 241, 0.05)" : "rgba(255, 255, 255, 0.05)";
            ctx.stroke();

            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [users.length, isVoid]); // Re-init only if user count changes drastically or mode changes

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
});


export const Visualizer: React.FC<VisualizerProps> = ({ users, roomMode, onUserClick, focusedPeerId, isWorkMuted }) => {
  const isVoid = roomMode === 'void';

  return (
    <div className={`relative w-full h-full overflow-hidden transition-colors duration-1000 ${isVoid ? 'bg-[#000000]' : 'bg-[#050505]'}`}> 
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000" style={{ background: isVoid ? `radial-gradient(circle at 50% 120%, #1e1b4b 0%, #000000 60%)` : `radial-gradient(circle at 50% 120%, #1a0a05 0%, #050505 60%)` }} />
        
<<<<<<< HEAD
        {/* Animated background branding */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none flex items-center justify-center">
            <div className={`text-[30vw] leading-none font-black ${isVoid ? 'text-indigo-500' : 'text-[#f70b28]'} opacity-[0.03] blur-[60px] animate-pulse transition-all duration-[5000ms]`}
                 style={{ animationDuration: '8s' }}>
                11
            </div>
=======
        {/* Static background text */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
            <div className={`absolute -bottom-20 -right-10 text-[35vw] leading-none font-black ${isVoid ? 'text-indigo-500' : 'text-[#f70b28]'} think11-pulse blur-[80px]`}>11</div>
>>>>>>> 7510e8d (Update: Add Think11 ambience and UI polish)
        </div>

        <NeuralBackground users={users} roomMode={roomMode} />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

        {users.map((user) => (
          <UserAvatar 
            key={user.id} 
            user={user} 
            onClick={onUserClick}
            shouldMute={focusedPeerId !== null && focusedPeerId !== user.id}
            isWorkMuted={isWorkMuted}
          />
        ))}
    </div>
  );
};