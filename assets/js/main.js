/**
 * MarketPulse v2 - Core UI & Interaction Controller
 * Controls theme, currency toggle, Cmd+K search, Ask AI widget, count-up animation, mobile drawer, and shared UI.
 */

(function () {
  'use strict';

  // --- 1. Theme Controller (Light Mode Default) ---
  function initTheme() {
    if (localStorage.getItem('marketpulse_theme')) {
      localStorage.removeItem('marketpulse_theme');
    }
    const savedTheme = localStorage.getItem('mp_theme') || 'light';
    const html = document.documentElement;

    if (savedTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isDark = html.classList.toggle('dark');
        localStorage.setItem('mp_theme', isDark ? 'dark' : 'light');
        updateThemeIcons(isDark);
      });
    });

    updateThemeIcons(html.classList.contains('dark'));
  }

  function updateThemeIcons(isDark) {
    document.querySelectorAll('.theme-icon-sun').forEach(el => el.classList.toggle('hidden', !isDark));
    document.querySelectorAll('.theme-icon-moon').forEach(el => el.classList.toggle('hidden', isDark));
  }

  // --- 2. Global Currency Switcher (USD / PKR) ---
  function initCurrencySwitcher() {
    const activeCurr = window.MarketPulseAPI ? window.MarketPulseAPI.getCurrency() : 'USD';
    updateCurrencyButtons(activeCurr);

    document.querySelectorAll('.currency-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-currency');
        if (target && window.MarketPulseAPI) {
          window.MarketPulseAPI.setCurrency(target);
          updateCurrencyButtons(target);
          updateDOMPrices();
        }
      });
    });

    window.addEventListener('marketpulse:currencyChange', (e) => {
      updateCurrencyButtons(e.detail.currency);
      updateDOMPrices();
    });
  }

  function updateCurrencyButtons(curr) {
    document.querySelectorAll('.currency-toggle-btn').forEach(btn => {
      const isTarget = btn.getAttribute('data-currency') === curr;
      if (isTarget) {
        btn.classList.add('bg-[#F5B700]', 'text-[#0B1220]', 'shadow-sm', 'font-bold');
        btn.classList.remove('text-slate-500', 'hover:text-slate-800');
      } else {
        btn.classList.remove('bg-[#F5B700]', 'text-[#0B1220]', 'shadow-sm', 'font-bold');
        btn.classList.add('text-slate-500', 'hover:text-slate-800');
      }
    });
  }

  function updateDOMPrices() {
    if (!window.MarketPulseAPI) return;
    document.querySelectorAll('[data-price-usd]').forEach(el => {
      const usdVal = parseFloat(el.getAttribute('data-price-usd'));
      if (!isNaN(usdVal)) {
        const oldVal = el.textContent;
        const newVal = window.MarketPulseAPI.formatPrice(usdVal);
        el.textContent = newVal;
        if (oldVal !== newVal) {
          el.classList.add('flash-up');
          setTimeout(() => el.classList.remove('flash-up'), 600);
        }
      }
    });
  }

  // --- 3. Sticky Compact Header on Scroll ---
  function initStickyHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('header-compact');
      } else {
        header.classList.remove('header-compact');
      }
    }, { passive: true });
  }

  // --- 3b. Nav Dropdown Controller (Zero-Glitch Grace Period + Click Toggle) ---
  function initNavDropdowns() {
    const groups = document.querySelectorAll('.dropdown-group');
    if (!groups.length) return;

    groups.forEach(group => {
      let closeTimer = null;
      const btn = group.querySelector('button');

      group.addEventListener('mouseenter', () => {
        if (closeTimer) clearTimeout(closeTimer);
        groups.forEach(g => { if (g !== group) g.classList.remove('is-open'); });
        group.classList.add('is-open');
      });

      group.addEventListener('mouseleave', () => {
        closeTimer = setTimeout(() => {
          group.classList.remove('is-open');
        }, 220); // 220ms grace period so moving cursor never loses menu
      });

      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = group.classList.contains('is-open');
          groups.forEach(g => g.classList.remove('is-open'));
          if (!isOpen) {
            group.classList.add('is-open');
          }
        });
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown-group')) {
        groups.forEach(g => g.classList.remove('is-open'));
      }
    });
  }

  // --- 3c. Top-Tier Crypto Cursor Glow & Tilt ---
  function initCardGlow() {
    const cards = document.querySelectorAll('.crypto-card-glow, .mp-card-hover, .glass-float-card, .mp-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // --- 4. Count-Up Numbers Animation (Motion #5) ---
  function initCountUpNumbers() {
    const countElements = document.querySelectorAll('[data-count-to]');
    if (!countElements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-count-to')) || 0;
          const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1200; // ms
          const startTime = performance.now();

          function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = (target * easeOut).toFixed(decimals);
            el.textContent = prefix + parseFloat(current).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = prefix + target.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
            }
          }

          requestAnimationFrame(step);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    countElements.forEach(el => observer.observe(el));
  }

  // --- 5. Mobile Drawer Navigation ---
  function initMobileDrawer() {
    const openBtn = document.getElementById('mobile-menu-open');
    const closeBtn = document.getElementById('mobile-menu-close');
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');

    if (!drawer) return;

    function openDrawer() {
      drawer.classList.remove('translate-x-full');
      if (backdrop) {
        backdrop.classList.remove('opacity-0', 'pointer-events-none');
        backdrop.classList.add('opacity-100');
      }
      document.body.classList.add('overflow-hidden');
    }

    function closeDrawer() {
      drawer.classList.add('translate-x-full');
      if (backdrop) {
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
      }
      document.body.classList.remove('overflow-hidden');
    }

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
  }

  // --- 6. Global Search Modal (Cmd/Ctrl + K) ---
  const searchableItems = [
    { type: 'Tool', title: 'DCA Calculator', desc: 'Simulate Dollar Cost Averaging with real historical klines', url: 'dca-calculator.html' },
    { type: 'Tool', title: 'Position Size Calculator', desc: 'Calculate exact risk amount and Risk/Reward ratio', url: 'position-size-calculator.html' },
    { type: 'Tool', title: 'Crypto to PKR Converter', desc: 'Live bidirectional currency converter', url: 'crypto-converter.html' },
    { type: 'Tool', title: 'Gold per Tola Calculator', desc: 'Calculate Pakistani gold tola rates from spot XAU/PAXG', url: 'gold-tola-calculator.html' },
    { type: 'Tool', title: 'Profit & Loss Calculator', desc: 'Compute exact net profit, fees, and ROI %', url: 'profit-loss-calculator.html' },
    { type: 'Market', title: 'Fear & Greed Index', desc: 'Live crypto market sentiment analysis and 30-day history', url: 'fear-greed.html' },
    { type: 'Market', title: 'Top Gainers & Losers', desc: 'Live 24h Binance USDT performance over $5M volume', url: 'gainers-losers.html' },
    { type: 'Market', title: 'Market Heatmap', desc: 'Top 100 coins tile heatmap sized by 24h volume', url: 'heatmap.html' },
    { type: 'Market', title: 'All Markets Screener', desc: 'Complete Binance USDT coins directory with sorting', url: 'markets.html' },
    { type: 'Coin', title: 'Bitcoin (BTC)', desc: 'Live price, TradingView chart, high/low & statistics', url: 'coin.html?symbol=BTCUSDT' },
    { type: 'Coin', title: 'Ethereum (ETH)', desc: 'Live price, TradingView chart, high/low & statistics', url: 'coin.html?symbol=ETHUSDT' },
    { type: 'Coin', title: 'Solana (SOL)', desc: 'Live price, TradingView chart, high/low & statistics', url: 'coin.html?symbol=SOLUSDT' },
    { type: 'Guide', title: 'Crypto Academy', desc: 'Beginner and intermediate guides to blockchain and risk', url: 'academy.html' },
    { type: 'Broker', title: 'Exchanges & Brokers Review', desc: 'Independent ratings, pros/cons, and fees disclosure', url: 'exchanges-brokers.html' },
    { type: 'News', title: 'Crypto Market News', desc: 'Latest breaking institutional and retail headlines', url: 'news.html' }
  ];

  function initSearchModal() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    const openBtns = document.querySelectorAll('.search-modal-trigger');
    const closeBtn = document.getElementById('search-modal-close');

    if (!modal || !input) return;

    let selectedIndex = 0;
    let filteredList = [...searchableItems];

    function openModal() {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      input.value = '';
      filterResults('');
      setTimeout(() => input.focus(), 50);
    }

    function closeModal() {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }

    openBtns.forEach(b => b.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (modal.classList.contains('hidden')) {
          openModal();
        } else {
          closeModal();
        }
      }
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    input.addEventListener('input', (e) => {
      filterResults(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
      const items = resultsContainer.querySelectorAll('.search-result-row');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        highlightSelected(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        highlightSelected(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredList[selectedIndex]) {
          window.location.href = filteredList[selectedIndex].url;
        }
      }
    });

    function filterResults(query) {
      const q = query.toLowerCase().trim();
      filteredList = q === '' 
        ? searchableItems 
        : searchableItems.filter(item => 
            item.title.toLowerCase().includes(q) || 
            item.desc.toLowerCase().includes(q) ||
            item.type.toLowerCase().includes(q)
          );

      selectedIndex = 0;
      renderResults();
    }

    function renderResults() {
      if (!resultsContainer) return;
      if (filteredList.length === 0) {
        resultsContainer.innerHTML = `
          <div class="py-8 text-center text-slate-500">
            <p class="text-sm">No results found for that query.</p>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = filteredList.map((item, idx) => `
        <a href="${item.url}" class="search-result-row block p-3 rounded-xl transition flex items-center justify-between group ${idx === selectedIndex ? 'bg-amber-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">${item.type}</span>
              <span class="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600">${item.title}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">${item.desc}</p>
          </div>
          <span class="text-xs text-slate-400 group-hover:text-slate-600">↵</span>
        </a>
      `).join('');
    }

    function highlightSelected(items) {
      items.forEach((item, idx) => {
        if (idx === selectedIndex) {
          item.classList.add('bg-amber-50', 'dark:bg-slate-800');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('bg-amber-50', 'dark:bg-slate-800');
        }
      });
    }
  }

  // --- 7. Floating "Ask AI" Assistant Widget ---
  function initAskAIWidget() {
    const trigger = document.getElementById('ask-ai-toggle') || document.getElementById('ask-ai-trigger');
    const panel = document.getElementById('ask-ai-panel');
    const closeBtn = document.getElementById('ask-ai-close');
    const body = document.getElementById('ask-ai-body');
    const form = document.getElementById('ask-ai-form');
    const input = document.getElementById('ask-ai-input');

    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => {
      panel.classList.toggle('hidden');
      if (!panel.classList.contains('hidden') && input) {
        input.focus();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => panel.classList.add('hidden'));
    }

    document.querySelectorAll('.ai-prompt-btn, .ask-ai-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.innerText.replace(/^[•\s]+/, '').trim();
        handleUserQuery(text);
      });
    });

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
          handleUserQuery(text);
          input.value = '';
        }
      });
    }

    function handleUserQuery(question) {
      if (!body) return;

      const userBubble = document.createElement('div');
      userBubble.className = 'flex justify-end mb-3';
      userBubble.innerHTML = `
        <div class="bg-[#F5B700] text-[#0B1220] font-bold text-xs rounded-2xl rounded-tr-none px-3.5 py-2 max-w-[85%] shadow-sm">
          ${escapeHTML(question)}
        </div>
      `;
      body.appendChild(userBubble);
      body.scrollTop = body.scrollHeight;

      // Typing loader
      const loader = document.createElement('div');
      loader.className = 'flex gap-1.5 items-center p-3 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-slate-500 w-fit mb-3';
      loader.innerHTML = `
        <span class="typing-dot w-2 h-2 rounded-full bg-slate-400"></span>
        <span class="typing-dot w-2 h-2 rounded-full bg-slate-400"></span>
        <span class="typing-dot w-2 h-2 rounded-full bg-slate-400"></span>
      `;
      body.appendChild(loader);
      body.scrollTop = body.scrollHeight;

      setTimeout(() => {
        loader.remove();

        let answer = "Current markets reflect a neutral-to-bullish rotation. Key institutional inflows support spot prices while macroeconomic rates stabilize.";
        if (question.toLowerCase().includes('gold') || question.toLowerCase().includes('tola')) {
          answer = "1 Pakistani Tola (11.664g) is derived from international gold per troy oz times USD/PKR. Check our Gold per Tola Calculator for live rates based on spot bullion.";
        } else if (question.toLowerCase().includes('sentiment') || question.toLowerCase().includes('fear')) {
          answer = "The Fear & Greed Index is currently signaling Greed, indicating heightened retail appetite with caution warranted around major resistance zones.";
        }

        const botBubble = document.createElement('div');
        botBubble.className = 'flex flex-col gap-1 mb-3';
        botBubble.innerHTML = `
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none p-3.5 max-w-[90%] shadow-sm leading-relaxed">
            <p>${answer}</p>
            <div class="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
              <span class="font-bold text-amber-600 dark:text-amber-400">Sample answer</span>
              <span>Powered by live data LLM in production</span>
            </div>
          </div>
        `;
        body.appendChild(botBubble);
        body.scrollTop = body.scrollHeight;
      }, 700);
    }
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // --- 8. Live Marquee Ticker Tape (Immediate 0ms Display + Live Hydration) ---
  const defaultTickerItems = [
    { name: 'BTC', price: '$89,450.20', change: 3.42 },
    { name: 'ETH', price: '$3,380.50', change: 2.15 },
    { name: 'SOL', price: '$214.80', change: 5.60 },
    { name: 'BNB', price: '$635.40', change: 1.12 },
    { name: 'XRP', price: '$1.48', change: -0.65 },
    { name: 'DOGE', price: '$0.3820', change: 8.94 },
    { name: 'ADA', price: '$0.5840', change: 2.80 },
    { name: 'AVAX', price: '$35.60', change: -2.10 },
    { name: 'USD/PKR', price: '₨ 278.70', change: 0.12 },
    { name: 'EUR/USD', price: '$1.0845', change: -0.08 },
    { name: 'Spot Gold (PAXG)', price: '$2,685.50', change: 0.45 },
    { name: 'Crude Oil', price: '$72.40', change: -0.85 }
  ];

  function buildTickerHTML(list) {
    return list.map(item => {
      const isUp = item.change >= 0;
      const arrow = isUp ? '▲' : '▼';
      const color = isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
      return `
        <div class="inline-flex items-center gap-2 px-4 py-1.5 border-r border-slate-200 dark:border-slate-800 text-xs whitespace-nowrap">
          <span class="font-bold text-slate-900 dark:text-white">${item.name}</span>
          <span class="font-mono text-slate-700 dark:text-slate-300 font-semibold" data-ticker-price="${item.name}">${item.price}</span>
          <span class="font-semibold ${color} flex items-center gap-0.5" data-ticker-change="${item.name}">
            <span class="text-[9px]">${arrow}</span>
            <span>${isUp ? '+' : ''}${item.change.toFixed(2)}%</span>
          </span>
        </div>
      `;
    }).join('');
  }

  async function initMarqueeTicker() {
    const track = document.getElementById('live-ticker-track');
    if (!track) return;

    // STEP 1: Render instantly so ticker moves IMMEDIATELY on 0ms page load
    if (!track.children.length || track.textContent.includes('Streaming') || track.textContent.includes('Loading')) {
      track.innerHTML = buildTickerHTML(defaultTickerItems) + buildTickerHTML(defaultTickerItems);
    }

    if (!window.MarketPulseAPI) return;

    // STEP 2: Asynchronously hydrate with live API data in background without interrupting marquee
    try {
      const [coinsRes, ratesRes] = await Promise.all([
        window.MarketPulseAPI.getLiveCoins(),
        window.MarketPulseAPI.getCurrencyRates()
      ]);

      const coins = coinsRes.data.slice(0, 8);
      const rates = ratesRes.rates || { pkr: 278.70, eur: 0.92 };

      const liveItems = [
        ...coins.map(c => ({
          name: c.code,
          price: window.MarketPulseAPI.formatPrice(c.price),
          change: c.change24h
        })),
        {
          name: 'USD/PKR',
          price: '₨ ' + rates.pkr.toFixed(2),
          change: 0.12
        },
        {
          name: 'EUR/USD',
          price: '$' + (rates.eur ? (1 / rates.eur).toFixed(4) : '1.0845'),
          change: -0.08
        },
        {
          name: 'Spot Gold (PAXG)',
          price: '$' + (coins.find(c => c.code === 'PAXG')?.price || 2685.50).toFixed(1),
          change: 0.45
        },
        {
          name: 'Crude Oil',
          price: '$72.40',
          change: -0.85
        }
      ];

      // Seamless in-place DOM hydration: updates figures directly so continuous CSS animation does NOT jump
      let updatedCount = 0;
      liveItems.forEach(item => {
        const priceEls = track.querySelectorAll(`[data-ticker-price="${item.name}"]`);
        const changeEls = track.querySelectorAll(`[data-ticker-change="${item.name}"]`);
        if (priceEls.length) {
          updatedCount++;
          priceEls.forEach(el => { el.textContent = item.price; });
        }
        if (changeEls.length) {
          const isUp = item.change >= 0;
          const arrow = isUp ? '▲' : '▼';
          const colorClass = isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
          changeEls.forEach(el => {
            el.className = `font-semibold ${colorClass} flex items-center gap-0.5`;
            el.innerHTML = `<span class="text-[9px]">${arrow}</span><span>${isUp ? '+' : ''}${item.change.toFixed(2)}%</span>`;
          });
        }
      });

      if (updatedCount === 0) {
        track.innerHTML = buildTickerHTML(liveItems) + buildTickerHTML(liveItems);
      }
    } catch (e) {
      console.warn('Ticker live hydration error:', e);
    }
  }

  // --- 9. Scroll Reveal Animations (Motion #3) ---
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('is-revealed');
          }, i * 60); // 60ms stagger
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    reveals.forEach(el => observer.observe(el));
  }

  // --- 10. Article Reading Progress Bar ---
  function initReadingProgressBar() {
    const bar = document.querySelector('.reading-progress-bar');
    if (!bar) return;

    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
      bar.style.width = Math.min(Math.max(progress, 0), 100) + '%';
    }, { passive: true });
  }

  // --- 11. Sparkline Inline SVG Generator ---
  window.generateSparklineSVG = function (points, isGain, width = 84, height = 26) {
    if (!points || points.length < 2) {
      points = isGain ? [10, 12, 11, 15, 14, 18, 22] : [22, 19, 20, 16, 17, 13, 10];
    }
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * (width - 4) + 2;
      const y = height - 4 - ((p - min) / range) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const strokeColor = isGain ? '#0E9F6E' : '#E11D48';
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="overflow-visible inline-block">
        <polyline fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points="${coords.join(' ')}" class="sparkline-path draw" />
      </svg>
    `;
  };

  // --- 12. Newsletter Form Handler ---
  function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    const successMsg = document.getElementById('newsletter-success');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.classList.add('hidden');
      if (successMsg) successMsg.classList.remove('hidden');
    });
  }

  // Bootstrap all UI features
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCurrencySwitcher();
    initStickyHeader();
    initNavDropdowns();
    initCardGlow();
    initCountUpNumbers();
    initMobileDrawer();
    initSearchModal();
    initAskAIWidget();
    initMarqueeTicker();
    initScrollReveal();
    initReadingProgressBar();
    initNewsletterForm();
  });

})();
