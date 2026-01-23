import React from 'react';
import { Play, Pause, Volume2, VolumeX, CloudRain, Book, Coffee, Camera, CameraOff, Mic, MicOff, Activity, MessageSquare, Moon, Sun, MonitorUp, MonitorOff, Users, PictureInPicture, Timer } from 'lucide-react';
import { AudioState, TimerState, RoomMode } from '../types';

interface ControlsProps {
  timer: TimerState;
  onToggleTimer: () => void;
  audio: AudioState;
  onToggleAudio: () => void;
  onVolumeChange: (val: number) => void;
  onModeChange: (mode: AudioState['mode']) => void;
  activeCount: number;
  isCameraOn: boolean;
  onToggleCamera: () => void;
  isMicOn: boolean;
  onToggleMic: () => void;
  isScreenSharing: boolean;
  onToggleScreenShare: () => void;
  
  currentGoal: string;
  onGoalChange: (goal: string) => void;
  onPulse: () => void;
  
  unreadCount: number;
  onToggleChat: () => void;
  isChatOpen: boolean;

  roomMode: RoomMode;
  onToggleRoomMode: () => void;
  
  isInBreakRoom: boolean;
  onEnterBreakRoom: () => void;
  
  // New
  onTogglePiP: () => void;
  personalPomodoro: { isActive: boolean; timeLeft: number; cycles: number };
  onTogglePersonalPomodoro: () => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface ControlBtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: React.ElementType;
  label: string;
  badge?: number | boolean;
  color?: string;
}

const ControlBtn: React.FC<ControlBtnProps> = ({ onClick, active, disabled, icon: Icon, label, badge, color = "bg-[#f70b28]" }) => (
  <div className="flex flex-col items-center gap-1 group relative">
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${active ? `${color} text-white shadow-[0_0_15px_-3px_rgba(247,11,40,0.4)]` : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
      title={label}
    >
      <Icon size={18} />
      {badge && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f70b28] rounded-full border-2 border-black animate-pulse"></span>}
    </button>
    <span className="text-[9px] uppercase font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors absolute -top-4 opacity-0 group-hover:opacity-100 whitespace-nowrap bg-black/80 px-1.5 rounded">{label}</span>
  </div>
);

export const Controls: React.FC<ControlsProps> = ({
  timer,
  onToggleTimer, // Team Timer
  audio,
  onToggleAudio,
  onVolumeChange,
  onModeChange,
  isCameraOn,
  onToggleCamera,
  isMicOn,
  onToggleMic,
  isScreenSharing,
  onToggleScreenShare,
  currentGoal,
  onGoalChange,
  onPulse,
  unreadCount,
  onToggleChat,
  isChatOpen,
  roomMode,
  onToggleRoomMode,
  isInBreakRoom,
  onEnterBreakRoom,
  onTogglePiP,
  personalPomodoro,
  onTogglePersonalPomodoro
}) => {
  const isVoid = roomMode === 'void';

  return (
    <div className="fixed bottom-0 left-0 w-full p-4 md:p-6 z-50 flex flex-col md:flex-row items-end md:items-center justify-between pointer-events-none gap-4">
      
      {/* Left: Environment & Stats */}
      <div className="pointer-events-auto flex flex-col gap-2 mb-12 md:mb-0">
         
         {/* Room Mode Switcher */}
         <div className="glass-panel p-1 rounded-xl flex gap-1 self-start shadow-xl">
            <button onClick={() => isVoid && onToggleRoomMode()} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${!isVoid ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-300'}`}><Sun size={14} /> Lounge</button>
            <button onClick={() => !isVoid && onToggleRoomMode()} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isVoid ? 'bg-indigo-900/80 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-zinc-500 hover:text-zinc-300'}`}><Moon size={14} /> Focus</button>
         </div>
         
         {/* Audio Controls */}
         {!isVoid && (
             <div className="glass-panel p-2 rounded-xl flex items-center gap-3 shadow-xl">
                 <div className="flex gap-1">
                    {[{ id: 'cafe', icon: Coffee, label: 'Cafe' }, { id: 'rain', icon: CloudRain, label: 'Rain' }, { id: 'library', icon: Book, label: 'Library' }].map((mode) => (
                        <button key={mode.id} title={mode.label} onClick={() => onModeChange(mode.id as any)} className={`p-2 rounded-lg transition-all ${audio.mode === mode.id ? 'bg-[#f70b28] text-white shadow-lg scale-105' : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'}`}><mode.icon size={16} /></button>
                    ))}
                 </div>
                 <div className="h-6 w-[1px] bg-white/10"></div>
                 <input type="range" min="0" max="1" step="0.01" value={audio.volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} className="w-20 mx-1 opacity-60 hover:opacity-100 accent-[#f70b28]" />
                 <button onClick={onToggleAudio} className={`p-1.5 rounded-lg ${audio.isPlaying ? 'text-white' : 'text-zinc-500'}`}>{audio.isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
             </div>
         )}
      </div>

      {/* Center: Goals & Team Timer */}
      <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 bottom-6 glass-panel rounded-full pl-2 pr-8 py-2 flex items-center gap-4 shadow-[0_0_50px_-12px_rgba(247,11,40,0.2)] border border-white/10 backdrop-blur-2xl">
          <button 
              onClick={onToggleTimer}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${timer.isActive ? 'bg-[#f70b28] text-white scale-110 shadow-[0_0_20px_rgba(247,11,40,0.5)]' : 'bg-white/5 text-white hover:bg-white/10'}`}
              title="Team Sprint Timer"
          >
              {timer.isActive ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
          </button>
          
          <div className="flex flex-col items-start justify-center">
              <div className="text-2xl font-['JetBrains_Mono'] font-medium tabular-nums tracking-tight leading-none text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {formatTime(timer.timeLeft)}
              </div>
              <input 
                type="text"
                value={currentGoal}
                onChange={(e) => onGoalChange(e.target.value)}
                placeholder="SET OBJECTIVE..."
                className="bg-transparent text-[11px] text-zinc-400 placeholder-zinc-600 focus:text-[#f70b28] focus:outline-none w-32 md:w-56 uppercase font-bold tracking-widest mt-1"
                maxLength={30}
             />
          </div>
      </div>

      {/* Right: Actions Toolbar */}
      <div className="pointer-events-auto glass-panel rounded-2xl p-3 flex gap-3 shadow-2xl items-center border border-white/5 bg-black/60 backdrop-blur-xl">
          
          {/* Pomodoro Section */}
          <div className="flex flex-col items-center mr-1">
             <ControlBtn 
                onClick={onTogglePersonalPomodoro} 
                active={personalPomodoro.isActive} 
                icon={Timer} 
                label="Sprint" 
                color="bg-emerald-600"
                badge={personalPomodoro.isActive}
             />
             <span className="text-[9px] font-mono text-zinc-500 mt-1">
                 {/* @ts-ignore */}
                 CYCLES: {personalPomodoro.cycles || 0}
             </span>
          </div>

          <div className="w-[1px] h-8 bg-white/10"></div>

          {/* Social */}
          <ControlBtn onClick={onEnterBreakRoom} icon={Users} label="Break Room" />
          <ControlBtn onClick={onPulse} icon={Activity} label="Pulse" />
          
          <div className="w-[1px] h-8 bg-white/10"></div>

          {/* Media */}
          <ControlBtn onClick={onToggleCamera} active={isCameraOn} disabled={isVoid} icon={isCameraOn ? Camera : CameraOff} label="Cam" color="bg-white !text-black" />
          <ControlBtn onClick={onToggleMic} active={isMicOn} disabled={isVoid} icon={isMicOn ? Mic : MicOff} label="Mic" />
          <ControlBtn onClick={onToggleScreenShare} active={isScreenSharing} disabled={isVoid} icon={isScreenSharing ? MonitorUp : MonitorOff} label="Share" />
          
          <div className="w-[1px] h-8 bg-white/10"></div>

          {/* Tools */}
          <ControlBtn onClick={onTogglePiP} icon={PictureInPicture} label="PiP" />
          <ControlBtn onClick={onToggleChat} active={isChatOpen} icon={MessageSquare} label="Chat" badge={unreadCount > 0} color="bg-zinc-800" />
      </div>

    </div>
  );
};