export type UserStatus = 'idle' | 'focus' | 'typing' | 'talking' | 'thinking';

export type RoomMode = 'social' | 'void';

export interface User {
  id: string;
  isMe: boolean;
  isGhost?: boolean; 
  name?: string; // Auth Name
  photoUrl?: string; // Auth Photo
  x: number; 
  y: number; 
  anchorX?: number; 
  anchorY?: number; 
  status: UserStatus;
  lastActive: number; 
  focusStreak: number; 
  
  activeSince?: number;
  joinedAt?: number; 

  activityLabel?: string;
  currentGoal?: string; 
  lastPulse?: number;

  isInSprint?: boolean;
  sprintDuration?: number; 
  sprintStartTime?: number; 
  sprintCountToday?: number;

  // Individual Pomodoro State
  pomodoroState?: {
      isActive: boolean;
      mode: 'focus' | 'break';
      startTime: number;
      duration: number; // in seconds
      completedCycles: number;
  };
  
  isCameraOn?: boolean;
  isMicOn?: boolean; 
  isScreenSharing?: boolean; 
  isInBreakRoom?: boolean; 
  stream?: MediaStream; 

  roomMode: RoomMode;

  currentPhase?: 'work' | 'break';
  nextPhaseChange?: number; 
  lifespanEnd?: number; 
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface AudioState {
  isPlaying: boolean;
  volume: number;
  mode: 'think11' | 'rain' | 'library' | 'cafe' | 'binaural'; 
}

export interface TimerState {
  isActive: boolean;
  timeLeft: number; 
  duration: number; 
  mode: 'focus' | 'break';
}

export interface NotificationState {
  id: string;
  message: string;
  type: 'invite' | 'info';
  onConfirm?: () => void;
  visible: boolean;
}