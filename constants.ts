import { Agency, AppSettings, Category } from "./types";

export const DEFAULT_SETTINGS: AppSettings = {
  authorName: '',
  rssSources: [
    { id: '1', name: 'بي بي سي عربي', url: 'https://feeds.bbci.co.uk/arabic/rss.xml', category: 'عالمي' },
    { id: '2', name: 'الجزيرة نت', url: 'https://www.aljazeera.net/rss', category: 'عربي' },
    { id: '3', name: 'سكاي نيوز عربية', url: 'https://www.skynewsarabia.com/rss.xml', category: 'عربي' },
    { id: '4', name: 'العربية نت', url: 'https://www.alarabiya.net/.mrss/ar.xml', category: 'عربي' },
    { id: '5', name: 'سانا (سوريا)', url: 'https://sana.sy/?feed=rss2', category: 'سوري' },
    { id: '6', name: 'عنب بلدي', url: 'https://www.enabbaladi.net/feed/', category: 'سوري' },
    { id: '7', name: 'تلفزيون سوريا', url: 'https://www.syria.tv/rss.xml', category: 'سوري' },
    { id: '8', name: 'زمان الوصل', url: 'https://www.zamanalwsl.net/rss/', category: 'سوري' },
    { id: '9', name: 'CNN بالعربية', url: 'https://arabic.cnn.com/api/v1/rss/middle_east/rss.xml', category: 'عالمي' },
    { id: '10', name: 'فرانس 24', url: 'https://www.france24.com/ar/rss', category: 'عالمي' },
    { id: '11', name: 'روسيا اليوم', url: 'https://arabic.rt.com/rss/', category: 'عالمي' },
    { id: '12', name: 'الحدث', url: 'https://www.alhadath.net/.mrss/ar.xml', category: 'عربي' },
    { id: '13', name: 'دويتشه فيله (DW)', url: 'https://rss.dw.com/rdf/rss-ar-all', category: 'عالمي' },
    { id: '14', name: 'رويترز', url: 'http://ara.reuters.com/rssFeed/topNews', category: 'عالمي' },
    { id: '15', name: 'صحيفة الشرق الأوسط', url: 'https://aawsat.com/feed', category: 'عربي' }
  ]
};

export const INITIAL_AGENCIES: Agency[] = [
  { id: '1', name: 'الوكالة المركزية' },
  { id: '2', name: 'القسم الرياضي' }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: '101', agencyId: '1', name: 'أخبار عاجلة' },
  { id: '102', agencyId: '1', name: 'تقارير ميدانية' },
  { id: '201', agencyId: '2', name: 'كرة القدم' }
];
