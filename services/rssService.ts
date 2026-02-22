import { RssItem, RssSource } from "../types";

export const rssService = {
  fetchFeeds: async (sources: RssSource[]): Promise<RssItem[]> => {
    const allItems: RssItem[] = [];
    
    const promises = sources.map(async (source) => {
      try {
        // Use a cache buster to prevent stale data
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(source.url)}&t=${Date.now()}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`Proxy error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.contents) {
            throw new Error('No content returned from proxy');
        }

        const parser = new DOMParser();
        const xml = parser.parseFromString(data.contents, "text/xml");
        
        // Check for XML parsing errors
        const parseError = xml.querySelector('parsererror');
        if (parseError) {
          throw new Error('XML Parsing Error');
        }

        // Try 'item' (RSS 2.0) first, then 'entry' (Atom)
        let items = xml.querySelectorAll("item");
        if (items.length === 0) {
            items = xml.querySelectorAll("entry");
        }
        
        items.forEach((item, index) => {
          if (index < 5) { // Limit to 5 per source
            // Handle differences between RSS and Atom
            const title = item.querySelector("title")?.textContent || "No Title";
            
            // Link might be a text content of <link> or href attribute in <link href="..." />
            let link = item.querySelector("link")?.textContent;
            if (!link) {
                link = item.querySelector("link")?.getAttribute("href") || "";
            }

            allItems.push({
              title: title.trim(),
              source: source.name,
              link: link?.trim() || ""
            });
          }
        });
      } catch (error) {
        console.warn(`Failed to fetch RSS from ${source.name}:`, error);
      }
    });

    await Promise.all(promises);
    return allItems;
  }
};