import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Link as LinkIcon, AlignRight, AlignCenter, 
  AlignLeft, Type, Eraser, PenTool, Send
} from 'lucide-react';

interface EditorProps {
  initialContent: string;
  title: string;
  onTitleChange: (title: string) => void;
  onChange: (content: string) => void;
  onSendToTelegram: () => void;
  authorName: string;
  fontSize: number;
  setFontSize: (size: number) => void;
  isFocusMode: boolean;
  setIsFocusMode: (v: boolean) => void;
}

export const Editor: React.FC<EditorProps> = ({ 
  initialContent, 
  title,
  onTitleChange,
  onChange, 
  onSendToTelegram,
  authorName,
  fontSize,
  setFontSize,
  isFocusMode,
  setIsFocusMode
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Update content only when article changes completely to avoid cursor jumping
  // We compare with the initialContent passed via props which reflects the DB state.
  // If the user types, onChange updates the DB, which updates initialContent.
  // We must ensure we don't reset innerHTML if it matches to avoid cursor reset.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      // Check if the difference is meaningful (sometimes browsers add extra attributes)
      // For simplicity, we trust the equality check. 
      // If the user is typing, React updates happen. 
      // To prevent cursor jump, we strictly check inequality.
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const cleanText = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      // Simple cleaning logic
      const cleaned = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
      editorRef.current.innerText = cleaned;
      handleInput();
    }
  };

  const addSignature = () => {
    if (editorRef.current) {
      const sig = `<br><p dir="rtl" style="color:#1e40af; font-weight:bold; border-top:1px solid #ddd; padding-top:10px; margin-top:20px;">✍️ تحرير: ${authorName || 'المحرر'}</p>`;
      exec('insertHTML', sig);
    }
  };

  const addLink = () => {
    const url = prompt('أدخل الرابط:', 'https://');
    if (url) exec('createLink', url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b bg-white flex flex-wrap gap-2 items-center shadow-sm sticky top-0 z-30">
        <div className="flex bg-slate-50 rounded-lg border border-slate-200 p-1 gap-1">
          <ToolBtn onClick={() => exec('bold')} icon={<Bold size={16} />} />
          <ToolBtn onClick={() => exec('italic')} icon={<Italic size={16} />} />
          <ToolBtn onClick={addLink} icon={<LinkIcon size={16} />} className="text-blue-500" />
        </div>

        <div className="flex bg-slate-50 rounded-lg border border-slate-200 p-1 gap-1">
          <ToolBtn onClick={() => exec('justifyRight')} icon={<AlignRight size={16} />} />
          <ToolBtn onClick={() => exec('justifyCenter')} icon={<AlignCenter size={16} />} />
          <ToolBtn onClick={() => exec('justifyLeft')} icon={<AlignLeft size={16} />} />
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-1 h-9">
          <Type size={14} className="text-slate-400" />
          <input 
            type="range" 
            min="12" 
            max="32" 
            value={fontSize} 
            onChange={(e) => setFontSize(parseInt(e.target.value))} 
            className="w-24 h-1 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-[10px] font-bold text-blue-600 w-8 text-center">{fontSize}px</span>
        </div>

        <div className="flex gap-2 mr-2">
            <button onClick={cleanText} className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] font-bold text-emerald-600 transition-colors flex items-center gap-1">
                <Eraser size={12} /> تنظيف
            </button>
            <button onClick={addSignature} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1">
                <PenTool size={12} /> توقيعي
            </button>
        </div>

        <button 
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`mr-auto p-2 rounded-lg transition-colors ${isFocusMode ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
            title="وضع التركيز"
        >
            <div className={`w-4 h-4 border-2 border-current rounded-sm transition-all ${isFocusMode ? 'scale-110' : ''}`} />
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:px-32 relative" onClick={() => editorRef.current?.focus()}>
        <div className="max-w-4xl mx-auto min-h-full flex flex-col">
          
          <div className="flex items-center gap-4 mb-8">
            <input 
              dir="rtl"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="اكتب عنوان الخبر هنا..."
              className="flex-1 text-4xl font-black bg-transparent border-none outline-none placeholder:text-slate-300 text-slate-800 caret-blue-600 py-2"
            />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSendToTelegram();
              }}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
              title="إرسال للمراسل"
            >
              <Send size={20} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div 
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="prose-editor outline-none text-slate-700 leading-loose min-h-[60vh] pb-20"
            style={{ fontSize: `${fontSize}px` }}
          />
        </div>
      </div>
    </div>
  );
};

const ToolBtn: React.FC<{ icon: React.ReactNode, onClick: () => void, className?: string }> = ({ icon, onClick, className }) => (
  <button 
    onClick={onClick} 
    className={`w-8 h-8 flex items-center justify-center rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all ${className || 'text-slate-600'}`}
  >
    {icon}
  </button>
);