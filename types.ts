export interface Agency {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  agencyId: string;
  name: string;
}

export interface Article {
  id: string;
  catId: string;
  agencyId: string;
  title: string;
  content: string; // HTML string
  date: string;
  lastModified: number;
}

export interface RssSource {
  id: string;
  name: string;
  url: string;
}

export interface RssItem {
  title: string;
  source: string;
  link?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  fromMe: boolean;
  timestamp: number;
}

export interface AppSettings {
  authorName: string;
  tgToken: string;
  tgChatId: string;
  rssSources: RssSource[];
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
