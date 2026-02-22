const KEYS = {
  AGENCIES: 'jp_agencies',
  CATEGORIES: 'jp_categories',
  ARTICLES: 'jp_articles',
  SETTINGS: 'jp_settings'
};

export const storageService = {
  save: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Storage Save Error", e);
    }
  },
  load: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  KEYS
};
