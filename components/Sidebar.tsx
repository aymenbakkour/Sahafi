import React from 'react';
import { Agency, Article, Category } from '../types';
import { PlusCircle, FolderPlus, Trash2, FileText, Upload } from 'lucide-react';

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
  onAddCategory
}) => {

  const currentCategories = categories.filter(c => c.agencyId === selectedAgencyId);
  const filteredArticles = articles.filter(a => a.catId === selectedCatId);

  return (
    <aside className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col flex-none overflow-hidden z-20 shadow-inner">
      {/* Agencies Section */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الوكالات</span>
          <button onClick={onAddAgency} className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors">
            <PlusCircle size={16} />
          </button>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
          {agencies.map(ag => (
            <div 
              key={ag.id}
              onClick={() => onSelectAgency(ag.id)}
              className={`p-3 rounded-xl cursor-pointer font-bold text-xs flex justify-between items-center transition-all duration-200 border ${
                selectedAgencyId === ag.id 
                  ? 'bg-white border-blue-200 shadow-md shadow-blue-50 text-blue-700 border-r-4 border-r-blue-600' 
                  : 'bg-slate-100 border-transparent text-slate-500 hover:bg-white hover:border-slate-200'
              }`}
            >
              {ag.name}
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
              <button 
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                  selectedCatId === cat.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
            {currentCategories.length === 0 && <span className="text-[10px] text-slate-400 italic">لا توجد تصنيفات</span>}
          </div>
        </div>

        {/* Article List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50">
          {selectedCatId ? (
            <>
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={onCreateArticle} 
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  <FileText size={14} /> مسودة جديدة
                </button>
                <label className="flex items-center justify-center w-12 bg-amber-500 hover:bg-amber-600 text-white rounded-lg cursor-pointer shadow-md shadow-amber-200 transition-all" title="استيراد Word">
                  <Upload size={14} />
                  <input type="file" className="hidden" onChange={(e) => e.target.files && onImportDocx(e.target.files[0])} accept=".docx" />
                </label>
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
                      onClick={(e) => { e.stopPropagation(); onDeleteArticle(art.id); }}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="حذف المسودة"
                    >
                      <Trash2 size={14} />
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
