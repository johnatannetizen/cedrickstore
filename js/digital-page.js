/* =========================================================================
   CedrickStore — Página pública de Productos Digitales (digital-page.js)
   Muestra todos los productos digitales creados por el admin.
   Los usuarios agregan al carrito y pagan desde ahí (con monedero o WA).
   ========================================================================= */
(function () {
  'use strict';
  const { qs, qsa, icon, money, escapeHtml } = CS;
  const root = qs('#digitalRoot');

  function render() {
    const list = CS.digitalProducts();
    const user = CS.currentUser();
    const balance = user ? CS.walletBalance(user.email) : 0;

    if (!list.length) {
      root.innerHTML = `
        <div class="empty-state">
          <div class="eico">${CS.ICONS.chip}</div>
          <h3>Sin productos digitales disponibles</h3>
          <p class="muted">El administrador aún no ha agregado productos digitales. Vuelve pronto.</p>
          <a href="index.html" class="btn btn-gold mt-16">Volver al inicio</a>
        </div>`;
      return;
    }

    const header = user
      ? `<div class="between mb-24 flex-wrap" style="gap:12px">
          <div><span class="eyebrow">Tu saldo</span><h3 class="gold-text" style="font-size:1.6rem">${money(balance)}</h3></div>
          <a href="account.html#wallet" class="btn btn-outline btn-sm">${icon('money')} Ver monedero</a>
        </div>`
      : `<div class="panel mb-24" style="background:var(--surface-2);text-align:center;padding:18px">
          <p class="muted">${icon('user')} <a href="#" id="loginToShop" class="gold-text" style="font-weight:700">Inicia sesión</a> para pagar con tu monedero</p>
        </div>`;

    root.innerHTML = `
      ${header}
      <div class="product-grid cols-3" id="dpGrid">
        ${list.map(dp => {
          const inStock = dp.items && dp.items.length > 0;
          return `
          <article class="product-card">
            <div class="pc-media" style="aspect-ratio:16/10;background:linear-gradient(135deg,var(--surface-2),var(--border))">
              ${dp.image ? `<img src="${dp.image}" alt="${escapeHtml(dp.name)}" style="width:100%;height:100%;object-fit:cover">` : `<div style="display:grid;place-items:center;height:100%;font-size:3rem;opacity:.5">${CS.ICONS.chip}</div>`}
              <div class="pc-tags">
                ${!inStock ? '<span class="tag tag-sale">Agotado</span>' : '<span class="tag tag-new">Digital</span>'}
              </div>
            </div>
            <div class="pc-body">
              <span class="pc-cat">${escapeHtml(dp.category)}</span>
              <h3 class="pc-title">${escapeHtml(dp.name)}</h3>
              ${dp.desc ? '<p class="muted" style="font-size:.84rem;-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden">' + escapeHtml(dp.desc) + '</p>' : ''}
              <div class="pc-price">
                <span class="price-now">${money(dp.price)}</span>
              </div>
              <span class="muted" style="font-size:.76rem">${icon('clock')} Duración: <b>${dp.duration || 30} días</b></span>
              <span class="pc-stock ${inStock ? '' : 'out'}">${inStock ? dp.items.length + ' disponibles' : 'Sin stock'}</span>
              <button class="btn btn-gold btn-block btn-sm mt-8" data-add-digital="${dp.id}" ${!inStock ? 'disabled' : ''}>
                ${!inStock ? 'Agotado' : icon('cart') + ' Agregar al carrito'}
              </button>
            </div>
          </article>`;
        }).join('')}
      </div>

      <div class="panel mt-24" style="text-align:center">
        <h4 class="mb-8">${icon('shield')} Entrega inmediata por correo</h4>
        <p class="muted">Al pagar con tu monedero, recibes el código/licencia en tu correo registrado al instante.</p>
      </div>`;

    // Eventos
    qs('#loginToShop') && qs('#loginToShop').addEventListener('click', e => { e.preventDefault(); CS.openAuth('login'); });

    qsa('[data-add-digital]').forEach(btn => btn.addEventListener('click', () => {
      const dpId = btn.dataset.addDigital;
      CS.addDigitalToCart(dpId);
    }));
  }

  CS.on('auth', render);
  CS.on('digital', render);
  render();
})();
