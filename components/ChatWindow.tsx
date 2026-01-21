import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
    isOpen, 
    onClose, 
    messages, 
    currentUserId,
    onSendMessage 
}) => {
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSendMessage(inputValue.trim());
            setInputValue("");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-32 right-4 md:right-8 w-80 md:w-96 h-[450px] z-50 flex flex-col glass-panel rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Void Chat</span>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                    <X size={16} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="text-center text-zinc-600 text-xs italic mt-10">
                        The void is silent.
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    const isSystem = msg.isSystem;
                    
                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center my-2">
                                <span className="text-[10px] uppercase tracking-wide text-zinc-600 bg-white/5 px-2 py-1 rounded">
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                                isMe 
                                ? 'bg-white/10 text-white rounded-br-none border border-white/5' 
                                : 'bg-black/30 text-zinc-300 rounded-bl-none border border-white/5'
                            }`}>
                                {msg.text}
                            </div>
                            <span className="text-[9px] text-zinc-600 mt-1 px-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/5">
                <div className="relative">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Whisper into the void..."
                        className="w-full bg-black/20 text-white text-sm rounded-full pl-4 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-zinc-600 transition-all hover:bg-black/30"
                    />
                    <button 
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 rounded-full text-zinc-400 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </form>
        </div>
    );
};