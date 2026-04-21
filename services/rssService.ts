import { RssItem, RssSource } from "../types";

export const rssService = {
  fetchFeeds: async (sources: RssSource[]): Promise<RssItem[]> => {
    const allItems: RssItem[] = [];
    
    const fetchWithProxy = async (url: string, proxyIndex = 0): Promise<string | null> => {
      const proxies = [
        (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}&t=${Date.now()}`, // Force no cache for now to debug
        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
        (u: string) => `https://api.codetabs.com/v1/proxy?url=${encodeURIComponent(u)}`,
      ];

      if (proxyIndex >= proxies.length) return null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const targetUrl = proxies[proxyIndex](url);
        const response = await fetch(targetUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Status " + response.status);

        if (proxyIndex === 0) {
          const data = await response.json();
          return data.contents || null;
        } else {
          return await response.text();
        }
      } catch (e) {
        console.warn(`Proxy ${proxyIndex} failed for ${url}:`, e);
        return fetchWithProxy(url, proxyIndex + 1);
      }
    };

    const fetchSource = async (source: RssSource) => {
      try {
        const contents = await fetchWithProxy(source.url);
        if (!contents) return [];

        const parser = new DOMParser();
        const doc = parser.parseFromString(contents, "text/xml");
        
        const isError = doc.querySelector('parsererror');
        if (isError) {
          const htmlDoc = parser.parseFromString(contents, "text/html");
          return processDoc(htmlDoc, source.name);
        }

        return processDoc(doc, source.name);
      } catch (error) {
        return [];
      }
    };

    const processDoc = (doc: Document | Element, sourceName: string): RssItem[] => {
      const sourceItems: RssItem[] = [];
      
      // Use getElementsByTagName for better cross-format/namespace compatibility
      let items = Array.from(doc.getElementsByTagName("item"));
      if (items.length === 0) items = Array.from(doc.getElementsByTagName("entry"));
      
      // Fallback to querySelectorAll if still empty
      if (items.length === 0) {
        items = Array.from(doc.querySelectorAll("item, entry, ITEM, ENTRY"));
      }

      items.slice(0, 10).forEach((item) => {
        const title = item.getElementsByTagName("title")[0]?.textContent || 
                      item.querySelector("title")?.textContent || 
                      "بدون عنوان";
        
        let link = "";
        const linkTags = item.getElementsByTagName("link");
        
        if (linkTags.length > 0) {
          link = linkTags[0].textContent || linkTags[0].getAttribute("href") || "";
        }

        if (!link || link.trim() === "") {
          link = item.querySelector("link")?.textContent || 
                 item.querySelector("link")?.getAttribute("href") || 
                 item.querySelector("guid")?.textContent ||
                 "";
        }

        if (title.trim()) {
          sourceItems.push({
            title: title.trim(),
            source: sourceName,
            link: link.trim()
          });
        }
      });
      return sourceItems;
    };

    const results = await Promise.all(sources.map(fetchSource));
    results.forEach(result => {
      if (result) allItems.push(...result);
    });

    return allItems;
  }
};