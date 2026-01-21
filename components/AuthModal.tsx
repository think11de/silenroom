import React, { useState } from 'react';
import { loginGoogle, loginGuest } from '../services/firebase';
import { ArrowRight, Lock, AlertCircle, Zap } from 'lucide-react';

interface AuthModalProps {
    onBypass: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onBypass }) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (method: 'google' | 'guest') => {
        setIsLoading(true);
        setError(null);
        try {
            if (method === 'google') await loginGoogle();
            else await loginGuest();
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/operation-not-allowed') {
                setError("Domain not allowed by database.");
            } else {
                setError("Connection failed.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] animate-in fade-in duration-1000">
             <div className="relative mb-12 text-center">
                <div className="absolute -inset-4 bg-[#f70b28]/10 blur-3xl rounded-full"></div>
                <h1 className="relative text-6xl md:text-8xl font-black tracking-tighter text-white">
                  THINK<span className="text-[#f70b28]">11</span>
                </h1>
                <p className="relative text-sm font-mono text-zinc-500 uppercase tracking-[0.5em] mt-2">Remote HQ</p>
             </div>
             
             <div className="flex flex-col gap-4 w-full max-w-xs z-10">
                 {error && (
                     <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-200 text-xs mb-2">
                         <AlertCircle size={14} />
                         <span>{error}</span>
                     </div>
                 )}

                 <button 
                    onClick={() => handleLogin('google')}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50"
                 >
                     <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                     <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
                 </button>
                 
                 <button 
                    onClick={() => handleLogin('guest')}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-3 px-8 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg font-medium hover:text-white hover:border-zinc-700 transition-colors text-sm disabled:opacity-50"
                 >
                     <span>Enter as Guest</span>
                     <ArrowRight size={14} />
                 </button>

                 {/* Fallback Option if Firebase Fails */}
                 {error && (
                     <button 
                        onClick={onBypass}
                        className="mt-4 flex items-center justify-center gap-2 text-[#f70b28] text-xs font-bold uppercase tracking-wider hover:text-white transition-colors"
                     >
                         <Zap size={12} /> Enter Offline Mode
                     </button>
                 )}
             </div>
             
             <div className="absolute bottom-8 text-[10px] text-zinc-600 uppercase flex items-center gap-1">
                 <Lock size={10} /> Secure Connection • Firebase Auth
             </div>
        </div>
    );
};