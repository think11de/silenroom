import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Visualizer } from './components/Visualizer';
import { Controls } from './components/Controls';
import { ChatWindow } from './components/ChatWindow';
import { SessionStats } from './components/SessionStats'; 
import { PrivateTalkModal } from './components/PrivateTalkModal';
import { BreakRoom } from './components/BreakRoom'; 
import { AuthModal } from './components/AuthModal'; 
import { User, AudioState, TimerState, UserStatus, NotificationState, ChatMessage, RoomMode } from './types';
import { audioService } from './services/audioService';
import { auth, FirebaseUser } from './services/firebase';
import { Flame, Sparkles, BarChart3, Zap } from 'lucide-react';
import { joinRoom } from 'trystero';
import { onAuthStateChanged } from 'firebase/auth';

const ROOM_ID = 'think11_hq_v5'; 
const TYPING_TIMEOUT = 1200; 
const PERSONAL_WORK_TIME = 25 * 60; 
const SAFE_BOUNDS = { minX: 8, maxX: 92, minY: 10, maxY: 72 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const randomInRange = (min: number, max: number) => min + Math.random() * (max - min);
const clampPosition = (x: number, y: number) => ({
  x: clamp(x, SAFE_BOUNDS.minX, SAFE_BOUNDS.maxX),
  y: clamp(y, SAFE_BOUNDS.minY, SAFE_BOUNDS.maxY)
});

// --- Ghosts Logic (Dynamic) ---
const createGhost = (id: string): User => ({
    id: `ghost-${id}`,
    isMe: false,
    isGhost: true,
    x: randomInRange(SAFE_BOUNDS.minX, SAFE_BOUNDS.maxX),
    y: randomInRange(SAFE_BOUNDS.minY, SAFE_BOUNDS.maxY),
    status: Math.random() > 0.6 ? 'focus' : 'idle',
    activityLabel: Math.random() > 0.5 ? "Deep Work" : "Reviewing",
    lastActive: Date.now(),
    focusStreak: Math.floor(Math.random() * 10),
    activeSince: Date.now() - Math.random() * 3600000,
    roomMode: 'social',
    anchorX: randomInRange(SAFE_BOUNDS.minX, SAFE_BOUNDS.maxX),
    anchorY: randomInRange(SAFE_BOUNDS.minY, SAFE_BOUNDS.maxY)
});

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [roomMode, setRoomMode] = useState<RoomMode>('void');
  const [audio, setAudio] = useState<AudioState>({ isPlaying: false, volume: 0.7, mode: 'think11' });
  const [timer, setTimer] = useState<TimerState>({ isActive: false, timeLeft: 50*60, duration: 50*60, mode: 'focus' }); 
  const [teamSprintCount, setTeamSprintCount] = useState(0);
  
  // Personal Pomodoro
  const [personalPomo, setPersonalPomo] = useState({ isActive: false, timeLeft: PERSONAL_WORK_TIME, cycles: 0 });

  // Local User - randomize start position to prevent overlap
  const [myPos, setMyPos] = useState(() => ({ 
    x: randomInRange(SAFE_BOUNDS.minX, SAFE_BOUNDS.maxX),
    y: randomInRange(SAFE_BOUNDS.minY, SAFE_BOUNDS.maxY)
  })); 
  const [myStatus, setMyStatus] = useState<UserStatus>('idle');
  const [myGoal, setMyGoal] = useState<string>("");
  const [myLastPulse, setMyLastPulse] = useState<number>(0);
  const myJoinedAt = useRef(Date.now()); 
  
  // Ref to store current data for immediate sending to new peers
  const myDataRef = useRef<any>(null);

  // Media & Interaction
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  // Ref to store current stream for sending to new peers (avoids closure issues)
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // Keep localStreamRef in sync with localStream state
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false); 
  const [isInBreakRoom, setIsInBreakRoom] = useState(false);
  const [focusedPeerId, setFocusedPeerId] = useState<string | null>(null); 
  
  // Trystero Refs
  const addPeerStream = useRef<(stream: MediaStream, targetId?: string) => void>(() => {});
  const removePeerStream = useRef<(stream: MediaStream, targetId?: string) => void>(() => {});
  const roomRef = useRef<any>(null);

  // Data
  const [ghosts, setGhosts] = useState<User[]>(() => Array.from({ length: 4 }).map((_, i) => createGhost(i.toString())));
  const [peers, setPeers] = useState<Map<string, User>>(new Map());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  
  // UI
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs for loop optimization
  const sendStatusUpdate = useRef<any>(() => {});
  const sendChatMessage = useRef<any>(() => {});
  const typingTimeoutRef = useRef<any>(null);
  const isChatOpenRef = useRef(isChatOpen);
  
  // Keep ref in sync
  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);

  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('think11_sprint_date');
    const storedCount = localStorage.getItem('think11_sprint_count');
    if (storedDate === today && storedCount) {
      setTeamSprintCount(Number.parseInt(storedCount, 10) || 0);
    } else {
      localStorage.setItem('think11_sprint_date', today);
      localStorage.setItem('think11_sprint_count', '0');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('think11_sprint_date', new Date().toDateString());
    localStorage.setItem('think11_sprint_count', String(teamSprintCount));
  }, [teamSprintCount]);

  // Auth Listener
  useEffect(() => {
      const unsub = onAuthStateChanged(auth, (u) => {
          if (u) {
              setUser(u);
              setAuthLoading(false);
          } else {
              // If we have a demo user set manually, don't clear it on null auth state
              setUser(prev => prev?.isAnonymous && prev.uid.startsWith('demo-') ? prev : null);
              if (!user) setAuthLoading(false);
          }
      });
      return unsub;
  }, []);

  // Ghost Loop: Dynamically add/remove/move ghosts with sound
  useEffect(() => {
      if (!audio.isPlaying && !personalPomo.isActive) return;

      const interval = setInterval(() => {
          // 1. Move existing ghosts gently
          setGhosts(prev => prev.map(g => {
              if (Math.random() > 0.3) return g; // Only move some
              const driftX = (Math.random() - 0.5) * 4;
              const driftY = (Math.random() - 0.5) * 4;
              let newX = g.x + driftX;
              let newY = g.y + driftY;
              // Boundary check (10-90%)
              newX = Math.max(10, Math.min(90, newX));
              newY = Math.max(15, Math.min(85, newY));
              
              return { ...g, x: newX, y: newY };
          }));

          // 2. Add/Remove logic
          if (Math.random() > 0.7) { // Slower churn
              setGhosts(prev => {
                  const shouldAdd = Math.random() > 0.45 && prev.length < 8;
                  if (shouldAdd) {
                      // Soft ping for arrival
                      void audioService.init().then(() => audioService.playSoftPing()).catch(() => {});
                      return [...prev, createGhost(Date.now().toString())];
                  } else if (prev.length > 2) {
                      void audioService.init().then(() => audioService.playSoftExit()).catch(() => {});
                      // Remove oldest ghost
                      return prev.slice(1); 
                  }
                  return prev;
              });
          }
      }, 3000); 
      return () => clearInterval(interval);
  }, [audio.isPlaying, personalPomo.isActive]);

  // Ghost drift: subtle movement to add life
  useEffect(() => {
    const interval = setInterval(() => {
      setGhosts(prev => prev.map(g => {
        const driftX = (Math.random() - 0.5) * 3;
        const driftY = (Math.random() - 0.5) * 3;
        const next = clampPosition((g.anchorX ?? g.x) + driftX, (g.anchorY ?? g.y) + driftY);
        return { ...g, x: next.x, y: next.y };
      }));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const handleDemoBypass = () => {
      const demoUser = {
        uid: `demo-${Date.now()}`,
        displayName: 'Offline Agent',
        photoURL: null,
        email: null,
        phoneNumber: null,
        isAnonymous: true,
        emailVerified: false,
        providerData: [],
        metadata: {},
        refreshToken: '',
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => '',
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        toJSON: () => ({}),
      } as unknown as FirebaseUser;
      
      setUser(demoUser);
  };

  // Trystero Setup
  useEffect(() => {
    if (!user) return;

    const config = { appId: 'think11_app_v5' };
    const room = joinRoom(config, ROOM_ID);
    roomRef.current = room;
    
    const [sendData, getData] = room.makeAction<any>('uStats'); 
    const [sendChat, getChat] = room.makeAction<any>('chat');

    sendStatusUpdate.current = sendData;
    sendChatMessage.current = sendChat;
    addPeerStream.current = room.addStream;
    removePeerStream.current = room.removeStream;

    // Immediately send data when someone joins so they see me
    room.onPeerJoin((peerId) => {
        const currentStream = localStreamRef.current;
        if (myDataRef.current) {
            sendData(myDataRef.current, peerId);
        }
        // Send stream to new peer if we have one active (use ref to get current value)
        if (currentStream && currentStream.active) {
            addPeerStream.current(currentStream, peerId);
        }
        void audioService.init().then(() => audioService.playSoftPing()).catch(() => {});
    });

    getData((data: any, peerId: string) => {
        setPeers((prev: Map<string, User>) => {
            const next = new Map(prev);
            const existing = next.get(peerId);
            
            // Check for position collision with other peers and adjust if needed
            const clamped = clampPosition(data.x, data.y);
            let adjustedX = clamped.x;
            let adjustedY = clamped.y;
            const minDistance = 8; // Minimum distance in percentage
            
            for (const [otherId, otherUser] of next.entries()) {
                if (otherId === peerId || otherUser.isGhost) continue;
                const dx = Math.abs(data.x - otherUser.x);
                const dy = Math.abs(data.y - otherUser.y);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minDistance) {
                    // Collision detected - move new peer away
                    const angle = Math.atan2(data.y - otherUser.y, data.x - otherUser.x);
                    adjustedX = Math.max(5, Math.min(95, otherUser.x + Math.cos(angle) * minDistance));
                    adjustedY = Math.max(5, Math.min(95, otherUser.y + Math.sin(angle) * minDistance));
                    break;
                }
            }
            
            next.set(peerId, { 
                ...data, 
                x: adjustedX,
                y: adjustedY,
                id: peerId, 
                isMe: false, 
                isGhost: false,
                stream: existing?.stream 
            });
            return next;
        });
    });

    getChat((data: any, peerId: string) => {
        setMessages(p => [...p.slice(-49), { id: data.id, senderId: peerId, text: data.text, timestamp: data.timestamp }]);
        if (!isChatOpenRef.current) { setUnreadCount(c => c + 1); audioService.playClick(); }
    });

    room.onPeerStream((stream, peerId) => {
        setPeers((prev: Map<string, User>) => {
            const next = new Map(prev);
            const existing = next.get(peerId);
            if (existing) {
                // User data exists, add stream to it
                next.set(peerId, { ...existing, stream });
            } else {
                // Stream arrived before user data - create placeholder with stream
                // Position will be adjusted when user data arrives via getData
                const clamped = clampPosition(20 + Math.random() * 60, 20 + Math.random() * 60);
                next.set(peerId, { 
                    id: peerId, 
                    isMe: false, 
                    isGhost: false,
                    x: clamped.x, // Random position, will be adjusted if collision
                    y: clamped.y,
                    status: 'idle' as const,
                    lastActive: Date.now(),
                    focusStreak: 0,
                    roomMode: 'social' as const,
                    stream,
                    isCameraOn: true // Assume camera is on if we're receiving a stream
                });
            }
            return next;
        });
    });
    
    room.onPeerLeave((id: string) => {
        setPeers(prev => { const n = new Map(prev); n.delete(id); return n; });
        if(focusedPeerId === id) setFocusedPeerId(null);
        void audioService.init().then(() => audioService.playSoftExit()).catch(() => {});
    });

    return () => room.leave();
  }, [user]); // Only re-run when user changes, NOT on isChatOpen/focusedPeerId changes!

  // --- Broadcast Loop ---
  useEffect(() => {
      if (!user) return;
      
      const interval = setInterval(() => {
          const personalPomoData = {
              isActive: personalPomo.isActive,
              mode: 'focus' as const,
              startTime: Date.now() - ((25*60 - personalPomo.timeLeft)*1000),
              duration: 25*60,
              completedCycles: personalPomo.cycles
          };
          const clamped = clampPosition(myPos.x, myPos.y);
          const sprintStartTime = timer.isActive ? Date.now() - ((timer.duration - timer.timeLeft) * 1000) : undefined;

          const myData = {
              x: clamped.x,
              y: clamped.y,
              status: myStatus,
              activityLabel: personalPomo.isActive ? "Personal Flow" : (myStatus === 'focus' ? 'Working' : 'Idle'),
              currentGoal: myGoal,
              lastPulse: myLastPulse,
              isCameraOn, isMicOn, isScreenSharing, isInBreakRoom,
              roomMode,
              name: user.displayName || 'Guest',
              photoUrl: user.photoURL,
              pomodoroState: personalPomoData,
              isInSprint: timer.isActive,
              sprintDuration: timer.isActive ? timer.duration : undefined,
              sprintStartTime,
              sprintCountToday: teamSprintCount,
              activeSince: myJoinedAt.current,
              joinedAt: myJoinedAt.current
          };

          // Update ref for immediate sending
          myDataRef.current = myData;

          // Regular broadcast
          sendStatusUpdate.current(myData);
      }, 1500); // Increased frequency slightly for better sync
      return () => clearInterval(interval);
  }, [user, myPos, myStatus, myGoal, myLastPulse, isCameraOn, isMicOn, isScreenSharing, isInBreakRoom, roomMode, personalPomo, timer, teamSprintCount]);


  // --- Logic Handlers ---
  const updateMediaStream = async (wantCam: boolean, wantMic: boolean, wantScreen: boolean = false, modeOverride?: RoomMode) => {
      const effectiveMode = modeOverride ?? roomMode;
      if (effectiveMode === 'void') wantMic = false;

      // Handle Screen Share
      if (wantScreen && !isScreenSharing) {
          try {
             const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: wantMic });
             
             if (localStream) {
                 localStream.getTracks().forEach(t => t.stop());
                 removePeerStream.current(localStream);
             }

             screenStream.getVideoTracks()[0].onended = () => toggleScreenShare();
             
             setLocalStream(screenStream);
             addPeerStream.current(screenStream);
             setIsScreenSharing(true);
             setIsCameraOn(false);
             setIsMicOn(wantMic);
             return;
          } catch(e) {
              console.error("Screen share cancelled", e);
              return;
          }
      }

      if (!wantScreen && isScreenSharing) {
          if (localStream) {
              localStream.getTracks().forEach(t => t.stop());
              removePeerStream.current(localStream);
              setLocalStream(null);
          }
          setIsScreenSharing(false);
      }

      if (!wantCam && !wantMic && !wantScreen) {
          if (localStream) {
              localStream.getTracks().forEach(t => t.stop());
              removePeerStream.current(localStream);
              setLocalStream(null);
          }
          setIsCameraOn(false);
          setIsMicOn(false);
          setIsScreenSharing(false);
          return;
      }

      let currentStream = localStream;

      if (!currentStream || !currentStream.active || isScreenSharing) {
          try {
              currentStream = await navigator.mediaDevices.getUserMedia({ 
                  video: { width: 320, height: 240, frameRate: 15 }, 
                  audio: true 
              });
              setLocalStream(currentStream);
              // Send stream to all existing peers (addStream without targetId broadcasts to all)
              addPeerStream.current(currentStream);
              setIsScreenSharing(false);
          } catch (err) {
              setNotification({ id: 'media-err', message: "Permission Denied", type: 'info', visible: true });
              setTimeout(() => setNotification(null), 3000);
              return;
          }
      }

      const videoTrack = currentStream.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = wantCam;

      const audioTrack = currentStream.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = wantMic;

      setIsCameraOn(wantCam);
      setIsMicOn(wantMic);
  };

  const toggleCamera = () => updateMediaStream(!isCameraOn, isMicOn, false);
  const toggleMic = () => updateMediaStream(isCameraOn, !isMicOn, isScreenSharing);
  const toggleScreenShare = () => {
      if (isScreenSharing) updateMediaStream(true, isMicOn, false);
      else updateMediaStream(false, isMicOn, true);
  };
  
  const handleTogglePiP = async () => {
      if ('documentPictureInPicture' in window) {
          try {
             // @ts-ignore
             const pipWindow = await window.documentPictureInPicture.requestWindow({ width: 400, height: 400 });
             const div = document.createElement('div');
             div.style.cssText = "background:#050505; color:white; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:sans-serif;";
             div.innerHTML = `<h1 style="color:#f70b28; margin:0;">THINK11</h1><p>Active</p>`;
             pipWindow.document.body.append(div);
          } catch(e) { console.error(e); }
      } else {
          const focusedVideo = focusedPeerId ? document.querySelector(`video[data-peer-id="${focusedPeerId}"]`) as HTMLVideoElement | null : null;
          const myVideo = user ? document.querySelector(`video[data-peer-id="${user.uid}"]`) as HTMLVideoElement | null : null;
          const anyVideo = document.querySelector('video[data-peer-id]') as HTMLVideoElement | null;
          const target = focusedVideo || myVideo || anyVideo;
          if (target) {
              // @ts-ignore
              if (target !== document.pictureInPictureElement) target.requestPictureInPicture();
              // @ts-ignore
              else document.exitPictureInPicture();
          } else {
              setNotification({ id: 'nopip', message: "No video active.", type: 'info', visible: true });
              setTimeout(() => setNotification(null), 2000);
          }
      }
  };

  const handleTogglePersonalPomodoro = () => {
      if (personalPomo.isActive) {
          setPersonalPomo(p => ({ ...p, isActive: false }));
      } else {
          setPersonalPomo(p => ({ ...p, isActive: true, timeLeft: PERSONAL_WORK_TIME }));
          audioService.playAlert();
      }
  };

  const handleEnterBreakRoom = () => {
      setIsInBreakRoom(true);
      // Auto-enable camera in break room
      setRoomMode('social');
      updateMediaStream(true, true, false, 'social');
  };

  const handleLeaveBreakRoom = () => {
      setIsInBreakRoom(false);
      setRoomMode('void');
      updateMediaStream(isCameraOn, false, false, 'void');
  };

  // Personal Pomodoro Tick
  useEffect(() => {
      if (!personalPomo.isActive) return;
      const int = setInterval(() => {
          setPersonalPomo(p => {
              if (p.timeLeft <= 1) {
                  audioService.playAlert();
                  return { ...p, isActive: false, cycles: p.cycles + 1, timeLeft: PERSONAL_WORK_TIME };
              }
              return { ...p, timeLeft: p.timeLeft - 1 };
          });
      }, 1000);
      return () => clearInterval(int);
  }, [personalPomo.isActive]);

  // Team Sprint Tick
  useEffect(() => {
      if (!timer.isActive) return;
      const interval = setInterval(() => {
          setTimer(t => {
              if (!t.isActive) return t;
              if (t.timeLeft <= 1) {
                  void audioService.init().then(() => audioService.playAlert()).catch(() => {});
                  setTeamSprintCount(c => c + 1);
                  return { ...t, isActive: false, timeLeft: t.duration };
              }
              return { ...t, timeLeft: t.timeLeft - 1 };
          });
      }, 1000);
      return () => clearInterval(interval);
  }, [timer.isActive, timer.duration]);

  // Input Handling
  const handleUserActivity = useCallback(() => {
      if(myStatus === 'idle') setMyStatus('typing');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setMyStatus(s => s === 'talking' ? s : 'focus'), TYPING_TIMEOUT);
  }, [myStatus]);

  useEffect(() => {
      window.addEventListener('keydown', handleUserActivity);
      window.addEventListener('mousemove', handleUserActivity);
      return () => { window.removeEventListener('keydown', handleUserActivity); window.removeEventListener('mousemove', handleUserActivity); };
  }, [handleUserActivity]);

  useEffect(() => {
      if (roomMode === 'void' && isMicOn) {
          updateMediaStream(isCameraOn, false, false, 'void');
      }
  }, [roomMode, isMicOn, isCameraOn]);

  // --- Render ---
  if (authLoading) return <div className="w-full h-screen bg-[#050505] flex items-center justify-center text-[#f70b28] animate-pulse">Initializing...</div>;
  if (!user) return <AuthModal onBypass={handleDemoBypass} />;

  const sprintStartTime = timer.isActive ? Date.now() - ((timer.duration - timer.timeLeft) * 1000) : undefined;
  const pomodoroState = {
      isActive: personalPomo.isActive,
      mode: 'focus' as const,
      startTime: Date.now() - ((PERSONAL_WORK_TIME - personalPomo.timeLeft) * 1000),
      duration: PERSONAL_WORK_TIME,
      completedCycles: personalPomo.cycles
  };
  const myClamped = clampPosition(myPos.x, myPos.y);

  const myUser: User = {
      id: user.uid,
      isMe: true, isGhost: false,
      name: user.displayName || "Me", photoUrl: user.photoURL || undefined,
      x: myClamped.x, y: myClamped.y, status: myStatus,
      activityLabel: "Me", currentGoal: myGoal,
      isCameraOn, isMicOn, isScreenSharing, isInBreakRoom, roomMode,
      stream: localStream || undefined,
      lastActive: Date.now(), focusStreak: 0,
      pomodoroState,
      isInSprint: timer.isActive,
      sprintDuration: timer.isActive ? timer.duration : undefined,
      sprintStartTime,
      sprintCountToday: teamSprintCount
  };

  const allUsers = [myUser, ...ghosts, ...Array.from(peers.values())];
  const focusedPeer = focusedPeerId ? peers.get(focusedPeerId) : null;

  return (
    <div className={`w-full h-screen text-zinc-100 overflow-hidden font-sans ${roomMode === 'void' ? 'bg-[#000000]' : 'bg-[#050505]'}`}>
      
      {/* Notifications */}
      {notification && notification.visible && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 glass-panel px-6 py-4 rounded-full flex items-center gap-5 border border-[#f70b28]/20 animate-in fade-in slide-in-from-top-4">
           <div className="p-2 rounded-full bg-[#f70b28] text-white"><Flame size={18} /></div>
           <div className="flex flex-col">
               <span className="text-[10px] font-bold text-[#f70b28] uppercase">System</span>
               <span className="text-sm font-bold text-white">{notification.message}</span>
           </div>
           {notification.onConfirm && (
             <button onClick={() => { notification.onConfirm?.(); setNotification(null); }} className="bg-[#f70b28] text-white px-4 py-2 rounded-full text-xs font-bold">JOIN</button>
           )}
        </div>
      )}

      {isInBreakRoom && <BreakRoom users={allUsers} onLeave={handleLeaveBreakRoom} />}
      
      {focusedPeer && !isInBreakRoom && <PrivateTalkModal me={myUser} peer={focusedPeer} onExit={() => setFocusedPeerId(null)} />}

      <button onClick={() => setIsStatsOpen(!isStatsOpen)} className="fixed top-8 left-8 z-40 flex items-center gap-2 px-4 h-12 bg-black/40 border border-white/10 rounded-full hover:border-[#f70b28] transition-all">
          <BarChart3 size={18} />
          <span className="hidden md:block text-xs font-bold uppercase">Stats</span>
      </button>

      {!isInBreakRoom && (
        <Visualizer 
            users={allUsers} 
            localStream={localStream} 
            roomMode={roomMode} 
            onUserClick={(u) => setFocusedPeerId(u.id)}
            focusedPeerId={focusedPeerId}
            isWorkMuted={!isInBreakRoom}
        />
      )}

      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} messages={messages} currentUserId={user.uid} onSendMessage={(t) => { sendChatMessage.current({ text: t, id: Date.now().toString(), timestamp: Date.now() }); setMessages(p => [...p, { id: Date.now().toString(), senderId: user.uid, text: t, timestamp: Date.now() }]); }} />
      <SessionStats users={allUsers} isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />

      <Controls 
        timer={timer}
        onToggleTimer={() => setTimer(t => {
          if (t.isActive) return { ...t, isActive: false };
          const nextTime = t.timeLeft > 0 ? t.timeLeft : t.duration;
          return { ...t, isActive: true, timeLeft: nextTime };
        })}
        teamSprintCount={teamSprintCount}
        audio={audio}
        onToggleAudio={async () => { if(audio.isPlaying){ audioService.stopAmbience(); setAudio(a=>({...a, isPlaying:false})); } else { await audioService.init(); audioService.startAmbience(audio.mode); setAudio(a=>({...a, isPlaying:true})); } }}
        onVolumeChange={(v) => { setAudio(a=>({...a, volume: v})); audioService.setVolume(v); }}
        onModeChange={(m) => { setAudio(a=>({...a, mode:m})); audioService.startAmbience(m); }}
        activeCount={allUsers.filter(u => u.status !== 'idle').length}
        isCameraOn={isCameraOn} 
        onToggleCamera={toggleCamera} 
        isMicOn={isMicOn} 
        onToggleMic={toggleMic}
        isScreenSharing={isScreenSharing} 
        onToggleScreenShare={toggleScreenShare}
        currentGoal={myGoal} onGoalChange={setMyGoal}
        onPulse={async () => { await audioService.init(); setMyLastPulse(Date.now()); audioService.playClick(); }}
        unreadCount={unreadCount} onToggleChat={() => { setIsChatOpen(!isChatOpen); setUnreadCount(0); }} isChatOpen={isChatOpen}
        roomMode={roomMode} onToggleRoomMode={() => setRoomMode(roomMode === 'social' ? 'void' : 'social')}
        isInBreakRoom={isInBreakRoom} 
        onEnterBreakRoom={handleEnterBreakRoom}
        onTogglePiP={handleTogglePiP}
        personalPomodoro={personalPomo}
        personalPomodoroCycles={personalPomo.cycles}
        onTogglePersonalPomodoro={handleTogglePersonalPomodoro}
      />
    </div>
  );
};

export default App;