import axios from "axios";

export interface PromotionItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  externalUrl?: string;
  isAd: boolean;
  createdAt?: string;
  validUntil?: string;
}

const API_URL = "https://audieappapi.playlistsolutions.com/api/v1/Promotion";
const API_KEY = "AU-ecOv8l6DtKaRqZSQC4cfm1AD5hePO";

interface RawPromotion {
  id?: number;
  title?: string;
  description?: string;
  imageUrl?: string;
  externalUrl?: string;
  isAd?: boolean;
  createdAt?: string;
  validUntil?: string;
}

export const promoService = {
  async getPromotions(stationId: number): Promise<PromotionItem[]> {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          accept: "application/json",
          "x-api-key": API_KEY,
        },
        params: { stationId }, // passa stationId como query
      });

      const rawData: any = (response?.data as any)?.data || response?.data;
      if (!rawData) return [];

      // Normaliza para array mesmo que seja objeto único
      const promoArray: RawPromotion[] = Array.isArray(rawData) ? rawData : [rawData];

      return promoArray.map((promo) => ({
        id: promo.id ?? 0,
        title: promo.title ?? "Sem título",
        description: promo.description ?? "",
        imageUrl: promo.imageUrl ?? "",
        externalUrl: promo.externalUrl ?? undefined,
        isAd: promo.isAd ?? false,
        createdAt: promo.createdAt ?? undefined,
        validUntil: promo.validUntil ?? undefined,
      }));
    } catch (error: any) {
      console.error("Erro ao carregar promoções:", error.response?.status, error.message || error);
      return [];
    }
  },
};

