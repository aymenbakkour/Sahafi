import React from 'react';
import { SlidersHorizontal, FileOutput, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onExport }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-black italic shadow-blue-200 shadow-lg transform -rotate-3 hover:rotate-0 transition-all duration-300">
          P
        </div>
        <div className="flex flex-col">
          <span className="font-black text-lg text-slate-800 tracking-tight flex items-center gap-2">
            صحفي برو <span className="text-blue-600">2026</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">نظام إدارة المحتوى المتكامل لوكالات الأنباء</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenSettings} 
          className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-xl transition-colors duration-200"
          title="الإعدادات"
        >
          <SlidersHorizontal size={20} />
        </button>
        <button 
          onClick={onExport} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all flex items-center gap-2"
        >
          <FileOutput size={14} />
          <span>تصدير Word</span>
        </button>
      </div>
    </header>
  );
};
