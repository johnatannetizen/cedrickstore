/* =========================================================================
   CedrickStore — Núcleo (core.js)
   Estado global, persistencia (localStorage), utilidades, íconos SVG,
   generador de imágenes, toasts, tema claro/oscuro, carrito, favoritos,
   comparador, autenticación demo y pedidos.
   ========================================================================= */
(function () {
  'use strict';

  const WHATSAPP_NUMBER = '573016515466'; // <- número de la tienda (editable)
  const STORE_NAME = 'CedrickStore';
  const KEY = {
    products: 'cs_products', categories: 'cs_categories', brands: 'cs_brands',
    coupons: 'cs_coupons', banners: 'cs_banners', testimonials: 'cs_testimonials',
    cart: 'cs_cart', wishlist: 'cs_wishlist', compare: 'cs_compare',
    orders: 'cs_orders', users: 'cs_users', session: 'cs_session',
    theme: 'cs_theme', seeded: 'cs_seeded_v1', settings: 'cs_settings'
  };

  /* ---------------- Persistencia ---------------- */
  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { localStorage.removeItem(k); }
  };

  /* ---------------- Sembrado inicial ---------------- */
  function seed(force) {
    const seedData = window.CEDRICK_SEED || {};
    if (force || !store.get(KEY.seeded)) {
      store.set(KEY.products, seedData.products || []);
      store.set(KEY.categories, seedData.categories || []);
      store.set(KEY.brands, seedData.brands || []);
      store.set(KEY.coupons, seedData.coupons || []);
      store.set(KEY.banners, seedData.banners || []);
      store.set(KEY.testimonials, seedData.testimonials || []);
      store.set(KEY.seeded, true);
      if (force) { CS.toast('Datos restablecidos', 'Catálogo restaurado a los valores originales.', 'success'); }
    }
  }

  /* ---------------- Utilidades ---------------- */
  const money = (n) => {
    n = Number(n) || 0;
    return '$' + n.toLocaleString('es-CO', { maximumFractionDigits: 0 });
  };
  const discountPct = (price, oldPrice) => oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;
  const slug = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const qs = (sel, ctx) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const param = (name) => new URLSearchParams(location.search).get(name);
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const escapeHtml = (s) => (s || '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = (p) => (p || 'id') + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);

  /* ---------------- Íconos SVG ---------------- */
  const ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1.6"/><circle cx="19" cy="21" r="1.6"/><path d="M2.5 3h2.2l2.3 12.4a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.6L21.5 7H6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    heartFill: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    compare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h13M3 6l3-3M3 6l3 3"/><path d="M21 18H8M21 18l-3-3M21 18l-3 3"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/></svg>',
    starO: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m12 2 3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M.5 23.5l1.6-5.9a11.3 11.3 0 1 1 4.2 4.1L.5 23.5zm6.6-3.8.4.2a9.4 9.4 0 1 0-3.2-3.1l.2.4-1 3.5 3.6-1zm11.3-5.3c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8.9-.1.2-.3.2-.5.1-1.4-.7-2.3-1.2-3.2-2.7-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.8.8-1 1.9-.6 3.1.5 1.6 1.6 3 3.4 4.3 2.4 1.8 3.8 1.7 4.7 1.6.6-.1 1.4-.6 1.6-1.2.2-.6.2-1 .1-1.2 0-.1-.2-.2-.4-.3z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.7L3 21l1.4-4.2A8.4 8.4 0 1 1 21 11.5z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16M7 12h10M10 19h4"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>',
    headset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="13" width="4" height="7" rx="1.5"/><rect x="18" y="13" width="4" height="7" rx="1.5"/><path d="M20 18v1a3 3 0 0 1-3 3h-3"/></svg>',
    watch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6"/><path d="M12 9v3l2 1M9 3h6l1 3M9 21h6l1-3"/></svg>',
    chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></svg>',
    shirt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4 15 2a3 3 0 0 1-6 0L4 4 2 8l3 2v10h14V10l3-2z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l3 3M15.4 15.4l3 3M18.4 5.6l-3 3M8.6 15.4l-3 3"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 14H5zM9 7a3 3 0 0 1 6 0"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.5M21 20a5.5 5.5 0 0 0-4-5"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7.5" cy="7.5" r="1.4"/></svg>',
    dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="10" rx="1"/><rect x="13" y="3" width="8" height="6" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/><rect x="3" y="17" width="8" height="4" rx="1"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m21 15-5-5L5 21"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.3 7-11a7 7 0 0 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15H4.5a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 6.2 8.3l-.1-.1A2 2 0 1 1 8.9 5.4l.1.1A1.6 1.6 0 0 0 11 4.6V4.5a2 2 0 0 1 4 0v.1A1.6 1.6 0 0 0 17.8 6.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 19.4 11h.1a2 2 0 0 1 0 4z"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 2H21l-6.6 7.5L22 22h-6.2l-4.8-6.3L5.5 22H3l7-8L2 2h6.3l4.3 5.7zM16 20h1.5L8 4H6.4z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.8C19.3 5 12 5 12 5s-7.3 0-8.9.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.8C4.7 19 12 19 12 19s7.3 0 8.9-.5a2.5 2.5 0 0 0 1.7-1.8C23 15.2 23 12 23 12zM9.8 15.3V8.7l5.7 3.3z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 3 2 10.5l5.3 1.7L18 6l-8 7.3.3 5.4 3-3.3 4 3c.6.3 1.4 0 1.5-.8L23 4.2A1 1 0 0 0 22 3z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>',
    money: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>'
  };
  const icon = (name, cls) => `<span class="ico ${cls || ''}" aria-hidden="true">${ICONS[name] || ''}</span>`;

  /* ---- Trazos de íconos (sin <svg>) para incrustar en imágenes generadas ---- */
  window.CS_ICON_PATHS = {
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
    watch: '<circle cx="12" cy="12" r="6"/><path d="M12 9v3l2 1M9 3h6l1 3M9 21h6l1-3"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="13" width="4" height="7" rx="1.5"/><rect x="18" y="13" width="4" height="7" rx="1.5"/><path d="M20 18v1a3 3 0 0 1-3 3h-3"/>',
    shirt: '<path d="M20 4 15 2a3 3 0 0 1-6 0L4 4 2 8l3 2v10h14V10l3-2z"/>',
    home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    sparkle: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l3 3M15.4 15.4l3 3M18.4 5.6l-3 3M8.6 15.4l-3 3"/>'
  };

  /* ---------------- Generador de imágenes (SVG data-uri) ---------------- */
  // Crea una imagen premium con degradado + ícono de categoría. Sin red.
  function genImage(seedStr, opts) {
    opts = opts || {};
    const tone = opts.tone || '#c9a227';
    const label = (opts.label || '').slice(0, 22);
    const variant = opts.variant || 0;
    const dark = shade(tone, -55);
    const light = shade(tone, 35);
    const iconPath = (window.CS_ICON_PATHS && window.CS_ICON_PATHS[opts.icon]) || '';
    const angles = [120, 145, 100, 160, 135];
    const ang = angles[variant % angles.length];
    const dots = variant % 2 === 0;
    const svg =
`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${ang - 135} .5 .5)">
<stop offset="0" stop-color="${light}"/><stop offset="0.55" stop-color="${tone}"/><stop offset="1" stop-color="${dark}"/>
</linearGradient>
<radialGradient id="glow" cx="0.7" cy="0.25" r="0.9"><stop offset="0" stop-color="#ffffff" stop-opacity="0.32"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
</defs>
<rect width="600" height="600" fill="url(#g)"/>
<rect width="600" height="600" fill="url(#glow)"/>
${dots ? '<g fill="#ffffff" opacity="0.06">' + Array.from({length:5},(_,i)=>`<circle cx="${80+i*120}" cy="${520-(i%2)*40}" r="${30+i*6}"/>`).join('') + '</g>' : '<g stroke="#ffffff" stroke-width="2" opacity="0.08" fill="none">'+Array.from({length:4},(_,i)=>`<circle cx="480" cy="120" r="${60+i*55}"/>`).join('')+'</g>'}
<g transform="translate(300 270)" opacity="0.92">${iconPath ? `<g transform="translate(-60 -60) scale(5)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">${iconPath}</g>` : ''}</g>
<text x="300" y="500" text-anchor="middle" font-family="Poppins, Montserrat, sans-serif" font-size="30" font-weight="700" fill="#ffffff" opacity="0.95">${escapeHtml(label)}</text>
<text x="300" y="540" text-anchor="middle" font-family="Montserrat, sans-serif" font-size="16" letter-spacing="4" fill="#ffffff" opacity="0.7">CEDRICKSTORE</text>
</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  function shade(hex, pct) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    let r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    const f = pct / 100;
    r = Math.round(f < 0 ? r * (1 + f) : r + (255 - r) * f);
    g = Math.round(f < 0 ? g * (1 + f) : g + (255 - g) * f);
    b = Math.round(f < 0 ? b * (1 + f) : b + (255 - b) * f);
    const h = (x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0');
    return '#' + h(r) + h(g) + h(b);
  }
  // Devuelve la imagen principal de un producto (usa subida o genera)
  function productImg(p, variant) {
    if (p.images && p.images[variant || 0]) return p.images[variant || 0];
    if (p.image && !variant) return p.image;
    const cat = (CS.categories().find(c => c.id === p.category) || {});
    return genImage(p.id + '-' + (variant || 0), { tone: p.tone || cat.color || '#c9a227', label: brandName(p.brand), icon: cat.icon, variant: variant || 0 });
  }

  /* ---------------- Estrellas ---------------- */
  function stars(rating, count) {
    const full = Math.round(rating || 0);
    let html = '<span class="stars" aria-label="' + (rating || 0) + ' de 5">';
    for (let i = 1; i <= 5; i++) html += (i <= full ? ICONS.star : ICONS.starO);
    if (count != null) html += '<span class="count">(' + count + ')</span>';
    html += '</span>';
    return html;
  }

  /* ---------------- Toast ---------------- */
  function toast(title, msg, type) {
    let stack = qs('.toast-stack');
    if (!stack) { stack = document.createElement('div'); stack.className = 'toast-stack'; document.body.appendChild(stack); }
    const t = document.createElement('div');
    t.className = 'toast ' + (type || 'success');
    const ic = type === 'error' ? 'close' : type === 'info' ? 'cart' : 'check';
    t.innerHTML = `<div class="t-ico">${icon(ic)}</div><div><b>${escapeHtml(title)}</b>${msg ? '<small>' + escapeHtml(msg) + '</small>' : ''}</div>`;
    stack.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3200);
  }

  /* ---------------- Tema ---------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    store.set(KEY.theme, theme);
  }
  function initTheme() {
    const saved = store.get(KEY.theme);
    const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefers ? 'dark' : 'light'));
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  }

  /* ---------------- Accesores de datos ---------------- */
  const products = () => store.get(KEY.products, []);
  const categories = () => store.get(KEY.categories, []);
  const brands = () => store.get(KEY.brands, []);
  const coupons = () => store.get(KEY.coupons, []);
  const banners = () => store.get(KEY.banners, []);
  const testimonials = () => store.get(KEY.testimonials, []);
  const productById = (id) => products().find(p => p.id === id);
  const categoryName = (id) => (categories().find(c => c.id === id) || {}).name || id;
  const brandName = (id) => (brands().find(b => b.id === id) || {}).name || id;

  /* ---------------- Carrito ---------------- */
  const cart = () => store.get(KEY.cart, []);
  function cartCount() { return cart().reduce((n, i) => n + i.qty, 0); }
  function cartSubtotal() { return cart().reduce((s, i) => { const p = productById(i.id); return s + (p ? p.price * i.qty : 0); }, 0); }
  function addToCart(id, qty) {
    qty = qty || 1;
    const p = productById(id); if (!p) return;
    if (p.stock <= 0) { toast('Sin stock', 'Este producto está agotado.', 'error'); return; }
    const c = cart();
    const item = c.find(i => i.id === id);
    if (item) item.qty = Math.min(item.qty + qty, p.stock);
    else c.push({ id, qty: Math.min(qty, p.stock) });
    store.set(KEY.cart, c);
    emit('cart');
    toast('Añadido al carrito', p.name, 'success');
  }
  function updateQty(id, qty) {
    const p = productById(id);
    let c = cart();
    if (qty <= 0) { c = c.filter(i => i.id !== id); }
    else { const it = c.find(i => i.id === id); if (it) it.qty = p ? Math.min(qty, p.stock) : qty; }
    store.set(KEY.cart, c); emit('cart');
  }
  function removeFromCart(id) { store.set(KEY.cart, cart().filter(i => i.id !== id)); emit('cart'); }
  function clearCart() { store.set(KEY.cart, []); emit('cart'); }

  /* ---------------- Cupón activo ---------------- */
  function activeCoupon() { return store.get('cs_active_coupon', null); }
  function applyCoupon(code) {
    code = (code || '').trim().toUpperCase();
    const c = coupons().find(x => x.code.toUpperCase() === code);
    if (!c) { toast('Cupón inválido', 'Verifica el código e inténtalo de nuevo.', 'error'); return false; }
    store.set('cs_active_coupon', c); emit('cart');
    toast('Cupón aplicado', c.label, 'success'); return true;
  }
  function removeCoupon() { store.del('cs_active_coupon'); emit('cart'); }
  function cartTotals() {
    const subtotal = cartSubtotal();
    const coupon = activeCoupon();
    let discount = 0, shipping = subtotal > 0 ? (subtotal >= 300000 ? 0 : 12000) : 0;
    if (coupon) {
      if (coupon.type === 'percent') discount = Math.round(subtotal * coupon.value / 100);
      else if (coupon.type === 'fixed') discount = Math.min(coupon.value, subtotal);
      else if (coupon.type === 'shipping') shipping = 0;
    }
    const total = Math.max(0, subtotal - discount + shipping);
    return { subtotal, discount, shipping, total, coupon };
  }

  /* ---------------- Favoritos / Comparador ---------------- */
  const wishlist = () => store.get(KEY.wishlist, []);
  function inWishlist(id) { return wishlist().includes(id); }
  function toggleWishlist(id) {
    let w = wishlist();
    const p = productById(id);
    if (w.includes(id)) { w = w.filter(x => x !== id); toast('Quitado de favoritos', p ? p.name : '', 'info'); }
    else { w.push(id); toast('Añadido a favoritos', p ? p.name : '', 'success'); }
    store.set(KEY.wishlist, w); emit('wishlist');
  }
  const compare = () => store.get(KEY.compare, []);
  function inCompare(id) { return compare().includes(id); }
  function toggleCompare(id) {
    let c = compare();
    if (c.includes(id)) c = c.filter(x => x !== id);
    else { if (c.length >= 4) { toast('Máximo 4 productos', 'Quita uno para comparar otro.', 'error'); return; } c.push(id); }
    store.set(KEY.compare, c); emit('compare');
  }
  function clearCompare() { store.set(KEY.compare, []); emit('compare'); }

  /* ---------------- Autenticación (demo) ---------------- */
  const users = () => store.get(KEY.users, []);
  const session = () => store.get(KEY.session, null);
  function currentUser() { const s = session(); return s ? users().find(u => u.email === s.email) : null; }
  function register(data) {
    const list = users();
    if (list.find(u => u.email === data.email.toLowerCase())) { toast('Correo registrado', 'Ya existe una cuenta con ese correo.', 'error'); return false; }
    const u = { id: uid('u_'), name: data.name, email: data.email.toLowerCase(), pass: data.pass, phone: data.phone || '', addresses: [], createdAt: Date.now() };
    list.push(u); store.set(KEY.users, list);
    store.set(KEY.session, { email: u.email }); emit('auth');
    toast('Cuenta creada', '¡Bienvenido a ' + STORE_NAME + ', ' + u.name + '!', 'success'); return true;
  }
  function login(email, pass) {
    const u = users().find(x => x.email === (email || '').toLowerCase());
    if (!u || u.pass !== pass) { toast('Datos incorrectos', 'Correo o contraseña inválidos.', 'error'); return false; }
    store.set(KEY.session, { email: u.email }); emit('auth');
    toast('Sesión iniciada', 'Hola de nuevo, ' + u.name, 'success'); return true;
  }
  function logout() { store.del(KEY.session); emit('auth'); toast('Sesión cerrada', '', 'info'); }
  function updateUser(patch) {
    const u = currentUser(); if (!u) return;
    Object.assign(u, patch);
    const list = users().map(x => x.id === u.id ? u : x);
    store.set(KEY.users, list); emit('auth');
  }
  function isAdmin() { const u = currentUser(); return u && (u.role === 'admin' || u.email === 'admin@cedrickstore.com'); }

  /* ---------------- Pedidos ---------------- */
  const orders = () => store.get(KEY.orders, []);
  function createOrder(payload) {
    const list = orders();
    const order = Object.assign({ id: 'CS-' + Date.now().toString().slice(-7), createdAt: Date.now(), status: 'pending' }, payload);
    list.unshift(order); store.set(KEY.orders, list); emit('orders');
    return order;
  }
  function updateOrder(id, patch) {
    const list = orders().map(o => o.id === id ? Object.assign(o, patch) : o);
    store.set(KEY.orders, list); emit('orders');
  }

  /* ---------------- WhatsApp ---------------- */
  function buildWhatsAppMessage(extra) {
    const items = cart().map(i => { const p = productById(i.id); return p ? { p, qty: i.qty } : null; }).filter(Boolean);
    const t = cartTotals();
    let msg = `Hola ${STORE_NAME}, deseo realizar el siguiente pedido:\n\n`;
    msg += `🛒 Productos:\n`;
    items.forEach(it => { msg += `• ${it.p.name} x ${it.qty} — ${money(it.p.price * it.qty)}\n`; });
    if (t.discount > 0) msg += `\n🏷️ Descuento: -${money(t.discount)}`;
    msg += `\n🚚 Envío: ${t.shipping === 0 ? 'Gratis' : money(t.shipping)}`;
    msg += `\n💰 Total: ${money(t.total)}\n\n`;
    extra = extra || {};
    msg += `👤 Nombre: ${extra.name || ''}\n`;
    msg += `📍 Dirección: ${extra.address || ''}${extra.city ? ', ' + extra.city : ''}\n`;
    msg += `📞 Teléfono: ${extra.phone || ''}\n`;
    if (extra.notes) msg += `📝 Observaciones: ${extra.notes}\n`;
    msg += `\nGracias.`;
    return msg;
  }
  function whatsappUrl(extra) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(buildWhatsAppMessage(extra));
  }
  function sendWhatsApp(extra) {
    if (cart().length === 0) { toast('Carrito vacío', 'Agrega productos antes de enviar el pedido.', 'error'); return; }
    window.open(whatsappUrl(extra), '_blank');
  }

  /* ---------------- Eventos ---------------- */
  const listeners = {};
  function on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); }
  function emit(evt) { (listeners[evt] || []).forEach(fn => { try { fn(); } catch (e) {} }); }

  /* ---------------- Filtrado / orden ---------------- */
  function filterProducts(opts) {
    opts = opts || {};
    let list = products().slice();
    if (opts.q) { const q = opts.q.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q) || brandName(p.brand).toLowerCase().includes(q) || categoryName(p.category).toLowerCase().includes(q)); }
    if (opts.cat && opts.cat.length) list = list.filter(p => opts.cat.includes(p.category));
    if (opts.brand && opts.brand.length) list = list.filter(p => opts.brand.includes(p.brand));
    if (opts.min != null) list = list.filter(p => p.price >= opts.min);
    if (opts.max != null) list = list.filter(p => p.price <= opts.max);
    if (opts.inStock) list = list.filter(p => p.stock > 0);
    if (opts.onSale) list = list.filter(p => discountPct(p.price, p.oldPrice) > 0);
    if (opts.minRating) list = list.filter(p => (p.rating || 0) >= opts.minRating);
    switch (opts.sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'popular': list.sort((a, b) => (b.sold || 0) - (a.sold || 0)); break;
      case 'discount': list.sort((a, b) => discountPct(b.price, b.oldPrice) - discountPct(a.price, a.oldPrice)); break;
      case 'new': list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: break;
    }
    return list;
  }

  /* ---------------- Lazy loading de imágenes ---------------- */
  function observeLazy(root) {
    const imgs = qsa('img[data-src]', root);
    if (!('IntersectionObserver' in window)) { imgs.forEach(im => { im.src = im.dataset.src; im.classList.add('loaded'); }); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { const im = e.target; im.src = im.dataset.src; im.addEventListener('load', () => im.classList.add('loaded')); obs.unobserve(im); } });
    }, { rootMargin: '200px' });
    imgs.forEach(im => io.observe(im));
  }

  /* ---------------- Reveal on scroll ---------------- */
  function observeReveal() {
    const els = qsa('.reveal, .stagger');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }

  /* ---------------- API pública ---------------- */
  window.CS = {
    WHATSAPP_NUMBER, STORE_NAME, KEY, store, ICONS, icon,
    seed, money, discountPct, slug, qs, qsa, param, debounce, escapeHtml, uid,
    genImage, productImg, stars,
    toast, applyTheme, initTheme, toggleTheme,
    products, categories, brands, coupons, banners, testimonials,
    productById, categoryName, brandName,
    cart, cartCount, cartSubtotal, addToCart, updateQty, removeFromCart, clearCart,
    activeCoupon, applyCoupon, removeCoupon, cartTotals,
    wishlist, inWishlist, toggleWishlist, compare, inCompare, toggleCompare, clearCompare,
    users, session, currentUser, register, login, logout, updateUser, isAdmin,
    orders, createOrder, updateOrder,
    buildWhatsAppMessage, whatsappUrl, sendWhatsApp,
    on, emit, filterProducts, observeLazy, observeReveal
  };

  // Inicializa tema y datos lo antes posible
  CS.initTheme();
  CS.seed();

  // Garantiza la cuenta de administrador demo
  (function ensureAdmin() {
    const list = store.get(KEY.users, []);
    if (!list.find(u => u.email === 'admin@cedrickstore.com')) {
      list.push({ id: 'u_admin', name: 'Administrador', email: 'admin@cedrickstore.com', pass: 'admin123', phone: '3016515466', role: 'admin', addresses: [], createdAt: Date.now() });
      store.set(KEY.users, list);
    }
  })();
})();
