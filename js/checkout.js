/* =========================================================================
   CedrickStore — Checkout (checkout.js)
   Formulario de datos con validaciones, resumen y creación de pedido +
   envío por WhatsApp.
   ========================================================================= */
(function () {
  'use strict';
  const { qs, qsa, icon, money, escapeHtml } = CS;
  const root = qs('#checkoutRoot');

  function render() {
    const items = CS.cart().map(i => ({ p: CS.productById(i.id), qty: i.qty })).filter(x => x.p);
    if (!items.length) {
      root.innerHTML = `<div class="empty-state"><div class="eico">${CS.ICONS.cart}</div><h3>No hay productos para procesar</h3><p class="muted">Agrega productos a tu carrito antes de finalizar la compra.</p><a href="catalog.html" class="btn btn-gold mt-16">Ir a comprar</a></div>`;
      return;
    }
    const t = CS.cartTotals();
    const u = CS.currentUser() || {};

    root.innerHTML = `
      <div class="cart-layout">
        <form id="checkoutForm" novalidate>
          <div class="panel">
            <h3 class="mb-16">${icon('user')} Datos del cliente</h3>
            <div class="form-grid">
              <div class="field full"><label>Nombre completo <span class="req">*</span></label><input class="input" name="name" value="${escapeHtml(u.name || '')}" placeholder="Ej: Juan Pérez"><div class="err">Ingresa tu nombre completo.</div></div>
              <div class="field"><label>Correo electrónico <span class="req">*</span></label><input class="input" name="email" type="email" value="${escapeHtml(u.email || '')}" placeholder="correo@email.com"><div class="err">Ingresa un correo válido.</div></div>
              <div class="field"><label>Teléfono / WhatsApp <span class="req">*</span></label><input class="input" name="phone" type="tel" value="${escapeHtml(u.phone || '')}" placeholder="3001234567"><div class="err">Ingresa un teléfono válido (10 dígitos).</div></div>
              <div class="field full"><label>Dirección de entrega <span class="req">*</span></label><input class="input" name="address" placeholder="Calle, número, barrio"><div class="err">Ingresa tu dirección.</div></div>
              <div class="field"><label>Ciudad <span class="req">*</span></label><input class="input" name="city" placeholder="Ej: Medellín"><div class="err">Ingresa tu ciudad.</div></div>
              <div class="field"><label>Departamento</label><input class="input" name="state" placeholder="Ej: Antioquia"></div>
              <div class="field full"><label>Observaciones</label><textarea class="textarea" name="notes" placeholder="Notas para la entrega (opcional)"></textarea></div>
            </div>
          </div>

          <div class="panel">
            <h3 class="mb-16">${icon('money')} Método de pago</h3>
            <div class="gap-12 row flex-wrap">
              <label class="check" style="border:1.5px solid var(--border);border-radius:10px;padding:12px;flex:1;min-width:160px"><input type="radio" name="payment" value="WhatsApp / Contra entrega" checked> Contra entrega / WhatsApp</label>
              <label class="check" style="border:1.5px solid var(--border);border-radius:10px;padding:12px;flex:1;min-width:160px"><input type="radio" name="payment" value="Transferencia (Nequi/PSE)"> Transferencia (Nequi/PSE)</label>
              <label class="check" style="border:1.5px solid var(--border);border-radius:10px;padding:12px;flex:1;min-width:160px"><input type="radio" name="payment" value="Tarjeta"> Tarjeta crédito/débito</label>
            </div>
            <p class="muted mt-16" style="font-size:.85rem">${icon('shield')} El pago se coordina de forma segura al confirmar tu pedido por WhatsApp.</p>
          </div>
        </form>

        <aside class="summary">
          <h3>Tu pedido</h3>
          <div style="max-height:260px;overflow-y:auto;margin-bottom:12px">
            ${items.map(({ p, qty }) => `<div class="row gap-12" style="align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
                <img src="${CS.productImg(p)}" alt="" style="width:48px;height:48px;border-radius:8px;object-fit:cover">
                <div style="flex:1"><div style="font-size:.88rem;font-weight:600">${escapeHtml(p.name)}</div><small class="muted">${qty} × ${money(p.price)}</small></div>
                <b style="font-size:.9rem">${money(p.price * qty)}</b>
              </div>`).join('')}
          </div>
          <div class="sum-line"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
          ${t.discount > 0 ? `<div class="sum-line" style="color:var(--success)"><span>Descuento</span><span>-${money(t.discount)}</span></div>` : ''}
          <div class="sum-line"><span>Envío</span><span>${t.shipping === 0 ? '<b style="color:var(--success)">Gratis</b>' : money(t.shipping)}</span></div>
          <div class="sum-line total"><span>Total</span><b>${money(t.total)}</b></div>
          <button class="btn btn-wa btn-block btn-lg mt-16" id="placeOrder" style="font-size:1.05rem">${icon('whatsapp')} Confirmar y enviar por WhatsApp</button>
          <p class="muted text-center mt-16" style="font-size:.8rem">Al confirmar aceptas nuestros <a href="#" data-policy="terminos" class="gold-text">términos y condiciones</a>.</p>
        </aside>
      </div>`;

    wire();
  }

  function validate(form) {
    let ok = true;
    const checks = {
      name: v => v.trim().length >= 3,
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      phone: v => v.replace(/\D/g, '').length >= 7,
      address: v => v.trim().length >= 5,
      city: v => v.trim().length >= 2
    };
    Object.keys(checks).forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      const field = input.closest('.field');
      const valid = checks[name](input.value);
      field.classList.toggle('invalid', !valid);
      if (!valid && ok) input.focus();
      if (!valid) ok = false;
    });
    return ok;
  }

  function wire() {
    const form = qs('#checkoutForm');
    // limpiar error al escribir
    qsa('.input, .textarea', form).forEach(i => i.addEventListener('input', () => i.closest('.field').classList.remove('invalid')));

    qs('#placeOrder').addEventListener('click', () => {
      if (!validate(form)) { CS.toast('Revisa el formulario', 'Completa los campos obligatorios.', 'error'); return; }
      const d = Object.fromEntries(new FormData(form));
      const items = CS.cart().map(i => { const p = CS.productById(i.id); return { id: i.id, name: p.name, price: p.price, qty: i.qty }; });
      const t = CS.cartTotals();
      const order = CS.createOrder({
        customer: { name: d.name, email: d.email, phone: d.phone, address: d.address, city: d.city, state: d.state, notes: d.notes },
        payment: d.payment, items, totals: t,
        userEmail: (CS.currentUser() || {}).email || d.email.toLowerCase()
      });

      // construir URL de WhatsApp ANTES de vaciar el carrito
      const waUrl = CS.whatsappUrl({ name: d.name, address: d.address, city: d.city, phone: d.phone, notes: d.notes });
      window.open(waUrl, '_blank');

      CS.clearCart();
      showSuccess(order, waUrl);
    });
  }

  function showSuccess(order, waUrl) {
    qsa('.step').forEach((s, i) => { s.classList.remove('active'); if (i < 2) s.classList.add('done'); });
    qsa('.step')[2].classList.add('done', 'active');
    root.innerHTML = `
      <div class="panel text-center" style="max-width:620px;margin:auto;padding:48px 32px">
        <div class="eico" style="width:90px;height:90px;margin:0 auto 18px;background:rgba(24,165,88,.14);color:var(--success);border-radius:50%;display:grid;place-items:center">${CS.ICONS.check}</div>
        <h2 style="font-size:1.8rem">¡Pedido confirmado!</h2>
        <p class="muted mt-8">Tu pedido <b class="gold-text">#${order.id}</b> fue registrado. Abrimos WhatsApp para que completes la confirmación con nuestro equipo.</p>
        <div class="panel" style="background:var(--surface-2);text-align:left;margin-top:20px">
          <div class="sum-line"><span>Cliente</span><b>${escapeHtml(order.customer.name)}</b></div>
          <div class="sum-line"><span>Productos</span><b>${order.items.reduce((n, i) => n + i.qty, 0)}</b></div>
          <div class="sum-line total"><span>Total</span><b>${money(order.totals.total)}</b></div>
        </div>
        <div class="gap-12 row flex-wrap mt-24" style="justify-content:center">
          <a href="${waUrl}" target="_blank" class="btn btn-wa btn-lg">${icon('whatsapp')} Reabrir WhatsApp</a>
          <a href="account.html#orders" class="btn btn-outline btn-lg">Ver mis pedidos</a>
          <a href="catalog.html" class="btn btn-gold btn-lg">Seguir comprando</a>
        </div>
      </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render();
})();
