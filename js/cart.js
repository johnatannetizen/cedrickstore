/* =========================================================================
   CedrickStore — Carrito (cart.js)
   Lista de items, cantidades, eliminar, cupón, resumen, total y el gran
   botón "Enviar Pedido por WhatsApp".
   ========================================================================= */
(function () {
  'use strict';
  const { qs, qsa, icon, money, escapeHtml } = CS;
  const root = qs('#cartRoot');

  function render() {
    const items = CS.cart().map(i => ({ p: CS.productById(i.id), qty: i.qty })).filter(x => x.p);

    if (!items.length) {
      root.innerHTML = `
        <div class="empty-state">
          <div class="eico">${CS.ICONS.cart}</div>
          <h3>Tu carrito está vacío</h3>
          <p class="muted">Explora nuestro catálogo y encuentra productos premium para ti.</p>
          <a href="catalog.html" class="btn btn-gold btn-lg mt-16">${icon('bag')} Ir a comprar</a>
        </div>`;
      renderReco();
      return;
    }

    const t = CS.cartTotals();
    const rows = items.map(({ p, qty }) => `
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

    root.innerHTML = `
      <div class="cart-layout">
        <div>
          <div class="between mb-16">
            <span class="muted">${items.length} producto${items.length !== 1 ? 's' : ''} en tu carrito</span>
            <button class="ci-remove" id="clearAll">${icon('trash')} Vaciar carrito</button>
          </div>
          <div class="cart-items">${rows}</div>
          <a href="catalog.html" class="link-more mt-24" style="display:inline-flex">${icon('chevL')} Seguir comprando</a>
        </div>

        <aside class="summary">
          <h3>Resumen del pedido</h3>
          ${renderCoupon(t)}
          <div class="sum-line"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
          ${t.discount > 0 ? `<div class="sum-line" style="color:var(--success)"><span>Descuento</span><span>-${money(t.discount)}</span></div>` : ''}
          <div class="sum-line"><span>Envío</span><span>${t.shipping === 0 ? '<b style="color:var(--success)">Gratis</b>' : money(t.shipping)}</span></div>
          ${t.subtotal < 300000 ? `<div class="muted" style="font-size:.8rem">Agrega ${money(300000 - t.subtotal)} más para envío gratis 🚚</div>` : ''}
          <div class="sum-line total"><span>Total</span><b>${money(t.total)}</b></div>

          <button class="btn btn-wa btn-block btn-lg mt-16" id="sendWhatsApp" style="font-size:1.08rem">
            ${icon('whatsapp')} Enviar Pedido por WhatsApp
          </button>
          <a href="checkout.html" class="btn btn-gold btn-block mt-8">${icon('check')} Finalizar compra</a>
          <p class="muted text-center mt-16" style="font-size:.8rem">${icon('shield')} Compra protegida · Datos seguros</p>
        </aside>
      </div>`;

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
    qsa('[data-inc]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.inc; const it = CS.cart().find(x => x.id === id); CS.updateQty(id, (it ? it.qty : 0) + 1); render(); }));
    qsa('[data-dec]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.dec; const it = CS.cart().find(x => x.id === id); CS.updateQty(id, (it ? it.qty : 0) - 1); render(); }));
    qsa('[data-qty]').forEach(inp => inp.addEventListener('change', () => { const id = inp.dataset.qty; const v = parseInt(inp.value.replace(/\D/g, '')) || 1; CS.updateQty(id, v); render(); }));
    qsa('[data-rm]').forEach(b => b.addEventListener('click', () => { CS.removeFromCart(b.dataset.rm); render(); }));
    qs('#clearAll') && qs('#clearAll').addEventListener('click', () => { if (confirm('¿Vaciar todo el carrito?')) { CS.clearCart(); render(); } });

    const applyBtn = qs('#applyCoupon');
    applyBtn && applyBtn.addEventListener('click', () => { if (CS.applyCoupon(qs('#couponInput').value)) render(); });
    qs('#couponInput') && qs('#couponInput').addEventListener('keydown', e => { if (e.key === 'Enter') { if (CS.applyCoupon(e.target.value)) render(); } });
    qs('#removeCoupon') && qs('#removeCoupon').addEventListener('click', () => { CS.removeCoupon(); render(); });

    qs('#sendWhatsApp') && qs('#sendWhatsApp').addEventListener('click', () => {
      const u = CS.currentUser();
      CS.sendWhatsApp(u ? { name: u.name, phone: u.phone } : {});
    });
  }

  function renderReco() {
    const sec = qs('#recoSection');
    const inCart = CS.cart().map(i => i.id);
    const reco = CS.filterProducts({ sort: 'popular' }).filter(p => !inCart.includes(p.id)).slice(0, 4);
    if (!reco.length) { sec.hidden = true; return; }
    sec.hidden = false;
    CS.renderGrid(qs('#cartReco'), reco);
  }

  CS.on('cart', render);
  render();
})();
