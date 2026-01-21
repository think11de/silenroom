import React from 'react';
import { Play, Pause, Volume2, VolumeX, CloudRain, Book, Coffee, Camera, CameraOff, Mic, MicOff, Activity, MessageSquare, Moon, Sun, Lock, MonitorUp, MonitorOff, Users, PictureInPicture, Timer } from 'lucide-react';
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
  personalPomodoro: { isActive: boolean; timeLeft: number };
  onTogglePersonalPomodoro: () => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

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
    <div className="fixed bottom-0 left-0 w-full p-6 z-50 flex flex-col md:flex-row items-end md:items-center justify-between pointer-events-none">
      
      {/* Left: Environment */}
      <div className="pointer-events-auto glass-panel rounded-2xl p-2 flex flex-col gap-2 mb-4 md:mb-0 shadow-2xl">
         <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl">
            <button onClick={() => isVoid && onToggleRoomMode()} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${!isVoid ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><Sun size={14} /> Lounge</button>
            <button onClick={() => !isVoid && onToggleRoomMode()} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isVoid ? 'bg-indigo-900 text-indigo-100' : 'text-zinc-500'}`}><Moon size={14} /> Deep Work</button>
         </div>
         
         {!isVoid && (
             <div className="flex items-center justify-between px-2 pt-1">
                 <div className="flex gap-1">
                    {[{ id: 'cafe', icon: Coffee }, { id: 'rain', icon: CloudRain }, { id: 'library', icon: Book }].map((mode) => (
                        <button key={mode.id} onClick={() => onModeChange(mode.id as any)} className={`p-1.5 rounded-md transition-all ${audio.mode === mode.id ? 'bg-[#f70b28] text-white' : 'text-zinc-600'}`}><mode.icon size={14} /></button>
                    ))}
                 </div>
                 <input type="range" min="0" max="1" step="0.01" value={audio.volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} className="w-16 mx-2 opacity-50 hover:opacity-100" />
                 <button onClick={onToggleAudio} className="text-zinc-400 hover:text-white">{audio.isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
             </div>
         )}
      </div>

      {/* Center: Goals & Team Timer */}
      <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 bottom-6 glass-panel rounded-full pl-2 pr-6 py-2 flex items-center gap-4 shadow-[0_0_50px_-12px_rgba(247,11,40,0.15)] border border-white/10">
          <button 
              onClick={onToggleTimer}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${timer.isActive ? 'bg-[#f70b28] text-white scale-105' : 'bg-white/5 text-white hover:bg-white/10'}`}
              title="Team Sprint"
          >
              {timer.isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
          
          <div className="flex flex-col items-start">
              <div className="text-xl font-['JetBrains_Mono'] font-medium tabular-nums tracking-tight leading-none mb-0.5">
                  {formatTime(timer.timeLeft)}
              </div>
              <input 
                type="text"
                value={currentGoal}
                onChange={(e) => onGoalChange(e.target.value)}
                placeholder="CURRENT OBJECTIVE..."
                className="bg-transparent text-xs text-zinc-400 placeholder-zinc-600 focus:text-[#f70b28] focus:outline-none w-32 md:w-48 uppercase font-bold tracking-wide"
                maxLength={25}
             />
          </div>
      </div>

      {/* Right: Actions */}
      <div className="pointer-events-auto glass-panel rounded-2xl p-2 flex gap-2 shadow-2xl">
          {/* Personal Pomodoro */}
          <button
            onClick={onTogglePersonalPomodoro}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${personalPomodoro.isActive ? 'bg-emerald-600 text-white' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
            title="My Personal Pomodoro"
          >
              <Timer size={18} />
              {personalPomodoro.isActive && <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>}
          </button>

          <div className="w-[1px] bg-white/10 my-1 mx-1"></div>

          <button onClick={onEnterBreakRoom} className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-zinc-400 hover:text-white hover:bg-[#f70b28]"><Users size={18} /></button>
          <button onClick={onPulse} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 text-zinc-400 hover:text-[#f70b28]"><Activity size={18} /></button>
          
          <div className="w-[1px] bg-white/10 my-1 mx-1"></div>

          <button onClick={onToggleCamera} disabled={isVoid} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCameraOn ? 'bg-white text-black' : 'text-zinc-400 hover:bg-white/5'}`}>{isCameraOn ? <Camera size={18} /> : <CameraOff size={18} />}</button>
          <button onClick={onToggleMic} disabled={isVoid} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMicOn ? 'bg-[#f70b28] text-white' : 'text-zinc-400 hover:bg-white/5'}`}>{isMicOn ? <Mic size={18} /> : <MicOff size={18} />}</button>
          <button onClick={onToggleScreenShare} disabled={isVoid} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isScreenSharing ? 'bg-[#f70b28] text-white' : 'text-zinc-400 hover:bg-white/5'}`}>{isScreenSharing ? <MonitorOff size={18} /> : <MonitorUp size={18} />}</button>
          
          <div className="w-[1px] bg-white/10 my-1 mx-1"></div>

          <button onClick={onTogglePiP} className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-white/5 hover:text-white" title="Picture in Picture Mode"><PictureInPicture size={18} /></button>
          <div className="relative">
            <button onClick={onToggleChat} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isChatOpen ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5'}`}><MessageSquare size={18} /></button>
            {unreadCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-[#f70b28] rounded-full border-2 border-black"></span>}
          </div>
      </div>

    </div>
  );
};