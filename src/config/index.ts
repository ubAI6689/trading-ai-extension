// src/config/index.ts
interface Config {
  COINGECKO_API_KEY: string;
  API_REFRESH_RATE: number;
  ALERT_THRESHOLD: number;
}

const developmentConfig: Config = {
  COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || '',
  API_REFRESH_RATE: 30000, // 30 seconds
  ALERT_THRESHOLD: 5
};

const productionConfig: Config = {
  COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || '',
  API_REFRESH_RATE: 60000, // 1 minute for production
  ALERT_THRESHOLD: 5
};

const config: Config = process.env.NODE_ENV === 'production' 
  ? productionConfig 
  : developmentConfig;

if (!config.COINGECKO_API_KEY) {
  console.error('COINGECKO_API_KEY is not set in environment variables');
}

export default config;