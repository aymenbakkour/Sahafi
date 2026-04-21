import React, { useRef, useEffect } from 'react';
import { Eraser, PenTool, FileOutput } from 'lucide-react';

interface EditorProps {
  initialContent: string;
  title: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onChange: (content: string) => void;
  authorName: string;
  fontSize: number;
  setFontSize: (size: number) => void;
  onExport: () => void;
}

export const Editor: React.FC<EditorProps> = ({ 
  initialContent, 
  title,
  onTitleChange,
  onSave,
  onChange, 
  authorName,
  fontSize,
  setFontSize,
  onExport
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Update content only when article changes completely to avoid cursor jumping
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const cleanText = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      const cleaned = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
      editorRef.current.innerText = cleaned;
      handleInput();
    }
  };

  const addSignature = () => {
    if (editorRef.current) {
      const sig = `<br><p dir="rtl" style="color:#1e40af; font-weight:bold; border-top:1px solid #ddd; padding-top:10px; margin-top:20px;">✍️ تحرير: ${authorName || 'المحرر'}</p>`;
      document.execCommand('insertHTML', false, sig);
      handleInput();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Toolbar - Simplified */}
      <div className="px-4 py-3 border-b bg-white flex flex-wrap gap-2 items-center shadow-sm sticky top-0 z-30 justify-between">
        <div className="flex gap-2">
            <button onClick={cleanText} className="px-4 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs font-bold text-slate-600 hover:text-emerald-600 transition-all flex items-center gap-2">
                <Eraser size={14} /> تنظيف النص
            </button>
            <button onClick={addSignature} className="px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold text-purple-600 transition-all flex items-center gap-2 font-black">
                <PenTool size={14} /> توقيعي
            </button>
            <button onClick={onExport} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
                <FileOutput size={14} /> تصدير Word
            </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              onChange(editorRef.current?.innerHTML || '');
              onSave();
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-12 relative" onClick={() => editorRef.current?.focus()}>
        <div className="max-w-4xl mx-auto min-h-full flex flex-col">
          
          <div className="flex items-center gap-4 mb-6">
            <input 
              dir="rtl"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="اكتب عنوان الخبر هنا..."
              className="flex-1 text-slate-900 bg-transparent caret-blue-600 py-2 outline-none border-none placeholder:text-slate-300 font-black leading-tight"
              style={{ fontSize: `${fontSize * 1.5}px` }}
            />
          </div>

          <div 
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="prose-editor outline-none text-slate-800 leading-relaxed min-h-[60vh] pb-32"
            style={{ fontSize: `${fontSize}px` }}
          />
        </div>
      </div>
    </div>
  );
};