import React, { useState } from 'react';
import { RssItem, ChatMessage } from '../types';
import { Radio, ChevronDown, ChevronUp, Send, User, Bot } from 'lucide-react';

interface RightPanelProps {
  rssItems: RssItem[];
  onImportRss: (item: RssItem) => void;
  chatMessages: ChatMessage[];
  onSendChat: (text: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  rssItems,
  onImportRss,
  chatMessages,
  onSendChat
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendChat(inputText);
    setInputText('');
  };

  return (
    <aside className="w-80 bg-slate-900 flex flex-col flex-none shadow-2xl z-30">
      {/* RSS Feed Section */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2 mb-1">
            <Radio size={14} className="text-red-500 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">المصادر العالمية (RSS)</span>
          </div>
          <span className="text-[9px] text-slate-400 block mt-1">اضغط على الخبر لاستيراده للمحرر</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {rssItems.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => onImportRss(item)}
              className="p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-blue-600/20 hover:border-blue-500/30 group transition-all duration-200"
            >
              <div className="text-[9px] text-blue-400 font-bold group-hover:text-blue-300 mb-1 flex justify-between">
                <span>{item.source}</span>
                <span className="text-white/20 group-hover:text-white/50 text-[8px]">استيراد</span>
              </div>
              <div className="text-[11px] text-slate-300 leading-relaxed group-hover:text-white font-medium">
                {item.title}
              </div>
            </div>
          ))}
          {rssItems.length === 0 && (
            <div className="text-center py-8 text-slate-600 text-xs">جاري جلب الأخبار...</div>
          )}
        </div>
      </div>

      {/* Telegram Section */}
      <div className={`bg-slate-950 border-t border-white/10 flex flex-col transition-all duration-300 ease-in-out ${chatOpen ? 'h-[400px]' : 'h-12'}`}>
        <div 
          onClick={() => setChatOpen(!chatOpen)} 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        >
          <span className="text-[10px] font-black text-white uppercase flex items-center gap-2">
            <Bot size={14} className="text-blue-500" />
            المراسل الميداني
          </span>
          {chatOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronUp size={14} className="text-slate-500" />}
        </div>

        {chatOpen && (
          <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {chatMessages.length === 0 && <p className="text-center text-xs text-slate-600 mt-4">لا توجد رسائل حالياً</p>}
              {chatMessages.map(m => (
                <div 
                  key={m.id} 
                  className={`p-3 rounded-2xl text-[11px] max-w-[85%] relative ${
                    m.fromMe 
                      ? 'bg-blue-600 text-white self-end mr-auto rounded-br-none' 
                      : 'bg-slate-800 text-slate-200 self-start ml-auto rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-900 border-t border-white/5 flex gap-2">
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="تعليمات للمراسل..." 
                className="flex-1 bg-white/5 text-xs text-white px-3 py-2 rounded-xl outline-none border border-white/10 focus:border-blue-500/50 transition-colors"
              />
              <button 
                onClick={handleSend}
                className="bg-blue-600 text-white w-9 h-9 rounded-xl hover:bg-blue-500 flex items-center justify-center transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
