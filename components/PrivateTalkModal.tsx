import React, { useEffect, useRef } from 'react';
import { User } from '../types';
import { X, Mic, MicOff, Maximize2 } from 'lucide-react';

interface PrivateTalkModalProps {
    me: User;
    peer: User;
    onExit: () => void;
}

export const PrivateTalkModal: React.FC<PrivateTalkModalProps> = ({ me, peer, onExit }) => {
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const peerVideoRef = useRef<HTMLVideoElement>(null);

    // Attach streams on mount
    useEffect(() => {
        if (myVideoRef.current && me.stream) {
            myVideoRef.current.srcObject = me.stream;
        }
        if (peerVideoRef.current && peer.stream) {
            peerVideoRef.current.srcObject = peer.stream;
        }
    }, [me.stream, peer.stream]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in duration-300">
            {/* Background Blur Backdrop handled by parent or css, here we just do the modal content */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onExit}></div>
            
            <div className="relative w-full h-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 pointer-events-none">
                
                {/* Peer View (Left/Top) */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-[#f70b28]/30 shadow-[0_0_100px_rgba(247,11,40,0.1)] pointer-events-auto bg-zinc-900 group">
                    {peer.stream ? (
                        <video 
                            ref={peerVideoRef} 
                            autoPlay 
                            playsInline 
                            className={`w-full h-full object-cover ${peer.isScreenSharing ? '' : 'transform scale-x-[-1]'}`}
                        />
                    ) : (
                         <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                            <img src={`https://i.pravatar.cc/300?u=${peer.id}`} alt="Peer" className="w-32 h-32 rounded-full opacity-50 grayscale" />
                         </div>
                    )}
                    
                    {/* Peer Label */}
                    <div className="absolute bottom-6 left-6 flex flex-col">
                        <span className="text-white text-2xl font-bold tracking-tight">{peer.activityLabel || 'Unknown'}</span>
                        <div className="flex items-center gap-2 mt-1">
                             <div className="px-2 py-0.5 bg-[#f70b28] text-white text-[10px] font-bold uppercase rounded-sm">Connected</div>
                             {peer.isScreenSharing && <div className="px-2 py-0.5 bg-white text-black text-[10px] font-bold uppercase rounded-sm">Sharing Screen</div>}
                        </div>
                    </div>
                </div>

                {/* My View (Right/Bottom) */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl pointer-events-auto bg-zinc-900 group">
                    {me.stream ? (
                        <video 
                            ref={myVideoRef} 
                            autoPlay 
                            muted 
                            playsInline 
                            className={`w-full h-full object-cover ${me.isScreenSharing ? '' : 'transform scale-x-[-1]'}`}
                        />
                    ) : (
                         <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                             <div className="text-zinc-600">Camera Off</div>
                         </div>
                    )}
                    
                    {/* My Label */}
                    <div className="absolute bottom-6 left-6">
                        <span className="text-zinc-400 text-xl font-bold tracking-tight">You</span>
                        <div className="flex items-center gap-2 mt-1">
                            {!me.isMicOn && <MicOff size={14} className="text-zinc-500" />}
                        </div>
                    </div>
                </div>

                {/* Floating Controls */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center gap-4 z-50">
                     <div className="bg-black/50 backdrop-blur-md border border-white/10 p-2 rounded-full">
                         <button 
                            onClick={onExit}
                            className="bg-[#f70b28] text-white hover:bg-white hover:text-black w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110"
                         >
                             <X size={32} />
                         </button>
                     </div>
                     <span className="text-white/50 text-xs uppercase tracking-widest font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Private Focus Mode</span>
                </div>

            </div>
        </div>
    );
};