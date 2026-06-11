/* =========================================================================
   CedrickStore — Carrito (cart.js)
   TODOS los productos son digitales con inventario de códigos/licencias.
   Se pagan con monedero o WhatsApp. Al pagar se entrega el código + mensaje.
   ========================================================================= */
(function () {
  'use strict';
  var qs = CS.qs, qsa = CS.qsa, icon = CS.icon, money = CS.money, escapeHtml = CS.escapeHtml;
  var root = qs('#cartRoot');

  // Mensajes motivacionales
  var THANKS = [
    '¡Gracias por tu compra! 🎉 Disfruta tu entretenimiento premium.',
    '¡Excelente elección! 🌟 Tu cuenta está lista. ¡A disfrutar!',
    '¡Compra exitosa! 🚀 Gracias por confiar en CedrickStore.',
    '¡Listo! 🎬 Tu entretenimiento te espera. ¡Disfrútalo al máximo!',
    '¡Genial! ✨ Tus credenciales están listas. Gracias por elegirnos.',
    '¡Felicidades! 🏆 Ya puedes acceder a tu servicio. ¡Que lo disfrutes!',
    '¡Gracias por ser parte de CedrickStore! 💛 Tu satisfacción es nuestra prioridad.',
    '¡Pedido completado! 🎊 Recuerda: 30 días de garantía incluidos.'
  ];
  function thankMsg() { return THANKS[Math.floor(Math.random() * THANKS.length)]; }

  function render() {
    var cartItems = CS.cart();
    var items = [];
    cartItems.forEach(function(i) {
      var dp = CS.digitalProductById(i.id);
      var p = dp || CS.productById(i.id);
      if (p) items.push({ product: p, qty: i.qty, isDigitalDB: !!dp, type: i.type || (dp ? 'digital' : 'regular') });
    });

    if (!items.length) {
      root.innerHTML = '<div class="empty-state"><div class="eico">' + CS.ICONS.cart + '</div><h3>Tu carrito está vacío</h3><p class="muted">Explora nuestro catálogo y encuentra lo que buscas.</p><div class="gap-12 row mt-16" style="justify-content:center;flex-wrap:wrap"><a href="catalog.html" class="btn btn-gold btn-lg">' + icon('bag') + ' Ver catálogo</a><a href="digital.html" class="btn btn-outline btn-lg">' + icon('chip') + ' Productos digitales</a></div></div>';
      renderReco(); return;
    }

    var user = CS.currentUser();
    var balance = user ? CS.walletBalance(user.email) : 0;
    var total = 0;
    items.forEach(function(it) { total += it.product.price * it.qty; });

    var rows = items.map(function(it) {
      var p = it.product;
      var imgSrc = p.image || CS.productImg(p);
      var stock = it.isDigitalDB ? (p.items ? p.items.length : 0) : (p.stock || 0);
      return '<div class="cart-row" data-id="' + p.id + '" style="border-left:3px solid var(--accent)">' +
        '<div class="ci-media"><img src="' + imgSrc + '" alt="' + escapeHtml(p.name) + '" style="width:100%;height:100%;object-fit:contain;padding:4px"></div>' +
        '<div>' +
          '<span class="ci-cat" style="color:var(--accent)">DIGITAL · ' + escapeHtml(p.category || '') + '</span>' +
          '<div class="ci-title">' + escapeHtml(p.name) + '</div>' +
          '<div class="ci-price">' + money(p.price) + '</div>' +
          '<span class="pc-stock" style="font-size:.72rem">' + stock + ' en inventario</span>' +
        '</div>' +
        '<div class="ci-right">' +
          '<div class="qty-stepper">' +
            '<button data-dec="' + p.id + '">−</button>' +
            '<input type="text" value="' + it.qty + '" data-qty="' + p.id + '" inputmode="numeric">' +
            '<button data-inc="' + p.id + '">+</button>' +
          '</div>' +
          '<b style="font-family:var(--font-head)">' + money(p.price * it.qty) + '</b>' +
          '<button class="ci-remove" data-rm="' + p.id + '">' + icon('trash') + ' Eliminar</button>' +
        '</div></div>';
    }).join('');

    root.innerHTML = '<div class="cart-layout"><div>' +
      '<div class="between mb-16"><span class="muted">' + items.length + ' producto' + (items.length !== 1 ? 's' : '') + '</span><button class="ci-remove" id="clearAll">' + icon('trash') + ' Vaciar</button></div>' +
      '<div class="cart-items">' + rows + '</div>' +
      '<a href="catalog.html" class="link-more mt-24" style="display:inline-flex">' + icon('chevL') + ' Seguir comprando</a>' +
    '</div><aside class="summary"><h3>Resumen del pedido</h3>' +
      '<div class="sum-line"><span>Subtotal</span><span>' + money(total) + '</span></div>' +
      '<div class="sum-line total"><span>Total</span><b>' + money(total) + '</b></div>' +
      '<div style="border:1.5px solid var(--accent);border-radius:12px;padding:14px;margin-top:14px;background:rgba(201,162,39,.06)">' +
        '<div class="between" style="margin-bottom:8px"><b style="font-size:.9rem">💳 Pagar con monedero</b>' + (user ? '<span class="muted" style="font-size:.82rem">Saldo: ' + money(balance) + '</span>' : '') + '</div>' +
        '<button class="btn btn-gold btn-block" id="payWallet" ' + (!user || balance < total ? 'disabled' : '') + '>' + icon('money') + ' Pagar ' + money(total) + '</button>' +
        (!user ? '<p class="muted text-center mt-8" style="font-size:.78rem"><a href="#" id="loginForWallet" class="gold-text">Inicia sesión</a> para pagar</p>' :
         balance < total ? '<p class="muted text-center mt-8" style="font-size:.78rem;color:var(--danger)">Saldo insuficiente</p>' :
         '<p class="muted text-center mt-8" style="font-size:.78rem">Credenciales se envían a: <b>' + escapeHtml(user.email) + '</b></p>') +
      '</div>' +
      '<button class="btn btn-wa btn-block mt-12" id="sendWhatsApp" style="font-size:.95rem">' + icon('whatsapp') + ' Pedir por WhatsApp</button>' +
      '<p class="muted text-center mt-16" style="font-size:.78rem">' + icon('shield') + ' Entrega inmediata · 30 días garantizado</p>' +
    '</aside></div><div id="walletResult" class="mt-24"></div>';

    wire(items, total);
    renderReco();
  }

  function wire(items, total) {
    qsa('[data-inc]').forEach(function(b) { b.addEventListener('click', function() { var c = CS.cart(); var it = c.find(function(x){return x.id===b.dataset.inc;}); if(it){it.qty++;CS.store.set(CS.KEY.cart,c);CS.emit('cart');} render(); }); });
    qsa('[data-dec]').forEach(function(b) { b.addEventListener('click', function() { var c = CS.cart(); var idx = c.findIndex(function(x){return x.id===b.dataset.dec;}); if(idx>=0){c[idx].qty--;if(c[idx].qty<=0)c.splice(idx,1);CS.store.set(CS.KEY.cart,c);CS.emit('cart');} render(); }); });
    qsa('[data-qty]').forEach(function(inp) { inp.addEventListener('change', function() { var c = CS.cart(); var it = c.find(function(x){return x.id===inp.dataset.qty;}); var v=parseInt(inp.value.replace(/\D/g,''))||1; if(it){if(v<=0){c=c.filter(function(x){return x.id!==inp.dataset.qty;});}else{it.qty=v;}CS.store.set(CS.KEY.cart,c);CS.emit('cart');} render(); }); });
    qsa('[data-rm]').forEach(function(b) { b.addEventListener('click', function() { CS.removeFromCart(b.dataset.rm); render(); }); });
    var cl = qs('#clearAll'); if(cl) cl.addEventListener('click', function() { if(confirm('¿Vaciar carrito?')){CS.clearCart();render();} });
    var lg = qs('#loginForWallet'); if(lg) lg.addEventListener('click', function(e) { e.preventDefault(); CS.openAuth('login'); });
    var wa = qs('#sendWhatsApp'); if(wa) wa.addEventListener('click', function() { var u=CS.currentUser(); CS.sendWhatsApp(u?{name:u.name,phone:u.phone}:{}); });

    var pay = qs('#payWallet');
    if(pay) pay.addEventListener('click', function() {
      var user = CS.currentUser();
      if(!user){CS.openAuth('login');return;}
      if(!confirm('¿Pagar '+money(total)+' con tu monedero?\nLas credenciales se enviarán a '+user.email)) return;

      // Intentar pago con inventario digital
      var result = CS.payDigitalWithWallet(user.email);
      if(result.ok) {
        CS.toast('¡Compra exitosa!', thankMsg(), 'success');
        showSuccess(result);
      } else if(result.error === 'No hay productos digitales en el carrito') {
        // Productos del catálogo regular: debitar y entregar códigos si los tiene
        if(CS.walletBalance(user.email) < total){CS.toast('Saldo insuficiente','','error');return;}
        if(!CS.walletDebit(user.email, total, 'Compra: '+items.map(function(it){return it.product.name;}).join(', '))){CS.toast('Error','','error');return;}
        var deliveredCodes = [];
        var orderItems = [];
        items.forEach(function(it) {
          for (var i = 0; i < it.qty; i++) {
            var code = CS.deliverProductCode(it.product.id, user.email);
            var duration = it.product.duration || 30;
            var purchaseDate = Date.now();
            var expiresAt = purchaseDate + duration * 24 * 60 * 60 * 1000;
            if (code) {
              deliveredCodes.push({ name: it.product.name, code: code, price: it.product.price, duration: duration, purchaseDate: purchaseDate, expiresAt: expiresAt });
              orderItems.push({ id: it.product.id, name: it.product.name, price: it.product.price, qty: 1, code: code, duration: duration, purchaseDate: purchaseDate, expiresAt: expiresAt });
            } else {
              orderItems.push({ id: it.product.id, name: it.product.name, price: it.product.price, qty: 1, duration: duration, purchaseDate: purchaseDate, expiresAt: expiresAt });
            }
          }
        });
        var order = CS.createOrder({type:'digital',customer:{email:user.email,name:user.name},items:orderItems,totals:{subtotal:total,discount:0,shipping:0,total:total},status:'done',userEmail:user.email});
        CS.clearCart();
        if (deliveredCodes.length > 0) {
          CS.toast('¡Compra exitosa!', thankMsg(), 'success');
          showSuccess({ ok: true, codes: deliveredCodes, email: user.email, order: order });
        } else {
          CS.toast('¡Pedido confirmado!', thankMsg(), 'success');
          showPendingSuccess(order, user);
        }
      } else {
        CS.toast('Error', result.error, 'error');
      }
      render();
    });
  }

  function showSuccess(result) {
    var el = qs('#walletResult'); if(!el) return;
    var msg = thankMsg();
    var codesHtml = result.codes.map(function(c) {
      return '<div class="cart-row" style="grid-template-columns:auto 1fr;border-left:3px solid var(--success)">' +
        '<div style="font-size:1.5rem;color:var(--success)">' + CS.ICONS.check + '</div>' +
        '<div><b>' + escapeHtml(c.name) + '</b>' +
        (c.duration ? '<span class="muted" style="margin-left:8px;font-size:.8rem">' + c.duration + ' días</span>' : '') +
        '<code style="display:block;padding:10px 14px;background:var(--surface-2);border-radius:8px;font-size:1.05rem;font-weight:700;margin-top:8px;word-break:break-all;font-family:monospace;border:1px dashed var(--accent)">' + escapeHtml(c.code) + '</code>' +
        '</div></div>';
    }).join('');
    el.innerHTML = '<div class="panel" style="border:1.5px solid var(--success);background:rgba(24,165,88,.04)">' +
      '<div class="text-center mb-16">' +
        '<div style="font-size:3rem;margin-bottom:12px">🎉</div>' +
        '<h3 style="color:var(--success)">¡Compra exitosa!</h3>' +
        '<p class="gold-text" style="font-size:1.1rem;font-weight:700;margin-top:8px">' + escapeHtml(msg) + '</p>' +
        '<p class="muted mt-8">Credenciales enviadas a <b>' + escapeHtml(result.email) + '</b></p>' +
      '</div>' +
      '<h4 class="mb-8">🔑 Tus credenciales:</h4>' +
      '<div class="cart-items">' + codesHtml + '</div>' +
      '<div class="panel mt-16" style="background:var(--surface-2);text-align:center">' +
        '<p style="font-size:.9rem">📋 <b>Guarda estas credenciales</b> en un lugar seguro.</p>' +
        '<p class="muted" style="font-size:.82rem">Tienes 30 días de garantía. Si tienes problemas, escríbenos por WhatsApp.</p>' +
      '</div>' +
      '<div class="gap-12 row flex-wrap mt-16" style="justify-content:center">' +
        '<a href="account.html#orders" class="btn btn-outline">Ver mis pedidos</a>' +
        '<a href="catalog.html" class="btn btn-gold">Seguir comprando</a>' +
        '<a href="https://wa.me/' + CS.WHATSAPP_NUMBER + '" target="_blank" class="btn btn-wa">Soporte WhatsApp</a>' +
      '</div></div>';
    el.scrollIntoView({behavior:'smooth'});
  }

  function showPendingSuccess(order, user) {
    var el = qs('#walletResult'); if(!el) return;
    var msg = thankMsg();
    el.innerHTML = '<div class="panel" style="border:1.5px solid var(--accent);background:rgba(201,162,39,.04);text-align:center">' +
      '<div style="font-size:3rem;margin-bottom:12px">✨</div>' +
      '<h3 style="color:var(--accent)">¡Pedido confirmado!</h3>' +
      '<p class="gold-text" style="font-size:1.05rem;font-weight:700;margin-top:8px">' + escapeHtml(msg) + '</p>' +
      '<p class="muted mt-8">Orden <b>#' + order.id + '</b> registrada.</p>' +
      '<p class="muted mt-8">Te enviaremos las credenciales a <b>' + escapeHtml(user.email) + '</b> por WhatsApp o correo en minutos.</p>' +
      '<div class="gap-12 row flex-wrap mt-16" style="justify-content:center">' +
        '<a href="account.html#orders" class="btn btn-outline">Ver mis pedidos</a>' +
        '<a href="catalog.html" class="btn btn-gold">Seguir comprando</a>' +
      '</div></div>';
    el.scrollIntoView({behavior:'smooth'});
  }

  function renderReco() {
    var sec = qs('#recoSection'); if(!sec) return;
    var inCart = CS.cart().map(function(i){return i.id;});
    var reco = CS.filterProducts({sort:'popular'}).filter(function(p){return !inCart.includes(p.id);}).slice(0,4);
    if(!reco.length){sec.hidden=true;return;} sec.hidden=false;
    CS.renderGrid(qs('#cartReco'), reco);
  }

  CS.on('cart', render);
  CS.on('auth', render);
  render();
})();
