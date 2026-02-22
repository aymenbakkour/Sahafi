import React, { useState, useEffect, useMemo } from 'react';
import { Agency, Article, Category, AppSettings, RssItem, ChatMessage, Toast } from './types';
import { DEFAULT_SETTINGS, INITIAL_AGENCIES, INITIAL_CATEGORIES } from './constants';
import { storageService } from './services/storageService';
import { rssService } from './services/rssService';
import { docService } from './services/docService';

import { NewsTicker } from './components/NewsTicker';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { RightPanel } from './components/RightPanel';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
  // State: Data
  const [agencies, setAgencies] = useState<Agency[]>(() => storageService.load(storageService.KEYS.AGENCIES, INITIAL_AGENCIES));
  const [categories, setCategories] = useState<Category[]>(() => storageService.load(storageService.KEYS.CATEGORIES, INITIAL_CATEGORIES));
  const [articles, setArticles] = useState<Article[]>(() => storageService.load(storageService.KEYS.ARTICLES, []));
  const [settings, setSettings] = useState<AppSettings>(() => storageService.load(storageService.KEYS.SETTINGS, DEFAULT_SETTINGS));
  
  // State: UI & Selection
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('1');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  
  // Replaced activeArticle object state with ID state to prevent stale closure bugs in Editor
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  
  // Derived state
  const activeArticle = useMemo(() => 
    articles.find(a => a.id === activeArticleId) || null,
  [articles, activeArticleId]);

  // State: Features
  const [rssItems, setRssItems] = useState<RssItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [wordCount, setWordCount] = useState(0);

  // --- Auto Save & Persistence ---
  useEffect(() => {
    storageService.save(storageService.KEYS.AGENCIES, agencies);
  }, [agencies]);

  useEffect(() => {
    storageService.save(storageService.KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    storageService.save(storageService.KEYS.ARTICLES, articles);
  }, [articles]);

  useEffect(() => {
    storageService.save(storageService.KEYS.SETTINGS, settings);
  }, [settings]);

  // --- Word Count Effect ---
  useEffect(() => {
    if (activeArticle) {
      const text = activeArticle.content.replace(/<[^>]*>/g, ' ').trim();
      setWordCount(text ? text.split(/\s+/).length : 0);
    } else {
      setWordCount(0);
    }
  }, [activeArticle]);

  // --- RSS Fetcher Loop ---
  useEffect(() => {
    const fetchNews = async () => {
      if (settings.rssSources.length > 0) {
        try {
          const items = await rssService.fetchFeeds(settings.rssSources);
          setRssItems(items);
        } catch (e) {
          console.error("RSS Fetch Error", e);
        }
      }
    };
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [settings.rssSources]);

  // --- Helpers ---
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // --- Actions ---

  const handleCreateArticle = () => {
    if (!selectedCatId) {
      addToast('اختر تصنيفاً أولاً', 'error');
      return;
    }
    const newId = Date.now().toString();
    const newArticle: Article = {
      id: newId,
      agencyId: selectedAgencyId,
      catId: selectedCatId,
      title: '',
      content: '',
      date: new Date().toLocaleDateString('ar-EG'),
      lastModified: Date.now()
    };
    setArticles(prev => [newArticle, ...prev]);
    setActiveArticleId(newId);
    addToast('تم إنشاء مسودة جديدة');
  };

  const handleDeleteArticle = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المسودة؟')) {
      setArticles(prev => prev.filter(a => a.id !== id));
      if (activeArticleId === id) setActiveArticleId(null);
      addToast('تم حذف المسودة', 'info');
    }
  };

  const handleArticleChange = (content: string) => {
    if (!activeArticleId) return;
    setArticles(prev => prev.map(a => 
      a.id === activeArticleId 
        ? { ...a, content, lastModified: Date.now() } 
        : a
    ));
  };

  const handleTitleChange = (title: string) => {
    if (!activeArticleId) return;
    setArticles(prev => prev.map(a => 
      a.id === activeArticleId 
        ? { ...a, title, lastModified: Date.now() } 
        : a
    ));
  };

  const handleImportRss = (item: RssItem) => {
    if (!selectedCatId) {
      addToast('يرجى اختيار تصنيف لاستيراد الخبر', 'error');
      return;
    }
    const newId = Date.now().toString();
    const newArticle: Article = {
      id: newId,
      agencyId: selectedAgencyId,
      catId: selectedCatId,
      title: item.title,
      content: `<p><b>المصدر: ${item.source}</b></p><br/><p>جاري تحرير الخبر...</p>`,
      date: new Date().toLocaleDateString('ar-EG'),
      lastModified: Date.now()
    };
    setArticles(prev => [newArticle, ...prev]);
    setActiveArticleId(newId);
    addToast('تم استيراد الخبر بنجاح');
  };

  const handleImportDocx = async (file: File) => {
    if (!selectedCatId) return;
    try {
      addToast('جاري التحويل...', 'info');
      const html = await docService.importDocx(file);
      const newId = Date.now().toString();
      const newArticle: Article = {
        id: newId,
        agencyId: selectedAgencyId,
        catId: selectedCatId,
        title: file.name.replace('.docx', ''),
        content: html,
        date: new Date().toLocaleDateString('ar-EG'),
        lastModified: Date.now()
      };
      setArticles(prev => [newArticle, ...prev]);
      setActiveArticleId(newId);
      addToast('تم استيراد ملف Word');
    } catch (e) {
      addToast('فشل الاستيراد', 'error');
    }
  };

  const handleExportDocx = () => {
    if (!activeArticle) return;
    docService.exportDocx(activeArticle.content, activeArticle.title);
    addToast('تم تصدير الملف');
  };

  const handleSendToTelegram = async () => {
    if (!activeArticle) return;
    if (!settings.tgToken || !settings.tgChatId) {
      addToast('يرجى ضبط إعدادات تلغرام أولاً', 'error');
      setShowSettings(true);
      return;
    }
    
    // Optimistic UI update
    const textContent = activeArticle.content.replace(/<[^>]+>/g, '\n');
    const msg: ChatMessage = {
      id: Date.now().toString(),
      text: `تم إرسال المسودة: ${activeArticle.title}`,
      fromMe: true,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, msg]);

    try {
      const payload = {
        chat_id: settings.tgChatId,
        text: `📢 *${activeArticle.title || 'بدون عنوان'}*\n\n${textContent}`,
        parse_mode: 'Markdown'
      };
      await fetch(`https://api.telegram.org/bot${settings.tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      addToast('تم الإرسال للمراسل');
    } catch (e) {
      addToast('فشل الاتصال بتلغرام', 'error');
    }
  };

  const handleSendChat = (text: string) => {
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      fromMe: true,
      timestamp: Date.now()
    }]);
    // Simulate reply
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'تم الاستلام، سأقوم بالمتابعة.',
        fromMe: false,
        timestamp: Date.now()
      }]);
    }, 1500);
  };

  const handleAddAgency = () => {
    const name = prompt('اسم الوكالة الجديدة:');
    if (name) setAgencies(prev => [...prev, { id: Date.now().toString(), name }]);
  };

  const handleAddCategory = () => {
    const name = prompt('اسم التصنيف الجديد:');
    if (name) setCategories(prev => [...prev, { id: Date.now().toString(), agencyId: selectedAgencyId, name }]);
  };

  // Helper to set active article from sidebar
  const handleSelectArticle = (article: Article) => {
    setActiveArticleId(article.id);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden font-sans text-right" dir="rtl">
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[9999]">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg text-white font-bold text-sm animate-bounce ${
            t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }`}>
            {t.message}
          </div>
        ))}
      </div>

      {/* Top Ticker */}
      {!isFocusMode && <NewsTicker items={rssItems} />}

      {/* Main Header */}
      {!isFocusMode && <Header onOpenSettings={() => setShowSettings(true)} onExport={handleExportDocx} />}

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Navigation) */}
        {!isFocusMode && (
          <Sidebar 
            agencies={agencies}
            categories={categories}
            articles={articles}
            selectedAgencyId={selectedAgencyId}
            selectedCatId={selectedCatId}
            activeArticleId={activeArticleId}
            onSelectAgency={setSelectedAgencyId}
            onSelectCategory={setSelectedCatId}
            onSelectArticle={handleSelectArticle}
            onDeleteArticle={handleDeleteArticle}
            onCreateArticle={handleCreateArticle}
            onImportDocx={handleImportDocx}
            onAddAgency={handleAddAgency}
            onAddCategory={handleAddCategory}
          />
        )}

        {/* Center Editor */}
        <main className="flex-1 flex flex-col relative bg-white z-10 shadow-xl">
          {activeArticle ? (
            <Editor 
              initialContent={activeArticle.content}
              title={activeArticle.title}
              onTitleChange={handleTitleChange}
              onChange={handleArticleChange}
              onSendToTelegram={handleSendToTelegram}
              authorName={settings.authorName}
              fontSize={fontSize}
              setFontSize={setFontSize}
              isFocusMode={isFocusMode}
              setIsFocusMode={setIsFocusMode}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50">
              <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">✒️</span>
              </div>
              <h2 className="text-xl font-bold text-slate-500 mb-2">مرحباً بك في غرفة الأخبار</h2>
              <p className="text-sm">اختر وكالة وتصنيفاً للبدء في تحرير الأخبار</p>
            </div>
          )}
          
          {/* Status Bar */}
          <div className="h-8 bg-white border-t border-slate-200 flex items-center justify-between px-6 text-[10px] text-slate-400 font-bold select-none">
            <div className="flex gap-4">
              <span>الكلمات: {wordCount}</span>
              <span>الحالة: {activeArticle ? 'تم الحفظ تلقائياً' : 'جاهز'}</span>
            </div>
            <span>v2.0.0 Pro</span>
          </div>
        </main>

        {/* Right Sidebar (Tools) */}
        {!isFocusMode && (
          <RightPanel 
            rssItems={rssItems}
            onImportRss={handleImportRss}
            chatMessages={chatMessages}
            onSendChat={handleSendChat}
          />
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal 
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;