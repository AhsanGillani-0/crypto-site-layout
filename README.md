# MarketPulse v2 — Institutional Market Intelligence & Financial Data

**MarketPulse v2** is a modern, light-first, institutional front-end demo for Crypto, Forex & Commodities intelligence. Built strictly with **semantic HTML5**, **Tailwind CSS (CDN)**, and **vanilla JavaScript**, it connects directly to keyless, client-side public APIs (Binance Vision, Alternative.me, Open Currency APIs) and requires no backend, database, or build tools.

🌐 **Live GitHub Pages URL**: [https://ahsangillani-0.github.io/crypto-site-layout/](https://ahsangillani-0.github.io/crypto-site-layout/)

---

## 🎨 1. Design System (Light Theme Default)

In response to client feedback (*"dark theme hurts the eyes"*), MarketPulse v2 adopts a clean, airy, high-contrast fintech aesthetic inspired by CoinGecko and Cryptonews, using CSS custom variables:

| Variable | Hex Value | Purpose |
| :--- | :--- | :--- |
| `--bg` | `#F6F9FC` | Soft ice-blue background (reduces eye strain) |
| `--surface` | `#FFFFFF` | Crisp white cards & content surfaces |
| `--text` | `#0B1220` | Primary dark navy ink |
| `--muted` | `#5B6B7F` | Secondary slate muted text |
| `--border` | `#E3EAF2` | Subtle borders |
| `--primary` | `#F5B700` | Yellow accent (**always** with black text, never yellow-on-white) |
| `--ice` | `#DCEBFA` | Chip accents & section tints |
| `--gain` | `#0E9F6E` | Emerald gain on `#E6F7EF` tint |
| `--loss` | `#E11D48` | Rose loss on `#FDE8EC` tint |

- **Header**: Pure white glassmorphism (`backdrop-filter: blur(14px)`).
- **Footer**: Near-black (`#0B1220`) with yellow accent links.
- **Dark Mode**: Retained as an optional toggle in the header.
- **Typography**: `Inter` for body text and `Plus Jakarta Sans` for headings.
- **Gains & Losses**: Always paired with an explicit sign and direction arrow (`▲ +3.42%` / `▼ -1.20%`).

---

## 🛡️ 2. Truth & Transparency Rules

1. **No Invented Claims**: Removed all fabricated claims (no *"65,000+ investors"*, *"SBP validated"*, etc.).
2. **Demo Content Labels**: Every sample article, demo author profile, mock portfolio card, and broker rating is tagged with an explicit `Demo content` badge.
3. **Verified Live Data**: Live feeds display their data origin and refresh time (*"Binance Vision"*, *"Updated 16:04"*).
4. **Mandatory Risk Disclaimer**: Featured in the footer of every page:  
   > *"Trading involves risk. Content is for information only and not financial advice."*

---

## 🇵🇰 3. Pakistan & Regional Forex Focus

- **Global Currency Switcher**: One-click **USD / PKR** toggle in the header instantly updates coin prices and portfolio valuations site-wide.
- **PKR Corner**: Live interbank rates for `USD/PKR`, `EUR/PKR`, `GBP/PKR`, `SAR/PKR`, and `AED/PKR`.
- **Gold per Tola Calculator**: Real conversion formula: `(Spot Gold USD × USD/PKR × 11.6638) / 31.1035` with manual override options for 24K and 22K jewelry purity.

---

## 📂 4. Complete Pages Directory (17 Templates)

### Flagship Pages
1. `index.html` — Homepage featuring Hero with floating live cards, Spotlight row, AI Market Brief, Top Gainers/Losers, Fear & Greed gauge, Top 10 coins, Tools grid, PKR corner, Gold tola, Commodities strip, Broker reviews, Academy preview, and Portfolio CTA.
2. `markets.html` — Screener of all Binance USDT pairs with real-time search, sorting (Volume, Gain, Loss, Price), and 50-row pagination.
3. `coin.html` — Dynamic single-coin view (`?symbol=BTCUSDT`) embedding TradingView Advanced Chart, 24h stats, and instant converter.

### Interactive Calculators & Market Tools (Real Math)
4. `tools.html` — Tools Hub with categorized cards, FAQ accordion, and tool suggestion form.
5. `dca-calculator.html` — Dollar-Cost Averaging backtest simulator powered by Binance daily historical klines with SVG performance chart.
6. `position-size-calculator.html` — Position sizing and risk-to-reward ratio modeler based on total capital and stop-loss distance.
7. `crypto-converter.html` — Live bidirectional converter (Coin ↔ USD ↔ PKR) with popular reference pairs.
8. `gold-tola-calculator.html` — Dedicated Pakistani gold rate calculator from spot PAXG bullion with manual override.
9. `profit-loss-calculator.html` — PnL and ROI % calculator accounting for maker/taker exchange fees and break-even targets.
10. `fear-greed.html` — Alternative.me Fear & Greed gauge with yesterday/week/month comparison and 30-day SVG trend curve.
11. `gainers-losers.html` — 24h market movers strictly filtered for institutional liquidity (> $5M volume).
12. `heatmap.html` — Interactive treemap of top 100 coins sized by 24h volume and color-coded by 24h return.

### Editorial & Trust
13. `news.html` — News listing with category filter tabs (All, Crypto, Forex, Commodities) and pagination.
14. `article.html` — Institutional article template with top reading-progress bar, 720px readable body, key takeaways box, and related stories.
15. `author.html` — Author profile page template with bio, verified credentials, and recent publications list.
16. `exchanges-brokers.html` — Exchange directory with filters (Crypto, Forex, Stocks), pros/cons, ratings, and affiliate disclosure.
17. `academy.html` — Learning hub with Beginner, Intermediate, and Advanced badges and estimated read times.

---

## ⚡ 5. Motion & Interaction Features

All animations are lightweight, GPU-accelerated (`transform` & `opacity` only), and respect `prefers-reduced-motion: reduce`:

1. **Live Marquee Ticker**: Continuous CSS ticker tape under the header (pauses on hover).
2. **Hero Floating Cards**: Subtle float (`translateY ±6px`, 6s loop) displaying live BTC and USD/PKR data.
3. **Scroll Reveal**: Elements fade up 16px via `IntersectionObserver`.
4. **Live Price Flash**: Flashes green (up) or red (down) for 600ms on value changes.
5. **Fear & Greed Needle**: Smooth rotational needle animation from 0° to final score.
6. **Reading Progress Bar**: Fixed top progress bar tracking article scroll depth.
7. **Global Search (Cmd/Ctrl+K)**: Instant keyboard-driven modal indexing coins, tools, and news.
8. **Floating "Ask AI" Widget**: Slide-up conversational panel with 3 suggested questions and typing indicator.
9. **SVG Sparklines**: Inline vector trend lines drawn in tables.

---

## 🛠️ Architecture & Data Layer

- `assets/js/config.js` — Single central configuration file for brand strings, API endpoints, and fallback datasets.
- `assets/js/api.js` — Client-side fetcher with 60s in-memory caching, graceful offline fallback, and currency conversions.
- `assets/js/main.js` — Shared navigation, search modal, theme controller, and UI interactions.
- `assets/css/style.css` — Tailored CSS custom properties, responsive utilities, and motion keyframes.
