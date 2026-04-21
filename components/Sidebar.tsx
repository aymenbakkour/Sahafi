import React, { useState } from 'react';
import { Agency, Article, Category } from '../types';
import { PlusCircle, FolderPlus, Trash2, FileText, Upload, Search, Filter } from 'lucide-react';

interface SidebarProps {
  agencies: Agency[];
  categories: Category[];
  articles: Article[];
  selectedAgencyId: string;
  selectedCatId: string | null;
  activeArticleId: string | null;
  onSelectAgency: (id: string) => void;
  onSelectCategory: (id: string) => void;
  onSelectArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onCreateArticle: () => void;
  onImportDocx: (file: File) => void;
  onAddAgency: () => void;
  onAddCategory: () => void;
  onDeleteCategory: (id: string) => void;
  onDeleteAgency: (id: string) => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  agencies,
  categories,
  articles,
  selectedAgencyId,
  selectedCatId,
  activeArticleId,
  onSelectAgency,
  onSelectCategory,
  onSelectArticle,
  onDeleteArticle,
  onCreateArticle,
  onImportDocx,
  onAddAgency,
  onAddCategory,
  onDeleteCategory,
  onDeleteAgency,
  isOpen
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const currentCategories = categories.filter(c => c.agencyId === selectedAgencyId);
  const filteredArticles = articles.filter(a => {
    const matchesCategory = a.catId === selectedCatId;
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <aside className="w-[300px] lg:w-80 bg-white border-l border-slate-200 flex flex-col flex-none overflow-hidden z-[60] shadow-2xl transition-all duration-300 h-full">
      {/* Agencies Section */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الوكالات</span>
          <button onClick={onAddAgency} className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors">
            <PlusCircle size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
          {agencies.map(ag => (
            <div key={ag.id} className="relative group flex-grow">
              <button 
                onClick={() => onSelectAgency(ag.id)}
                className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all border w-full text-center ${
                  selectedAgencyId === ag.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {ag.name}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteAgency(ag.id);
                }}
                className={`absolute left-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${
                  selectedAgencyId === ag.id 
                    ? 'text-blue-200 hover:text-white hover:bg-blue-500' 
                    : 'text-slate-300 hover:text-red-500 hover:bg-slate-100'
                }`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Categories & Articles Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Categories Pills */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase">التصنيفات الداخلية</span>
            <button onClick={onAddCategory} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-colors">
              <FolderPlus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentCategories.map(cat => (
              <div key={cat.id} className="relative group">
                <button 
                  onClick={() => onSelectCategory(cat.id)}
                  className={`pl-4 pr-8 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                    selectedCatId === cat.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {cat.name}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(cat.id);
                  }}
                  className={`absolute left-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${
                    selectedCatId === cat.id 
                      ? 'text-emerald-200 hover:text-white hover:bg-emerald-500' 
                      : 'text-slate-300 hover:text-red-500 hover:bg-slate-100'
                  }`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {currentCategories.length === 0 && <span className="text-[10px] text-slate-400 italic">لا توجد تصنيفات</span>}
          </div>
        </div>

        {/* Article List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50">
          {selectedCatId ? (
            <>
              {/* Filter & Search Tools */}
              <div className="mb-4 space-y-2">
                <div className="relative group">
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="ابحث في المقالات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pr-9 pl-3 text-[11px] outline-none focus:border-blue-400 transition-all font-bold placeholder:text-slate-300"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={onCreateArticle} 
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={14} /> مقال جديد
                  </button>
                  <label className="flex items-center justify-center w-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl cursor-pointer shadow-lg shadow-amber-100 transition-all" title="استيراد Word">
                    <Upload size={14} />
                    <input type="file" className="hidden" onChange={(e) => e.target.files && onImportDocx(e.target.files[0])} accept=".docx" />
                  </label>
                </div>
              </div>

              {filteredArticles.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs italic">
                  المجلد فارغ، ابدأ بالكتابة
                </div>
              )}

              {filteredArticles.map(art => (
                <div 
                  key={art.id} 
                  onClick={() => onSelectArticle(art)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all group relative ${
                    activeArticleId === art.id 
                      ? 'bg-white ring-2 ring-blue-500 shadow-lg z-10' 
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <h4 className={`text-[11px] font-bold line-clamp-2 ${activeArticleId === art.id ? 'text-blue-700' : 'text-slate-700'}`}>
                    {art.title || 'بدون عنوان'}
                  </h4>
                  <div className="flex justify-between mt-3 items-end">
                    <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{art.date}</span>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onDeleteArticle(art.id); 
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all p-2 rounded-full z-30 relative"
                      title="حذف المقال"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
             <div className="flex flex-col items-center justify-center h-40 text-slate-300">
               <span className="text-xs">اختر تصنيفاً لعرض المحتوى</span>
             </div>
          )}
        </div>
      </div>
    </aside>
  );
};
