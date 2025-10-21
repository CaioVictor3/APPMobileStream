export const RADIO_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_API_KEY || 'chavedaapi',
  BASE_URL: 'https://audieappapi.playlistsolutions.com/api/v1/Url',
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  STATION_DESCRIPTION: 'Radio Central 91.9 (Hits 1964-1989)',
} as const;
