import React, { useState } from 'react';
import { AppSettings, Agency, Category } from '../types';
import { X, Trash2, Plus, Download, Upload, Building2, Layers, FilePlus } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  agencies: Agency[];
  categories: Category[];
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  onMergeRestore: (file: File) => void;
  onAddAgency: (name: string) => void;
  onDeleteAgency: (id: string) => void;
  onAddCategory: (agencyId: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  settings, 
  agencies,
  categories,
  onSave, 
  onClose, 
  onBackup, 
  onRestore,
  onMergeRestore,
  onAddAgency,
  onDeleteAgency,
  onAddCategory,
  onDeleteCategory
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(JSON.parse(JSON.stringify(settings)));
  const [newRssName, setNewRssName] = useState('');
  const [newRssUrl, setNewRssUrl] = useState('');
  const [newRssCategory, setNewRssCategory] = useState('عربى');
  const [newAgencyName, setNewAgencyName] = useState('');
  const [activeAgencyId, setActiveAgencyId] = useState<string | null>(agencies[0]?.id || null);
  const [newCatName, setNewCatName] = useState('');

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const addRss = () => {
    if (newRssName && newRssUrl) {
      setLocalSettings({
        ...localSettings,
        rssSources: [...localSettings.rssSources, { 
          id: Date.now().toString(), 
          name: newRssName, 
          url: newRssUrl,
          category: newRssCategory 
        }]
      });
      setNewRssName('');
      setNewRssUrl('');
    }
  };

  const removeRss = (id: string) => {
    setLocalSettings({
      ...localSettings,
      rssSources: localSettings.rssSources.filter(r => r.id !== id)
    });
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[900px]">
        <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-black text-2xl text-slate-800">إعدادات المنصة الشاملة</h3>
            <p className="text-xs text-slate-400 font-bold mt-1">تخصيص الهوية، المصادر، والبيانات</p>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"><X size={24}/></button>
        </div>
        
        <div className="p-6 lg:p-10 space-y-12 overflow-y-auto custom-scrollbar flex-1">
          {/* Section: Identity */}
          <section>
            <h4 className="text-xs font-black text-blue-600 mb-6 uppercase tracking-widest flex items-center gap-3">
              <span className="w-3 h-3 bg-blue-600 rounded-full shadow-lg shadow-blue-200" /> هوية المحرر 
            </h4>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <label className="block text-[11px] font-black text-slate-400 mb-2 mr-2">الاسم الذي سيظهر في التوقيع</label>
              <input 
                value={localSettings.authorName}
                onChange={(e) => setLocalSettings({...localSettings, authorName: e.target.value})}
                className="w-full p-4 bg-white rounded-2xl outline-none border-2 border-transparent focus:border-blue-400 transition-all font-bold text-slate-700 shadow-sm"
                placeholder="مثال: يحيى المحمد"
              />
            </div>
          </section>

          {/* Section: Organizational Agencies Management */}
          <section className="border-t border-slate-100 pt-10">
            <h4 className="text-xs font-black text-indigo-600 mb-6 uppercase tracking-widest flex items-center gap-3">
               <span className="w-3 h-3 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200" /> إدارة المؤسسات والتصنيفات
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Agency List */}
              <div className="space-y-4">
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                  <div className="flex gap-2 mb-4">
                    <input 
                      value={newAgencyName} onChange={(e) => setNewAgencyName(e.target.value)}
                      placeholder="اسم وكالة/مؤسسة جديدة" className="flex-1 p-3 bg-white border border-indigo-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-400" 
                    />
                    <button 
                      onClick={() => { if(newAgencyName) { onAddAgency(newAgencyName); setNewAgencyName(''); } }}
                      className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                    {agencies.map(agency => (
                      <div 
                        key={agency.id} 
                        onClick={() => setActiveAgencyId(agency.id)}
                        className={`flex justify-between items-center p-3 rounded-xl border transition-all cursor-pointer ${activeAgencyId === agency.id ? 'bg-white border-indigo-400 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}
                      >
                        <span className={`text-xs font-black ${activeAgencyId === agency.id ? 'text-indigo-600' : 'text-slate-600'}`}>{agency.name}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); if(window.confirm('حذف الوكالة سيحذف جميع تصنيفاتها ومقالاتها. هل أنت متأكد؟')) onDeleteAgency(agency.id); }}
                          className="p-1.5 text-slate-300 hover:text-red-500 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category List for Selected Agency */}
              <div className="space-y-4">
                {activeAgencyId ? (
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    <div className="flex gap-2 mb-4">
                      <input 
                        value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                        placeholder={`إضافة تصنيف لـ ${agencies.find(a => a.id === activeAgencyId)?.name}`}
                        className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-400" 
                      />
                      <button 
                        onClick={() => { if(newCatName && activeAgencyId) { onAddCategory(activeAgencyId, newCatName); setNewCatName(''); } }}
                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                      {categories.filter(c => c.agencyId === activeAgencyId).map(cat => (
                        <div key={cat.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <span className="text-xs font-bold text-slate-600">{cat.name}</span>
                          <button 
                            onClick={() => { if(window.confirm('هل تريد حذف هذا التصنيف؟')) onDeleteCategory(cat.id); }}
                            className="p-1.5 text-slate-300 hover:text-red-500 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-10">
                    اختر مؤسسة لإدارة تصنيفات الأخبار
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section: News Sources (RSS) */}
          <section className="border-t border-slate-100 pt-10">
            <h4 className="text-xs font-black text-orange-600 mb-6 uppercase tracking-widest flex items-center gap-3">
               <span className="w-3 h-3 bg-orange-600 rounded-full shadow-lg shadow-orange-100" /> مصادر جلب الأخبار (RSS)
            </h4>
            <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <input 
                  value={newRssName} onChange={(e) => setNewRssName(e.target.value)}
                  placeholder="اسم الوكالة الإخبارية" className="flex-1 p-4 bg-white border-2 border-transparent focus:border-orange-400 rounded-2xl text-sm font-bold outline-none shadow-sm transition-all" 
                />
                <input 
                  value={newRssUrl} onChange={(e) => setNewRssUrl(e.target.value)}
                  placeholder="رابط XML Feed المباشر" className="flex-[2] p-4 bg-white border-2 border-transparent focus:border-orange-400 rounded-2xl text-sm outline-none dir-ltr text-left font-mono shadow-sm transition-all" 
                />
                <select 
                  value={newRssCategory} onChange={(e) => setNewRssCategory(e.target.value)}
                  className="p-4 bg-white border-2 border-transparent focus:border-orange-400 rounded-2xl text-sm font-bold outline-none shadow-sm transition-all cursor-pointer"
                >
                  <option value="عالمي">عالمي</option>
                  <option value="عربي">عربي</option>
                  <option value="سوري">سوري</option>
                  <option value="رياضي">رياضي</option>
                  <option value="تقني">تقني</option>
                </select>
              </div>
              <button onClick={addRss} className="w-full bg-slate-900 text-white p-5 rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3">
                 <Plus size={20}/> تسجيل مصدر إخباري جديد
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {localSettings.rssSources.map(rss => (
                <div key={rss.id} className="flex justify-between items-center p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group border-b-4 border-b-orange-200">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-black text-slate-800">{rss.name}</span>
                       {rss.category && <span className="text-[8px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-black uppercase">{rss.category}</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px] font-mono">{rss.url}</span>
                  </div>
                  <button onClick={() => removeRss(rss.id)} className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Cloud Data */}
          <section className="border-t border-slate-100 pt-10">
            <h4 className="text-xs font-black text-purple-600 mb-6 uppercase tracking-widest flex items-center gap-3">
               <span className="w-3 h-3 bg-purple-600 rounded-full shadow-lg shadow-purple-100" /> الصيانة والبيانات السحابية
            </h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onBackup}
                className="flex-1 p-6 bg-purple-50 border border-purple-100 rounded-3xl flex items-center justify-center gap-4 hover:bg-purple-100 transition-all text-purple-700 font-black text-sm group"
              >
                <Download size={22} className="group-hover:translate-y-1 transition-transform" />
                تحميل نسخة كاملة
              </button>
              
              <div className="flex-[2] flex flex-col sm:flex-row gap-4">
                <label className="flex-1 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center gap-4 hover:bg-emerald-100 transition-all text-emerald-700 font-black text-sm cursor-pointer group text-center">
                  <Upload size={22} className="group-hover:-translate-y-1 transition-transform" />
                  استعادة نسخة شاملة
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={(e) => e.target.files && onRestore(e.target.files[0])}
                  />
                </label>

                <label className="flex-1 p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center gap-4 hover:bg-blue-100 transition-all text-blue-700 font-black text-sm cursor-pointer group text-center">
                  <FilePlus size={22} className="group-hover:scale-110 transition-transform" />
                  دمج بيانات إضافية
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={(e) => e.target.files && onMergeRestore(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-6 flex items-start gap-3">
               <span className="text-lg">ℹ️</span>
               <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                 دمج البيانات سيقوم بإضافة المؤسسات والتصنيفات والمقالات الجديدة إلى مخزونك الحالي دون حذف أي بيانات موجودة مسبقاً.
               </p>
            </div>
          </section>
        </div>

        <div className="p-8 border-t bg-white flex flex-col sm:flex-row justify-end gap-4 sticky bottom-0 z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <button onClick={onClose} className="px-10 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition order-2 sm:order-1">إلغاء</button>
            <button onClick={handleSave} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] order-1 sm:order-2">حفظ واعتماد التعديلات</button>
        </div>
      </div>
    </div>
  );
};
