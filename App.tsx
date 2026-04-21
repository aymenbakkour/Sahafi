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

import { ConfirmationModal } from './components/ConfirmationModal';
import { InputModal } from './components/InputModal';

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
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isRssLoading, setIsRssLoading] = useState(false);
  
  // State: Sidebars
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // --- Mobile Detection ---
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsLeftSidebarOpen(false);
        setIsRightSidebarOpen(false);
      } else {
        setIsLeftSidebarOpen(true);
        setIsRightSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // State: Delete Confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; articleId: string | null }>({
    isOpen: false,
    articleId: null
  });

  // State: Category Delete Confirmation
  const [deleteCategoryConfirmation, setDeleteCategoryConfirmation] = useState<{ isOpen: boolean; categoryId: string | null }>({
    isOpen: false,
    categoryId: null
  });

  // State: Agency Delete Confirmation
  const [deleteAgencyConfirmation, setDeleteAgencyConfirmation] = useState<{ isOpen: boolean; agencyId: string | null }>({
    isOpen: false,
    agencyId: null
  });

  // State: Input Modal (Add Category)
  const [inputModal, setInputModal] = useState<{ isOpen: boolean; title: string; onConfirm: (val: string) => void }>({
    isOpen: false,
    title: '',
    onConfirm: () => {}
  });

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
      setCharCount(text ? text.length : 0);
    } else {
      setWordCount(0);
      setCharCount(0);
    }
  }, [activeArticle]);

  // --- RSS Fetcher Loop ---
  const fetchNews = async () => {
    if (settings.rssSources.length > 0) {
      setIsRssLoading(true);
      try {
        const items = await rssService.fetchFeeds(settings.rssSources);
        setRssItems(items);
      } catch (e) {
        console.error("RSS Fetch Error", e);
      } finally {
        setIsRssLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Refetch every 5 minutes automatically
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

  const handleSaveAndClose = () => {
    setActiveArticleId(null);
    addToast('تم حفظ المقال وإغلاقه بنجاح');
  };

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
    addToast('تم إنشاء مقال جديد');
  };

  const handleDeleteArticle = (id: string) => {
    setDeleteConfirmation({ isOpen: true, articleId: id });
  };

  const confirmDeleteArticle = () => {
    if (deleteConfirmation.articleId) {
      setArticles(prev => prev.filter(a => a.id !== deleteConfirmation.articleId));
      if (activeArticleId === deleteConfirmation.articleId) setActiveArticleId(null);
      addToast('تم حذف المقال نهائياً', 'info');
    }
    setDeleteConfirmation({ isOpen: false, articleId: null });
  };

  const handleBackup = () => {
    const data = {
      agencies,
      categories,
      articles,
      settings,
      timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journalist-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('تم تحميل النسخة الاحتياطية');
  };

  const handleRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.agencies && json.categories && json.articles && json.settings) {
          if (window.confirm('سيتم استبدال جميع البيانات الحالية بالنسخة الاحتياطية. هل أنت متأكد؟')) {
            setAgencies(json.agencies);
            setCategories(json.categories);
            setArticles(json.articles);
            setSettings(json.settings);
            addToast('تم استعادة البيانات بنجاح');
            setShowSettings(false);
          }
        } else {
          addToast('ملف النسخة الاحتياطية غير صالح', 'error');
        }
      } catch (err) {
        addToast('فشل قراءة ملف النسخة الاحتياطية', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleMergeBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.agencies && json.categories && json.articles) {
          // Merge logic: Append only non-existing IDs to avoid duplicates
          setAgencies(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const newAgencies = json.agencies.filter((a: Agency) => !existingIds.has(a.id));
            return [...prev, ...newAgencies];
          });

          setCategories(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const newCategories = json.categories.filter((c: Category) => !existingIds.has(c.id));
            return [...prev, ...newCategories];
          });

          setArticles(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const newArticles = json.articles.filter((a: Article) => !existingIds.has(a.id));
            return [...prev, ...newArticles];
          });

          if (json.settings?.rssSources) {
            setSettings(prev => {
              const existingUrls = new Set(prev.rssSources.map(s => s.url));
              const newSources = json.settings.rssSources.filter((s: RssSource) => !existingUrls.has(s.url));
              return {
                ...prev,
                rssSources: [...prev.rssSources, ...newSources]
              };
            });
          }

          addToast('تم دمج البيانات المضافة بنجاح');
          setShowSettings(false);
        } else {
          addToast('ملف النسخة الاحتياطية غير صالح للدمج', 'error');
        }
      } catch (err) {
        addToast('فشل قراءة ملف النسخة الاحتياطية', 'error');
      }
    };
    reader.readAsText(file);
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
      content: `<p><b>المصدر: ${item.source}</b></p><br/><p>جاري تحرير المقال...</p>`,
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
    
    const hasContent = activeArticle.content && activeArticle.content.replace(/<[^>]*>/g, '').trim().length > 0;
    const hasTitle = activeArticle.title && activeArticle.title.trim().length > 0;

    if (!hasContent && !hasTitle) {
      addToast('لا يمكن تصدير ملف فارغ. يرجى كتابة عنوان أو محتوى.', 'error');
      return;
    }

    docService.exportDocx(activeArticle.content, activeArticle.title);
    addToast('تم تصدير الملف');
  };

  const handleAddAgency = () => {
    setInputModal({
      isOpen: true,
      title: 'إضافة وكالة جديدة',
      onConfirm: (name) => {
        setAgencies(prev => [...prev, { id: Date.now().toString(), name }]);
        setInputModal(prev => ({ ...prev, isOpen: false }));
        addToast('تم إضافة الوكالة بنجاح');
      }
    });
  };

  const handleAddCategory = () => {
    setInputModal({
      isOpen: true,
      title: 'إضافة تصنيف جديد',
      onConfirm: (name) => {
        setCategories(prev => [...prev, { id: Date.now().toString(), agencyId: selectedAgencyId, name }]);
        setInputModal(prev => ({ ...prev, isOpen: false }));
        addToast('تم إضافة التصنيف بنجاح');
      }
    });
  };

  const handleDeleteCategory = (id: string) => {
    setDeleteCategoryConfirmation({ isOpen: true, categoryId: id });
  };

  const confirmDeleteCategory = () => {
    if (deleteCategoryConfirmation.categoryId) {
      // Check if category has articles
      const hasArticles = articles.some(a => a.catId === deleteCategoryConfirmation.categoryId);
      if (hasArticles) {
        if (!window.confirm('هذا التصنيف يحتوي على مقالات. هل أنت متأكد من حذفه وجميع المقالات بداخله؟')) {
          setDeleteCategoryConfirmation({ isOpen: false, categoryId: null });
          return;
        }
        // Delete articles in this category
        setArticles(prev => prev.filter(a => a.catId !== deleteCategoryConfirmation.categoryId));
      }
      
      setCategories(prev => prev.filter(c => c.id !== deleteCategoryConfirmation.categoryId));
      if (selectedCatId === deleteCategoryConfirmation.categoryId) setSelectedCatId(null);
      addToast('تم حذف التصنيف', 'info');
    }
    setDeleteCategoryConfirmation({ isOpen: false, categoryId: null });
  };

  const handleDeleteAgency = (id: string) => {
    setDeleteAgencyConfirmation({ isOpen: true, agencyId: id });
  };

  const confirmDeleteAgency = () => {
    if (deleteAgencyConfirmation.agencyId) {
      const agencyId = deleteAgencyConfirmation.agencyId;
      
      // Check if agency has categories or articles
      const hasCategories = categories.some(c => c.agencyId === agencyId);
      const hasArticles = articles.some(a => a.agencyId === agencyId);

      if (hasCategories || hasArticles) {
        if (!window.confirm('هذه الوكالة تحتوي على تصنيفات ومقالات. هل أنت متأكد من حذفها وجميع محتوياتها؟')) {
          setDeleteAgencyConfirmation({ isOpen: false, agencyId: null });
          return;
        }
        // Delete content
        setArticles(prev => prev.filter(a => a.agencyId !== agencyId));
        setCategories(prev => prev.filter(c => c.agencyId !== agencyId));
      }

      setAgencies(prev => prev.filter(a => a.id !== agencyId));
      
      // If selected agency is deleted, select the first available one or none
      if (selectedAgencyId === agencyId) {
        const remaining = agencies.filter(a => a.id !== agencyId);
        if (remaining.length > 0) {
          setSelectedAgencyId(remaining[0].id);
        } else {
          // Handle case where no agencies left (maybe create default or handle empty state)
          setSelectedAgencyId(''); 
        }
      }
      
      addToast('تم حذف الوكالة', 'info');
    }
    setDeleteAgencyConfirmation({ isOpen: false, agencyId: null });
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
      <NewsTicker items={rssItems} />

      {/* Main Header */}
      <Header 
        onOpenSettings={() => setShowSettings(true)} 
        toggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        toggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        isLeftSidebarOpen={isLeftSidebarOpen}
        isRightSidebarOpen={isRightSidebarOpen}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar (Navigation) */}
        {(isLeftSidebarOpen || !isMobile) && (
          <div className={`${isMobile ? 'fixed inset-0 z-50 flex shadow-2xl' : 'contents'}`}>
            {isMobile && <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsLeftSidebarOpen(false)} />}
            <Sidebar 
              agencies={agencies}
              categories={categories}
              articles={articles}
              selectedAgencyId={selectedAgencyId}
              selectedCatId={selectedCatId}
              activeArticleId={activeArticleId}
              onSelectAgency={(id) => { setSelectedAgencyId(id); }}
              onSelectCategory={(id) => { setSelectedCatId(id); }}
              onSelectArticle={(art) => { handleSelectArticle(art); if(isMobile) setIsLeftSidebarOpen(false); }}
              onDeleteArticle={handleDeleteArticle}
              onCreateArticle={handleCreateArticle}
              onImportDocx={handleImportDocx}
              onAddAgency={handleAddAgency}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onDeleteAgency={handleDeleteAgency}
              isOpen={isLeftSidebarOpen}
            />
          </div>
        )}

        {/* Center Editor */}
        <main className={`flex-1 flex flex-col relative bg-white z-10 transition-all duration-300 ${activeArticle ? 'shadow-xl' : ''}`}>
          {activeArticle ? (
            <Editor 
              initialContent={activeArticle.content}
              title={activeArticle.title}
              onTitleChange={handleTitleChange}
              onSave={handleSaveAndClose}
              onChange={handleArticleChange}
              authorName={settings.authorName}
              fontSize={fontSize}
              setFontSize={setFontSize}
              onExport={handleExportDocx}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50 p-6 text-center">
              <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">✒️</span>
              </div>
              <h2 className="text-xl font-bold text-slate-500 mb-2">مرحباً بك في غرفة الأخبار</h2>
              <p className="text-sm max-w-[280px]">اختر وكالة وتصنيفاً للبدء في تحرير الأخبار والتقارير الميدانية</p>
            </div>
          )}
          
          {/* Status Bar */}
          <div className="h-8 bg-white border-t border-slate-200 flex items-center justify-between px-6 text-[10px] text-slate-400 font-bold select-none whitespace-nowrap overflow-x-auto custom-scrollbar">
            <div className="flex gap-4">
              <span>الكلمات: {wordCount}</span>
              <span>الأحرف: {charCount}</span>
              <span>الحالة: {activeArticle ? 'تم الحفظ تلقائياً' : 'جاهز'}</span>
            </div>
            <span>v2.0.0 Pro</span>
          </div>
        </main>

        {/* Right Sidebar (Tools) */}
        {(isRightSidebarOpen || !isMobile) && (
          <div className={`${isMobile ? 'fixed inset-0 z-50 flex shadow-2xl' : 'contents'}`}>
            <RightPanel 
              rssItems={rssItems}
              rssSources={settings.rssSources}
              onImportRss={(item) => { handleImportRss(item); if(isMobile) setIsRightSidebarOpen(false); }}
              onRefresh={fetchNews}
              isLoading={isRssLoading}
              isOpen={isRightSidebarOpen}
            />
            {isMobile && <div className="flex-1 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsRightSidebarOpen(false)} />}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal 
          settings={settings}
          agencies={agencies}
          categories={categories}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
          onBackup={handleBackup}
          onRestore={handleRestore}
          onMergeRestore={handleMergeBackup}
          onAddAgency={handleAddAgency}
          onDeleteAgency={handleDeleteAgency}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {/* Delete Confirmation Modal (Article) */}
      {deleteConfirmation.isOpen && (
        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          title="حذف المقال"
          message="هل أنت متأكد من أنك تريد حذف هذا المقال نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
          onConfirm={confirmDeleteArticle}
          onCancel={() => setDeleteConfirmation({ isOpen: false, articleId: null })}
        />
      )}

      {/* Delete Confirmation Modal (Category) */}
      {deleteCategoryConfirmation.isOpen && (
        <ConfirmationModal
          isOpen={deleteCategoryConfirmation.isOpen}
          title="حذف التصنيف"
          message="هل أنت متأكد من حذف هذا التصنيف؟ سيتم حذف جميع المقالات المرتبطة به."
          onConfirm={confirmDeleteCategory}
          onCancel={() => setDeleteCategoryConfirmation({ isOpen: false, categoryId: null })}
        />
      )}

      {/* Delete Confirmation Modal (Agency) */}
      {deleteAgencyConfirmation.isOpen && (
        <ConfirmationModal
          isOpen={deleteAgencyConfirmation.isOpen}
          title="حذف الوكالة"
          message="هل أنت متأكد من حذف هذه الوكالة؟ سيتم حذف جميع التصنيفات والمقالات المرتبطة بها."
          onConfirm={confirmDeleteAgency}
          onCancel={() => setDeleteAgencyConfirmation({ isOpen: false, agencyId: null })}
        />
      )}

      {/* Input Modal */}
      <InputModal
        isOpen={inputModal.isOpen}
        title={inputModal.title}
        placeholder="اكتب الاسم هنا..."
        onConfirm={inputModal.onConfirm}
        onCancel={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default App;