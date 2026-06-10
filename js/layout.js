/* =========================================================================
   CedrickStore — Layout compartido (layout.js)
   Inyecta header, footer, botones flotantes, chat, modal de cuenta,
   barra de comparación y renderiza tarjetas de producto. Maneja toda la
   interacción global (tema, carrito, favoritos, búsqueda, menú móvil).
   ========================================================================= */
(function () {
  'use strict';
  const { icon, qs, qsa, money, escapeHtml } = CS;
  const PAGE = document.body.getAttribute('data-page') || '';

  const NAV = [
    { label: 'Inicio', href: 'index.html', page: 'home' },
    { label: 'Catálogo', href: 'catalog.html', page: 'catalog' },
    { label: 'Ofertas', href: 'catalog.html?filter=sale', page: 'sale' },
    { label: 'Novedades', href: 'catalog.html?sort=new', page: 'new' },
    { label: 'Contacto', href: 'index.html#contacto', page: 'contact' }
  ];

  const S = () => CS.settings();
  function brandLogo() {
    const s = S(); const b = s.brand || {};
    const mark = (s.logo || 'assets/logo-mark.svg');
    return `<span class="logo-mark"><img src="${mark}" alt="${escapeHtml((b.name1 || '') + (b.name2 || ''))}" width="42" height="42"></span><span class="logo-text">${escapeHtml(b.name1 || '')}<span>${escapeHtml(b.name2 || '')}</span>${b.tagline ? '<small>' + escapeHtml(b.tagline) + '</small>' : ''}</span>`;
  }

  /* ---------------- HEADER ---------------- */
  function buildHeader() {
    const navLinks = NAV.map(n => `<a href="${n.href}" class="${n.page === PAGE ? 'active' : ''}">${n.label}</a>`).join('');
    const catLinks = CS.categories().map(c => `<a href="catalog.html?cat=${c.id}">${escapeHtml(c.name)} ${icon('chevR')}</a>`).join('');
    const header = document.createElement('div');
    header.innerHTML = `
    <div class="topbar">
      <div class="container">
        <span>${icon('truck')} ${escapeHtml(S().topbar)}</span>
        <div class="topbar-links">
          <a href="https://wa.me/${CS.WHATSAPP_NUMBER}" target="_blank">${icon('whatsapp')} ${escapeHtml(S().contact.phone)}</a>
          <a href="account.html">Mi cuenta</a>
          <a href="admin.html">Admin</a>
        </div>
      </div>
    </div>
    <header class="site-header" id="siteHeader">
      <div class="container header-inner">
        <button class="icon-btn hamburger hide-lg" id="btnMenu" aria-label="Abrir menú"><span></span><span></span><span></span></button>
        <a href="index.html" class="logo" aria-label="${escapeHtml(CS.STORE_NAME)} inicio">${brandLogo()}</a>
        <nav class="main-nav">${navLinks}</nav>
        <div class="search-wrap">
          <span class="ico-search">${CS.ICONS.search}</span>
          <input type="search" class="search-input" id="searchInput" placeholder="Buscar productos, marcas..." autocomplete="off" aria-label="Buscar">
          <button class="search-go" id="searchGo" aria-label="Buscar">${CS.ICONS.search}</button>
          <div class="search-suggestions hidden" id="searchSuggest"></div>
        </div>
        <div class="header-actions">
          <button class="icon-btn theme-toggle" id="btnTheme" aria-label="Cambiar tema" title="Modo claro/oscuro">
            <span class="moon">${CS.ICONS.moon}</span><span class="sun">${CS.ICONS.sun}</span>
          </button>
          <button class="icon-btn hide-sm" id="btnUser" aria-label="Cuenta" title="Iniciar sesión">${CS.ICONS.user}</button>
          <a class="icon-btn hide-sm" href="account.html#wishlist" id="btnWish" aria-label="Favoritos" title="Favoritos">
            ${CS.ICONS.heart}<span class="badge-count" id="wishBadge">0</span>
          </a>
          <a class="icon-btn" href="cart.html" id="btnCart" aria-label="Carrito" title="Carrito">
            ${CS.ICONS.cart}<span class="badge-count" id="cartBadge">0</span>
          </a>
        </div>
      </div>
    </header>`;
    document.body.prepend(header);
  }

  /* ---------------- DRAWER MÓVIL ---------------- */
  function buildDrawer() {
    const navLinks = NAV.map(n => `<a href="${n.href}">${n.label} ${icon('chevR')}</a>`).join('');
    const cats = CS.categories().map(c => `<a href="catalog.html?cat=${c.id}">${escapeHtml(c.name)} ${icon('chevR')}</a>`).join('');
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="drawer-overlay" id="drawerOverlay"></div>
      <aside class="mobile-drawer" id="mobileDrawer" aria-label="Menú móvil">
        <div class="between mb-16">
          <a href="index.html" class="logo">${brandLogo()}</a>
          <button class="modal-close" id="drawerClose" aria-label="Cerrar">${CS.ICONS.close}</button>
        </div>
        <div class="search-wrap" style="display:block;max-width:none;margin-bottom:8px">
          <span class="ico-search">${CS.ICONS.search}</span>
          <input type="search" class="search-input" id="searchInputM" placeholder="Buscar productos..." aria-label="Buscar">
        </div>
        <nav style="overflow-y:auto;flex:1">
          ${navLinks}
          <p class="pc-cat" style="margin:16px 0 4px">Categorías</p>
          ${cats}
        </nav>
        <div class="gap-8 row mt-16">
          <a href="account.html" class="btn btn-outline flex-1">${icon('user')} Cuenta</a>
          <a href="account.html#wishlist" class="btn btn-outline flex-1">${icon('heart')} Favoritos</a>
        </div>
        <a href="${CS.whatsappUrl()}" target="_blank" class="btn btn-wa btn-block mt-16">${icon('whatsapp')} Escríbenos por WhatsApp</a>
      </aside>`;
    document.body.appendChild(el);
  }

  /* ---------------- FOOTER ---------------- */
  function buildFooter() {
    const s = S();
    const cats = CS.categories().slice(0, 6).map(c => `<li><a href="catalog.html?cat=${c.id}">${escapeHtml(c.name)}</a></li>`).join('');
    const f = document.createElement('footer');
    f.className = 'site-footer footer';
    f.id = 'contacto';
    f.innerHTML = `
      <div class="container">
        <div class="footer-top">
          <div class="footer-col footer-about">
            <a href="index.html" class="logo">${brandLogo()}</a>
            <p>${escapeHtml(s.footerAbout)}</p>
            <div class="social-row">
              <a href="${s.social.facebook || '#'}" target="_blank" aria-label="Facebook">${CS.ICONS.facebook}</a>
              <a href="${s.social.instagram || '#'}" target="_blank" aria-label="Instagram">${CS.ICONS.instagram}</a>
              <a href="${s.social.twitter || '#'}" target="_blank" aria-label="Twitter X">${CS.ICONS.twitter}</a>
              <a href="${s.social.youtube || '#'}" target="_blank" aria-label="YouTube">${CS.ICONS.youtube}</a>
              <a href="https://wa.me/${CS.WHATSAPP_NUMBER}" target="_blank" aria-label="WhatsApp">${CS.ICONS.whatsapp}</a>
            </div>
            <div class="pay-methods">
              <span>VISA</span><span>MASTERCARD</span><span>PSE</span><span>NEQUI</span><span>EFECTIVO</span>
            </div>
          </div>
          <div class="footer-col">
            <h5>Categorías</h5>
            <ul>${cats}</ul>
          </div>
          <div class="footer-col">
            <h5>Ayuda</h5>
            <ul>
              <li><a href="#" data-policy="privacidad">Política de privacidad</a></li>
              <li><a href="#" data-policy="terminos">Términos y condiciones</a></li>
              <li><a href="#" data-policy="envios">Envíos y devoluciones</a></li>
              <li><a href="#" data-policy="faq">Preguntas frecuentes</a></li>
              <li><a href="account.html">Mi cuenta</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Contacto</h5>
            <div class="contact-line">${CS.ICONS.pin}<span>${escapeHtml(s.contact.address)}</span></div>
            <div class="contact-line">${CS.ICONS.phone}<span>${escapeHtml(s.contact.phone)}</span></div>
            <div class="contact-line">${CS.ICONS.mail}<span>${escapeHtml(s.contact.email)}</span></div>
            <div class="contact-line">${CS.ICONS.clock}<span>${escapeHtml(s.contact.hours)}</span></div>
            <div class="footer-map">
              <iframe title="Ubicación ${escapeHtml(CS.STORE_NAME)}" loading="lazy" src="https://www.google.com/maps?q=${encodeURIComponent(s.contact.mapQuery || 'Medellin,Colombia')}&output=embed"></iframe>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} ${escapeHtml(CS.STORE_NAME)}. Todos los derechos reservados.</span>
          <div class="fb-links">
            <a href="#" data-policy="privacidad">Privacidad</a>
            <a href="#" data-policy="terminos">Términos</a>
            <a href="#" data-policy="cookies">Cookies</a>
          </div>
        </div>
      </div>`;
    document.body.appendChild(f);
  }

  /* ---------------- FLOTANTES + CHAT ---------------- */
  function buildFloats() {
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="float-stack">
        <button class="fab fab-top" id="fabTop" aria-label="Subir">${CS.ICONS.arrowUp}</button>
        <button class="fab fab-chat" id="fabChat" aria-label="Chat de soporte">${CS.ICONS.chat}<span class="fab-label">Soporte en línea</span></button>
        <a class="fab fab-wa" id="fabWa" href="https://wa.me/${CS.WHATSAPP_NUMBER}" target="_blank" aria-label="WhatsApp">${CS.ICONS.whatsapp}<span class="fab-label">Pedir por WhatsApp</span></a>
      </div>
      <div class="chat-box" id="chatBox">
        <div class="chat-head">
          <span class="dot"></span>
          <div><b style="display:block;color:#fff">Soporte CedrickStore</b><small style="opacity:.7">Normalmente responde al instante</small></div>
          <button class="modal-close" id="chatClose" style="margin-left:auto;background:rgba(255,255,255,.15);color:#fff">${CS.ICONS.close}</button>
        </div>
        <div class="chat-body" id="chatBody">
          <div class="chat-msg bot">¡Hola! 👋 Bienvenido a CedrickStore. ¿En qué podemos ayudarte hoy?</div>
          <div class="chat-msg bot">Puedes preguntarnos por productos, envíos o realizar tu pedido directamente por WhatsApp.</div>
        </div>
        <div class="chat-foot">
          <input type="text" id="chatInput" placeholder="Escribe un mensaje...">
          <button class="icon-btn" id="chatSend" style="background:var(--accent);color:var(--accent-contrast)">${CS.ICONS.send}</button>
        </div>
      </div>`;
    document.body.appendChild(el);
  }

  /* ---------------- BARRA DE COMPARACIÓN ---------------- */
  function buildCompareBar() {
    const el = document.createElement('div');
    el.className = 'compare-bar';
    el.id = 'compareBar';
    document.body.appendChild(el);
  }
  function renderCompareBar() {
    const bar = qs('#compareBar'); if (!bar) return;
    const ids = CS.compare();
    if (!ids.length) { bar.classList.remove('show'); return; }
    const thumbs = ids.map(id => {
      const p = CS.productById(id); if (!p) return '';
      return `<div class="compare-thumb" title="${escapeHtml(p.name)}"><img src="${CS.productImg(p)}" alt=""><button class="x" data-uncompare="${id}">${CS.ICONS.close}</button></div>`;
    }).join('');
    bar.innerHTML = `<div class="container between" style="gap:14px;flex-wrap:wrap">
        <div class="compare-items"><b style="font-family:var(--font-head)">Comparar (${ids.length})</b>${thumbs}</div>
        <div class="gap-8 row">
          <button class="btn btn-ghost btn-sm" id="clearCompare">Limpiar</button>
          <button class="btn btn-gold btn-sm" id="openCompare">Comparar ahora ${icon('arrowR')}</button>
        </div>
      </div>`;
    bar.classList.add('show');
  }

  /* ---------------- MODAL DE CUENTA (login/registro/recuperar) ---------------- */
  function buildAuthModal() {
    const el = document.createElement('div');
    el.className = 'modal-overlay';
    el.id = 'authModal';
    el.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head"><h3 id="authTitle">Iniciar sesión</h3><button class="modal-close" data-close-modal>${CS.ICONS.close}</button></div>
        <div class="modal-body">
          <div class="tabs" id="authTabs">
            <button class="tab active" data-auth-tab="login">Ingresar</button>
            <button class="tab" data-auth-tab="register">Registrarse</button>
            <button class="tab" data-auth-tab="recover">Recuperar</button>
          </div>
          <form id="formLogin" class="auth-form">
            <div class="field"><label>Correo electrónico</label><input type="email" class="input" name="email" required placeholder="tucorreo@email.com"></div>
            <div class="field"><label>Contraseña</label><input type="password" class="input" name="pass" required placeholder="••••••••"></div>
            <button class="btn btn-gold btn-block btn-lg">Iniciar sesión</button>
            <p class="muted text-center mt-16" style="font-size:.85rem">Demo admin: <b>admin@cedrickstore.com</b> / <b>admin123</b></p>
          </form>
          <form id="formRegister" class="auth-form hidden">
            <div class="field"><label>Nombre completo</label><input type="text" class="input" name="name" required placeholder="Tu nombre"></div>
            <div class="field"><label>Correo electrónico</label><input type="email" class="input" name="email" required placeholder="tucorreo@email.com"></div>
            <div class="field"><label>Teléfono</label><input type="tel" class="input" name="phone" placeholder="3001234567"></div>
            <div class="field"><label>Contraseña</label><input type="password" class="input" name="pass" required minlength="4" placeholder="Mínimo 4 caracteres"></div>
            <button class="btn btn-gold btn-block btn-lg">Crear cuenta</button>
          </form>
          <form id="formRecover" class="auth-form hidden">
            <p class="muted mb-16">Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.</p>
            <div class="field"><label>Correo electrónico</label><input type="email" class="input" name="email" required placeholder="tucorreo@email.com"></div>
            <button class="btn btn-gold btn-block btn-lg">Enviar instrucciones</button>
          </form>
        </div>
      </div>`;
    document.body.appendChild(el);
  }

  /* ---------------- Modal genérico de políticas ---------------- */
  const POLICIES = {
    privacidad: { t: 'Política de privacidad', b: 'En CedrickStore protegemos tus datos personales. La información que compartes (nombre, dirección, teléfono) se usa exclusivamente para procesar y entregar tus pedidos. No vendemos ni compartimos tus datos con terceros sin tu consentimiento. Puedes solicitar la eliminación de tus datos en cualquier momento escribiéndonos.' },
    terminos: { t: 'Términos y condiciones', b: 'Al comprar en CedrickStore aceptas nuestras condiciones de venta. Los precios incluyen impuestos y pueden cambiar sin previo aviso. Las imágenes son ilustrativas. Los pedidos se confirman vía WhatsApp y el pago se coordina directamente. Nos reservamos el derecho de cancelar pedidos en caso de error de precio o falta de stock.' },
    envios: { t: 'Envíos y devoluciones', b: 'Realizamos envíos a todo el país en 2 a 5 días hábiles. Envío gratis en compras superiores a $300.000. Aceptamos devoluciones dentro de los 10 días posteriores a la entrega, siempre que el producto esté sin uso y en su empaque original.' },
    faq: { t: 'Preguntas frecuentes', b: '¿Cómo compro? Agrega productos al carrito y envía tu pedido por WhatsApp. ¿Qué métodos de pago aceptan? Tarjetas, PSE, Nequi y efectivo contra entrega en ciudades principales. ¿Tienen garantía? Sí, todos los productos cuentan con garantía del fabricante.' },
    cookies: { t: 'Política de cookies', b: 'Usamos almacenamiento local (localStorage) para recordar tu carrito, favoritos, sesión y preferencia de tema. No utilizamos cookies de rastreo de terceros. Puedes limpiar estos datos desde la configuración de tu navegador.' }
  };
  function buildPolicyModal() {
    const el = document.createElement('div');
    el.className = 'modal-overlay'; el.id = 'policyModal';
    el.innerHTML = `<div class="modal" role="dialog"><div class="modal-head"><h3 id="policyTitle"></h3><button class="modal-close" data-close-modal>${CS.ICONS.close}</button></div><div class="modal-body"><p class="muted" id="policyBody" style="line-height:1.8"></p></div></div>`;
    document.body.appendChild(el);
  }

  /* ---------------- Comparador modal ---------------- */
  function buildCompareModal() {
    const el = document.createElement('div');
    el.className = 'modal-overlay'; el.id = 'compareModal';
    el.innerHTML = `<div class="modal modal-wide" role="dialog"><div class="modal-head"><h3>Comparar productos</h3><button class="modal-close" data-close-modal>${CS.ICONS.close}</button></div><div class="modal-body"><div class="table-wrap" id="compareModalBody"></div></div></div>`;
    document.body.appendChild(el);
  }
  function renderCompareModal() {
    const ids = CS.compare();
    const body = qs('#compareModalBody'); if (!body) return;
    if (!ids.length) { body.innerHTML = '<p class="muted">No hay productos para comparar.</p>'; return; }
    const ps = ids.map(CS.productById).filter(Boolean);
    const rows = [
      ['Imagen', p => `<img src="${CS.productImg(p)}" alt="" style="width:80px;height:80px;border-radius:10px;object-fit:cover;margin:auto">`],
      ['Producto', p => `<a href="product.html?id=${p.id}" style="font-weight:700">${escapeHtml(p.name)}</a>`],
      ['Precio', p => `<b style="color:var(--accent)">${money(p.price)}</b>`],
      ['Antes', p => p.oldPrice ? `<span style="text-decoration:line-through;color:var(--muted)">${money(p.oldPrice)}</span>` : '—'],
      ['Marca', p => escapeHtml(CS.brandName(p.brand))],
      ['Categoría', p => escapeHtml(CS.categoryName(p.category))],
      ['Calificación', p => CS.stars(p.rating, p.sold)],
      ['Stock', p => p.stock > 0 ? p.stock + ' disponibles' : 'Agotado'],
      ['Acción', p => `<button class="btn btn-gold btn-sm" data-add="${p.id}">Agregar</button>`]
    ];
    let html = '<table class="compare-table"><thead><tr><th>Característica</th>' + ps.map(p => '<th>' + escapeHtml(CS.brandName(p.brand)) + '</th>').join('') + '</tr></thead><tbody>';
    rows.forEach(([label, fn]) => { html += '<tr><td>' + label + '</td>' + ps.map(p => '<td>' + fn(p) + '</td>').join('') + '</tr>'; });
    html += '</tbody></table>';
    body.innerHTML = html;
  }

  /* =========================================================================
     TARJETA DE PRODUCTO (reutilizable)
     ========================================================================= */
  CS.productCard = function (p, opts) {
    opts = opts || {};
    const off = CS.discountPct(p.price, p.oldPrice);
    const tags = [];
    if (p.isNew) tags.push('<span class="tag tag-new">Nuevo</span>');
    if (off > 0) tags.push('<span class="tag tag-sale">-' + off + '%</span>');
    if (p.bestseller) tags.push('<span class="tag tag-hot">Top ventas</span>');
    const stockCls = p.stock <= 0 ? 'out' : p.stock <= 5 ? 'low' : '';
    const stockTxt = p.stock <= 0 ? 'Agotado' : p.stock <= 5 ? '¡Últimas ' + p.stock + ' unidades!' : 'En stock';
    const wishActive = CS.inWishlist(p.id) ? 'active' : '';
    const cmpActive = CS.inCompare(p.id) ? 'active' : '';
    return `
    <article class="product-card reveal" data-id="${p.id}">
      <div class="pc-media">
        <div class="pc-tags">${tags.join('')}</div>
        <div class="pc-actions">
          <button class="icon-btn ${wishActive}" data-wish="${p.id}" aria-label="Favorito" title="Favoritos">${CS.ICONS.heart}</button>
          <button class="icon-btn ${cmpActive}" data-compare="${p.id}" aria-label="Comparar" title="Comparar">${CS.ICONS.compare}</button>
          <a class="icon-btn" href="product.html?id=${p.id}" aria-label="Ver" title="Ver detalle">${CS.ICONS.eye}</a>
        </div>
        <a href="product.html?id=${p.id}" aria-label="${escapeHtml(p.name)}">
          <img class="lazy" data-src="${CS.productImg(p)}" alt="${escapeHtml(p.name)}" width="400" height="400">
        </a>
        <div class="pc-add">
          <button class="btn btn-dark btn-block btn-sm" data-add="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>${icon('cart')} ${p.stock <= 0 ? 'Agotado' : 'Agregar al carrito'}</button>
        </div>
      </div>
      <div class="pc-body">
        <span class="pc-cat">${escapeHtml(CS.categoryName(p.category))} · ${escapeHtml(CS.brandName(p.brand))}</span>
        <h3 class="pc-title"><a href="product.html?id=${p.id}">${escapeHtml(p.name)}</a></h3>
        ${CS.stars(p.rating, p.sold)}
        <p class="muted list-only" style="font-size:.88rem">${escapeHtml(p.desc || '')}</p>
        <div class="pc-price">
          <span class="price-now">${money(p.price)}</span>
          ${p.oldPrice ? '<span class="price-old">' + money(p.oldPrice) + '</span>' : ''}
          ${off > 0 ? '<span class="price-off">-' + off + '%</span>' : ''}
        </div>
        <span class="pc-stock ${stockCls}">${stockTxt}</span>
        <div class="list-only mt-8 gap-8 row flex-wrap">
          <button class="btn btn-gold btn-sm" data-buy="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>Comprar ahora</button>
          <button class="btn btn-outline btn-sm" data-add="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>Agregar</button>
        </div>
      </div>
    </article>`;
  };

  CS.renderGrid = function (container, list, opts) {
    if (!container) return;
    if (!list.length) { container.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="eico">' + CS.ICONS.box + '</div><h3>Sin resultados</h3><p class="muted">No encontramos productos con esos criterios.</p></div>'; return; }
    container.innerHTML = list.map(p => CS.productCard(p, opts)).join('');
    CS.observeLazy(container);
    CS.observeReveal();
  };

  /* =========================================================================
     INTERACCIÓN GLOBAL
     ========================================================================= */
  function openModal(id) { const m = qs('#' + id); if (m) m.classList.add('open'); }
  function closeModal(m) { m.classList.remove('open'); }
  CS.openAuth = function (tab) { switchAuthTab(tab || 'login'); openModal('authModal'); };
  CS.openPolicy = function (key) { const p = POLICIES[key]; if (!p) return; qs('#policyTitle').textContent = p.t; qs('#policyBody').textContent = p.b; openModal('policyModal'); };

  function switchAuthTab(tab) {
    qsa('[data-auth-tab]').forEach(b => b.classList.toggle('active', b.dataset.authTab === tab));
    qs('#formLogin').classList.toggle('hidden', tab !== 'login');
    qs('#formRegister').classList.toggle('hidden', tab !== 'register');
    qs('#formRecover').classList.toggle('hidden', tab !== 'recover');
    qs('#authTitle').textContent = tab === 'register' ? 'Crear cuenta' : tab === 'recover' ? 'Recuperar contraseña' : 'Iniciar sesión';
  }

  /* ---------------- Badges ---------------- */
  function updateBadges() {
    const cb = qs('#cartBadge'), wb = qs('#wishBadge');
    if (cb) { const n = CS.cartCount(); cb.textContent = n; cb.classList.toggle('show', n > 0); }
    if (wb) { const n = CS.wishlist().length; wb.textContent = n; wb.classList.toggle('show', n > 0); }
  }
  function refreshCards() {
    qsa('[data-wish]').forEach(b => b.classList.toggle('active', CS.inWishlist(b.dataset.wish)));
    qsa('[data-compare]').forEach(b => b.classList.toggle('active', CS.inCompare(b.dataset.compare)));
  }

  /* ---------------- Búsqueda ---------------- */
  function setupSearch() {
    const input = qs('#searchInput'), sug = qs('#searchSuggest'), go = qs('#searchGo');
    const inputM = qs('#searchInputM');
    const doSearch = (val) => { if (val && val.trim()) location.href = 'catalog.html?q=' + encodeURIComponent(val.trim()); };
    if (input) {
      const render = CS.debounce(() => {
        const q = input.value.trim().toLowerCase();
        if (q.length < 2) { sug.classList.add('hidden'); return; }
        const res = CS.filterProducts({ q }).slice(0, 6);
        if (!res.length) { sug.innerHTML = '<div style="padding:14px" class="muted">Sin coincidencias para "' + escapeHtml(q) + '"</div>'; sug.classList.remove('hidden'); return; }
        sug.innerHTML = res.map(p => `<a href="product.html?id=${p.id}"><img src="${CS.productImg(p)}" alt=""><div><div style="font-weight:600;font-size:.9rem">${escapeHtml(p.name)}</div><small class="muted">${escapeHtml(CS.categoryName(p.category))}</small></div><span class="s-price">${money(p.price)}</span></a>`).join('');
        sug.classList.remove('hidden');
      }, 180);
      input.addEventListener('input', render);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(input.value); });
      go && go.addEventListener('click', () => doSearch(input.value));
      document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) sug.classList.add('hidden'); });
    }
    if (inputM) inputM.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(inputM.value); });
  }

  /* ---------------- Drawer ---------------- */
  function setupDrawer() {
    const drawer = qs('#mobileDrawer'), ov = qs('#drawerOverlay');
    const open = () => { drawer.classList.add('open'); ov.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const close = () => { drawer.classList.remove('open'); ov.classList.remove('open'); document.body.style.overflow = ''; };
    qs('#btnMenu') && qs('#btnMenu').addEventListener('click', open);
    qs('#drawerClose') && qs('#drawerClose').addEventListener('click', close);
    ov && ov.addEventListener('click', close);
  }

  /* ---------------- Chat ---------------- */
  function setupChat() {
    const box = qs('#chatBox'), body = qs('#chatBody'), input = qs('#chatInput');
    const toggle = () => box.classList.toggle('open');
    qs('#fabChat') && qs('#fabChat').addEventListener('click', toggle);
    qs('#chatClose') && qs('#chatClose').addEventListener('click', () => box.classList.remove('open'));
    const send = () => {
      const v = input.value.trim(); if (!v) return;
      const me = document.createElement('div'); me.className = 'chat-msg me'; me.textContent = v; body.appendChild(me);
      input.value = ''; body.scrollTop = body.scrollHeight;
      setTimeout(() => {
        const bot = document.createElement('div'); bot.className = 'chat-msg bot';
        bot.innerHTML = 'Gracias por tu mensaje. Para una atención más rápida, escríbenos por <a href="https://wa.me/' + CS.WHATSAPP_NUMBER + '" target="_blank" style="color:var(--accent);font-weight:700">WhatsApp</a> 💬';
        body.appendChild(bot); body.scrollTop = body.scrollHeight;
      }, 700);
    };
    qs('#chatSend') && qs('#chatSend').addEventListener('click', send);
    input && input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  }

  /* ---------------- Auth forms ---------------- */
  function setupAuthForms() {
    qsa('[data-auth-tab]').forEach(b => b.addEventListener('click', () => switchAuthTab(b.dataset.authTab)));
    const fl = qs('#formLogin'), fr = qs('#formRegister'), frc = qs('#formRecover');
    fl && fl.addEventListener('submit', e => { e.preventDefault(); const d = Object.fromEntries(new FormData(fl)); if (CS.login(d.email, d.pass)) { closeModal(qs('#authModal')); fl.reset(); } });
    fr && fr.addEventListener('submit', e => { e.preventDefault(); const d = Object.fromEntries(new FormData(fr)); if (CS.register(d)) { closeModal(qs('#authModal')); fr.reset(); } });
    frc && frc.addEventListener('submit', e => { e.preventDefault(); CS.toast('Correo enviado', 'Revisa tu bandeja para restablecer la contraseña.', 'success'); closeModal(qs('#authModal')); frc.reset(); });
    qs('#btnUser') && qs('#btnUser').addEventListener('click', () => { if (CS.currentUser()) location.href = 'account.html'; else CS.openAuth('login'); });
  }

  /* ---------------- Header scroll + back to top ---------------- */
  function setupScroll() {
    const header = qs('#siteHeader'), top = qs('#fabTop');
    const onScroll = () => {
      const y = window.scrollY;
      header && header.classList.toggle('scrolled', y > 10);
      top && top.classList.toggle('show', y > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    top && top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------------- Delegación global de clics ---------------- */
  function setupDelegation() {
    document.addEventListener('click', e => {
      const add = e.target.closest('[data-add]');
      const buy = e.target.closest('[data-buy]');
      const wish = e.target.closest('[data-wish]');
      const cmp = e.target.closest('[data-compare]');
      const uncmp = e.target.closest('[data-uncompare]');
      const policy = e.target.closest('[data-policy]');
      const closeM = e.target.closest('[data-close-modal]');

      if (add) { e.preventDefault(); CS.addToCart(add.dataset.add); }
      else if (buy) { e.preventDefault(); CS.addToCart(buy.dataset.buy); location.href = 'cart.html'; }
      else if (wish) { e.preventDefault(); CS.toggleWishlist(wish.dataset.wish); }
      else if (cmp) { e.preventDefault(); CS.toggleCompare(cmp.dataset.compare); }
      else if (uncmp) { e.preventDefault(); CS.toggleCompare(uncmp.dataset.uncompare); }
      else if (policy) { e.preventDefault(); CS.openPolicy(policy.dataset.policy); }

      if (closeM) { const ov = closeM.closest('.modal-overlay'); ov && closeModal(ov); }
      const ov = e.target.classList && e.target.classList.contains('modal-overlay') ? e.target : null;
      if (ov) closeModal(ov);

      if (e.target.closest('#clearCompare')) CS.clearCompare();
      if (e.target.closest('#openCompare')) { renderCompareModal(); openModal('compareModal'); }
    });
    qs('#btnTheme') && qs('#btnTheme').addEventListener('click', CS.toggleTheme);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') qsa('.modal-overlay.open').forEach(closeModal); });
  }

  /* ---------------- Init ---------------- */
  function init() {
    buildHeader();
    buildDrawer();
    buildFloats();
    buildCompareBar();
    buildAuthModal();
    buildPolicyModal();
    buildCompareModal();
    buildFooter();

    setupSearch();
    setupDrawer();
    setupChat();
    setupAuthForms();
    setupScroll();
    setupDelegation();

    updateBadges();
    renderCompareBar();
    refreshCards();

    CS.on('cart', updateBadges);
    CS.on('wishlist', () => { updateBadges(); refreshCards(); });
    CS.on('compare', () => { renderCompareBar(); refreshCards(); });

    CS.observeReveal();
    CS.observeLazy();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
