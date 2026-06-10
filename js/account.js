/* =========================================================================
   CedrickStore — Cuenta de usuario (account.js)
   Perfil editable, historial de pedidos, direcciones guardadas, favoritos.
   ========================================================================= */
(function () {
  'use strict';
  const { qs, qsa, icon, money, escapeHtml } = CS;
  const root = qs('#accountRoot');

  function currentSection() { return (location.hash || '#dashboard').replace('#', ''); }

  function renderGuest() {
    root.innerHTML = `
      <div class="panel text-center" style="max-width:460px;margin:auto;padding:42px 30px">
        <div class="eico" style="width:80px;height:80px;margin:0 auto 16px;background:var(--surface-2);border-radius:50%;display:grid;place-items:center;color:var(--accent)">${CS.ICONS.user}</div>
        <h2>Accede a tu cuenta</h2>
        <p class="muted mt-8">Inicia sesión o crea una cuenta para ver tus pedidos, favoritos y direcciones guardadas.</p>
        <div class="gap-12 row mt-24" style="justify-content:center">
          <button class="btn btn-gold btn-lg" id="goLogin">Iniciar sesión</button>
          <button class="btn btn-outline btn-lg" id="goRegister">Registrarse</button>
        </div>
      </div>`;
    qs('#goLogin').addEventListener('click', () => CS.openAuth('login'));
    qs('#goRegister').addEventListener('click', () => CS.openAuth('register'));
  }

  function renderApp() {
    const u = CS.currentUser();
    const section = currentSection();
    const nav = [
      { id: 'dashboard', label: 'Resumen', icon: 'dash' },
      { id: 'orders', label: 'Mis pedidos', icon: 'box' },
      { id: 'wallet', label: 'Mi monedero', icon: 'money' },
      { id: 'digital', label: 'Tienda digital', icon: 'chip' },
      { id: 'wishlist', label: 'Favoritos', icon: 'heart' },
      { id: 'addresses', label: 'Direcciones', icon: 'pin' },
      { id: 'profile', label: 'Mi perfil', icon: 'user' }
    ];
    root.innerHTML = `
      <div class="acct-layout">
        <aside class="side-nav">
          <div style="padding:14px;text-align:center;border-bottom:1px solid var(--border);margin-bottom:8px">
            <div class="testi-author" style="flex-direction:column;gap:8px">
              <div class="avatar" style="width:60px;height:60px;font-size:1.5rem">${escapeHtml((u.name || 'C').charAt(0).toUpperCase())}</div>
              <div><b>${escapeHtml(u.name)}</b><span class="muted" style="display:block;font-size:.8rem">${escapeHtml(u.email)}</span></div>
            </div>
          </div>
          ${nav.map(n => `<a href="#${n.id}" class="${section === n.id ? 'active' : ''}">${CS.ICONS[n.icon]} ${n.label}</a>`).join('')}
          ${CS.isAdmin() ? '<a href="admin.html">' + CS.ICONS.settings + ' Panel admin</a>' : ''}
          <div class="nav-sep"></div>
          <button id="logoutBtn">${CS.ICONS.logout} Cerrar sesión</button>
        </aside>
        <div id="acctContent"></div>
      </div>`;
    qs('#logoutBtn').addEventListener('click', () => { CS.logout(); });
    renderSection(section);
  }

  function renderSection(section) {
    const c = qs('#acctContent'); if (!c) return;
    const u = CS.currentUser();
    if (section === 'dashboard') c.innerHTML = dashboard(u);
    else if (section === 'orders') c.innerHTML = ordersView(u);
    else if (section === 'wallet') c.innerHTML = walletSection(u);
    else if (section === 'digital') digitalShop(c, u);
    else if (section === 'wishlist') wishlistView(c);
    else if (section === 'addresses') { c.innerHTML = addressesView(u); wireAddresses(); }
    else if (section === 'profile') { c.innerHTML = profileView(u); wireProfile(); }
    else c.innerHTML = dashboard(u);
  }

  function myOrders(u) { return CS.orders().filter(o => o.userEmail === u.email); }

  function dashboard(u) {
    const orders = myOrders(u);
    const spent = orders.reduce((s, o) => s + (o.totals ? o.totals.total : 0), 0);
    return `
      <div class="stat-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card"><div class="sico" style="background:rgba(201,162,39,.15);color:var(--accent)">${CS.ICONS.box}</div><h4>${orders.length}</h4><span>Pedidos realizados</span></div>
        <div class="stat-card"><div class="sico" style="background:rgba(226,61,68,.14);color:var(--danger)">${CS.ICONS.heart}</div><h4>${CS.wishlist().length}</h4><span>Productos favoritos</span></div>
        <div class="stat-card"><div class="sico" style="background:rgba(24,165,88,.14);color:var(--success)">${CS.ICONS.money}</div><h4 style="font-size:1.3rem">${money(spent)}</h4><span>Total comprado</span></div>
      </div>
      <div class="panel">
        <h3 class="mb-16">Bienvenido de nuevo, ${escapeHtml(u.name)} 👋</h3>
        <p class="muted">Desde aquí puedes gestionar tus pedidos, favoritos, direcciones y datos personales.</p>
        <div class="gap-12 row flex-wrap mt-16">
          <a href="catalog.html" class="btn btn-gold">Seguir comprando</a>
          <a href="#orders" class="btn btn-outline">Ver mis pedidos</a>
        </div>
      </div>`;
  }

  function ordersView(u) {
    const orders = myOrders(u);
    if (!orders.length) return `<div class="panel empty-state"><div class="eico">${CS.ICONS.box}</div><h3>Aún no tienes pedidos</h3><p class="muted">Cuando realices tu primer pedido aparecerá aquí.</p><a href="catalog.html" class="btn btn-gold mt-16">Explorar catálogo</a></div>`;
    const statusMap = { pending: ['pending', 'Pendiente'], paid: ['paid', 'Pagado'], ship: ['ship', 'Enviado'], done: ['done', 'Entregado'], cancel: ['cancel', 'Cancelado'] };
    return `<div class="panel"><h3 class="mb-16">Historial de pedidos</h3><div class="table-wrap"><table class="data-table">
      <thead><tr><th>Pedido</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th></tr></thead>
      <tbody>${orders.map(o => { const st = statusMap[o.status] || ['pending', o.status]; return `<tr>
        <td><b>#${o.id}</b></td>
        <td>${new Date(o.createdAt).toLocaleDateString('es-CO')}</td>
        <td>${o.items.reduce((n, i) => n + i.qty, 0)} art.</td>
        <td><b>${money(o.totals.total)}</b></td>
        <td><span class="status-pill ${st[0]}">${st[1]}</span></td>
      </tr>`; }).join('')}</tbody></table></div></div>`;
  }

  function wishlistView(c) {
    const ids = CS.wishlist();
    if (!ids.length) { c.innerHTML = `<div class="panel empty-state"><div class="eico">${CS.ICONS.heart}</div><h3>Sin favoritos aún</h3><p class="muted">Guarda productos con el corazón para verlos aquí.</p><a href="catalog.html" class="btn btn-gold mt-16">Ver productos</a></div>`; return; }
    c.innerHTML = `<div class="panel"><h3 class="mb-16">Mis favoritos (${ids.length})</h3><div class="product-grid cols-3" id="wishGrid"></div></div>`;
    CS.renderGrid(qs('#wishGrid'), ids.map(CS.productById).filter(Boolean));
  }

  function addressesView(u) {
    const addrs = u.addresses || [];
    return `<div class="panel">
      <div class="between mb-16"><h3>Direcciones guardadas</h3><button class="btn btn-gold btn-sm" id="addAddr">${icon('plus')} Nueva dirección</button></div>
      <div id="addrList">
        ${addrs.length ? addrs.map((a, i) => `<div class="cart-row" style="grid-template-columns:auto 1fr auto"><div class="cat-ico" style="width:46px;height:46px">${CS.ICONS.pin}</div><div><b>${escapeHtml(a.label || 'Dirección')}</b><div class="muted" style="font-size:.9rem">${escapeHtml(a.address)}, ${escapeHtml(a.city)}</div><div class="muted" style="font-size:.85rem">${escapeHtml(a.phone || '')}</div></div><button class="ci-remove" data-addr-rm="${i}">${icon('trash')}</button></div>`).join('') : '<p class="muted">No tienes direcciones guardadas.</p>'}
      </div>
      <form id="addrForm" class="hidden mt-16 panel" style="background:var(--surface-2)">
        <h4 class="mb-16">Nueva dirección</h4>
        <div class="form-grid">
          <div class="field"><label>Etiqueta</label><input class="input" name="label" placeholder="Casa, Oficina..."></div>
          <div class="field"><label>Ciudad</label><input class="input" name="city" required></div>
          <div class="field full"><label>Dirección</label><input class="input" name="address" required></div>
          <div class="field"><label>Teléfono</label><input class="input" name="phone"></div>
        </div>
        <button class="btn btn-gold">Guardar dirección</button>
      </form>
    </div>`;
  }
  function wireAddresses() {
    const u = CS.currentUser();
    qs('#addAddr') && qs('#addAddr').addEventListener('click', () => qs('#addrForm').classList.toggle('hidden'));
    qs('#addrForm') && qs('#addrForm').addEventListener('submit', e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const addrs = (u.addresses || []).concat([d]);
      CS.updateUser({ addresses: addrs });
      CS.toast('Dirección guardada', '', 'success');
      renderSection('addresses');
    });
    qsa('[data-addr-rm]').forEach(b => b.addEventListener('click', () => {
      const addrs = (u.addresses || []).filter((_, i) => i !== +b.dataset.addrRm);
      CS.updateUser({ addresses: addrs }); renderSection('addresses');
    }));
  }

  function walletSection(u) {
    const balance = CS.walletBalance(u.email);
    const txs = CS.walletTransactions(u.email);
    return `
      <div class="stat-grid" style="grid-template-columns:1fr">
        <div class="stat-card" style="text-align:center">
          <div class="sico" style="background:rgba(201,162,39,.15);color:var(--accent);margin:0 auto 10px">${CS.ICONS.money}</div>
          <h4 style="font-size:2rem;color:var(--accent)">${CS.money(balance)}</h4>
          <span>Saldo disponible en tu monedero</span>
        </div>
      </div>
      <div class="panel">
        <h3 class="mb-16">Historial de movimientos</h3>
        ${txs.length ? `<div class="table-wrap"><table class="data-table">
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Detalle</th></tr></thead>
          <tbody>${txs.map(t => `<tr>
            <td>${new Date(t.date).toLocaleDateString('es-CO')}</td>
            <td><span class="status-pill ${t.type === 'recharge' ? 'done' : 'pending'}">${t.type === 'recharge' ? 'Recarga' : 'Compra'}</span></td>
            <td><b style="color:${t.amount > 0 ? 'var(--success)' : 'var(--danger)'}">${t.amount > 0 ? '+' : ''}${CS.money(Math.abs(t.amount))}</b></td>
            <td class="muted">${CS.escapeHtml(t.note || t.reason || '')}</td>
          </tr>`).join('')}</tbody></table></div>` : '<p class="muted">Aún no tienes movimientos. El administrador puede recargar saldo a tu cuenta.</p>'}
      </div>`;
  }

  function digitalShop(c, u) {
    const list = CS.digitalProducts();
    const balance = CS.walletBalance(u.email);
    if (!list.length) { c.innerHTML = '<div class="panel empty-state"><div class="eico">' + CS.ICONS.chip + '</div><h3>Sin productos digitales</h3><p class="muted">El administrador aún no ha agregado productos digitales.</p></div>'; return; }
    c.innerHTML = `
      <div class="panel">
        <div class="between mb-16">
          <h3>${icon('chip')} Tienda de productos digitales</h3>
          <span class="gold-text" style="font-weight:700">Saldo: ${CS.money(balance)}</span>
        </div>
        <div class="product-grid cols-3" id="digitalGrid">${list.map(dp => `
          <div class="product-card" style="cursor:default">
            <div class="pc-media" style="aspect-ratio:16/9;background:linear-gradient(135deg,var(--surface-2),var(--border))">
              <div style="display:grid;place-items:center;height:100%;font-size:2.5rem;opacity:.6">${CS.ICONS.chip}</div>
            </div>
            <div class="pc-body">
              <h3 class="pc-title">${CS.escapeHtml(dp.name)}</h3>
              <span class="pc-cat">${CS.escapeHtml(dp.category)} · ${dp.items.length} disponibles</span>
              ${dp.desc ? '<p class="muted" style="font-size:.82rem">' + CS.escapeHtml(dp.desc) + '</p>' : ''}
              <div class="pc-price"><span class="price-now">${CS.money(dp.price)}</span></div>
              <button class="btn btn-gold btn-block btn-sm mt-8" data-buy-dp="${dp.id}" ${dp.items.length === 0 ? 'disabled' : ''}>${dp.items.length === 0 ? 'Agotado' : 'Comprar con monedero'}</button>
            </div>
          </div>`).join('')}</div>
        <div id="purchaseResult" class="mt-16"></div>
      </div>`;
    CS.qsa('[data-buy-dp]', c).forEach(b => b.addEventListener('click', () => {
      const dpId = b.dataset.buyDp;
      const dp = CS.digitalProductById(dpId);
      if (!dp) return;
      if (!confirm('¿Comprar "' + dp.name + '" por ' + CS.money(dp.price) + ' de tu monedero?')) return;
      const result = CS.purchaseDigitalWithWallet(dpId, u.email);
      if (result.ok) {
        CS.toast('Compra exitosa', 'Tu código: ' + result.code, 'success');
        CS.qs('#purchaseResult', c).innerHTML = '<div class="panel" style="background:rgba(24,165,88,.08);border:1px solid var(--success)"><h4 style="color:var(--success)">Compra exitosa</h4><p class="mt-8">Tu código / producto:</p><code style="display:block;padding:12px;background:var(--surface-2);border-radius:8px;font-size:1.1rem;font-weight:700;margin-top:8px;word-break:break-all">' + CS.escapeHtml(result.code) + '</code><p class="muted mt-8">Guárdalo en un lugar seguro. También puedes verlo en "Mis pedidos".</p></div>';
        digitalShop(c, u); // refresh
      } else {
        CS.toast('Error', result.error, 'error');
      }
    }));
  }

  function profileView(u) {
    return `<div class="panel" style="max-width:560px">
      <h3 class="mb-16">Mi perfil</h3>
      <form id="profileForm">
        <div class="field"><label>Nombre completo</label><input class="input" name="name" value="${escapeHtml(u.name || '')}" required></div>
        <div class="field"><label>Correo electrónico</label><input class="input" value="${escapeHtml(u.email || '')}" disabled style="opacity:.6"></div>
        <div class="field"><label>Teléfono</label><input class="input" name="phone" value="${escapeHtml(u.phone || '')}" placeholder="3001234567"></div>
        <hr style="border:none;border-top:1px solid var(--border);margin:18px 0">
        <div class="field"><label>Nueva contraseña</label><input class="input" type="password" name="pass" placeholder="Dejar en blanco para no cambiar"></div>
        <button class="btn btn-gold">Guardar cambios</button>
      </form>
    </div>`;
  }
  function wireProfile() {
    qs('#profileForm').addEventListener('submit', e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const patch = { name: d.name, phone: d.phone };
      if (d.pass) patch.pass = d.pass;
      CS.updateUser(patch);
      CS.toast('Perfil actualizado', 'Tus cambios fueron guardados.', 'success');
    });
  }

  function rerender() { if (CS.currentUser()) renderApp(); else renderGuest(); }

  window.addEventListener('hashchange', () => { if (CS.currentUser()) renderApp(); });
  CS.on('auth', rerender);
  CS.on('wishlist', () => { if (CS.currentUser() && currentSection() === 'wishlist') renderSection('wishlist'); });
  rerender();
})();
