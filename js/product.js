/* =========================================================================
   CedrickStore — Detalle de producto (product.js)
   Galería, info, stepper, acciones, compartir, tabs, reseñas, relacionados.
   ========================================================================= */
(function () {
  'use strict';
  const { qs, qsa, icon, money, escapeHtml, param } = CS;
  const id = param('id');
  const p = CS.productById(id);
  const root = qs('#pdpRoot');

  if (!p) {
    root.innerHTML = `<div class="empty-state"><div class="eico">${CS.ICONS.box}</div><h3>Producto no encontrado</h3><p class="muted">El producto que buscas no existe o fue removido.</p><a href="catalog.html" class="btn btn-gold mt-16">Volver al catálogo</a></div>`;
    return;
  }

  document.title = p.name + ' | CedrickStore';
  const off = CS.discountPct(p.price, p.oldPrice);
  const galleryN = p.gallery || 3;
  let currentImg = 0;
  let qty = 1;

  /* ---------- Breadcrumb ---------- */
  qs('#crumb').innerHTML = `<a href="index.html">Inicio</a><span class="sep">/</span><a href="catalog.html?cat=${p.category}">${escapeHtml(CS.categoryName(p.category))}</a><span class="sep">/</span><span>${escapeHtml(p.name)}</span>`;

  /* ---------- Galería imágenes ---------- */
  function imgFor(i) { return CS.productImg(p, i); }

  function render() {
    const stockCls = p.stock <= 0 ? 'out' : p.stock <= 5 ? 'low' : '';
    const stockTxt = p.stock <= 0 ? 'Agotado' : p.stock <= 5 ? '¡Solo quedan ' + p.stock + ' unidades!' : 'En stock (' + p.stock + ' disponibles)';
    const wish = CS.inWishlist(p.id);
    const cmp = CS.inCompare(p.id);
    const shareUrl = encodeURIComponent(location.href);
    const shareText = encodeURIComponent('Mira este producto en CedrickStore: ' + p.name);

    root.innerHTML = `
    <div class="pdp">
      <div>
        <div class="gallery-main" id="galleryMain"><img src="${imgFor(0)}" alt="${escapeHtml(p.name)}" id="galleryImg"></div>
        <div class="gallery-thumbs" id="galleryThumbs">
          ${Array.from({ length: galleryN }, (_, i) => `<button class="${i === 0 ? 'active' : ''}" data-img="${i}"><img src="${imgFor(i)}" alt="Vista ${i + 1}"></button>`).join('')}
        </div>
        <div class="feature-row" style="grid-template-columns:1fr 1fr;margin-top:18px">
          <div class="feature"><div class="fico">${CS.ICONS.truck}</div><div><h5>Envío rápido</h5><p>2-5 días hábiles</p></div></div>
          <div class="feature"><div class="fico">${CS.ICONS.shield}</div><div><h5>Garantía</h5><p>${escapeHtml((p.specs && p.specs['Garantía']) || '12 meses')}</p></div></div>
        </div>
      </div>

      <div class="pdp-info">
        <span class="pc-cat">${escapeHtml(CS.categoryName(p.category))} · ${escapeHtml(CS.brandName(p.brand))}</span>
        <h1>${escapeHtml(p.name)}</h1>
        <div class="pdp-rating">
          ${CS.stars(p.rating)} <b>${p.rating}</b>
          <span class="muted">·</span><a href="#tab-reviews" class="muted" id="toReviews">${(p.reviews || []).length} opiniones</a>
          <span class="muted">·</span><span class="muted">${p.sold || 0} vendidos</span>
        </div>
        <div class="pdp-price">
          <span class="price-now">${money(p.price)}</span>
          ${p.oldPrice ? '<span class="price-old">' + money(p.oldPrice) + '</span>' : ''}
          ${off > 0 ? '<span class="tag tag-sale">Ahorras ' + off + '%</span>' : ''}
        </div>
        <span class="pc-stock ${stockCls}" style="font-size:.95rem">${stockTxt}</span>
        <p class="pdp-desc mt-16">${escapeHtml(p.desc || '')}</p>

        <div class="row gap-16 flex-wrap" style="align-items:center;margin:18px 0">
          <div class="qty-stepper">
            <button id="qtyMinus" aria-label="Restar">−</button>
            <input type="text" id="qtyInput" value="1" inputmode="numeric" aria-label="Cantidad">
            <button id="qtyPlus" aria-label="Sumar">+</button>
          </div>
          <span class="muted" style="font-size:.9rem">Subtotal: <b id="lineTotal" style="color:var(--accent)">${money(p.price)}</b></span>
        </div>

        <div class="pdp-actions">
          <button class="btn btn-gold btn-lg" id="buyNow" ${p.stock <= 0 ? 'disabled' : ''}>${icon('cart')} Comprar ahora</button>
          <button class="btn btn-dark btn-lg" data-add="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>Agregar al carrito</button>
          <button class="icon-btn ${wish ? 'active' : ''}" id="wishBtn" data-wish="${p.id}" title="Favoritos" style="width:52px;height:52px">${CS.ICONS.heart}</button>
          <button class="icon-btn ${cmp ? 'active' : ''}" data-compare="${p.id}" title="Comparar" style="width:52px;height:52px">${CS.ICONS.compare}</button>
        </div>

        <a class="btn btn-wa btn-block btn-lg" id="waProduct">${icon('whatsapp')} Consultar este producto por WhatsApp</a>

        <div class="pdp-meta mt-24">
          <div class="ln"><b>SKU:</b> <span class="muted">${p.id.toUpperCase()}</span></div>
          <div class="ln"><b>Marca:</b> <a href="catalog.html?brand=${p.brand}">${escapeHtml(CS.brandName(p.brand))}</a></div>
          <div class="ln"><b>Categoría:</b> <a href="catalog.html?cat=${p.category}">${escapeHtml(CS.categoryName(p.category))}</a></div>
        </div>

        <div class="share-row">
          <span class="muted" style="font-weight:600">${icon('share')} Compartir:</span>
          <a class="fb" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" aria-label="Facebook">${CS.ICONS.facebook}</a>
          <a class="wa" href="https://wa.me/?text=${shareText}%20${shareUrl}" target="_blank" aria-label="WhatsApp">${CS.ICONS.whatsapp}</a>
          <a class="tw" href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" aria-label="Twitter">${CS.ICONS.twitter}</a>
          <a class="tg" href="https://t.me/share/url?url=${shareUrl}&text=${shareText}" target="_blank" aria-label="Telegram">${CS.ICONS.telegram}</a>
          <a class="cp" href="#" id="copyLink" aria-label="Copiar enlace">${CS.ICONS.copy}</a>
        </div>
      </div>
    </div>`;

    wireGallery();
    wireQty();
    wireActions();
  }

  function wireGallery() {
    qsa('#galleryThumbs button').forEach(b => b.addEventListener('click', () => {
      currentImg = +b.dataset.img;
      qs('#galleryImg').src = imgFor(currentImg);
      qsa('#galleryThumbs button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    }));
  }

  function wireQty() {
    const input = qs('#qtyInput'), lineTotal = qs('#lineTotal');
    const upd = () => { qty = Math.max(1, Math.min(p.stock || 99, qty)); input.value = qty; lineTotal.textContent = money(p.price * qty); };
    qs('#qtyMinus').addEventListener('click', () => { qty--; upd(); });
    qs('#qtyPlus').addEventListener('click', () => { qty++; upd(); });
    input.addEventListener('input', () => { qty = parseInt(input.value.replace(/\D/g, '')) || 1; upd(); });
    upd();
  }

  function wireActions() {
    qs('#buyNow') && qs('#buyNow').addEventListener('click', () => { CS.addToCart(p.id, qty); location.href = 'cart.html'; });
    // override add-to-cart to respect qty
    qs('[data-add]') && qs('[data-add]').addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); CS.addToCart(p.id, qty); }, true);
    qs('#waProduct') && qs('#waProduct').addEventListener('click', () => {
      const msg = `Hola ${CS.STORE_NAME}, estoy interesado en este producto:\n\n• ${p.name}\n💰 Precio: ${money(p.price)}\n🔢 Cantidad: ${qty}\n\n¿Está disponible?`;
      window.open('https://wa.me/' + CS.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
    });
    qs('#copyLink') && qs('#copyLink').addEventListener('click', e => {
      e.preventDefault();
      navigator.clipboard && navigator.clipboard.writeText(location.href).then(() => CS.toast('Enlace copiado', 'Compártelo donde quieras.', 'success'))
        .catch(() => CS.toast('Copia manual', location.href, 'info'));
    });
    qs('#toReviews') && qs('#toReviews').addEventListener('click', e => { e.preventDefault(); switchTab('reviews'); qs('#pdpTabsRoot').scrollIntoView({ behavior: 'smooth' }); });
  }

  /* ---------- TABS ---------- */
  function renderTabs() {
    qs('#pdpTabsRoot').hidden = false;
    qs('#tab-desc').innerHTML = `
      <div class="panel">
        <h3 class="mb-16">Descripción del producto</h3>
        <p class="muted" style="line-height:1.9;font-size:1.02rem">${escapeHtml(p.desc || '')}</p>
        <ul style="margin-top:16px;display:grid;gap:10px">
          ${Object.entries(p.specs || {}).slice(0, 4).map(([k, v]) => `<li class="row gap-8" style="align-items:center">${icon('check', 'gold-text')} <span><b>${escapeHtml(k)}:</b> ${escapeHtml(v)}</span></li>`).join('')}
        </ul>
      </div>`;

    qs('#tab-specs').innerHTML = `
      <div class="panel">
        <h3 class="mb-16">Especificaciones técnicas</h3>
        <table class="data-table">
          <tbody>${Object.entries(p.specs || {}).map(([k, v]) => `<tr><td style="font-weight:700;width:40%">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join('')}</tbody>
        </table>
      </div>`;

    renderReviews();
  }

  function renderReviews() {
    const reviews = CS.store.get('cs_reviews_' + p.id, null) || (p.reviews || []);
    const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : p.rating;
    const dist = [5, 4, 3, 2, 1].map(n => reviews.filter(r => Math.round(r.rating) === n).length);
    const max = Math.max(1, ...dist);
    qs('#tab-reviews').innerHTML = `
      <div class="panel">
        <div class="row gap-24 flex-wrap" style="align-items:flex-start">
          <div class="text-center" style="min-width:160px">
            <div style="font-size:3.4rem;font-family:var(--font-head);font-weight:800;line-height:1">${avg}</div>
            ${CS.stars(Math.round(avg))}
            <p class="muted mt-8">${reviews.length} opiniones</p>
          </div>
          <div class="flex-1" style="min-width:240px">
            ${[5, 4, 3, 2, 1].map((n, i) => `<div class="row gap-8" style="align-items:center;margin-bottom:6px"><span style="width:38px;font-size:.85rem">${n} ★</span><div style="flex:1;height:8px;background:var(--surface-2);border-radius:20px;overflow:hidden"><div style="height:100%;width:${dist[i] / max * 100}%;background:var(--accent)"></div></div><span class="muted" style="width:28px;font-size:.82rem;text-align:right">${dist[i]}</span></div>`).join('')}
          </div>
        </div>
        <hr style="border:none;border-top:1px solid var(--border);margin:22px 0">
        <div class="between mb-16"><h3>Opiniones de clientes</h3><button class="btn btn-outline btn-sm" id="openReview">${icon('edit')} Escribir opinión</button></div>
        <div id="reviewsList">
          ${reviews.length ? reviews.map(r => `
            <div class="review-card">
              <div class="rh">
                <div class="avatar">${escapeHtml((r.user || 'C').charAt(0))}</div>
                <div><b>${escapeHtml(r.user || 'Cliente')}</b><div>${CS.stars(r.rating)}</div></div>
                <span class="muted" style="margin-left:auto;font-size:.82rem">${escapeHtml(r.date || 'reciente')}</span>
              </div>
              <p class="muted">${escapeHtml(r.text)}</p>
            </div>`).join('') : '<p class="muted">Sé el primero en opinar sobre este producto.</p>'}
        </div>
        <form id="reviewForm" class="hidden mt-16 panel" style="background:var(--surface-2)">
          <h4 class="mb-16">Tu opinión</h4>
          <div class="field"><label>Tu nombre</label><input class="input" name="user" required placeholder="Nombre"></div>
          <div class="field"><label>Calificación</label>
            <select class="select" name="rating"><option value="5">★★★★★ Excelente</option><option value="4">★★★★ Muy bueno</option><option value="3">★★★ Bueno</option><option value="2">★★ Regular</option><option value="1">★ Malo</option></select>
          </div>
          <div class="field"><label>Comentario</label><textarea class="textarea" name="text" required placeholder="Cuéntanos tu experiencia..."></textarea></div>
          <button class="btn btn-gold">Publicar opinión</button>
        </form>
      </div>`;

    qs('#openReview').addEventListener('click', () => qs('#reviewForm').classList.toggle('hidden'));
    qs('#reviewForm').addEventListener('submit', e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const list = CS.store.get('cs_reviews_' + p.id, null) || (p.reviews || []).slice();
      list.unshift({ user: d.user, rating: +d.rating, text: d.text, date: 'Justo ahora' });
      CS.store.set('cs_reviews_' + p.id, list);
      CS.toast('¡Gracias!', 'Tu opinión fue publicada.', 'success');
      renderReviews();
    });
  }

  function switchTab(tab) {
    qsa('#pdpTabs .tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    ['desc', 'specs', 'reviews'].forEach(t => qs('#tab-' + t).classList.toggle('hidden', t !== tab));
  }
  function wireTabs() {
    qsa('#pdpTabs .tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  }

  /* ---------- Relacionados / recomendados ---------- */
  function renderRelated() {
    const related = CS.products().filter(x => x.id !== p.id && x.category === p.category).slice(0, 4);
    const fill = related.length < 4 ? CS.products().filter(x => x.id !== p.id && !related.includes(x)).slice(0, 4 - related.length) : [];
    CS.renderGrid(qs('#relatedGrid'), related.concat(fill));
    const recommended = CS.filterProducts({ sort: 'popular' }).filter(x => x.id !== p.id).slice(0, 4);
    CS.renderGrid(qs('#recommendedGrid'), recommended);
  }

  render();
  renderTabs();
  wireTabs();
  renderRelated();

  // refrescar estado de favoritos/comparar al cambiar
  CS.on('wishlist', () => { const b = qs('#wishBtn'); if (b) b.classList.toggle('active', CS.inWishlist(p.id)); });
})();
