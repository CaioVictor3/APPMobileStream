import axios from "axios";

export interface PromotionItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  externalUrl?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isAd: boolean;
  position: number;
  stationId: number;
  dateUndefined: boolean;
  isAuto: boolean;
  intervalType?: number;
  intervalValue?: number;
  lastRaffle?: string;
}

const API_URL = "https://audieappapi.playlistsolutions.com/api/v1/Promotion";
const API_KEY = "AU-ecOv8l6DtKaRqZSQC4cfm1AD5hePO";

interface RawPromotion {
  id?: number;
  stationId?: number;
  localId?: number;
  description?: string;
  title?: string;
  image?: string;
  imageUrl?: string;
  isAd?: boolean;
  position?: number;
  externalUrl?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  dateUndefined?: boolean;
  isAuto?: boolean;
  intervalType?: number;
  intervalValue?: number;
  lastRaffle?: string;
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
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const promocoesRadioService = {

  async getAllAds(): Promise<PromotionItem[]> {
    try {
      return await retryWithBackoff(async () => {
        const allPromotions: PromotionItem[] = [];
        let currentPage = 1;
        const pageSize = 100; // Máximo permitido pela API
        let hasMorePages = true;

        // Buscar todas as páginas disponíveis
        while (hasMorePages) {
          
          const response = await axios.get(API_URL, {
            params: {
              CurrentPage: currentPage,
              PageSize: pageSize,
            },
            headers: {
              accept: "application/json",
              "Authorization": `Bearer ${API_KEY}`,
              "X-API-Key": API_KEY,
            },
          });

          const apiResponse = response.data as any;
          
          if (!apiResponse.success) {
            console.error("[PromocoesRadioService] API retornou erro:", apiResponse.message);
            break;
          }

          const rawData = apiResponse.data;
          
          // A API pode retornar um objeto ou um array dependendo da paginação
          let promotionsArray: RawPromotion[] = [];
          
          if (Array.isArray(rawData)) {
            promotionsArray = rawData;
          } else if (rawData && typeof rawData === 'object') {
            promotionsArray = [rawData];
          }

          if (promotionsArray.length === 0) {
            hasMorePages = false;
            break;
          }

          // Filtra apenas promoções ATIVAS (isActive === true)
          const processedPromotions = promotionsArray
            .filter((promo: RawPromotion) => promo.isActive === true)
            .map((promo: RawPromotion) => {
              const promotion = {
                id: promo.id ?? 0,
                title: promo.title ?? "Sem título",
                description: promo.description ?? "",
                imageUrl: promo.imageUrl ?? promo.image ?? "",
                externalUrl: promo.externalUrl ?? undefined,
                startDate: promo.startDate ?? new Date().toISOString(),
                endDate: promo.endDate ?? new Date().toISOString(),
                isActive: promo.isActive ?? false,
                isAd: promo.isAd ?? false,
                position: promo.position ?? 0,
                stationId: promo.stationId ?? 0,
                dateUndefined: promo.dateUndefined ?? false,
                isAuto: promo.isAuto ?? false,
                intervalType: promo.intervalType,
                intervalValue: promo.intervalValue,
                lastRaffle: promo.lastRaffle,
              };
              return promotion;
            });

          allPromotions.push(...processedPromotions);

          // Se retornou menos que pageSize, não há mais páginas
          if (promotionsArray.length < pageSize) {
            hasMorePages = false;
          } else {
            currentPage++;
          }
        }

        // Ordenar por data de início (mais recentes primeiro)
        const sortedAds = allPromotions.sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        
        return sortedAds;
      });
    } catch (error: any) {
      console.error("[PromocoesRadioService] Erro ao carregar promoções:", {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      return [];
    }
  },

  filterPromotions(promotions: PromotionItem[], searchTerm: string): PromotionItem[] {
    if (!searchTerm.trim()) {
      return promotions;
    }

    const term = searchTerm.toLowerCase();
    return promotions.filter(item => 
      item.title.toLowerCase().indexOf(term) > -1 ||
      item.description.toLowerCase().indexOf(term) > -1
    );
  },

  paginatePromotions(promotions: PromotionItem[], currentPage: number, entriesPerPage: number): PromotionItem[] {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return promotions.slice(startIndex, endIndex);
  },

  getTotalPages(totalItems: number, entriesPerPage: number): number {
    return Math.ceil(totalItems / entriesPerPage);
  }
};

