import React from 'react';
import { Play, Pause, Volume2, VolumeX, CloudRain, Book, Coffee, Camera, CameraOff, Mic, MicOff, Activity, MessageSquare, Moon, Sun, Lock, MonitorUp, MonitorOff, Users, PictureInPicture, Timer, Sparkles } from 'lucide-react';
import { AudioState, TimerState, RoomMode } from '../types';

interface ControlsProps {
  timer: TimerState;
  onToggleTimer: () => void;
  teamSprintCount: number;
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
  personalPomodoro: { isActive: boolean; timeLeft: number };
  personalPomodoroCycles: number;
  onTogglePersonalPomodoro: () => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const Controls: React.FC<ControlsProps> = ({
  timer,
  onToggleTimer,
  teamSprintCount,
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
  personalPomodoroCycles,
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
                    {[{ id: 'think11', icon: Sparkles }, { id: 'cafe', icon: Coffee }, { id: 'rain', icon: CloudRain }, { id: 'library', icon: Book }].map((mode) => (
                        <button key={mode.id} onClick={() => onModeChange(mode.id as any)} className={`p-1.5 rounded-md transition-all ${audio.mode === mode.id ? 'bg-[#f70b28] text-white' : 'text-zinc-600'}`}><mode.icon size={14} /></button>
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
              <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                  Sprints heute: {teamSprintCount}
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

      {/* Right: Actions */}
      <div className="pointer-events-auto glass-panel rounded-2xl p-2 flex flex-wrap gap-3 shadow-2xl">
          {/* Personal Pomodoro */}
          <div className="flex flex-col items-center gap-1">
              <button
                onClick={onTogglePersonalPomodoro}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${personalPomodoro.isActive ? 'bg-emerald-600 text-white' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
                title="Personal Pomodoro"
              >
                  <Timer size={18} />
                  {personalPomodoro.isActive && <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>}
              </button>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500">Pomo {personalPomodoroCycles}</span>
          </div>

          <div className="w-[1px] bg-white/10 my-1 mx-1"></div>

          <div className="flex flex-col items-center gap-1">
              <button onClick={onEnterBreakRoom} className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-zinc-400 hover:text-white hover:bg-[#f70b28]"><Users size={18} /></button>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500">Break</span>
          </div>
          <div className="flex flex-col items-center gap-1">
              <button onClick={onPulse} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 text-zinc-400 hover:text-[#f70b28]"><Activity size={18} /></button>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500">Ping</span>
          </div>
          
          <div className="w-[1px] bg-white/10 my-1 mx-1"></div>

          <div className="flex flex-col items-center gap-1">
              <button onClick={onToggleCamera} disabled={isVoid} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCameraOn ? 'bg-white text-black' : 'text-zinc-400 hover:bg-white/5'}`}>{isCameraOn ? <Camera size={18} /> : <CameraOff size={18} />}</button>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500">Cam</span>
          </div>
          <div className="flex flex-col items-center gap-1">
              <button onClick={onToggleMic} disabled={isVoid} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMicOn ? 'bg-[#f70b28] text-white' : 'text-zinc-400 hover:bg-white/5'}`}>{isMicOn ? <Mic size={18} /> : <MicOff size={18} />}</button>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500">Mic</span>
          </div>
          <div className="flex flex-col items-center gap-1">
              <button onClick={onToggleScreenShare} disabled={isVoid} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isScreenSharing ? 'bg-[#f70b28] text-white' : 'text-zinc-400 hover:bg-white/5'}`}>{isScreenSharing ? <MonitorOff size={18} /> : <MonitorUp size={18} />}</button>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500">Share</span>
          </div>
          
          <div className="w-[1px] bg-white/10 my-1 mx-1"></div>

          <div className="flex flex-col items-center gap-1">
              <button onClick={onTogglePiP} className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-white/5 hover:text-white" title="Picture in Picture"><PictureInPicture size={18} /></button>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500">PiP</span>
          </div>
          <div className="relative flex flex-col items-center gap-1">
            <button onClick={onToggleChat} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isChatOpen ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5'}`}><MessageSquare size={18} /></button>
            {unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-[#f70b28] rounded-full border-2 border-black"></span>}
            <span className="text-[9px] uppercase tracking-wider text-zinc-500">Chat</span>
          </div>
      </div>

    </div>
  );
};
