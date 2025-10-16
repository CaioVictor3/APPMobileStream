import axios from "axios";

export interface NewsItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  author?: string;
  category?: string;
  publishedAt: string;
  summary?: string;
  pubUri?: string;
  sourceRss?: string;
  contentEncoded?: string;
}

const API_URL = "https://audieappapi.playlistsolutions.com/api/v1/News";
const API_KEY = "AU-ecOv8l6DtKaRqZSQC4cfm1AD5hePO";

interface RawNews {
  title?: string;
  author?: string;
  auhor?: string; 
  category?: string;
  summary?: string;
  pubUri?: string;
  contentEncoded?: string;
  imageUri?: string;
  sourceRss?: string;
  publishedDate?: string;
}

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`[NoticiasRadioService] Tentativa ${attempt + 1} falhou, tentando novamente em ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const noticiasRadioService = {
  async getAllNews(): Promise<NewsItem[]> {
    try {
      console.log("[NoticiasRadioService] Carregando todas as notícias disponíveis");
      
      return await retryWithBackoff(async () => {
        const response = await axios.get(API_URL, {
          headers: {
            accept: "application/json",
            "x-api-key": API_KEY,
          },
        });

        console.log("[NoticiasRadioService] Resposta da API recebida:", response.status);
        
        const apiResponse = response.data as any;
        
        if (!apiResponse.success) {
          console.error("[NoticiasRadioService] API retornou success=false:", apiResponse.message);
          return [];
        }

        const rawData = apiResponse.data?.result;
        
        if (!Array.isArray(rawData)) {
          console.warn("[NoticiasRadioService] Dados não são um array:", rawData);
          return [];
        }

        console.log(`[NoticiasRadioService] Processando ${rawData.length} notícias`);

        const processedNews = rawData
          .map((news: RawNews, index: number) => ({
            id: index + 1, 
            title: news.title ?? "Sem título",
            description: news.summary ?? "",
            imageUrl: news.imageUri ?? "",
            author: news.author ?? news.auhor ?? "N/A",
            category: news.category ?? news.sourceRss ?? "N/A",
            publishedAt: news.publishedDate ?? new Date().toISOString(),
            summary: news.summary ?? "",
            pubUri: news.pubUri ?? undefined,
            sourceRss: news.sourceRss ?? undefined,
            contentEncoded: news.contentEncoded ?? undefined,
          }))
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()); 

        console.log(`[NoticiasRadioService] ${processedNews.length} notícias processadas com sucesso`);
        return processedNews;
      });
    } catch (error: any) {
      console.error("[NoticiasRadioService] Erro ao carregar notícias:", {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      return [];
    }
  },

  filterNews(news: NewsItem[], searchTerm: string): NewsItem[] {
    if (!searchTerm.trim()) {
      return news;
    }

    const term = searchTerm.toLowerCase();
    return news.filter(item => 
      item.title.toLowerCase().indexOf(term) > -1
    );
  },

  paginateNews(news: NewsItem[], currentPage: number, entriesPerPage: number): NewsItem[] {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return news.slice(startIndex, endIndex);
  },

  getTotalPages(totalItems: number, entriesPerPage: number): number {
    return Math.ceil(totalItems / entriesPerPage);
  }
};
