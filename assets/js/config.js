/**
 * MarketPulse v2 - Central Configuration
 * All API endpoints, brand constants, and demo fallback data reside here.
 */
window.MARKETPULSE_CONFIG = {
  brand: {
    name: 'MarketPulse',
    tagline: 'Institutional Market Intelligence & Financial Data',
    version: '2.0.0',
    disclaimer: 'Trading involves risk. Content is for information only and not financial advice.'
  },

  endpoints: {
    bitunixFutures: 'https://fapi.bitunix.com/api/v1/futures/market/tickers',
    bitunixProxy: 'https://api.allorigins.win/raw?url=https%3A%2F%2Ffapi.bitunix.com%2Fapi%2Fv1%2Ffutures%2Fmarket%2Ftickers',
    binance24h: 'https://data-api.binance.vision/api/v3/ticker/24hr',
    binanceKlines: 'https://data-api.binance.vision/api/v3/klines',
    currencyApi: 'https://cdn.jsdelivr.net/npm/@irfanokr/currency-api@latest/v1/currencies/usd.json',
    currencyFallback: 'https://open.er-api.com/v6/latest/USD',
    fearAndGreed: 'https://api.alternative.me/fng/?limit=30'
  },

  cacheTTL: 60000, // 60 seconds in-memory cache
  defaultCurrency: 'USD',

  // Fallbacks if client is offline or free endpoints encounter CORS/rate-limits
  fallbackRates: {
    usd: 1,
    pkr: 278.60,
    eur: 0.92,
    gbp: 0.79,
    sar: 3.75,
    aed: 3.67,
    inr: 83.40
  },

  fallbackFearAndGreed: {
    value: "68",
    value_classification: "Greed",
    timestamp: String(Math.floor(Date.now() / 1000)),
    previous_day: "64",
    previous_week: "72",
    previous_month: "55"
  },

  fallbackCoins: [
    { symbol: 'BTCUSDT', name: 'Bitcoin', code: 'BTC', price: 89450.20, change24h: 3.42, volume: 38450120000, high: 90200, low: 86400 },
    { symbol: 'ETHUSDT', name: 'Ethereum', code: 'ETH', price: 3380.50, change24h: 2.15, volume: 18230400000, high: 3420, low: 3290 },
    { symbol: 'SOLUSDT', name: 'Solana', code: 'SOL', price: 214.80, change24h: 5.60, volume: 6840200000, high: 220, low: 202 },
    { symbol: 'BNBUSDT', name: 'BNB', code: 'BNB', price: 635.40, change24h: 1.12, volume: 1420100000, high: 642, low: 628 },
    { symbol: 'XRPUSDT', name: 'XRP', code: 'XRP', price: 0.724, change24h: -1.35, volume: 1980300000, high: 0.745, low: 0.712 },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', code: 'DOGE', price: 0.382, change24h: 8.94, volume: 4210000000, high: 0.395, low: 0.345 },
    { symbol: 'ADAUSDT', name: 'Cardano', code: 'ADA', price: 0.584, change24h: 2.80, volume: 840500000, high: 0.598, low: 0.562 },
    { symbol: 'AVAXUSDT', name: 'Avalanche', code: 'AVAX', price: 35.60, change24h: -2.10, volume: 620400000, high: 37.10, low: 34.80 },
    { symbol: 'SUIUSDT', name: 'Sui', code: 'SUI', price: 3.25, change24h: 11.45, volume: 1250300000, high: 3.38, low: 2.89 },
    { symbol: 'LINKUSDT', name: 'Chainlink', code: 'LINK', price: 14.80, change24h: 0.75, volume: 490200000, high: 15.10, low: 14.50 },
    { symbol: 'PAXGUSDT', name: 'PAX Gold', code: 'PAXG', price: 2685.40, change24h: 0.45, volume: 14500000, high: 2692, low: 2674 }
  ],

  // Known coin names dictionary
  coinNames: {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'SOL': 'Solana',
    'BNB': 'BNB',
    'XRP': 'XRP',
    'DOGE': 'Dogecoin',
    'ADA': 'Cardano',
    'AVAX': 'Avalanche',
    'SUI': 'Sui',
    'LINK': 'Chainlink',
    'NEAR': 'NEAR Protocol',
    'DOT': 'Polkadot',
    'TRX': 'TRON',
    'SHIB': 'Shiba Inu',
    'LTC': 'Litecoin',
    'UNI': 'Uniswap',
    'PEPE': 'Pepe',
    'APT': 'Aptos',
    'ICP': 'Internet Computer',
    'RENDER': 'Render',
    'FET': 'Artificial Superintelligence',
    'PAXG': 'PAX Gold (Spot Gold)'
  }
};

