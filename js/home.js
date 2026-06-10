/* =========================================================================
   CedrickStore — Home (home.js)
   Slider, countdown, features, categorías, grids de productos, testimonios,
   marcas y newsletter.
   ========================================================================= */
(function () {
  'use strict';
  const { qs, qsa, icon, money, escapeHtml } = CS;

  /* ---------------- HERO SLIDER ---------------- */
  function renderSlider() {
    const slides = qs('#heroSlides'), dots = qs('#heroDots');
    if (!slides) return;
    const banners = CS.banners();
    const toneBg = {
      gold: 'linear-gradient(120deg,#1a1407,#3a2e0c 50%,#15151a)',
      blue: 'linear-gradient(120deg,#0a1020,#13284a 55%,#0c0c14)',
      dark: 'linear-gradient(120deg,#0a0a0c,#23232b 55%,#0c0c0e)'
    };
    slides.innerHTML = banners.map(b => `
      <div class="slide">
        <div class="slide-inner">
          <div class="slide-bg" style="background:${toneBg[b.tone] || toneBg.dark}"></div>
          <div class="slide-content reveal in">
            <div class="eyebrow">${escapeHtml(b.eyebrow)}</div>
            <h1>${b.title}</h1>
            <p>${escapeHtml(b.text)}</p>
            <div class="slide-actions">
              <a href="${b.link}" class="btn btn-gold btn-lg">${escapeHtml(b.cta)} ${icon('arrowR')}</a>
              <a href="catalog.html" class="btn btn-outline btn-lg" style="background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,255,255,.25)">Ver catálogo</a>
            </div>
          </div>
          <div class="slide-figure">
            ${b.image
              ? `<img src="${b.image}" alt="" style="width:100%;max-width:420px;border-radius:var(--radius);aspect-ratio:1;object-fit:cover;box-shadow:0 20px 50px rgba(0,0,0,.35)">`
              : `<div class="ph" style="aspect-ratio:1;background:linear-gradient(135deg,rgba(201,162,39,.25),rgba(255,255,255,.05));border:1px solid rgba(255,255,255,.15);color:#fff">
              <div style="font-size:120px;opacity:.9;display:grid;place-items:center">${CS.ICONS[b.icon] || CS.ICONS.sparkle}</div>
            </div>`}
            <div class="slide-price-badge">${b.badge.includes('%') ? '<small>HASTA</small><b>' + b.badge + '</b>' : '<b style="font-size:1.1rem">' + b.badge + '</b>'}</div>
          </div>
        </div>
      </div>`).join('');
    dots.innerHTML = banners.map((_, i) => `<button class="${i === 0 ? 'active' : ''}" data-slide="${i}" aria-label="Ir al slide ${i + 1}"></button>`).join('');

    let idx = 0;
    const total = banners.length;
    qs('#heroPrev').innerHTML = CS.ICONS.chevL;
    qs('#heroNext').innerHTML = CS.ICONS.chevR;
    const go = (i) => {
      idx = (i + total) % total;
      slides.style.transform = `translateX(-${idx * 100}%)`;
      qsa('#heroDots button').forEach((d, k) => d.classList.toggle('active', k === idx));
    };
    qs('#heroPrev').addEventListener('click', () => { go(idx - 1); reset(); });
    qs('#heroNext').addEventListener('click', () => { go(idx + 1); reset(); });
    qsa('#heroDots button').forEach(d => d.addEventListener('click', () => { go(+d.dataset.slide); reset(); }));
    let timer = setInterval(() => go(idx + 1), 5500);
    const reset = () => { clearInterval(timer); timer = setInterval(() => go(idx + 1), 5500); };

    // swipe táctil
    let startX = 0;
    slides.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
    slides.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) { go(dx < 0 ? idx + 1 : idx - 1); reset(); }
    }, { passive: true });
  }

  /* ---------------- COUNTDOWN ---------------- */
  function renderCountdown() {
    const root = qs('#countdown'); if (!root) return;
    let end = CS.store.get('cs_deal_end');
    const now = Date.now();
    if (!end || end < now) { end = now + 1000 * 60 * 60 * 26; CS.store.set('cs_deal_end', end); } // ~26h
    const tick = () => {
      let diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      const set = (k, v) => { const el = qs(`[data-cd="${k}"]`, root); if (el) el.textContent = String(v).padStart(2, '0'); };
      set('d', d); set('h', h); set('m', m); set('s', s);
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------------- FEATURES ---------------- */
  function renderFeatures() {
    const row = qs('#featureRow'); if (!row) return;
    const items = [
      { i: 'truck', t: 'Envío express', s: 'Gratis desde $300.000' },
      { i: 'shield', t: 'Pago 100% seguro', s: 'Compra protegida' },
      { i: 'refresh', t: 'Devolución fácil', s: '10 días de garantía' },
      { i: 'whatsapp', t: 'Pedido por WhatsApp', s: 'Atención inmediata' }
    ];
    row.innerHTML = items.map(f => `<div class="feature"><div class="fico">${CS.ICONS[f.i]}</div><div><h5>${f.t}</h5><p>${f.s}</p></div></div>`).join('');
  }

  /* ---------------- CATEGORÍAS ---------------- */
  function renderCategories() {
    const grid = qs('#catGrid'); if (!grid) return;
    const counts = {};
    CS.products().forEach(p => counts[p.category] = (counts[p.category] || 0) + 1);
    grid.innerHTML = CS.categories().map(c => `
      <a class="cat-card" href="catalog.html?cat=${c.id}">
        <div class="cat-ico" style="color:${c.color};background:${c.color}1f">${CS.ICONS[c.icon] || CS.ICONS.box}</div>
        <h4>${escapeHtml(c.name)}</h4>
        <span>${counts[c.id] || 0} productos</span>
      </a>`).join('');
  }

  /* ---------------- GRIDS ---------------- */
  function renderGrids() {
    const all = CS.products();
    CS.renderGrid(qs('#bestGrid'), CS.filterProducts({ sort: 'popular' }).slice(0, 8));
    CS.renderGrid(qs('#featuredGrid'), all.filter(p => p.featured).slice(0, 8));
    CS.renderGrid(qs('#newGrid'), all.filter(p => p.isNew).slice(0, 8));
    CS.renderGrid(qs('#saleGrid'), CS.filterProducts({ onSale: true, sort: 'discount' }).slice(0, 8));
  }

  /* ---------------- TESTIMONIOS ---------------- */
  function renderTestimonials() {
    const grid = qs('#testiGrid'); if (!grid) return;
    grid.innerHTML = CS.testimonials().slice(0, 3).map(t => `
      <div class="testi-card">
        <span class="quote">”</span>
        ${CS.stars(t.rating)}
        <p>${escapeHtml(t.text)}</p>
        <div class="testi-author">
          <div class="avatar">${escapeHtml(t.name.charAt(0))}</div>
          <div><b>${escapeHtml(t.name)}</b><span>${escapeHtml(t.role)}</span></div>
        </div>
      </div>`).join('');
  }

  /* ---------------- MARCAS ---------------- */
  function renderBrands() {
    const strip = qs('#brandStrip'); if (!strip) return;
    strip.innerHTML = CS.brands().map(b => `<a class="brand-pill" href="catalog.html?brand=${b.id}">${escapeHtml(b.name)}</a>`).join('');
  }

  /* ---------------- NEWSLETTER ---------------- */
  function setupNewsletter() {
    const form = qs('#newsletterForm'); if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      CS.toast('¡Suscripción exitosa!', 'Usa el cupón CEDRICK10 en tu compra.', 'success');
      form.reset();
    });
  }

  /* ---------------- PRODUCTOS DIGITALES EN HOME ---------------- */
  function renderDigitalHome() {
    const grid = qs('#digitalHomeGrid'); if (!grid) return;
    const list = CS.digitalProducts();
    if (!list.length) { grid.closest('.section').style.display = 'none'; return; }
    grid.innerHTML = list.slice(0, 6).map(dp => {
      const inStock = dp.items && dp.items.length > 0;
      return `
        <a href="digital.html" class="product-card" style="text-decoration:none">
          <div class="pc-media" style="aspect-ratio:16/10;background:linear-gradient(135deg,var(--surface-2),var(--border))">
            ${dp.image ? `<img src="${dp.image}" alt="${escapeHtml(dp.name)}" style="width:100%;height:100%;object-fit:cover">` : `<div style="display:grid;place-items:center;height:100%;font-size:2.5rem;opacity:.5">${CS.ICONS.chip}</div>`}
            <div class="pc-tags"><span class="tag tag-new">Digital</span></div>
          </div>
          <div class="pc-body">
            <span class="pc-cat">${escapeHtml(dp.category)}</span>
            <h3 class="pc-title">${escapeHtml(dp.name)}</h3>
            <div class="pc-price"><span class="price-now">${money(dp.price)}</span></div>
            <span class="pc-stock ${inStock ? '' : 'out'}">${inStock ? dp.items.length + ' disponibles' : 'Agotado'}</span>
          </div>
        </a>`;
    }).join('');
  }

  renderSlider();
  renderCountdown();
  renderFeatures();
  renderCategories();
  renderGrids();
  renderTestimonials();
  renderBrands();
  setupNewsletter();
  renderDigitalHome();
})();
