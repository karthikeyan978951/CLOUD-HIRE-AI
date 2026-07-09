import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  Sparkles,
  RefreshCw 
} from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'coach',
      text: "Hello! I am your CloudHire AI Career Guide. 🚀 I can help you validate your cloud skill levels, map study programs, suggest cert preparation tracks, or optimize your resume for applicant scanners. Ask me anything!",
      suggestions: ["Cloud Engineer roadmap", "How to study Terraform?", "Improve my resume"]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    try {
      const response = await api.post('/api/chat', { message: text });
      
      const coachMsg = {
        id: Date.now() + 1,
        sender: 'coach',
        text: response.data.reply,
        suggestions: response.data.suggestions || []
      };
      
      setMessages(prev => [...prev, coachMsg]);
    } catch (err) {
      console.error("Chatbot transmission error", err);
      const errMsg = {
        id: Date.now() + 1,
        sender: 'coach',
        text: "My apologies, I ran into an error connecting to my NLP services. Please try sending your question again."
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'coach',
        text: "Hello! I am your CloudHire AI Career Guide. 🚀 I can help you validate your cloud skill levels, map study programs, suggest cert preparation tracks, or optimize your resume for applicant scanners. Ask me anything!",
        suggestions: ["Cloud Engineer roadmap", "How to study Terraform?", "Improve my resume"]
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col justify-between animate-fadeIn space-y-4">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bot className="text-brand-neonCyan w-7 h-7" />
            <span>AI Career Guidance Coach</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Discuss cloud roadmaps, certification pathways, and resume improvements.
          </p>
        </div>
        <button
          onClick={handleResetChat}
          className="p-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer rounded-lg hover:bg-slate-800"
          title="Reset Conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Messaging Container */}
      <div className="flex-1 glass-panel rounded-xl border border-slate-850 p-6 overflow-y-auto flex flex-col space-y-4 min-h-0">
        
        {messages.map((msg) => {
          const isCoach = msg.sender === 'coach';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[80%] ${
                isCoach ? 'self-start' : 'self-end flex-row-reverse'
              }`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                isCoach 
                  ? 'bg-brand-navy border-brand-neonCyan/30 text-brand-neonCyan' 
                  : 'bg-brand-indigo/30 border-brand-indigo/40 text-brand-indigo'
              }`}>
                {isCoach ? <Bot className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
              </div>

              {/* Message text bubble */}
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isCoach 
                    ? 'bg-slate-800/40 text-slate-200 border border-slate-800 rounded-tl-sm' 
                    : 'bg-brand-indigo text-white rounded-tr-sm'
                }`}>
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
                  ))}
                </div>

                {/* Suggestions Quick Buttons for Coach Messages */}
                {isCoach && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-2">
                    {msg.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-800 hover:border-brand-neonCyan/50 bg-brand-navy/60 hover:bg-brand-neonCyan/5 text-slate-400 hover:text-brand-neonCyan cursor-pointer transition-all"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })}

        {sending && (
          <div className="flex gap-3 self-start max-w-[80%]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-navy border border-brand-neonCyan/30 text-brand-neonCyan">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl rounded-tl-sm text-slate-500 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-neonCyan" />
              <span>Analyzing response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Box */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="glass-panel rounded-xl border border-slate-850 p-2 flex gap-2 items-center"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about DevOps skills, AWS certifications, or resume feedback..."
          className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-200 placeholder-slate-650 outline-none"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="p-2.5 bg-brand-neonCyan hover:bg-brand-neonCyan/85 text-brand-navy rounded-lg cursor-pointer transition-colors disabled:opacity-35"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
