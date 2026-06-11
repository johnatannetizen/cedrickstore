/* =========================================================================
   CedrickStore — Página de Productos Digitales (digital-page.js)
   Muestra TODOS los productos (del catálogo + digitales del admin).
   Todos se agregan al carrito y se pagan con monedero o WhatsApp.
   ========================================================================= */
(function () {
  'use strict';
  var qs = CS.qs, qsa = CS.qsa, icon = CS.icon, money = CS.money, escapeHtml = CS.escapeHtml;
  var root = qs('#digitalRoot');

  function render() {
    // Combinar productos del catálogo + productos digitales del admin
    var catalogProducts = CS.products();
    var digitalProducts = CS.digitalProducts();
    var allProducts = catalogProducts.concat(digitalProducts);
    var user = CS.currentUser();
    var balance = user ? CS.walletBalance(user.email) : 0;

    if (!allProducts.length) {
      root.innerHTML = '<div class="empty-state"><div class="eico">' + CS.ICONS.chip + '</div><h3>Sin productos disponibles</h3><p class="muted">Vuelve pronto.</p><a href="index.html" class="btn btn-gold mt-16">Volver al inicio</a></div>';
      return;
    }

    var header = user
      ? '<div class="between mb-24 flex-wrap" style="gap:12px"><div><span class="eyebrow">Tu saldo</span><h3 class="gold-text" style="font-size:1.6rem">' + money(balance) + '</h3></div><a href="account.html#wallet" class="btn btn-outline btn-sm">' + icon('money') + ' Ver monedero</a></div>'
      : '<div class="panel mb-24" style="background:var(--surface-2);text-align:center;padding:18px"><p class="muted">' + icon('user') + ' <a href="#" id="loginToShop" class="gold-text" style="font-weight:700">Inicia sesión</a> para pagar con tu monedero</p></div>';

    var cards = allProducts.map(function(p) {
      var isDigitalDB = !!p.items; // tiene inventario de códigos
      var inStock = isDigitalDB ? (p.items.length > 0) : (p.stock > 0);
      var stockCount = isDigitalDB ? p.items.length : (p.stock || 0);
      var imgSrc = p.image || CS.productImg(p);
      return '<article class="product-card">' +
        '<div class="pc-media" style="aspect-ratio:16/10;background:linear-gradient(135deg,var(--surface-2),var(--border))">' +
          '<img src="' + imgSrc + '" alt="' + escapeHtml(p.name) + '" style="width:100%;height:100%;object-fit:contain;padding:12px">' +
          '<div class="pc-tags">' + (!inStock ? '<span class="tag tag-sale">Agotado</span>' : '<span class="tag tag-new">Digital</span>') + '</div>' +
        '</div>' +
        '<div class="pc-body">' +
          '<span class="pc-cat">' + escapeHtml(p.category || '') + (p.brand ? ' · ' + escapeHtml(CS.brandName ? CS.brandName(p.brand) : p.brand) : '') + '</span>' +
          '<h3 class="pc-title">' + escapeHtml(p.name) + '</h3>' +
          (p.desc ? '<p class="muted" style="font-size:.82rem;-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden">' + escapeHtml(p.desc) + '</p>' : '') +
          '<div class="pc-price"><span class="price-now">' + money(p.price) + '</span>' + (p.oldPrice ? '<span class="price-old">' + money(p.oldPrice) + '</span>' : '') + '</div>' +
          (p.duration ? '<span class="muted" style="font-size:.74rem">' + icon('clock') + ' ' + p.duration + ' días</span>' : '<span class="muted" style="font-size:.74rem">' + icon('clock') + ' 30 días</span>') +
          '<span class="pc-stock ' + (inStock ? '' : 'out') + '">' + (inStock ? stockCount + ' disponibles' : 'Sin stock') + '</span>' +
          '<button class="btn btn-gold btn-block btn-sm mt-8" data-add-to-cart="' + p.id + '" data-is-digital="' + (isDigitalDB ? '1' : '0') + '" ' + (!inStock ? 'disabled' : '') + '>' +
            (inStock ? icon('cart') + ' Agregar al carrito' : 'Agotado') +
          '</button>' +
        '</div>' +
      '</article>';
    }).join('');

    root.innerHTML = header +
      '<div class="product-grid cols-3" id="dpGrid">' + cards + '</div>' +
      '<div class="panel mt-24" style="text-align:center"><h4 class="mb-8">' + icon('shield') + ' Entrega inmediata</h4><p class="muted">Al pagar con monedero, recibes tus credenciales al instante. Garantía de 30 días.</p></div>';

    // Eventos
    var loginBtn = qs('#loginToShop');
    if (loginBtn) loginBtn.addEventListener('click', function(e) { e.preventDefault(); CS.openAuth('login'); });

    qsa('[data-add-to-cart]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.addToCart;
        var isDigital = btn.dataset.isDigital === '1';
        if (isDigital) {
          CS.addDigitalToCart(id);
        } else {
          CS.addToCart(id);
        }
      });
    });
  }

  CS.on('auth', render);
  CS.on('digital', render);
  CS.on('cart', function() {}); // badges update via layout
  render();
})();
