import React from 'react';
import { SlidersHorizontal, PanelLeft, PanelRight } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenSettings, 
  toggleLeftSidebar, 
  toggleRightSidebar,
  isLeftSidebarOpen,
  isRightSidebarOpen
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleRightSidebar}
          className={`p-2 rounded-lg transition-colors ${isRightSidebarOpen ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-100'}`}
          title="تبديل الشريط الجانبي الأيمن"
        >
          <PanelRight size={20} />
        </button>
        
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-black italic shadow-blue-200 shadow-lg transform -rotate-3 hover:rotate-0 transition-all duration-300">
          P
        </div>
        <div className="flex flex-col">
          <span className="font-black text-sm lg:text-lg text-slate-800 tracking-tight flex items-center gap-2">
            صحفي برو <span className="text-blue-600">2026</span>
          </span>
          <span className="text-[9px] lg:text-[10px] text-slate-400 font-medium hidden xs:block">نظام إدارة المحتوى المتكامل لوكالات الأنباء</span>
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
          onClick={toggleLeftSidebar}
          className={`p-2 rounded-lg transition-colors ${isLeftSidebarOpen ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-100'}`}
          title="تبديل الشريط الجانبي الأيسر"
        >
          <PanelLeft size={20} />
        </button>
      </div>
    </header>
  );
};
