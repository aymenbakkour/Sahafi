import React, { useState } from 'react';
import { AppSettings } from '../types';
import { X, Trash2, Plus } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(JSON.parse(JSON.stringify(settings)));
  const [newRssName, setNewRssName] = useState('');
  const [newRssUrl, setNewRssUrl] = useState('');

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const addRss = () => {
    if (newRssName && newRssUrl) {
      setLocalSettings({
        ...localSettings,
        rssSources: [...localSettings.rssSources, { id: Date.now().toString(), name: newRssName, url: newRssUrl }]
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
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-black text-xl text-slate-800">إعدادات المنصة</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X /></button>
        </div>
        
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          <section>
            <h4 className="text-xs font-black text-blue-600 mb-4 uppercase tracking-wider">اسم المحرر (للتوثيق)</h4>
            <input 
              value={localSettings.authorName}
              onChange={(e) => setLocalSettings({...localSettings, authorName: e.target.value})}
              className="w-full p-4 bg-slate-100 rounded-2xl outline-none border-2 border-transparent focus:border-blue-200 transition-all font-bold text-slate-700"
              placeholder="الاسم الكامل"
            />
          </section>

          <section className="border-t border-slate-100 pt-6">
            <h4 className="text-xs font-black text-orange-600 mb-4 uppercase tracking-wider">مصادر RSS المخصصة</h4>
            <div className="flex gap-2 mb-4">
              <input 
                value={newRssName} onChange={(e) => setNewRssName(e.target.value)}
                placeholder="اسم المصدر" className="flex-1 p-3 bg-slate-50 border rounded-xl text-xs outline-none focus:border-orange-300" 
              />
              <input 
                value={newRssUrl} onChange={(e) => setNewRssUrl(e.target.value)}
                placeholder="الرابط XML" className="flex-[2] p-3 bg-slate-50 border rounded-xl text-xs outline-none focus:border-orange-300 dir-ltr text-left" 
              />
              <button onClick={addRss} className="bg-slate-900 text-white px-4 rounded-xl text-xs hover:bg-slate-800"><Plus size={16}/></button>
            </div>
            <div className="space-y-2">
              {localSettings.rssSources.map(rss => (
                <div key={rss.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">{rss.name}</span>
                  <button onClick={() => removeRss(rss.id)} className="text-red-300 hover:text-red-500 transition"><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-slate-100 pt-6">
            <h4 className="text-xs font-black text-blue-600 mb-4 uppercase tracking-wider">اتصال تلغرام (Bot API)</h4>
            <div className="grid grid-cols-2 gap-4">
              <input 
                value={localSettings.tgToken}
                onChange={(e) => setLocalSettings({...localSettings, tgToken: e.target.value})}
                placeholder="Bot Token" className="p-4 bg-slate-100 rounded-2xl text-xs outline-none dir-ltr text-left" 
              />
              <input 
                value={localSettings.tgChatId}
                onChange={(e) => setLocalSettings({...localSettings, tgChatId: e.target.value})}
                placeholder="Chat ID" className="p-4 bg-slate-100 rounded-2xl text-xs outline-none dir-ltr text-left" 
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">مطلوب لإرسال المسودات للمراسلين الميدانيين.</p>
          </section>
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
            <button onClick={onClose} className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition">إلغاء</button>
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">حفظ التغييرات</button>
        </div>
      </div>
    </div>
  );
};
