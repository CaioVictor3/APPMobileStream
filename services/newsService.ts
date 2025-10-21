
export interface NewsItem {
    title: string;
    description: string;
    link: string;
    pubDate: string;
    guid?: string;
  }
  
  export interface NewsUrl {
    id: number;
    description: string;
    typeId: number;
    url: string;
    isActive: boolean;
    createTime: string;
    updateTime: string;
    stationId: number;
    station: any;
  }
  
  export interface NewsUrlResponse {
    urls: NewsUrl;
  }
  
  export class NewsService {
    private static readonly API_BASE_URL = 'https://audieappapi.playlistsolutions.com/api/v1/Url';
    private static readonly API_KEY = 'AU-ecOv8l6DtKaRqZSQC4cfm1AD5hePO';
  
  static async getActiveNewsUrls(): Promise<NewsUrl[]> {
    try {
      const response = await fetch(this.API_BASE_URL, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.API_KEY}`,
            'X-API-Key': this.API_KEY,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
  
        const data = await response.json();

        if (data.success === false && Array.isArray(data.data)) {
          const newsUrls = data.data
            .map((item: any) => item.urls)
            .filter((url: any) => url && url.isActive && url.typeId === 3); 
          
          return newsUrls;
        } else if (Array.isArray(data)) {

          return data.filter((item: any) => item.isActive && item.typeId === 3);
        } else if (data.urls && Array.isArray(data.urls)) {

          return data.urls.filter((item: any) => item.isActive && item.typeId === 3);
      } else if (data.urls && typeof data.urls === 'object' && !Array.isArray(data.urls)) {
        return (data.urls.isActive && data.urls.typeId === 3) ? [data.urls] : [];
      } else {
        return [];
      }
      } catch (error) {
        console.error('Erro ao buscar URLs de notícias da API:', error);
        return [];
      }
    }
  
    static async getNews(stationId?: number): Promise<NewsItem[]> {
      try {

        const activeUrls = await this.getActiveNewsUrls();
        

        const urlsToUse = stationId 
          ? activeUrls.filter(url => url.stationId === stationId)
          : activeUrls;
  
        if (urlsToUse.length === 0) {
          return [];
        }

        const allNews: NewsItem[] = [];
        
        for (const urlInfo of urlsToUse) {
          try {
            const response = await fetch(urlInfo.url, {
              method: 'GET',
              headers: {
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
  
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
  
          const xmlText = await response.text();

          const itemRegex = /<item>([\s\S]*?)<\/item>/g;
            let match;
            let itemCount = 0;
            
            while ((match = itemRegex.exec(xmlText)) !== null && allNews.length < 50) {
              const itemContent = match[1];
              
              const title = this.extractTagContent(itemContent, 'title');
              const description = this.extractTagContent(itemContent, 'description');
              const link = this.extractTagContent(itemContent, 'link');
              const pubDate = this.extractTagContent(itemContent, 'pubDate');
              const guid = this.extractTagContent(itemContent, 'guid');
              
              if (title && link) {
                allNews.push({
                  title: this.cleanText(title),
                  description: this.cleanText(description),
                  link,
                  pubDate,
                  guid
                });
              itemCount++;
            }
          }
        } catch (urlError) {
          // Ignora erros de URLs individuais
        }
      }

      const uniqueNews = allNews.filter((news, index, self) => 
        index === self.findIndex(n => n.link === news.link)
      );

      const sortedNews = uniqueNews.sort((a, b) => {
          const dateA = new Date(a.pubDate).getTime();
          const dateB = new Date(b.pubDate).getTime();
          

          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          
          return dateB - dateA;
        });
  

      const recentNews = sortedNews.filter(newsItem => {
        const newsDate = new Date(newsItem.pubDate);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        return !isNaN(newsDate.getTime()) && newsDate >= weekAgo;
      });
      
      return recentNews.length > 0 ? recentNews : sortedNews.slice(0, 10);
      } catch (error) {
        console.error('Erro ao buscar notícias:', error);

        return [];
      }
    }
  
    private static extractTagContent(xml: string, tagName: string): string {
      try {

        const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
        const match = xml.match(regex);
        if (match && match[1]) {
          return this.cleanText(match[1]);
        }
        return '';
      } catch (error) {
        return '';
      }
    }
  
    private static cleanText(text: string): string {
      if (!text) return '';
      

      return text
        .replace(/<[^>]*>/g, '') // Remove todas as tags HTML
        .replace(/&nbsp;/g, ' ') // Espaços não-quebrados
        .replace(/&amp;/g, '&')  // Ampersands
        .replace(/&lt;/g, '<')   // Menor que
        .replace(/&gt;/g, '>')   // Maior que
        .replace(/&quot;/g, '"') // Aspas duplas
        .replace(/&apos;/g, "'") // Aspas simples
        .replace(/&hellip;/g, '...') // Reticências
        .replace(/&ndash;/g, '–') // Traço en
        .replace(/&mdash;/g, '—') // Traço em
        .replace(/\s+/g, ' ') // Múltiplos espaços em um só
        .trim();
    }
  
    static async getNewsUrlsByType(typeId: number): Promise<NewsUrl[]> {
      try {
        const allUrls = await this.getActiveNewsUrls();
        return allUrls.filter(url => url.typeId === typeId);
      } catch (error) {
        console.error('Erro ao buscar URLs por tipo:', error);
        throw new Error('Não foi possível carregar as URLs por tipo');
      }
    }
  
    static async getNewsUrlById(id: number): Promise<NewsUrl | null> {
      try {
        const allUrls = await this.getActiveNewsUrls();
        return allUrls.find(url => url.id === id) || null;
      } catch (error) {
        console.error('Erro ao buscar URL por ID:', error);
        throw new Error('Não foi possível carregar a URL por ID');
      }
    }
  
    static formatDate(dateString: string): string {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return dateString;
      }
    }
  }