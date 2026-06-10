/* =========================================================================
   CedrickStore — Carrito (cart.js)
   Soporta productos físicos y digitales. Opciones de pago:
   - WhatsApp (físicos)
   - Monedero (digitales)
   - Checkout completo
   ========================================================================= */
(function () {
  'use strict';
  const { qs, qsa, icon, money, escapeHtml } = CS;
  const root = qs('#cartRoot');

  function render() {
    const cartItems = CS.cart();
    // Separar físicos y digitales
    const physicalItems = [];
    const digitalItems = [];
    cartItems.forEach(i => {
      if (i.type === 'digital') {
        const dp = CS.digitalProductById(i.id);
        if (dp) digitalItems.push({ dp, qty: i.qty });
      } else {
        const p = CS.productById(i.id);
        if (p) physicalItems.push({ p, qty: i.qty });
      }
    });

    const allEmpty = physicalItems.length === 0 && digitalItems.length === 0;

    if (allEmpty) {
      root.innerHTML = `
        <div class="empty-state">
          <div class="eico">${CS.ICONS.cart}</div>
          <h3>Tu carrito está vacío</h3>
          <p class="muted">Explora nuestro catálogo y encuentra productos premium para ti.</p>
          <div class="gap-12 row mt-16" style="justify-content:center;flex-wrap:wrap">
            <a href="catalog.html" class="btn btn-gold btn-lg">${icon('bag')} Ir a comprar</a>
            <a href="digital.html" class="btn btn-outline btn-lg">${icon('chip')} Productos digitales</a>
          </div>
        </div>`;
      renderReco();
      return;
    }

    const t = CS.cartTotals();
    const user = CS.currentUser();
    const balance = user ? CS.walletBalance(user.email) : 0;

    // Calcular total de digitales
    const digitalTotal = digitalItems.reduce((s, { dp, qty }) => s + dp.price * qty, 0);
    const physicalTotal = t.total - digitalTotal; // ajuste simple

    // Filas de productos físicos
    const physicalRows = physicalItems.map(({ p, qty }) => `
      <div class="cart-row" data-id="${p.id}">
        <a class="ci-media" href="product.html?id=${p.id}"><img src="${CS.productImg(p)}" alt="${escapeHtml(p.name)}"></a>
        <div>
          <span class="ci-cat">${escapeHtml(CS.categoryName(p.category))}</span>
          <a href="product.html?id=${p.id}"><div class="ci-title">${escapeHtml(p.name)}</div></a>
          <div class="ci-price">${money(p.price)}</div>
          ${p.stock <= 5 ? '<span class="pc-stock low" style="font-size:.76rem">¡Quedan ' + p.stock + '!</span>' : ''}
        </div>
        <div class="ci-right">
          <div class="qty-stepper">
            <button data-dec="${p.id}" aria-label="Restar">−</button>
            <input type="text" value="${qty}" data-qty="${p.id}" inputmode="numeric" aria-label="Cantidad">
            <button data-inc="${p.id}" aria-label="Sumar">+</button>
          </div>
          <b style="font-family:var(--font-head)">${money(p.price * qty)}</b>
          <button class="ci-remove" data-rm="${p.id}">${icon('trash')} Eliminar</button>
        </div>
      </div>`).join('');

    // Filas de productos digitales
    const digitalRows = digitalItems.map(({ dp, qty }) => `
      <div class="cart-row" data-id="${dp.id}" style="border-left:3px solid var(--accent)">
        <div class="ci-media" style="display:grid;place-items:center;background:linear-gradient(135deg,var(--surface-2),var(--border))">
          ${dp.image ? `<img src="${dp.image}" alt="" style="width:100%;height:100%;object-fit:cover">` : `<div style="font-size:1.8rem;opacity:.5">${CS.ICONS.chip}</div>`}
        </div>
        <div>
          <span class="ci-cat" style="color:var(--accent)">DIGITAL · ${escapeHtml(dp.category)}</span>
          <div class="ci-title">${escapeHtml(dp.name)}</div>
          <div class="ci-price">${money(dp.price)}</div>
          <span class="pc-stock" style="font-size:.72rem">${dp.items.length} disponibles</span>
        </div>
        <div class="ci-right">
          <div class="qty-stepper">
            <button data-dec-d="${dp.id}" aria-label="Restar">−</button>
            <input type="text" value="${qty}" data-qty-d="${dp.id}" inputmode="numeric" aria-label="Cantidad">
            <button data-inc-d="${dp.id}" aria-label="Sumar">+</button>
          </div>
          <b style="font-family:var(--font-head)">${money(dp.price * qty)}</b>
          <button class="ci-remove" data-rm-d="${dp.id}">${icon('trash')} Eliminar</button>
        </div>
      </div>`).join('');

    root.innerHTML = `
      <div class="cart-layout">
        <div>
          <div class="between mb-16">
            <span class="muted">${cartItems.length} producto${cartItems.length !== 1 ? 's' : ''} en tu carrito</span>
            <button class="ci-remove" id="clearAll">${icon('trash')} Vaciar carrito</button>
          </div>

          ${physicalRows ? '<h4 class="mb-8" style="font-size:.9rem;color:var(--text-soft)">Productos físicos</h4><div class="cart-items mb-16">' + physicalRows + '</div>' : ''}
          ${digitalRows ? '<h4 class="mb-8" style="font-size:.9rem;color:var(--accent)">Productos digitales</h4><div class="cart-items">' + digitalRows + '</div>' : ''}

          <a href="catalog.html" class="link-more mt-24" style="display:inline-flex">${icon('chevL')} Seguir comprando</a>
        </div>

        <aside class="summary">
          <h3>Resumen del pedido</h3>
          ${renderCoupon(t)}
          <div class="sum-line"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
          ${t.discount > 0 ? `<div class="sum-line" style="color:var(--success)"><span>Descuento</span><span>-${money(t.discount)}</span></div>` : ''}
          ${physicalItems.length > 0 ? `<div class="sum-line"><span>Envío</span><span>${t.shipping === 0 ? '<b style="color:var(--success)">Gratis</b>' : money(t.shipping)}</span></div>` : ''}
          ${t.subtotal < 300000 && physicalItems.length > 0 ? `<div class="muted" style="font-size:.8rem">Agrega ${money(300000 - t.subtotal)} más para envío gratis 🚚</div>` : ''}
          <div class="sum-line total"><span>Total</span><b>${money(t.total)}</b></div>

          ${digitalItems.length > 0 ? `
            <div style="border:1.5px solid var(--accent);border-radius:12px;padding:14px;margin-top:14px;background:rgba(201,162,39,.06)">
              <div class="between" style="margin-bottom:8px"><b style="font-size:.9rem">Digitales: ${money(digitalTotal)}</b>${user ? '<span class="muted" style="font-size:.82rem">Saldo: ' + money(balance) + '</span>' : ''}</div>
              <button class="btn btn-gold btn-block" id="payWallet" ${!user || balance < digitalTotal ? 'disabled' : ''}>
                ${icon('money')} Pagar digitales con monedero
              </button>
              ${!user ? '<p class="muted text-center mt-8" style="font-size:.78rem"><a href="#" id="loginForWallet" class="gold-text">Inicia sesión</a> para pagar con monedero</p>' : balance < digitalTotal ? '<p class="muted text-center mt-8" style="font-size:.78rem;color:var(--danger)">Saldo insuficiente. Pide recarga al admin.</p>' : '<p class="muted text-center mt-8" style="font-size:.78rem">Los códigos se enviarán a: <b>' + escapeHtml(user.email) + '</b></p>'}
            </div>` : ''}

          ${physicalItems.length > 0 ? `
            <button class="btn btn-wa btn-block btn-lg mt-16" id="sendWhatsApp" style="font-size:1.02rem">
              ${icon('whatsapp')} Enviar Pedido por WhatsApp
            </button>
            <a href="checkout.html" class="btn btn-outline btn-block mt-8">${icon('check')} Finalizar compra</a>` : ''}

          <p class="muted text-center mt-16" style="font-size:.8rem">${icon('shield')} Compra protegida · Datos seguros</p>
        </aside>
      </div>
      <div id="walletResult" class="mt-24"></div>`;

    wire();
    renderReco();
  }

  function renderCoupon(t) {
    if (t.coupon) {
      return `<div class="coupon-applied">${icon('tag')} Cupón <b>${t.coupon.code}</b> aplicado · ${escapeHtml(t.coupon.label)}<button id="removeCoupon" style="margin-left:auto;color:var(--danger)">${CS.ICONS.close}</button></div>`;
    }
    return `
      <div class="coupon-row">
        <input class="input" id="couponInput" placeholder="Código de cupón" aria-label="Cupón">
        <button class="btn btn-dark btn-sm" id="applyCoupon">Aplicar</button>
      </div>
      <p class="muted" style="font-size:.78rem;margin-bottom:8px">Prueba: <b>CEDRICK10</b>, <b>PREMIUM20</b> o <b>ENVIOGRATIS</b></p>`;
  }

  function wire() {
    // Productos físicos
    qsa('[data-inc]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.inc; const it = CS.cart().find(x => x.id === id); CS.updateQty(id, (it ? it.qty : 0) + 1); render(); }));
    qsa('[data-dec]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.dec; const it = CS.cart().find(x => x.id === id); CS.updateQty(id, (it ? it.qty : 0) - 1); render(); }));
    qsa('[data-qty]').forEach(inp => inp.addEventListener('change', () => { const id = inp.dataset.qty; const v = parseInt(inp.value.replace(/\D/g, '')) || 1; CS.updateQty(id, v); render(); }));
    qsa('[data-rm]').forEach(b => b.addEventListener('click', () => { CS.removeFromCart(b.dataset.rm); render(); }));

    // Productos digitales
    qsa('[data-inc-d]').forEach(b => b.addEventListener('click', () => { updateDigitalQty(b.dataset.incD, 1); }));
    qsa('[data-dec-d]').forEach(b => b.addEventListener('click', () => { updateDigitalQty(b.dataset.decD, -1); }));
    qsa('[data-qty-d]').forEach(inp => inp.addEventListener('change', () => { setDigitalQty(inp.dataset.qtyD, parseInt(inp.value.replace(/\D/g, '')) || 1); }));
    qsa('[data-rm-d]').forEach(b => b.addEventListener('click', () => { CS.removeFromCart(b.dataset.rmD); render(); }));

    qs('#clearAll') && qs('#clearAll').addEventListener('click', () => { if (confirm('¿Vaciar todo el carrito?')) { CS.clearCart(); render(); } });

    // Cupón
    const applyBtn = qs('#applyCoupon');
    applyBtn && applyBtn.addEventListener('click', () => { if (CS.applyCoupon(qs('#couponInput').value)) render(); });
    qs('#couponInput') && qs('#couponInput').addEventListener('keydown', e => { if (e.key === 'Enter') { if (CS.applyCoupon(e.target.value)) render(); } });
    qs('#removeCoupon') && qs('#removeCoupon').addEventListener('click', () => { CS.removeCoupon(); render(); });

    // WhatsApp (solo físicos)
    qs('#sendWhatsApp') && qs('#sendWhatsApp').addEventListener('click', () => {
      const u = CS.currentUser();
      CS.sendWhatsApp(u ? { name: u.name, phone: u.phone } : {});
    });

    // Login para monedero
    qs('#loginForWallet') && qs('#loginForWallet').addEventListener('click', e => { e.preventDefault(); CS.openAuth('login'); });

    // Pagar digitales con monedero
    qs('#payWallet') && qs('#payWallet').addEventListener('click', () => {
      const user = CS.currentUser();
      if (!user) { CS.openAuth('login'); return; }
      if (!confirm('¿Pagar los productos digitales con tu monedero? Los códigos se enviarán a ' + user.email)) return;

      const result = CS.payDigitalWithWallet(user.email);
      if (result.ok) {
        CS.toast('Pago exitoso', 'Códigos entregados a tu correo.', 'success');
        showDigitalSuccess(result);
        render();
      } else {
        CS.toast('Error', result.error, 'error');
      }
    });
  }

  function updateDigitalQty(id, delta) {
    let c = CS.cart();
    const item = c.find(i => i.id === id && i.type === 'digital');
    if (!item) return;
    const dp = CS.digitalProductById(id);
    const newQty = item.qty + delta;
    if (newQty <= 0) { c = c.filter(i => !(i.id === id && i.type === 'digital')); }
    else { item.qty = dp ? Math.min(newQty, dp.items.length) : newQty; }
    CS.store.set(CS.KEY.cart, c); CS.emit('cart'); render();
  }

  function setDigitalQty(id, qty) {
    let c = CS.cart();
    const item = c.find(i => i.id === id && i.type === 'digital');
    if (!item) return;
    const dp = CS.digitalProductById(id);
    if (qty <= 0) { c = c.filter(i => !(i.id === id && i.type === 'digital')); }
    else { item.qty = dp ? Math.min(qty, dp.items.length) : qty; }
    CS.store.set(CS.KEY.cart, c); CS.emit('cart'); render();
  }

  function showDigitalSuccess(result) {
    const resEl = qs('#walletResult');
    if (!resEl) return;
    const codesHtml = result.codes.map(c => `
      <div class="cart-row" style="grid-template-columns:auto 1fr;border-left:3px solid var(--success)">
        <div style="font-size:1.5rem;color:var(--success)">${CS.ICONS.check}</div>
        <div>
          <b>${escapeHtml(c.name)}</b>
          <code style="display:block;padding:8px 12px;background:var(--surface-2);border-radius:8px;font-size:1rem;font-weight:700;margin-top:6px;word-break:break-all;font-family:monospace">${escapeHtml(c.code)}</code>
        </div>
      </div>`).join('');

    resEl.innerHTML = `
      <div class="panel" style="border:1.5px solid var(--success);background:rgba(24,165,88,.04)">
        <div class="text-center mb-16">
          <div class="eico" style="width:70px;height:70px;margin:0 auto 12px;background:rgba(24,165,88,.14);color:var(--success);border-radius:50%;display:grid;place-items:center">${CS.ICONS.check}</div>
          <h3 style="color:var(--success)">Pago exitoso</h3>
          <p class="muted">Tus productos digitales están listos. Los datos fueron enviados a <b>${escapeHtml(result.email)}</b></p>
        </div>
        <h4 class="mb-8">Tus códigos:</h4>
        <div class="cart-items">${codesHtml}</div>
        <p class="muted mt-16 text-center" style="font-size:.85rem">También puedes verlos en <a href="account.html#orders" class="gold-text">Mis pedidos</a>. Guárdalos en un lugar seguro.</p>
      </div>`;
    resEl.scrollIntoView({ behavior: 'smooth' });
  }

  function renderReco() {
    const sec = qs('#recoSection');
    if (!sec) return;
    const inCart = CS.cart().map(i => i.id);
    const reco = CS.filterProducts({ sort: 'popular' }).filter(p => !inCart.includes(p.id)).slice(0, 4);
    if (!reco.length) { sec.hidden = true; return; }
    sec.hidden = false;
    CS.renderGrid(qs('#cartReco'), reco);
  }

  CS.on('cart', render);
  CS.on('auth', render);
  render();
})();
