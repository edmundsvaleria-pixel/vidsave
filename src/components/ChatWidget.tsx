// src/components/ChatWidget.tsx
"use client";
import { MessageCircle, X, Send } from 'lucide-react';
import { useState } from 'react';

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
};

const QUICK_REPLIES = [
  "How much is Pro?",
  "What is Batch Mode?",
  "How do I get an API key?"
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "bot", text: "Hi! I'm the SwiftSave bot. Ask me anything about our plans, features, or platforms!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: "bot", 
        text: data.reply || "Sorry, I couldn't understand that." 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "bot", text: "Network error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-[#0A0A0A] border border-[#27272A] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-[#27272A] flex justify-between items-center bg-[#141416]">
            <span className="text-white font-semibold text-sm">SwiftSave Support</span>
            <button onClick={() => setIsOpen(false)} className="text-[#A1A1AA] hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`text-[12px] p-3 rounded-lg leading-relaxed ${m.role === 'user' ? 'bg-[#3B82F6] text-white ml-auto max-w-[85%]' : 'bg-[#27272A] text-white mr-auto max-w-[85%]'}`}>
                {m.text}
              </div>
            ))}
            {isLoading && (
              <div className="text-[12px] text-[#A1A1AA] mr-auto animate-pulse">Typing...</div>
            )}
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(reply)}
                  className="text-[10px] font-medium text-[#3B82F6] border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1.5 rounded-full hover:bg-[#3B82F6]/20 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleFormSubmit} className="p-3 border-t border-[#27272A] flex gap-2">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask a question..." 
              className="flex-1 bg-[#0A0A0A] border border-[#27272A] rounded-lg px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[#3B82F6]" 
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="bg-[#3B82F6] text-white px-3 py-2 rounded-lg text-[12px] hover:bg-[#2563EB] disabled:opacity-50 transition-colors">
              <Send size={14} />
            </button>
          </form>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="h-14 w-14 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
}