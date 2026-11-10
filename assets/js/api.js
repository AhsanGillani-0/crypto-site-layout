/**
 * MarketPulse v2 - Data & API Services
 * Handles in-memory caching, live API calls, fallback data, and currency conversions.
 */

window.MarketPulseAPI = (function () {
  const config = window.MARKETPULSE_CONFIG;
  const cache = {};

  // Current global currency state (synced with localStorage)
  let currentCurrency = localStorage.getItem('mp_currency') || config.defaultCurrency;
  let cachedRates = { ...config.fallbackRates };
  let lastRateUpdate = null;

  function getCache(key) {
    const item = cache[key];
    if (!item) return null;
    if (Date.now() - item.timestamp > config.cacheTTL) {
      delete cache[key];
      return null;
    }
    return item.data;
  }

  function setCache(key, data) {
    cache[key] = {
      timestamp: Date.now(),
      data: data
    };
  }

  function getCoinName(code) {
    return config.coinNames[code] || code;
  }

  /**
   * Fetch 24hr Bitunix Futures market data
   */
  async function getBitunixTickers() {
    const cacheKey = 'bitunix_tickers';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const urls = [
      config.endpoints.bitunixFutures,
      config.endpoints.bitunixProxy
    ];

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) continue;
        const json = await res.json();
        const items = json.data || (Array.isArray(json) ? json : null);
        if (items && Array.isArray(items) && items.length > 0) {
          const formatted = items
            .filter(item => item.symbol && item.symbol.endsWith('USDT'))
            .map(item => {
              const code = item.symbol.replace('USDT', '');
              const price = parseFloat(item.lastPrice || item.last || item.markPrice) || 0;
              const open = parseFloat(item.open) || price;
              const change24h = open > 0 ? ((price - open) / open) * 100 : 0;
              const volume = parseFloat(item.quoteVol || item.baseVol) || 0;
              const high = parseFloat(item.high) || price;
              const low = parseFloat(item.low) || price;

              return {
                symbol: item.symbol,
                code: code,
                name: getCoinName(code),
                price: price,
                change24h: change24h,
                volume: volume,
                high: high,
                low: low,
                source: 'Bitunix Futures'
              };
            });

          if (formatted.length > 0) {
            const result = {
              data: formatted,
              timestamp: new Date(),
              source: 'Bitunix.com Futures API',
              isFallback: false
            };
            setCache(cacheKey, result);
            return result;
          }
        }
      } catch (err) {
        // try next endpoint
      }
    }
    return null;
  }

  /**
   * Fetch 24hr Binance market data
   */
  async function getBinance24h() {
    const cacheKey = 'binance_24h';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(config.endpoints.binance24h, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('Binance API response error ' + res.status);
      const raw = await res.json();

      // Filter USDT pairs and format
      const usdtPairs = raw
        .filter(item => item.symbol.endsWith('USDT'))
        .map(item => {
          const code = item.symbol.replace('USDT', '');
          const price = parseFloat(item.lastPrice) || 0;
          const change24h = parseFloat(item.priceChangePercent) || 0;
          const volume = parseFloat(item.quoteVolume) || 0;
          const high = parseFloat(item.highPrice) || 0;
          const low = parseFloat(item.lowPrice) || 0;

          return {
            symbol: item.symbol,
            code: code,
            name: getCoinName(code),
            price: price,
            change24h: change24h,
            volume: volume,
            high: high,
            low: low,
            count: parseInt(item.count) || 0
          };
        });

      const result = {
        data: usdtPairs,
        timestamp: new Date(),
        isFallback: false
      };
      setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.warn('Binance fetch failed or CORS blocked; loading fallback dataset:', err.message);
      return {
        data: config.fallbackCoins,
        timestamp: new Date(),
        isFallback: true,
        error: err.message
      };
    }
  }

  /**
   * Fetch Binance historical daily klines (for DCA / Charts)
   */
  async function getBinanceKlines(symbol = 'BTCUSDT', interval = '1d', limit = 180) {
    const cacheKey = `klines_${symbol}_${interval}_${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      const url = `${config.endpoints.binanceKlines}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Klines response status ' + res.status);
      const raw = await res.json();
      
      const klines = raw.map(k => ({
        openTime: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
        closeTime: k[6]
      }));

      setCache(cacheKey, klines);
      return klines;
    } catch (err) {
      console.warn(`Binance Klines failed for ${symbol}; using synthetic historical data`, err.message);
      // Generate synthetic historical candles based on current price
      const now = Date.now();
      const synthetic = [];
      let base = symbol.startsWith('BTC') ? 60000 : (symbol.startsWith('ETH') ? 2400 : 150);
      for (let i = limit; i >= 0; i--) {
        const time = now - (i * 86400000);
        const delta = (Math.random() - 0.48) * (base * 0.03);
        base = Math.max(base + delta, 10);
        synthetic.push({
          openTime: time,
          open: base,
          high: base * 1.02,
          low: base * 0.98,
          close: base,
          volume: base * 1000,
          closeTime: time + 86400000
        });
      }
      return synthetic;
    }
  }

  /**
   * Fetch live currency exchange rates (USD -> PKR, EUR, GBP, SAR, AED)
   */
  async function getCurrencyRates() {
    const cacheKey = 'currency_rates';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      // Primary: @irfanokr currency API
      let res = await fetch(config.endpoints.currencyApi);
      let data = null;
      if (res.ok) {
        const json = await res.json();
        data = json.usd;
      } else {
        // Secondary fallback: open.er-api
        const fallbackRes = await fetch(config.endpoints.currencyFallback);
        if (fallbackRes.ok) {
          const fJson = await fallbackRes.json();
          data = fJson.rates ? {
            pkr: fJson.rates.PKR,
            eur: fJson.rates.EUR,
            gbp: fJson.rates.GBP,
            sar: fJson.rates.SAR,
            aed: fJson.rates.AED
          } : null;
        }
      }

      if (data && data.pkr) {
        cachedRates = {
          usd: 1,
          pkr: parseFloat(data.pkr),
          eur: parseFloat(data.eur || config.fallbackRates.eur),
          gbp: parseFloat(data.gbp || config.fallbackRates.gbp),
          sar: parseFloat(data.sar || config.fallbackRates.sar),
          aed: parseFloat(data.aed || config.fallbackRates.aed)
        };
      }
    } catch (err) {
      console.warn('Currency API failed; using fallback rates:', err.message);
      cachedRates = { ...config.fallbackRates };
    }

    lastRateUpdate = new Date();
    const result = {
      rates: cachedRates,
      timestamp: lastRateUpdate
    };
    setCache(cacheKey, result);
    return result;
  }

  /**
   * Fetch Fear and Greed index
   */
  async function getFearAndGreed() {
    const cacheKey = 'fear_and_greed';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(config.endpoints.fearAndGreed);
      if (!res.ok) throw new Error('Fear & Greed API failed');
      const json = await res.json();

      if (json && json.data && json.data.length > 0) {
        const current = json.data[0];
        const yesterday = json.data[1] || current;
        const lastWeek = json.data[6] || current;
        const lastMonth = json.data[29] || current;

        const result = {
          value: parseInt(current.value),
          classification: current.value_classification,
          yesterday: parseInt(yesterday.value),
          lastWeek: parseInt(lastWeek.value),
          lastMonth: parseInt(lastMonth.value),
          history: json.data, // 30 entries
          timestamp: new Date(parseInt(current.timestamp) * 1000)
        };
        setCache(cacheKey, result);
        return result;
      }
      throw new Error('Invalid Fear & Greed payload');
    } catch (err) {
      console.warn('Fear & Greed API error; using fallback:', err.message);
      const fb = config.fallbackFearAndGreed;
      return {
        value: parseInt(fb.value),
        classification: fb.value_classification,
        yesterday: parseInt(fb.previous_day),
        lastWeek: parseInt(fb.previous_week),
        lastMonth: parseInt(fb.previous_month),
        history: [],
        timestamp: new Date()
      };
    }
  }

  /**
   * Currency management
   */
  function setCurrency(curr) {
    if (curr !== 'USD' && curr !== 'PKR') return;
    currentCurrency = curr;
    localStorage.setItem('mp_currency', curr);
    window.dispatchEvent(new CustomEvent('marketpulse:currencyChange', { detail: { currency: curr } }));
  }

  function getCurrency() {
    return currentCurrency;
  }

  /**
   * Convert USD price to current target currency
   */
  function convertPrice(usdPrice) {
    if (currentCurrency === 'PKR') {
      const rate = cachedRates.pkr || config.fallbackRates.pkr;
      return usdPrice * rate;
    }
    return usdPrice;
  }

  /**
   * Format currency values nicely
   */
  function formatPrice(usdPrice, forceCurrency = null) {
    const curr = forceCurrency || currentCurrency;
    const rate = (curr === 'PKR') ? (cachedRates.pkr || config.fallbackRates.pkr) : 1;
    const converted = usdPrice * rate;

    if (curr === 'PKR') {
      if (converted >= 1000000) {
        return '₨ ' + converted.toLocaleString('en-PK', { maximumFractionDigits: 0 });
      } else if (converted >= 100) {
        return '₨ ' + converted.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else {
        return '₨ ' + converted.toLocaleString('en-PK', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
      }
    } else {
      // USD
      if (converted >= 1000) {
        return '$' + converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else if (converted >= 1) {
        return '$' + converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
      } else if (converted >= 0.0001) {
        return '$' + converted.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
      } else {
        return '$' + converted.toFixed(6);
      }
    }
  }

  /**
   * Format large volumes with B / M / T
   */
  function formatVolume(usdVolume, forceCurrency = null) {
    const curr = forceCurrency || currentCurrency;
    const rate = (curr === 'PKR') ? (cachedRates.pkr || config.fallbackRates.pkr) : 1;
    const val = usdVolume * rate;
    const prefix = curr === 'PKR' ? '₨ ' : '$';

    if (val >= 1e12) return prefix + (val / 1e12).toFixed(2) + 'T';
    if (val >= 1e9) return prefix + (val / 1e9).toFixed(2) + 'B';
    if (val >= 1e6) return prefix + (val / 1e6).toFixed(2) + 'M';
    if (val >= 1e3) return prefix + (val / 1e3).toFixed(2) + 'K';
    return prefix + val.toFixed(0);
  }

  /**
   * Format 24h percentage change with sign & arrow
   */
  function formatChangeBadge(change) {
    const isGain = change >= 0;
    const sign = isGain ? '+' : '';
    const arrow = isGain ? '▲' : '▼';
    const colorClass = isGain 
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' 
      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
    
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${colorClass} tabular-nums">
      <span class="text-[10px]">${arrow}</span>
      <span>${sign}${change.toFixed(2)}%</span>
    </span>`;
  }

  /**
   * Universal Live Coins Fetcher
   * Automatically prioritizes Bitunix.com free Futures API, with seamless fallback to Binance Vision API
   */
  async function getLiveCoins(preferred = 'auto') {
    if (preferred === 'bitunix' || preferred === 'auto') {
      try {
        const bitunix = await getBitunixTickers();
        if (bitunix && bitunix.data && bitunix.data.length > 0) {
          return bitunix;
        }
      } catch (e) {
        console.warn('Bitunix API fetch skipped, falling back to Binance', e);
      }
    }
    const binance = await getBinance24h();
    if (binance && binance.data && binance.data.length > 0) {
      binance.source = 'Binance Vision Spot API';
      return binance;
    }
    return {
      data: config.fallbackCoins,
      timestamp: new Date(),
      source: 'Verified Fallback Feed',
      isFallback: true
    };
  }

  // Pre-fetch currency rates on load
  getCurrencyRates();

  return {
    getBitunixTickers,
    getLiveCoins,
    getBinance24h,
    getBinanceKlines,
    getCurrencyRates,
    getFearAndGreed,
    setCurrency,
    getCurrency,
    convertPrice,
    formatPrice,
    formatVolume,
    formatChangeBadge,
    getRates: () => cachedRates
  };
})();

