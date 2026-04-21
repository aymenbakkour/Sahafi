import React, { useState, useMemo } from 'react';
import { RssItem, RssSource } from '../types';
import { Radio, Search, Filter, Globe } from 'lucide-react';

interface RightPanelProps {
  rssItems: RssItem[];
  rssSources: RssSource[];
  onImportRss: (item: RssItem) => void;
  onRefresh: () => void;
  isLoading: boolean;
  isOpen: boolean;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  rssItems,
  rssSources,
  onImportRss,
  onRefresh,
  isLoading,
  isOpen
}) => {
  const [rssSearch, setRssSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!isOpen) return null;

  const categories = useMemo(() => {
    const cats = new Set(rssSources.map(s => s.category).filter(Boolean));
    return Array.from(cats);
  }, [rssSources]);

  const sourcesInCategory = useMemo(() => {
    if (selectedCategory === 'all') return rssSources;
    return rssSources.filter(s => s.category === selectedCategory);
  }, [rssSources, selectedCategory]);

  const filteredRss = useMemo(() => {
    return rssItems.filter(item => {
      const sourceData = rssSources.find(s => s.name === item.source);
      
      const matchSearch = item.title.toLowerCase().includes(rssSearch.toLowerCase()) ||
                         item.source.toLowerCase().includes(rssSearch.toLowerCase());
      
      const matchCategory = selectedCategory === 'all' || sourceData?.category === selectedCategory;
      const matchSource = selectedSource === 'all' || item.source === selectedSource;

      return matchSearch && matchCategory && matchSource;
    });
  }, [rssItems, rssSources, rssSearch, selectedCategory, selectedSource]);

  return (
    <aside className="w-[300px] lg:w-80 bg-slate-900 flex flex-col flex-none shadow-2xl z-[60] transition-all duration-300 h-full">
      {/* RSS Feed Section */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">المصادر العالمية</span>
            </div>
            <button 
              onClick={onRefresh}
              disabled={isLoading}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all ${isLoading ? 'animate-spin opacity-50' : ''}`}
              title="تحديث الأخبار"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            </button>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text"
                placeholder="بحث في الأخبار..."
                value={rssSearch}
                onChange={(e) => setRssSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-8 pl-3 text-[10px] text-white outline-none focus:border-blue-500/50 transition-all font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSource('all'); }}
                className="bg-white/5 border border-white/10 rounded-xl py-2 px-2 text-[9px] text-white outline-none focus:border-blue-500/50 transition-all font-bold cursor-pointer"
              >
                <option value="all" className="bg-slate-900">كل التصنيفات</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                ))}
              </select>

              <select 
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2 px-2 text-[9px] text-white outline-none focus:border-blue-500/50 transition-all font-bold cursor-pointer"
              >
                <option value="all" className="bg-slate-900">كل القنوات</option>
                {sourcesInCategory.map(source => (
                  <option key={source.id} value={source.name} className="bg-slate-900">{source.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[9px] text-slate-500 block font-bold tracking-tight">اضغط لاستيراد الخبر للمحرر</span>
            <span className="text-[9px] text-blue-400 font-bold">{filteredRss.length} خبر</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {filteredRss.map((item, idx) => (
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
            <div className="text-center py-12">
              <div className="mb-4 opacity-20 flex justify-center">
                <Globe size={48} className="animate-pulse" />
              </div>
              <div className="text-slate-600 text-xs font-bold">جاري جلب آخر الأخبار...</div>
            </div>
          )}
          {filteredRss.length === 0 && rssItems.length > 0 && (
            <div className="text-center py-12 text-slate-600 text-xs font-bold">لا يوجد نتائج تطابق الفلترة الحالية</div>
          )}
        </div>
      </div>
    </aside>
  );
};
