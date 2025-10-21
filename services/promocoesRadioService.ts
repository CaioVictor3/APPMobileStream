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
      console.log(`[PromocoesRadioService] Tentativa ${attempt + 1} falhou, tentando novamente em ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const promocoesRadioService = {
  /**
   * Carrega apenas as PROMOÇÕES ATIVAS da API
   * Filtra por: isActive === true
   * NÃO filtra por data de vencimento (endDate)
   */
  async getAllAds(): Promise<PromotionItem[]> {
    try {
      console.log("[PromocoesRadioService] Carregando promoções ATIVAS (isActive=true)");
      
      return await retryWithBackoff(async () => {
        const allPromotions: PromotionItem[] = [];
        let currentPage = 1;
        const pageSize = 100; // Máximo permitido pela API
        let hasMorePages = true;

        // Buscar todas as páginas disponíveis
        while (hasMorePages) {
          console.log(`[PromocoesRadioService] Buscando página ${currentPage}`);
          
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

          console.log(`[PromocoesRadioService] Resposta da API recebida para página ${currentPage}:`, response.status);
          console.log(`[PromocoesRadioService] Estrutura da resposta:`, JSON.stringify(response.data, null, 2).substring(0, 500));
          
          const apiResponse = response.data as any;
          
          console.log(`[PromocoesRadioService] API Response - success:`, apiResponse.success);
          console.log(`[PromocoesRadioService] API Response - message:`, apiResponse.message);
          console.log(`[PromocoesRadioService] API Response - data type:`, typeof apiResponse.data);
          console.log(`[PromocoesRadioService] API Response - data is array?:`, Array.isArray(apiResponse.data));
          
          if (!apiResponse.success) {
            console.error("[PromocoesRadioService] ❌ API retornou success=false:", apiResponse.message);
            console.error("[PromocoesRadioService] Response completa:", JSON.stringify(apiResponse, null, 2));
            break;
          }

          const rawData = apiResponse.data;
          
          // A API pode retornar um objeto ou um array dependendo da paginação
          let promotionsArray: RawPromotion[] = [];
          
          if (Array.isArray(rawData)) {
            promotionsArray = rawData;
            console.log(`[PromocoesRadioService] rawData é um array com ${rawData.length} itens`);
          } else if (rawData && typeof rawData === 'object') {
            // Se for um único objeto, colocar em array
            promotionsArray = [rawData];
            console.log(`[PromocoesRadioService] rawData é um objeto único, convertido para array`);
          } else {
            console.warn(`[PromocoesRadioService] ⚠️ rawData tem tipo inesperado:`, typeof rawData, rawData);
          }

          if (promotionsArray.length === 0) {
            console.warn(`[PromocoesRadioService] ⚠️ promotionsArray está vazio para página ${currentPage}`);
            hasMorePages = false;
            break;
          }

          console.log(`[PromocoesRadioService] Processando ${promotionsArray.length} itens da página ${currentPage}`);
          
          // Log de debug: mostrar quantas são ativas vs inativas
          const activeCount = promotionsArray.filter((promo: RawPromotion) => promo.isActive === true).length;
          const inactiveCount = promotionsArray.filter((promo: RawPromotion) => promo.isActive !== true).length;
          console.log(`[PromocoesRadioService] Página ${currentPage}: ${activeCount} ativas, ${inactiveCount} inativas`);

          // Filtra apenas promoções ATIVAS (isActive === true)
          // NÃO FILTRA POR DATA - mostra todas, vencidas ou não
          const processedPromotions = promotionsArray
            .filter((promo: RawPromotion) => {
              const isActive = promo.isActive === true;
              if (!isActive) {
                console.log(`[PromocoesRadioService] Item ignorado (inativo): ${promo.title || 'sem título'}`);
              }
              return isActive;
            })
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
              
              console.log(`[PromocoesRadioService] Promoção adicionada: ID=${promotion.id}, Título="${promotion.title}", isAd=${promotion.isAd}, Início=${promotion.startDate}, Fim=${promotion.endDate}`);
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

        console.log(`[PromocoesRadioService] ========== RESUMO ==========`);
        console.log(`[PromocoesRadioService] Total de promoções ATIVAS carregadas: ${sortedAds.length}`);
        console.log(`[PromocoesRadioService] ================================`);
        
        if (sortedAds.length > 0) {
          console.log(`[PromocoesRadioService] Primeiras 5 promoções:`);
          sortedAds.slice(0, 5).forEach((ad, index) => {
            console.log(`  ${index + 1}. ID=${ad.id}, Título="${ad.title}", Tipo=${ad.isAd ? 'Publicidade' : 'Promoção'}, Fim=${ad.endDate}`);
          });
        }
        
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

