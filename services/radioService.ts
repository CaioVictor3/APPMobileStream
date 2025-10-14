// Serviço para buscar URLs de stream de rádio
import { RADIO_CONFIG } from '@/constants/radioConfig';

export interface RadioUrl {
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

export interface RadioUrlResponse {
  urls: RadioUrl;
}

export interface RadioApiResponse {
  data: RadioUrlResponse[];
  error?: string;
}

class RadioService {
  private baseUrl = RADIO_CONFIG.BASE_URL;
  private apiKey = RADIO_CONFIG.API_KEY;

  async getActiveRadioUrls(): Promise<RadioUrl[]> {
    try {
      console.log('Buscando URLs de rádio ativas...');
      
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'x-api-key': this.apiKey,
          'User-Agent': RADIO_CONFIG.USER_AGENT
        }
      });

      if (!response.ok) {
        throw new Error(`API retornou status ${response.status}: ${response.statusText}`);
      }

      const data: RadioApiResponse = await response.json();
      
      if (!data || !Array.isArray(data.data)) {
        throw new Error('Resposta da API não é um array válido');
      }

      // Extrai as URLs e filtra apenas as ativas
      const activeUrls = data.data
        .map(item => item.urls)
        .filter(url => url.isActive);

      console.log(`${activeUrls.length} URLs de rádio ativas obtidas com sucesso`);
      return activeUrls;
    } catch (error) {
      console.error("Erro ao acessar API externa:", error);
      throw new Error(`Erro ao buscar URLs de rádio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async getRadioCentralUrl(): Promise<string> {
    try {
      const activeUrls = await this.getActiveRadioUrls();
      
      const radioCentralItem = activeUrls.find(url =>
        url.description === RADIO_CONFIG.STATION_DESCRIPTION
      );

      if (radioCentralItem && radioCentralItem.url) {
        console.log("URL da Radio Central 91.9:", radioCentralItem.url);
        return radioCentralItem.url;
      } else {
        throw new Error("Radio Central 91.9 não encontrada nos dados recebidos.");
      }
    } catch (error) {
      console.error("Erro ao buscar Radio Central:", error);
      throw error;
    }
  }

  async getRadioUrlsByType(typeId: number): Promise<RadioUrl[]> {
    try {
      const allUrls = await this.getActiveRadioUrls();
      return allUrls.filter(url => url.typeId === typeId);
    } catch (error) {
      console.error('Erro ao buscar URLs por tipo:', error);
      throw new Error('Não foi possível carregar as URLs por tipo');
    }
  }

  async getRadioUrlById(id: number): Promise<RadioUrl | null> {
    try {
      const allUrls = await this.getActiveRadioUrls();
      return allUrls.find(url => url.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar URL por ID:', error);
      throw new Error('Não foi possível carregar a URL por ID');
    }
  }

  async getRadioUrlsByStation(stationId: number): Promise<RadioUrl[]> {
    try {
      const allUrls = await this.getActiveRadioUrls();
      return allUrls.filter(url => url.stationId === stationId);
    } catch (error) {
      console.error('Erro ao buscar URLs por estação:', error);
      throw new Error('Não foi possível carregar as URLs por estação');
    }
  }

  async getStreamUrl(stationId?: number): Promise<RadioApiResponse> {
    try {
      const activeUrls = await this.getActiveRadioUrls();
      
      // Se stationId for especificado, filtra por estação
      const urlsToUse = stationId 
        ? activeUrls.filter(url => url.stationId === stationId)
        : activeUrls;

      if (urlsToUse.length === 0) {
        throw new Error('Nenhuma URL de rádio ativa encontrada');
      }

      // Retorna no formato esperado pelo código existente
      return {
        data: urlsToUse.map(url => ({ urls: url })),
        error: undefined
      };
    } catch (error) {
      console.error('Erro ao buscar stream:', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async getRadioStreams(): Promise<RadioUrl[]> {
    try {
      const activeUrls = await this.getActiveRadioUrls();
      
      // Filtra apenas streams de rádio (typeId 1 e 12)
      const radioStreams = activeUrls.filter(url => 
        url.typeId === 1 || url.typeId === 12
      );

      console.log(`${radioStreams.length} streams de rádio encontrados`);
      return radioStreams;
    } catch (error) {
      console.error('Erro ao buscar streams de rádio:', error);
      return [];
    }
  }
}

export default new RadioService();
