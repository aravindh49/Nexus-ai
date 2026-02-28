
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse } from '../services/gemini';
import { Send, Bot, User, Sparkles, Terminal, Info, Zap, Cpu, Code } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayedText(''); // Reset when text changes
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, 15);
    return () => clearInterval(timer);
  }, [text]);

  return <span className="whitespace-pre-wrap text-slate-700/80 leading-relaxed font-mono text-[13px]">{displayedText}</span>;
};

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Protocol NEXUS-V4 active. Systems at 100% integrity. How can I assist with your operational fleet today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    const response = await getGeminiResponse(input);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-14rem)] cyber-card rounded-[3rem] shadow-2xl border-slate-200 relative bg-white/40">
      <div className="p-10 border-b border-slate-100 bg-white/60 flex justify-between items-center rounded-t-[3rem]">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-2 bg-teal-500/10 rounded-full blur"></div>
            <div className="relative w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tighter">Neural Command Core</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Synchronized Cluster Active</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
            <Cpu className="w-4 h-4 text-teal-600" />
            <span className="text-[10px] font-mono text-slate-600 font-bold tracking-tighter">LATENCY: 8ms</span>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-800 transition-colors"><Info className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide font-medium" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${msg.role === 'user'
                ? 'bg-teal-600 text-white border-teal-700 shadow-md'
                : 'bg-white text-slate-400 border-slate-200 shadow-sm'
              }`}>
              {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
            </div>
            <div className={`max-w-[70%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block rounded-[2rem] p-6 text-sm leading-loose tracking-tight shadow-sm ${msg.role === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-none'
                  : 'bg-white/80 text-slate-700 border border-slate-100 rounded-tl-none backdrop-blur-sm'
                }`}>
                {msg.role === 'assistant' && <div className="text-[9px] font-black uppercase text-teal-600 mb-2 tracking-widest font-mono">Response Protocol: Confirmed</div>}
                <div className={msg.role === 'assistant' ? 'opacity-90' : 'font-semibold text-[13px]'}>
                  {msg.role === 'assistant' ? <TypewriterText text={msg.content} /> : msg.content}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold font-mono px-4 italic">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-6 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
              <Bot className="w-6 h-6 text-slate-300" />
            </div>
            <div className="bg-white/60 border border-slate-50 rounded-[2rem] rounded-tl-none p-6 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-10 border-t border-slate-100 bg-white/80 rounded-b-[3rem]">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-amber-500 rounded-3xl blur opacity-5 group-focus-within:opacity-20 transition duration-500"></div>
          <div className="relative flex gap-4">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Submit telemetry query..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 pl-6 pr-14 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-none h-20 transition-all font-mono"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-30 text-white rounded-xl transition-all shadow-lg shadow-teal-600/30"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-8">
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-teal-600 transition-colors flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" /> Direct Link
            </button>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-teal-600 transition-colors flex items-center gap-2">
              <Code className="w-3.5 h-3.5" /> Source Stream
            </button>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-teal-600 transition-colors flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Efficiency Mode
            </button>
          </div>
          <div className="px-3 py-1 bg-teal-50 rounded-lg border border-teal-100">
            <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest">Telemetry Unlocked</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
