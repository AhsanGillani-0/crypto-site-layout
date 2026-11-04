/**
 * MarketPulse - Institutional Financial Intelligence & Market Data
 * Brand, UI Controls, Dark/Light Mode, Search & Micro-interactions
 */

const BRAND_NAME = "MarketPulse";

// --- Theme Management ---
function initTheme() {
  const savedTheme = localStorage.getItem('marketpulse_theme');
  // Default to 'dark' institutional navy
  const activeTheme = savedTheme ? savedTheme : 'dark';
  applyTheme(activeTheme);
}

function applyTheme(theme) {
  const html = document.documentElement;
  const isDark = theme === 'dark';
  
  if (isDark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
  
  localStorage.setItem('marketpulse_theme', theme);
  updateThemeIcons(isDark);
  
  // Dispatch custom event for widgets if needed
  window.dispatchEvent(new CustomEvent('marketpulse:themechange', { detail: { theme, isDark } }));
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  applyTheme(isDark ? 'light' : 'dark');
}

function updateThemeIcons(isDark) {
  const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    const sunIcon = btn.querySelector('.theme-icon-sun');
    const moonIcon = btn.querySelector('.theme-icon-moon');
    if (sunIcon && moonIcon) {
      if (isDark) {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
      } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
      }
    }
  });
}

// --- Toast Notifications ---
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-msg flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border ${
    type === 'success' 
      ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 backdrop-blur-md'
      : 'bg-slate-900/90 text-slate-100 border-slate-700 backdrop-blur-md'
  }`;
  
  const icon = type === 'success' 
    ? `<svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
    : `<svg class="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  
  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- Mobile Navigation Drawer ---
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-menu-drawer');
  const backdrop = document.getElementById('mobile-menu-backdrop');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (!toggleBtn || !drawer) return;

  function openDrawer() {
    drawer.classList.remove('translate-x-full');
    if (backdrop) backdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    toggleBtn.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    drawer.classList.add('translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
    document.body.style.overflow = '';
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.classList.contains('translate-x-full')) {
      closeDrawer();
    }
  });

  // Mobile submenu accordions
  const accordionButtons = drawer.querySelectorAll('.mobile-accordion-toggle');
  accordionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const icon = btn.querySelector('.accordion-chevron');
      if (panel) {
        panel.classList.toggle('hidden');
        if (icon) icon.classList.toggle('rotate-180');
      }
    });
  });
}

// --- Global Search Modal ---
const SEARCH_INDEX = [
  { title: "Bitcoin Surpasses Institutional Allocation Thresholds", category: "Crypto News", url: "article.html", ticker: "BTC" },
  { title: "Ethereum Layer-2 Throughput Reaches Milestone", category: "Crypto News", url: "article.html", ticker: "ETH" },
  { title: "Solana DeFi TVL Climbs as High-Frequency DEXes Gain Market Share", category: "Crypto News", url: "article.html", ticker: "SOL" },
  { title: "Federal Reserve Holds Benchmark Rates Steady: Dollar Index Dips", category: "Forex", url: "news.html?cat=forex", ticker: "DXY" },
  { title: "Pakistani Rupee (USD/PKR) Consolidates at 278.40 on Remittances", category: "Forex", url: "news.html?cat=forex", ticker: "USD/PKR" },
  { title: "Euro Steady vs Dollar (EUR/USD) Ahead of ECB Minutes", category: "Forex", url: "news.html?cat=forex", ticker: "EUR/USD" },
  { title: "Gold Hits New All-Time High at $2,780/oz on Geopolitical Hedge", category: "Commodities", url: "news.html?cat=commodities", ticker: "GOLD" },
  { title: "Copper Rallies on Energy Transition & Clean Grid Infrastructure Demand", category: "Commodities", url: "news.html?cat=commodities", ticker: "COPPER" },
  { title: "Crude Oil (WTI & Brent) Balances OPEC+ Quota Adjustments", category: "Commodities", url: "news.html?cat=commodities", ticker: "CRUDE OIL" },
  { title: "Live Cryptocurrency Screener & Technicals", category: "Markets", url: "crypto.html", ticker: "ALL COINS" },
  { title: "Top Crypto Exchanges & Forex Brokers Guide 2026", category: "Reviews", url: "index.html#brokers", ticker: "BROKERS" },
  { title: "MarketPulse Portfolio Tracker & Analytics Preview", category: "Tools", url: "index.html#portfolio", ticker: "PORTFOLIO" }
];

function initSearchModal() {
  const modal = document.getElementById('search-modal');
  const openButtons = document.querySelectorAll('.search-open-btn');
  const closeBtn = document.getElementById('search-modal-close');
  const input = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');

  if (!modal) return;

  function openSearch() {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (input) {
      input.value = '';
      renderSearchResults(SEARCH_INDEX.slice(0, 5));
      setTimeout(() => input.focus(), 80);
    }
  }

  function closeSearch() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  openButtons.forEach(btn => btn.addEventListener('click', openSearch));
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
      closeSearch();
    }
  });

  // Shortcut Ctrl+K / Cmd+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.classList.contains('hidden')) {
        openSearch();
      } else {
        closeSearch();
      }
    } else if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeSearch();
    }
  });

  // Search input typing
  if (input && resultsContainer) {
    input.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        renderSearchResults(SEARCH_INDEX.slice(0, 5));
        return;
      }
      const filtered = SEARCH_INDEX.filter(item => 
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.ticker.toLowerCase().includes(q)
      );
      renderSearchResults(filtered, q);
    });
  }

  function renderSearchResults(items, query = '') {
    if (!resultsContainer) return;
    if (items.length === 0) {
      resultsContainer.innerHTML = `
        <div class="py-12 text-center text-slate-400">
          <svg class="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <p class="font-medium text-slate-300">No results found for "${query}"</p>
          <p class="text-xs text-slate-500 mt-1">Try searching for "BTC", "Gold", "USD/PKR" or "Rates"</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = items.map(item => `
      <a href="${item.url}" class="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-800/60 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700/60 group">
        <div class="flex items-center gap-3">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">${item.ticker}</span>
          <div>
            <div class="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">${item.title}</div>
            <div class="text-xs text-slate-400 mt-0.5">${item.category}</div>
          </div>
        </div>
        <svg class="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </a>
    `).join('');
  }
}

// --- Newsletter Subscription UI ---
function initNewsletterForms() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`Welcome aboard! Confirmation sent to ${input.value}`, 'success');
        input.value = '';
      }
    });
  });
}

// --- Clipboard & Share Actions ---
function initShareActions() {
  const copyBtn = document.getElementById('copy-article-link');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('Article link copied to clipboard!', 'success');
        }).catch(() => {
          showToast('Link copied: ' + window.location.href, 'info');
        });
      } else {
        showToast('Link copied to clipboard!', 'success');
      }
    });
  }
}

// --- Fear & Greed Interactive Needle Demo ---
function initFearAndGreedGauge() {
  const needle = document.getElementById('gauge-needle');
  if (needle) {
    // Score 74 Greed corresponds to angle in semi-circle (-90 to +90 degrees)
    // 0 = -90deg, 50 = 0deg, 100 = +90deg -> 74 = (74/100 * 180) - 90 = 43.2 deg
    setTimeout(() => {
      needle.style.transform = 'rotate(43.2deg)';
    }, 400);
  }
}

// --- News Category Filter (news.html) ---
function initNewsFilter() {
  const tabs = document.querySelectorAll('.news-category-tab');
  const cards = document.querySelectorAll('.news-item-card');

  if (tabs.length === 0 || cards.length === 0) return;

  // Check URL params for category
  const urlParams = new URLSearchParams(window.location.search);
  const activeParam = urlParams.get('cat');

  if (activeParam) {
    tabs.forEach(tab => {
      if (tab.dataset.category === activeParam) {
        activateTab(tab);
        filterCards(activeParam);
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activateTab(tab);
      const cat = tab.dataset.category;
      filterCards(cat);
    });
  });

  function activateTab(selectedTab) {
    tabs.forEach(t => {
      t.classList.remove('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-500/20');
      t.classList.add('text-slate-400', 'hover:text-slate-200', 'bg-slate-800/40');
    });
    selectedTab.classList.remove('text-slate-400', 'hover:text-slate-200', 'bg-slate-800/40');
    selectedTab.classList.add('bg-blue-600', 'text-white', 'shadow-md', 'shadow-blue-500/20');
  }

  function filterCards(cat) {
    cards.forEach(card => {
      if (cat === 'all' || card.dataset.category === cat) {
        card.style.display = '';
        card.style.opacity = '1';
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
      }
    });
  }
}

// --- Crypto Table Filter & Search (crypto.html & index.html) ---
function initCryptoTableFilter() {
  const searchInput = document.getElementById('crypto-table-search');
  const tableRows = document.querySelectorAll('.crypto-table-row');
  const filterPills = document.querySelectorAll('.crypto-filter-pill');

  if (!tableRows.length) return;

  function filterTable() {
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activePill = document.querySelector('.crypto-filter-pill.active');
    const selectedCategory = activePill ? activePill.dataset.category : 'all';

    tableRows.forEach(row => {
      const name = row.dataset.name ? row.dataset.name.toLowerCase() : '';
      const symbol = row.dataset.symbol ? row.dataset.symbol.toLowerCase() : '';
      const cat = row.dataset.category ? row.dataset.category.toLowerCase() : 'all';

      const matchesSearch = !q || name.includes(q) || symbol.includes(q);
      const matchesCategory = selectedCategory === 'all' || cat.includes(selectedCategory);

      if (matchesSearch && matchesCategory) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterTable);
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('active', 'bg-blue-600', 'text-white');
        p.classList.add('bg-slate-800/60', 'text-slate-400');
      });
      pill.classList.add('active', 'bg-blue-600', 'text-white');
      pill.classList.remove('bg-slate-800/60', 'text-slate-400');
      filterTable();
    });
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  // Bind theme toggles
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });

  initMobileMenu();
  initSearchModal();
  initNewsletterForms();
  initShareActions();
  initFearAndGreedGauge();
  initNewsFilter();
  initCryptoTableFilter();
});

