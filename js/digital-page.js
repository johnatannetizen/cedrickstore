/* =========================================================================
   CedrickStore — Página pública de Productos Digitales (digital-page.js)
   Muestra todos los productos digitales creados por el admin.
   Los usuarios pueden comprar con su monedero (deben estar logueados).
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
          <p class="muted">${icon('user')} <a href="#" id="loginToShop" class="gold-text" style="font-weight:700">Inicia sesión</a> para comprar con tu monedero</p>
        </div>`;

    root.innerHTML = `
      ${header}
      <div class="product-grid cols-3" id="dpGrid">
        ${list.map(dp => {
          const inStock = dp.items && dp.items.length > 0;
          const canAfford = user && balance >= dp.price;
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
              <span class="pc-stock ${inStock ? '' : 'out'}">${inStock ? dp.items.length + ' disponibles' : 'Sin stock'}</span>
              <button class="btn ${canAfford && inStock ? 'btn-gold' : 'btn-outline'} btn-block btn-sm mt-8" data-buy-dp="${dp.id}" ${!inStock ? 'disabled' : ''}>
                ${!inStock ? 'Agotado' : !user ? 'Iniciar sesión para comprar' : !canAfford ? 'Saldo insuficiente' : icon('money') + ' Comprar con monedero'}
              </button>
            </div>
          </article>`;
        }).join('')}
      </div>
      <div id="purchaseResult" class="mt-24"></div>

      <div class="panel mt-24" style="text-align:center">
        <h4 class="mb-8">${icon('shield')} Entrega inmediata</h4>
        <p class="muted">Al comprar, recibes tu código/licencia al instante. Se descuenta automáticamente del inventario.</p>
      </div>`;

    // Eventos
    qs('#loginToShop') && qs('#loginToShop').addEventListener('click', e => { e.preventDefault(); CS.openAuth('login'); });

    qsa('[data-buy-dp]').forEach(btn => btn.addEventListener('click', () => {
      if (!user) { CS.openAuth('login'); return; }
      const dpId = btn.dataset.buyDp;
      const dp = CS.digitalProductById(dpId);
      if (!dp) return;
      if (!confirm('¿Comprar "' + dp.name + '" por ' + money(dp.price) + ' de tu monedero?')) return;

      const result = CS.purchaseDigitalWithWallet(dpId, user.email);
      if (result.ok) {
        CS.toast('Compra exitosa', 'Tu código: ' + result.code, 'success');
        qs('#purchaseResult').innerHTML = `
          <div class="panel" style="background:rgba(24,165,88,.08);border:1.5px solid var(--success);text-align:center">
            <h3 style="color:var(--success)">${icon('check')} Compra exitosa</h3>
            <p class="mt-8 muted">Tu producto digital:</p>
            <code style="display:block;padding:16px;background:var(--surface-2);border-radius:10px;font-size:1.15rem;font-weight:700;margin-top:10px;word-break:break-all;font-family:monospace">${escapeHtml(result.code)}</code>
            <p class="muted mt-12">Guárdalo. También lo puedes ver en <a href="account.html#orders" class="gold-text">Mis pedidos</a>.</p>
          </div>`;
        render(); // actualizar stock y saldo
      } else {
        CS.toast('No se pudo comprar', result.error, 'error');
      }
    }));
  }

  // Re-render cuando cambia auth o wallet
  CS.on('auth', render);
  CS.on('wallet', render);
  CS.on('digital', render);
  render();
})();
