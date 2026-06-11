/* =========================================================================
   CedrickStore — Carrito (cart.js)
   TODOS los productos son digitales. Se pagan con monedero o WhatsApp.
   Al pagar con monedero se entregan los códigos/credenciales al instante.
   ========================================================================= */
(function () {
  'use strict';
  var qs = CS.qs, qsa = CS.qsa, icon = CS.icon, money = CS.money, escapeHtml = CS.escapeHtml;
  var root = qs('#cartRoot');

  function render() {
    var cartItems = CS.cart();
    var items = [];
    cartItems.forEach(function(i) {
      // Buscar primero en productos digitales, luego en catálogo regular
      var dp = CS.digitalProductById(i.id);
      var p = dp || CS.productById(i.id);
      if (p) items.push({ product: p, qty: i.qty, isDigital: !!dp, type: i.type || (dp ? 'digital' : 'regular') });
    });

    if (!items.length) {
      root.innerHTML = '<div class="empty-state"><div class="eico">' + CS.ICONS.cart + '</div><h3>Tu carrito está vacío</h3><p class="muted">Explora nuestro catálogo y encuentra lo que buscas.</p><div class="gap-12 row mt-16" style="justify-content:center;flex-wrap:wrap"><a href="catalog.html" class="btn btn-gold btn-lg">' + icon('bag') + ' Ver catálogo</a><a href="digital.html" class="btn btn-outline btn-lg">' + icon('chip') + ' Productos digitales</a></div></div>';
      renderReco();
      return;
    }

    var user = CS.currentUser();
    var balance = user ? CS.walletBalance(user.email) : 0;
    var total = 0;
    items.forEach(function(it) { total += it.product.price * it.qty; });

    var rows = items.map(function(it) {
      var p = it.product;
      var imgSrc = p.image || CS.productImg(p);
      var stock = it.isDigital ? (p.items ? p.items.length : 0) : (p.stock || 0);
      return '<div class="cart-row" data-id="' + p.id + '" style="border-left:3px solid var(--accent)">' +
        '<div class="ci-media"><img src="' + imgSrc + '" alt="' + escapeHtml(p.name) + '" style="width:100%;height:100%;object-fit:cover"></div>' +
        '<div>' +
          '<span class="ci-cat" style="color:var(--accent)">DIGITAL · ' + escapeHtml(p.category || '') + '</span>' +
          '<div class="ci-title">' + escapeHtml(p.name) + '</div>' +
          '<div class="ci-price">' + money(p.price) + '</div>' +
          '<span class="pc-stock" style="font-size:.72rem">' + stock + ' disponibles</span>' +
          (p.duration ? '<span class="muted" style="font-size:.72rem;margin-left:8px">' + p.duration + ' días</span>' : '') +
        '</div>' +
        '<div class="ci-right">' +
          '<div class="qty-stepper">' +
            '<button data-dec="' + p.id + '" aria-label="Restar">−</button>' +
            '<input type="text" value="' + it.qty + '" data-qty="' + p.id + '" inputmode="numeric" aria-label="Cantidad">' +
            '<button data-inc="' + p.id + '" aria-label="Sumar">+</button>' +
          '</div>' +
          '<b style="font-family:var(--font-head)">' + money(p.price * it.qty) + '</b>' +
          '<button class="ci-remove" data-rm="' + p.id + '">' + icon('trash') + ' Eliminar</button>' +
        '</div>' +
      '</div>';
    }).join('');

    root.innerHTML = '<div class="cart-layout"><div>' +
      '<div class="between mb-16"><span class="muted">' + items.length + ' producto' + (items.length !== 1 ? 's' : '') + ' en tu carrito</span><button class="ci-remove" id="clearAll">' + icon('trash') + ' Vaciar</button></div>' +
      '<div class="cart-items">' + rows + '</div>' +
      '<a href="catalog.html" class="link-more mt-24" style="display:inline-flex">' + icon('chevL') + ' Seguir comprando</a>' +
    '</div>' +
    '<aside class="summary">' +
      '<h3>Resumen del pedido</h3>' +
      '<div class="sum-line"><span>Subtotal</span><span>' + money(total) + '</span></div>' +
      '<div class="sum-line total"><span>Total</span><b>' + money(total) + '</b></div>' +
      // Sección monedero
      '<div style="border:1.5px solid var(--accent);border-radius:12px;padding:14px;margin-top:14px;background:rgba(201,162,39,.06)">' +
        '<div class="between" style="margin-bottom:8px"><b style="font-size:.9rem">Pagar con monedero</b>' + (user ? '<span class="muted" style="font-size:.82rem">Saldo: ' + money(balance) + '</span>' : '') + '</div>' +
        '<button class="btn btn-gold btn-block" id="payWallet" ' + (!user || balance < total ? 'disabled' : '') + '>' + icon('money') + ' Pagar ' + money(total) + ' con monedero</button>' +
        (!user ? '<p class="muted text-center mt-8" style="font-size:.78rem"><a href="#" id="loginForWallet" class="gold-text">Inicia sesión</a> para pagar</p>' :
         balance < total ? '<p class="muted text-center mt-8" style="font-size:.78rem;color:var(--danger)">Saldo insuficiente. Pide recarga al admin.</p>' :
         '<p class="muted text-center mt-8" style="font-size:.78rem">Credenciales se envían a: <b>' + escapeHtml(user.email) + '</b></p>') +
      '</div>' +
      // WhatsApp alternativo
      '<button class="btn btn-wa btn-block mt-12" id="sendWhatsApp" style="font-size:.95rem">' + icon('whatsapp') + ' Pedir por WhatsApp</button>' +
      '<p class="muted text-center mt-16" style="font-size:.8rem">' + icon('shield') + ' Entrega inmediata · 30 días garantizado</p>' +
    '</aside></div>' +
    '<div id="walletResult" class="mt-24"></div>';

    wire(items, total);
    renderReco();
  }

  function wire(items, total) {
    // Cantidades
    qsa('[data-inc]').forEach(function(b) { b.addEventListener('click', function() {
      var c = CS.cart(); var it = c.find(function(x) { return x.id === b.dataset.inc; });
      if (it) { it.qty++; CS.store.set(CS.KEY.cart, c); CS.emit('cart'); } render();
    }); });
    qsa('[data-dec]').forEach(function(b) { b.addEventListener('click', function() {
      var c = CS.cart(); var idx = c.findIndex(function(x) { return x.id === b.dataset.dec; });
      if (idx >= 0) { c[idx].qty--; if (c[idx].qty <= 0) c.splice(idx, 1); CS.store.set(CS.KEY.cart, c); CS.emit('cart'); } render();
    }); });
    qsa('[data-qty]').forEach(function(inp) { inp.addEventListener('change', function() {
      var c = CS.cart(); var it = c.find(function(x) { return x.id === inp.dataset.qty; });
      var v = parseInt(inp.value.replace(/\D/g, '')) || 1;
      if (it) { if (v <= 0) { c = c.filter(function(x) { return x.id !== inp.dataset.qty; }); } else { it.qty = v; } CS.store.set(CS.KEY.cart, c); CS.emit('cart'); } render();
    }); });
    qsa('[data-rm]').forEach(function(b) { b.addEventListener('click', function() { CS.removeFromCart(b.dataset.rm); render(); }); });

    // Vaciar
    var clearBtn = qs('#clearAll');
    if (clearBtn) clearBtn.addEventListener('click', function() { if (confirm('¿Vaciar todo el carrito?')) { CS.clearCart(); render(); } });

    // Login
    var loginBtn = qs('#loginForWallet');
    if (loginBtn) loginBtn.addEventListener('click', function(e) { e.preventDefault(); CS.openAuth('login'); });

    // WhatsApp
    var waBtn = qs('#sendWhatsApp');
    if (waBtn) waBtn.addEventListener('click', function() { var u = CS.currentUser(); CS.sendWhatsApp(u ? { name: u.name, phone: u.phone } : {}); });

    // Pagar con monedero
    var payBtn = qs('#payWallet');
    if (payBtn) payBtn.addEventListener('click', function() {
      var user = CS.currentUser();
      if (!user) { CS.openAuth('login'); return; }
      if (!confirm('¿Pagar ' + CS.money(total) + ' con tu monedero? Las credenciales se enviarán a ' + user.email)) return;

      // Intentar pago digital primero (productos con inventario de códigos)
      var result = CS.payDigitalWithWallet(user.email);
      if (result.ok) {
        CS.toast('Pago exitoso', 'Credenciales entregadas', 'success');
        showSuccess(result);
      } else if (result.error === 'No hay productos digitales en el carrito') {
        // Si no hay digitales registrados en la BD de digitales, debitar manualmente
        if (CS.walletBalance(user.email) < total) { CS.toast('Saldo insuficiente', '', 'error'); return; }
        if (!CS.walletDebit(user.email, total, 'Compra desde carrito')) { CS.toast('Error al debitar', '', 'error'); return; }
        var orderItems = items.map(function(it) { return { id: it.product.id, name: it.product.name, price: it.product.price, qty: it.qty }; });
        var order = CS.createOrder({ type: 'digital', customer: { email: user.email, name: user.name }, items: orderItems, totals: { subtotal: total, discount: 0, shipping: 0, total: total }, status: 'done', userEmail: user.email });
        CS.clearCart();
        CS.toast('Pedido confirmado', 'Orden #' + order.id, 'success');
        showOrderSuccess(order, user);
      } else {
        CS.toast('Error', result.error, 'error');
      }
      render();
    });
  }

  function showSuccess(result) {
    var el = qs('#walletResult'); if (!el) return;
    var codesHtml = result.codes.map(function(c) {
      return '<div class="cart-row" style="grid-template-columns:auto 1fr;border-left:3px solid var(--success)"><div style="font-size:1.5rem;color:var(--success)">' + CS.ICONS.check + '</div><div><b>' + escapeHtml(c.name) + '</b>' +
        (c.duration ? '<span class="muted" style="margin-left:8px;font-size:.8rem">' + c.duration + ' días</span>' : '') +
        '<code style="display:block;padding:8px 12px;background:var(--surface-2);border-radius:8px;font-size:1rem;font-weight:700;margin-top:6px;word-break:break-all;font-family:monospace">' + escapeHtml(c.code) + '</code></div></div>';
    }).join('');
    el.innerHTML = '<div class="panel" style="border:1.5px solid var(--success);background:rgba(24,165,88,.04)"><div class="text-center mb-16"><div class="eico" style="width:70px;height:70px;margin:0 auto 12px;background:rgba(24,165,88,.14);color:var(--success);border-radius:50%;display:grid;place-items:center">' + CS.ICONS.check + '</div><h3 style="color:var(--success)">Pago exitoso</h3><p class="muted">Credenciales enviadas a <b>' + escapeHtml(result.email) + '</b></p></div><h4 class="mb-8">Tus credenciales:</h4><div class="cart-items">' + codesHtml + '</div><p class="muted mt-16 text-center" style="font-size:.85rem">También en <a href="account.html#orders" class="gold-text">Mis pedidos</a>. Guárdalas en un lugar seguro.</p></div>';
    el.scrollIntoView({ behavior: 'smooth' });
  }

  function showOrderSuccess(order, user) {
    var el = qs('#walletResult'); if (!el) return;
    el.innerHTML = '<div class="panel" style="border:1.5px solid var(--success);background:rgba(24,165,88,.04);text-align:center"><div class="eico" style="width:70px;height:70px;margin:0 auto 12px;background:rgba(24,165,88,.14);color:var(--success);border-radius:50%;display:grid;place-items:center">' + CS.ICONS.check + '</div><h3 style="color:var(--success)">Pedido confirmado</h3><p class="muted">Orden <b class="gold-text">#' + order.id + '</b></p><p class="muted mt-8">Se entregará a <b>' + escapeHtml(user.email) + '</b>. El admin te enviará las credenciales por WhatsApp o correo.</p><div class="gap-12 row flex-wrap mt-16" style="justify-content:center"><a href="account.html#orders" class="btn btn-outline">Ver mis pedidos</a><a href="catalog.html" class="btn btn-gold">Seguir comprando</a></div></div>';
    el.scrollIntoView({ behavior: 'smooth' });
  }

  function renderReco() {
    var sec = qs('#recoSection'); if (!sec) return;
    var inCart = CS.cart().map(function(i) { return i.id; });
    var reco = CS.filterProducts({ sort: 'popular' }).filter(function(p) { return !inCart.includes(p.id); }).slice(0, 4);
    if (!reco.length) { sec.hidden = true; return; }
    sec.hidden = false;
    CS.renderGrid(qs('#cartReco'), reco);
  }

  CS.on('cart', render);
  CS.on('auth', render);
  render();
})();
