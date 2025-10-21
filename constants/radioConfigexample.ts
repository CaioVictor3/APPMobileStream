export const RADIO_CONFIG = {

  API_KEY: process.env.EXPO_PUBLIC_API_KEY || 'SUA_CHAVE_API_AQUI',
  
  // Base URLs das APIs
  API_BASE_URL: 'https://audieappapi.playlistsolutions.com/api/v1',
  
  // Endpoints específicos
  URLS_ENDPOINT: '/Url',
  NEWS_ENDPOINT: '/Url',
  PROMOTIONS_ENDPOINT: '/Promotion',
  
  // Configurações de requisição
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  
  // IDs de tipos de conteúdo
  TYPE_ID: {
    RADIO_STREAM: 1,
    ONLINE_STREAM: 12,
    NEWS: 3,
  },
} as const;

/**
 * Valida se a configuração da API está correta
  @returns 
 */
export const validateApiConfig = (): { isValid: boolean; error?: string } => {
  if (!RADIO_CONFIG.API_KEY || RADIO_CONFIG.API_KEY.trim() === '' || RADIO_CONFIG.API_KEY === 'SUA_CHAVE_API_AQUI') {
    return {
      isValid: false,
      error: 'API Key não configurada em radioConfig.ts. Copie radioConfigexample.ts para radioConfig.ts e configure sua chave.'
    };
  }
  
  if (!RADIO_CONFIG.API_BASE_URL || RADIO_CONFIG.API_BASE_URL.trim() === '') {
    return {
      isValid: false,
      error: 'Base URL não configurada em radioConfig.ts'
    };
  }
  
  return { isValid: true };
};

