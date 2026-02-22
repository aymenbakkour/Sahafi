import { Agency, AppSettings, Category } from "./types";

export const DEFAULT_SETTINGS: AppSettings = {
  authorName: '',
  tgToken: '',
  tgChatId: '',
  rssSources: [
    { id: '1', name: 'BBC Arabic', url: 'https://feeds.bbci.co.uk/arabic/rss.xml' },
    { id: '2', name: 'Al Jazeera', url: 'https://www.aljazeera.net/aljazeerarss/a7c186be-15b1-4320-8fdb-3222dbe2c3b1/x/1/rss' }
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
