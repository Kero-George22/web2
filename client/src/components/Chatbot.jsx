import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import api from '../lib/api';
import ZazaRobotMascot from './ZazaRobotMascot';

export default function Chatbot() {
  const { user } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputStr, setInputStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [wave, setWave] = useState(false);
  const waveTimerRef = useRef(null);
  const msgsEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => () => {
    if (waveTimerRef.current) clearTimeout(waveTimerRef.current);
  }, []);

  const playWave = () => {
    if (waveTimerRef.current) clearTimeout(waveTimerRef.current);
    setWave(true);
    waveTimerRef.current = setTimeout(() => {
      setWave(false);
      waveTimerRef.current = null;
    }, 1000);
  };

  const toggleOpen = () => {
    if (!isOpen) {
      playWave();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputStr.trim()) return;

    const userMsg = inputStr.trim();
    setInputStr('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { prompt: userMsg });
      setMessages((prev) => [...prev, { role: 'bot', content: data.data.reply }]);
    } catch (err) {
      console.error(err);
      toast(err.response?.data?.message || 'AI request failed.', 'error');
      setMessages((prev) => [...prev, { role: 'bot', content: 'Oops, I encountered an error answering that.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const headerStatus = loading ? 'THINKING...' : wave ? 'HELLO!' : 'ONLINE & READY';
  const fabStatus = isOpen ? 'OPEN' : headerStatus;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="rounded-2xl w-[450px] h-[600px] max-h-[85vh] max-w-[90vw] mb-4 shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-[#21262d] bg-[#030712]">
          {/* Header */}
          <div
            className="px-4 py-3 flex justify-between items-center gap-3 border-b border-cinema-border bg-cinema-surface/50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-cinema-surface border border-cinema-border flex items-center justify-center flex-shrink-0 shadow-sm relative">
                <span className="text-xl">🤖</span>
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-cinema-bg ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h3 className="font-semibold text-cinema-text text-[15px] tracking-wide truncate">
                  ZAZA AI Assistant
                </h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[12px] text-cinema-muted truncate">{headerStatus}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-cinema-muted hover:text-white transition-colors flex-shrink-0"
              aria-label="Close chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cinema-bg bg-opacity-95 [scrollbar-width:thin] [scrollbar-color:var(--tw-colors-cinema-border)_transparent]">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-cinema-muted opacity-80 space-y-3">
                <div className="zaza-bot-fab-wrap !cursor-default !shadow-none py-3 px-4">
                  <ZazaRobotMascot thinking={false} wave={false} />
                  <div className="zaza-bot-name-tag">ZAZA · BOT</div>
                  <div className="zaza-bot-status-tag">
                    <div className="zaza-bot-status-dot" />
                    <span>ASK ME ANYTHING</span>
                  </div>
                </div>
                <p className="text-sm text-center px-4" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                  Ask me for movie recommendations or anything film-related!
                </p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-9 h-9 rounded-xl bg-cinema-surface border border-cinema-border flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1 overflow-hidden">
                    <ZazaRobotMascot thinking={false} wave={false} className="!scale-[0.34] !m-0 -translate-y-0.5" />
                  </div>
                )}
                <div 
                  className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                    m.role === 'user' 
                      ? 'bg-cinema-accent text-cinema-bg rounded-br-sm font-medium' 
                      : 'bg-cinema-surface border border-cinema-border text-cinema-text rounded-bl-sm drop-shadow-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex w-full justify-start">
                <div className="w-9 h-9 rounded-xl bg-cinema-surface border border-cinema-border flex items-center justify-center mr-2 flex-shrink-0 self-end mb-1 overflow-hidden">
                  <ZazaRobotMascot thinking={true} wave={false} className="!scale-[0.34] !m-0 -translate-y-0.5" />
                </div>
                <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-cinema-surface border border-cinema-border flex items-center gap-1.5 shadow-sm">
                  <div className="w-2 h-2 bg-cinema-accent/70 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cinema-accent/70 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                  <div className="w-2 h-2 bg-cinema-accent/70 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                </div>
              </div>
            )}
            <div ref={msgsEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 bg-cinema-surface border-t border-cinema-border z-10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                placeholder="Type a message..."
                disabled={loading}
                className="w-full bg-cinema-bg border border-cinema-border rounded-xl pl-4 pr-12 py-3 text-[15px] text-cinema-text focus:outline-none focus:border-cinema-accent focus:ring-1 focus:ring-cinema-accent transition-all disabled:opacity-50 placeholder:text-cinema-muted"
              />
              <button 
                type="submit" 
                disabled={loading || !inputStr.trim()}
                className="absolute right-2 text-cinema-bg bg-cinema-accent p-2 rounded-lg disabled:opacity-50 disabled:bg-transparent disabled:text-cinema-muted hover:bg-opacity-90 transition-all flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 ml-0.5">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating launcher — ZAZA BOT card */}
      <button
        type="button"
        onClick={toggleOpen}
        className="zaza-bot-fab-wrap outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/40"
        aria-label={isOpen ? 'Close ZAZA chatbot' : 'Open ZAZA chatbot'}
      >
        <ZazaRobotMascot thinking={loading && !isOpen} wave={wave && !isOpen} />
        <div className="zaza-bot-name-tag">ZAZA · BOT</div>
        <div className="zaza-bot-status-tag">
          <div className="zaza-bot-status-dot" />
          <span>{fabStatus}</span>
        </div>
      </button>
    </div>
  );
}