# MarketPulse — Institutional Market Intelligence & Financial Data

A clean, modern, institutional-grade front-end demo layout for a **Cryptocurrency, Foreign Exchange (Forex) & Commodities** news and market data platform. Inspired by the clarity of **Bloomberg**, the editorial design of **CoinDesk**, and the multi-asset depth of **Investing.com**.

## 🌐 Live Demo
- **GitHub Pages Preview**: [https://ahsangillani-0.github.io/crypto-site-layout/](https://ahsangillani-0.github.io/crypto-site-layout/)

---

## 🚀 Key Features

- **Institutional Design System**: Deep Navy (`#0B1220`) & Charcoal dark surfaces, crisp light mode surfaces, emerald gains (`#10B981`) and soft red losses (`#EF4444`) with explicit arrow/sign indicators (`▲ +%`, `▼ -%`).
- **Dark / Light Mode**: Seamless theme toggle stored in `localStorage` using CSS custom properties.
- **100% Mobile Responsive**: Tested from 360px mobile viewports up to 4K displays, with an accessible slide-in drawer and collapsible accordions.
- **Live TradingView Integration**:
  - Live Ticker Tape (BTC, ETH, EUR/USD, USD/PKR, Gold, Silver, Copper, Crude Oil) with fallback marquee.
  - Market Overview Widget with multi-asset tabs.
  - Advanced Candlestick Chart (BTCUSD) & Screener / Heatmap.
- **Zero Heavy Dependencies**: Pure static HTML + Tailwind CSS (CDN) + vanilla JS. No backend, no database, no build tools needed.

---

## 📑 Pages Included

1. **`index.html` (Home)**
   - Sticky header with multi-level dropdowns & search modal (`⌘K` / `Ctrl+K`)
   - Live ticker tape
   - Hero: Large featured story + 4-story Breaking Wire
   - Market Overview widget (Crypto, Forex, Commodities)
   - Top 8 Cryptocurrencies table with inline SVG sparklines
   - 6-card Latest News grid with SVG financial art
   - Tactical Snapshots: Pakistan Interbank Forex (USD/PKR, EUR/PKR, GBP/PKR, SAR/PKR, AED/PKR), Commodities desk (Gold, Silver, Copper, Oil), and Fear & Greed needle gauge
   - Top 4 Broker reviews (Binance, Bybit, Exness, XM)
   - "Track Your Crypto" Portfolio CTA banner with mock card preview
   - Morning Briefing newsletter signup
   - Institutional Footer with Risk Disclaimer

2. **`news.html` (News Wire)**
   - Interactive category filter tabs (`All`, `Crypto`, `Forex`, `Commodities`)
   - 8 curated market intelligence articles
   - Clean pagination UI
   - Sidebar: Most Read stories, Trending Tickers, and newsletter box

3. **`crypto.html` (Crypto Terminal)**
   - Global market metrics strip (Market Cap, Vol, BTC Dominance, Gas Gwei)
   - TradingView Advanced Interactive Chart (BTCUSD)
   - TradingView Screener & Performance Heatmap
   - Extended 10-row Cryptocurrency Table with instant client-side search and category filter pills (`Layer 1`, `DeFi`, `Layer 2`)

4. **`article.html` (Single Article Template)**
   - Breadcrumb navigation & H1 headline
   - Author metadata, timestamp & fact-check badge
   - Featured graphic area with vector charts
   - Key Takeaways / Executive Summary box
   - Readable typography body (`max-w-3xl`)
   - Technical level snapshot card & pull quotes
   - Author bio card, related stories, and sticky social share bar

---

## 🛠️ Project Structure

```text
├── index.html        # Home Page
├── news.html         # News Listing
├── crypto.html       # Crypto Screener & Chart
├── article.html      # Single News Article
├── assets/
│   ├── css/
│   │   └── style.css # Design system tokens & utility classes
│   └── js/
│       └── main.js   # Theme switcher, search modal, drawer, tabs & filters
└── README.md
```

---

## 📄 License
Preview demo layout built for client approval. Content is for informational purposes only and does not constitute financial advice.

