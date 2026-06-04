/* =========================================================================
   CedrickStore — Panel administrativo (admin.js)
   Dashboard, productos, categorías, pedidos, clientes, banners,
   promociones, inventario y ajustes. Todo editable (localStorage).
   ========================================================================= */
(function () {
  'use strict';
  const { qs, qsa, icon, money, escapeHtml, uid } = CS;
  const root = qs('#adminRoot');

  /* ---------- Setters de datos ---------- */
  const save = {
    products: a => CS.store.set(CS.KEY.products, a),
    categories: a => CS.store.set(CS.KEY.categories, a),
    brands: a => CS.store.set(CS.KEY.brands, a),
    coupons: a => CS.store.set(CS.KEY.coupons, a),
    banners: a => CS.store.set(CS.KEY.banners, a)
  };

  function currentSection() { return (location.hash || '#dashboard').replace('#', ''); }

  /* ---------- Modal ---------- */
  function openModal(title, html, onMount) {
    qs('#adminModalTitle').textContent = title;
    qs('#adminModalBody').innerHTML = html;
    qs('#adminModal').classList.add('open');
    if (onMount) onMount(qs('#adminModalBody'));
  }
  function closeModal() { qs('#adminModal').classList.remove('open'); }

  /* ---------- Guard de acceso ---------- */
  function renderLocked() {
    root.innerHTML = `
      <div class="panel text-center" style="max-width:460px;margin:auto;padding:42px 30px">
        <div class="eico" style="width:80px;height:80px;margin:0 auto 16px;background:var(--surface-2);border-radius:50%;display:grid;place-items:center;color:var(--accent)">${CS.ICONS.shield}</div>
        <h2>Acceso restringido</h2>
        <p class="muted mt-8">Inicia sesión como administrador para acceder al panel.</p>
        <p class="muted mt-8" style="font-size:.85rem">Demo: <b>admin@cedrickstore.com</b> / <b>admin123</b></p>
        <button class="btn btn-gold btn-lg mt-24" id="adminLogin">Iniciar sesión</button>
      </div>`;
    qs('#adminLogin').addEventListener('click', () => CS.openAuth('login'));
  }

  /* ---------- Layout ---------- */
  function renderApp() {
    const section = currentSection();
    const nav = [
      { id: 'dashboard', label: 'Dashboard', icon: 'dash' },
      { id: 'products', label: 'Productos', icon: 'bag' },
      { id: 'categories', label: 'Categorías', icon: 'tag' },
      { id: 'orders', label: 'Pedidos', icon: 'box' },
      { id: 'customers', label: 'Clientes', icon: 'users' },
      { id: 'banners', label: 'Banners', icon: 'image' },
      { id: 'promotions', label: 'Promociones', icon: 'tag' },
      { id: 'inventory', label: 'Inventario', icon: 'chip' },
      { id: 'settings', label: 'Ajustes', icon: 'settings' }
    ];
    root.innerHTML = `
      <div class="admin-layout">
        <aside class="side-nav">
          <div style="padding:10px 14px 14px;border-bottom:1px solid var(--border);margin-bottom:8px">
            <b style="font-family:var(--font-head)">Administración</b>
            <span class="muted" style="display:block;font-size:.8rem">${escapeHtml((CS.currentUser() || {}).email || '')}</span>
          </div>
          ${nav.map(n => `<a href="#${n.id}" class="${section === n.id ? 'active' : ''}">${CS.ICONS[n.icon]} ${n.label}</a>`).join('')}
          <div class="nav-sep"></div>
          <a href="index.html">${CS.ICONS.logout} Volver a la tienda</a>
        </aside>
        <div id="adminContent"></div>
      </div>`;
    renderSection(section);
  }

  function renderSection(s) {
    const c = qs('#adminContent'); if (!c) return;
    ({
      dashboard, products: productsView, categories: categoriesView, orders: ordersView,
      customers: customersView, banners: bannersView, promotions: promotionsView,
      inventory: inventoryView, settings: settingsView
    }[s] || dashboard)(c);
  }

  /* ================= DASHBOARD ================= */
  function dashboard(c) {
    const orders = CS.orders();
    const revenue = orders.reduce((s, o) => s + (o.totals ? o.totals.total : 0), 0);
    const products = CS.products();
    const customers = CS.users().filter(u => u.role !== 'admin');
    const lowStock = products.filter(p => p.stock <= 5);
    // ventas por día (últimos 7) basadas en pedidos + datos demo
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const demo = [42, 58, 35, 70, 64, 88, 52];
    const max = Math.max(...demo);

    c.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card"><div class="sico" style="background:rgba(24,165,88,.14);color:var(--success)">${CS.ICONS.money}</div><span class="trend up">▲ 12%</span><h4 style="font-size:1.4rem">${money(revenue)}</h4><span>Ingresos totales</span></div>
        <div class="stat-card"><div class="sico" style="background:rgba(47,125,225,.14);color:var(--info)">${CS.ICONS.box}</div><span class="trend up">▲ 8%</span><h4>${orders.length}</h4><span>Pedidos</span></div>
        <div class="stat-card"><div class="sico" style="background:rgba(201,162,39,.15);color:var(--accent)">${CS.ICONS.bag}</div><h4>${products.length}</h4><span>Productos</span></div>
        <div class="stat-card"><div class="sico" style="background:rgba(226,61,68,.14);color:var(--danger)">${CS.ICONS.users}</div><span class="trend up">▲ 5%</span><h4>${customers.length}</h4><span>Clientes</span></div>
      </div>

      <div class="admin-layout" style="grid-template-columns:1.5fr 1fr">
        <div class="panel">
          <h3 class="mb-16">Ventas de la semana</h3>
          <div class="mini-chart">${demo.map((v, i) => `<div class="bar" style="height:${v / max * 100}%"><span>${days[i]}</span></div>`).join('')}</div>
        </div>
        <div class="panel">
          <h3 class="mb-16">${icon('chip')} Stock bajo</h3>
          ${lowStock.length ? lowStock.slice(0, 6).map(p => `<div class="between" style="padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:.9rem">${escapeHtml(p.name)}</span><span class="status-pill ${p.stock <= 0 ? 'cancel' : 'pending'}">${p.stock} und</span></div>`).join('') : '<p class="muted">Todo el inventario está saludable. 👍</p>'}
        </div>
      </div>

      <div class="panel">
        <h3 class="mb-16">Pedidos recientes</h3>
        ${ordersTable(orders.slice(0, 6))}
      </div>`;
    wireOrderStatus();
  }

  /* ================= PRODUCTOS ================= */
  function productsView(c) {
    const list = CS.products();
    c.innerHTML = `
      <div class="panel">
        <div class="between mb-16"><h3>Gestión de productos (${list.length})</h3><button class="btn btn-gold btn-sm" id="newProduct">${icon('plus')} Nuevo producto</button></div>
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th></th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${list.map(p => `<tr>
            <td><img src="${CS.productImg(p)}" alt=""></td>
            <td><b>${escapeHtml(p.name)}</b><div class="muted" style="font-size:.78rem">${escapeHtml(CS.brandName(p.brand))}</div></td>
            <td>${escapeHtml(CS.categoryName(p.category))}</td>
            <td><b>${money(p.price)}</b></td>
            <td>${p.stock}</td>
            <td><span class="status-pill ${p.stock <= 0 ? 'cancel' : p.stock <= 5 ? 'pending' : 'done'}">${p.stock <= 0 ? 'Agotado' : p.stock <= 5 ? 'Bajo' : 'Activo'}</span></td>
            <td><div class="row gap-8"><button class="icon-btn btn-sm" data-edit-prod="${p.id}" title="Editar" style="width:34px;height:34px">${CS.ICONS.edit}</button><button class="icon-btn btn-sm" data-del-prod="${p.id}" title="Eliminar" style="width:34px;height:34px">${CS.ICONS.trash}</button></div></td>
          </tr>`).join('')}</tbody>
        </table></div>
      </div>`;
    qs('#newProduct').addEventListener('click', () => productForm());
    qsa('[data-edit-prod]').forEach(b => b.addEventListener('click', () => productForm(b.dataset.editProd)));
    qsa('[data-del-prod]').forEach(b => b.addEventListener('click', () => {
      if (!confirm('¿Eliminar este producto?')) return;
      save.products(CS.products().filter(p => p.id !== b.dataset.delProd));
      CS.toast('Producto eliminado', '', 'info'); renderSection('products');
    }));
  }

  function productForm(id) {
    const p = id ? CS.productById(id) : { id: uid('p_'), category: CS.categories()[0].id, brand: CS.brands()[0].id, price: 0, stock: 0, rating: 5, sold: 0, gallery: 3, tone: '#c9a227', specs: {} };
    const cats = CS.categories().map(c => `<option value="${c.id}" ${p.category === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
    const brs = CS.brands().map(b => `<option value="${b.id}" ${p.brand === b.id ? 'selected' : ''}>${escapeHtml(b.name)}</option>`).join('');
    const specsText = Object.entries(p.specs || {}).map(([k, v]) => k + ': ' + v).join('\n');
    openModal(id ? 'Editar producto' : 'Nuevo producto', `
      <form id="prodForm">
        <div class="field"><label>Nombre <span class="req">*</span></label><input class="input" name="name" required value="${escapeHtml(p.name || '')}"></div>
        <div class="form-grid">
          <div class="field"><label>Categoría</label><select class="select" name="category">${cats}</select></div>
          <div class="field"><label>Marca</label><select class="select" name="brand">${brs}</select></div>
          <div class="field"><label>Precio <span class="req">*</span></label><input class="input" type="number" name="price" required value="${p.price || 0}"></div>
          <div class="field"><label>Precio anterior</label><input class="input" type="number" name="oldPrice" value="${p.oldPrice || ''}"></div>
          <div class="field"><label>Stock</label><input class="input" type="number" name="stock" value="${p.stock || 0}"></div>
          <div class="field"><label>Calificación (1-5)</label><input class="input" type="number" step="0.1" min="0" max="5" name="rating" value="${p.rating || 5}"></div>
          <div class="field"><label>Vendidos</label><input class="input" type="number" name="sold" value="${p.sold || 0}"></div>
          <div class="field"><label>Nº de imágenes (galería)</label><input class="input" type="number" min="1" max="6" name="gallery" value="${p.gallery || 3}"></div>
          <div class="field"><label>Color (imagen)</label><input class="input" type="color" name="tone" value="${p.tone || '#c9a227'}" style="height:48px;padding:4px"></div>
        </div>
        <div class="field"><label>Descripción</label><textarea class="textarea" name="desc">${escapeHtml(p.desc || '')}</textarea></div>
        <div class="field"><label>Especificaciones (una por línea: Clave: Valor)</label><textarea class="textarea" name="specs" placeholder="Garantía: 12 meses">${escapeHtml(specsText)}</textarea></div>
        <div class="row gap-16 flex-wrap mb-16">
          <label class="check"><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}> Destacado</label>
          <label class="check"><input type="checkbox" name="isNew" ${p.isNew ? 'checked' : ''}> Nuevo</label>
          <label class="check"><input type="checkbox" name="bestseller" ${p.bestseller ? 'checked' : ''}> Más vendido</label>
        </div>
        <button class="btn btn-gold btn-block btn-lg">${id ? 'Guardar cambios' : 'Crear producto'}</button>
      </form>`, (body) => {
      qs('#prodForm', body).addEventListener('submit', e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.target));
        const specs = {};
        (d.specs || '').split('\n').forEach(line => { const idx = line.indexOf(':'); if (idx > 0) specs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim(); });
        const np = {
          id: p.id, name: d.name, category: d.category, brand: d.brand,
          price: +d.price, oldPrice: d.oldPrice ? +d.oldPrice : null, stock: +d.stock,
          rating: +d.rating, sold: +d.sold, gallery: +d.gallery, tone: d.tone,
          desc: d.desc, specs, featured: !!d.featured, isNew: !!d.isNew, bestseller: !!d.bestseller,
          reviews: p.reviews || []
        };
        const list = CS.products();
        const i = list.findIndex(x => x.id === p.id);
        if (i >= 0) list[i] = np; else list.unshift(np);
        save.products(list);
        CS.toast(id ? 'Producto actualizado' : 'Producto creado', np.name, 'success');
        closeModal(); renderSection('products');
      });
    });
  }

  /* ================= CATEGORÍAS ================= */
  function categoriesView(c) {
    const list = CS.categories();
    const counts = {}; CS.products().forEach(p => counts[p.category] = (counts[p.category] || 0) + 1);
    c.innerHTML = `<div class="panel">
      <div class="between mb-16"><h3>Categorías (${list.length})</h3><button class="btn btn-gold btn-sm" id="newCat">${icon('plus')} Nueva</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Categoría</th><th>ID</th><th>Productos</th><th>Color</th><th></th></tr></thead>
      <tbody>${list.map(cat => `<tr>
        <td><div class="row gap-8" style="align-items:center"><span class="cat-ico" style="width:34px;height:34px;color:${cat.color};background:${cat.color}1f">${CS.ICONS[cat.icon] || CS.ICONS.box}</span><b>${escapeHtml(cat.name)}</b></div></td>
        <td class="muted">${cat.id}</td><td>${counts[cat.id] || 0}</td>
        <td><span style="display:inline-block;width:20px;height:20px;border-radius:5px;background:${cat.color}"></span></td>
        <td><button class="icon-btn" data-del-cat="${cat.id}" style="width:34px;height:34px">${CS.ICONS.trash}</button></td>
      </tr>`).join('')}</tbody></table></div></div>`;
    qs('#newCat').addEventListener('click', () => {
      openModal('Nueva categoría', `<form id="catForm">
        <div class="field"><label>Nombre</label><input class="input" name="name" required></div>
        <div class="field"><label>Color</label><input class="input" type="color" name="color" value="#c9a227" style="height:48px"></div>
        <div class="field"><label>Ícono</label><select class="select" name="icon"><option value="box">Caja</option><option value="chip">Tecnología</option><option value="watch">Reloj</option><option value="headset">Audio</option><option value="shirt">Moda</option><option value="home">Hogar</option><option value="sparkle">Belleza</option></select></div>
        <button class="btn btn-gold btn-block">Crear categoría</button>
      </form>`, (body) => {
        qs('#catForm', body).addEventListener('submit', e => {
          e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
          const list = CS.categories(); list.push({ id: CS.slug(d.name), name: d.name, color: d.color, icon: d.icon });
          save.categories(list); CS.toast('Categoría creada', '', 'success'); closeModal(); renderSection('categories');
        });
      });
    });
    qsa('[data-del-cat]').forEach(b => b.addEventListener('click', () => {
      if (!confirm('¿Eliminar esta categoría?')) return;
      save.categories(CS.categories().filter(x => x.id !== b.dataset.delCat));
      renderSection('categories');
    }));
  }

  /* ================= PEDIDOS ================= */
  function ordersTable(orders) {
    if (!orders.length) return '<p class="muted">No hay pedidos todavía.</p>';
    return `<div class="table-wrap"><table class="data-table">
      <thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
      <tbody>${orders.map(o => `<tr>
        <td><b>#${o.id}</b></td>
        <td>${escapeHtml(o.customer ? o.customer.name : '—')}<div class="muted" style="font-size:.78rem">${escapeHtml(o.customer ? o.customer.phone : '')}</div></td>
        <td>${new Date(o.createdAt).toLocaleDateString('es-CO')}</td>
        <td><b>${money(o.totals.total)}</b></td>
        <td><select class="select status-sel" data-order="${o.id}" style="height:36px;width:auto;font-size:.82rem">
          ${['pending', 'paid', 'ship', 'done', 'cancel'].map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${{ pending: 'Pendiente', paid: 'Pagado', ship: 'Enviado', done: 'Entregado', cancel: 'Cancelado' }[s]}</option>`).join('')}
        </select></td>
      </tr>`).join('')}</tbody></table></div>`;
  }
  function wireOrderStatus() {
    qsa('.status-sel').forEach(sel => sel.addEventListener('change', () => {
      CS.updateOrder(sel.dataset.order, { status: sel.value });
      CS.toast('Pedido actualizado', 'Estado: ' + sel.options[sel.selectedIndex].text, 'success');
    }));
  }
  function ordersView(c) {
    const orders = CS.orders();
    c.innerHTML = `<div class="panel"><h3 class="mb-16">Gestión de pedidos (${orders.length})</h3>${ordersTable(orders)}</div>`;
    wireOrderStatus();
  }

  /* ================= CLIENTES ================= */
  function customersView(c) {
    const users = CS.users().filter(u => u.role !== 'admin');
    const orders = CS.orders();
    c.innerHTML = `<div class="panel"><h3 class="mb-16">Clientes (${users.length})</h3>
      ${users.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Cliente</th><th>Correo</th><th>Teléfono</th><th>Pedidos</th><th>Registro</th></tr></thead>
      <tbody>${users.map(u => { const n = orders.filter(o => o.userEmail === u.email).length; return `<tr>
        <td><div class="row gap-8" style="align-items:center"><span class="avatar" style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--surface-2);font-weight:800;color:var(--accent)">${escapeHtml(u.name.charAt(0).toUpperCase())}</span><b>${escapeHtml(u.name)}</b></div></td>
        <td class="muted">${escapeHtml(u.email)}</td><td>${escapeHtml(u.phone || '—')}</td><td>${n}</td>
        <td>${new Date(u.createdAt).toLocaleDateString('es-CO')}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="muted">Aún no hay clientes registrados.</p>'}
    </div>`;
  }

  /* ================= BANNERS ================= */
  function bannersView(c) {
    const list = CS.banners();
    c.innerHTML = `<div class="panel">
      <div class="between mb-16"><h3>Banners del home (${list.length})</h3><button class="btn btn-gold btn-sm" id="newBanner">${icon('plus')} Nuevo banner</button></div>
      ${list.map((b, i) => `<div class="cart-row" style="grid-template-columns:1fr auto">
        <div><b>${b.title.replace(/<[^>]+>/g, '')}</b><div class="muted" style="font-size:.85rem">${escapeHtml(b.eyebrow)} · CTA: ${escapeHtml(b.cta)}</div></div>
        <button class="icon-btn" data-del-banner="${i}" style="width:34px;height:34px">${CS.ICONS.trash}</button>
      </div>`).join('')}
    </div>`;
    qs('#newBanner').addEventListener('click', () => {
      openModal('Nuevo banner', `<form id="bannerForm">
        <div class="field"><label>Eyebrow (texto superior)</label><input class="input" name="eyebrow" value="Nueva colección"></div>
        <div class="field"><label>Título (puedes usar &lt;span&gt; para resaltar)</label><input class="input" name="title" value="Tu título <span>destacado</span>"></div>
        <div class="field"><label>Texto</label><textarea class="textarea" name="text"></textarea></div>
        <div class="form-grid">
          <div class="field"><label>Texto del botón</label><input class="input" name="cta" value="Comprar ahora"></div>
          <div class="field"><label>Enlace</label><input class="input" name="link" value="catalog.html"></div>
          <div class="field"><label>Insignia</label><input class="input" name="badge" value="-30%"></div>
          <div class="field"><label>Tono</label><select class="select" name="tone"><option value="gold">Dorado</option><option value="blue">Azul</option><option value="dark">Oscuro</option></select></div>
        </div>
        <button class="btn btn-gold btn-block">Crear banner</button>
      </form>`, (body) => {
        qs('#bannerForm', body).addEventListener('submit', e => {
          e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
          const list = CS.banners(); list.push({ id: uid('b_'), eyebrow: d.eyebrow, title: d.title, text: d.text, cta: d.cta, link: d.link, badge: d.badge, tone: d.tone, icon: 'sparkle' });
          save.banners(list); CS.toast('Banner creado', '', 'success'); closeModal(); renderSection('banners');
        });
      });
    });
    qsa('[data-del-banner]').forEach(b => b.addEventListener('click', () => {
      save.banners(CS.banners().filter((_, i) => i !== +b.dataset.delBanner)); renderSection('banners');
    }));
  }

  /* ================= PROMOCIONES (cupones) ================= */
  function promotionsView(c) {
    const list = CS.coupons();
    c.innerHTML = `<div class="panel">
      <div class="between mb-16"><h3>Cupones y promociones (${list.length})</h3><button class="btn btn-gold btn-sm" id="newCoupon">${icon('plus')} Nuevo cupón</button></div>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Código</th><th>Tipo</th><th>Valor</th><th>Descripción</th><th></th></tr></thead>
      <tbody>${list.map((cp, i) => `<tr>
        <td><b class="gold-text">${escapeHtml(cp.code)}</b></td>
        <td>${{ percent: 'Porcentaje', fixed: 'Monto fijo', shipping: 'Envío gratis' }[cp.type]}</td>
        <td>${cp.type === 'percent' ? cp.value + '%' : cp.type === 'fixed' ? money(cp.value) : '—'}</td>
        <td class="muted">${escapeHtml(cp.label)}</td>
        <td><button class="icon-btn" data-del-coupon="${i}" style="width:34px;height:34px">${CS.ICONS.trash}</button></td>
      </tr>`).join('')}</tbody></table></div></div>`;
    qs('#newCoupon').addEventListener('click', () => {
      openModal('Nuevo cupón', `<form id="couponForm">
        <div class="field"><label>Código</label><input class="input" name="code" required value="DESCUENTO15" style="text-transform:uppercase"></div>
        <div class="field"><label>Tipo</label><select class="select" name="type"><option value="percent">Porcentaje (%)</option><option value="fixed">Monto fijo ($)</option><option value="shipping">Envío gratis</option></select></div>
        <div class="field"><label>Valor</label><input class="input" type="number" name="value" value="15"></div>
        <div class="field"><label>Descripción</label><input class="input" name="label" value="15% de descuento"></div>
        <button class="btn btn-gold btn-block">Crear cupón</button>
      </form>`, (body) => {
        qs('#couponForm', body).addEventListener('submit', e => {
          e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
          const list = CS.coupons(); list.push({ code: d.code.toUpperCase(), type: d.type, value: +d.value, label: d.label });
          save.coupons(list); CS.toast('Cupón creado', d.code.toUpperCase(), 'success'); closeModal(); renderSection('promotions');
        });
      });
    });
    qsa('[data-del-coupon]').forEach(b => b.addEventListener('click', () => {
      save.coupons(CS.coupons().filter((_, i) => i !== +b.dataset.delCoupon)); renderSection('promotions');
    }));
  }

  /* ================= INVENTARIO ================= */
  function inventoryView(c) {
    const list = CS.products();
    c.innerHTML = `<div class="panel">
      <h3 class="mb-16">Gestión de inventario</h3>
      <p class="muted mb-16">Ajusta el stock directamente. Los cambios se guardan al instante.</p>
      <div class="table-wrap"><table class="data-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock actual</th><th></th></tr></thead>
      <tbody>${list.map(p => `<tr>
        <td><b>${escapeHtml(p.name)}</b></td><td>${escapeHtml(CS.categoryName(p.category))}</td><td>${money(p.price)}</td>
        <td><div class="qty-stepper" style="height:38px"><button data-stock-dec="${p.id}" style="height:38px;width:34px">−</button><input type="text" value="${p.stock}" data-stock="${p.id}" style="height:38px;width:48px"><button data-stock-inc="${p.id}" style="height:38px;width:34px">+</button></div></td>
        <td><span class="status-pill ${p.stock <= 0 ? 'cancel' : p.stock <= 5 ? 'pending' : 'done'}">${p.stock <= 0 ? 'Agotado' : p.stock <= 5 ? 'Bajo' : 'OK'}</span></td>
      </tr>`).join('')}</tbody></table></div></div>`;
    const setStock = (id, val) => { const list = CS.products(); const p = list.find(x => x.id === id); if (p) { p.stock = Math.max(0, val); save.products(list); } };
    qsa('[data-stock-inc]').forEach(b => b.addEventListener('click', () => { const p = CS.productById(b.dataset.stockInc); setStock(p.id, p.stock + 1); renderSection('inventory'); }));
    qsa('[data-stock-dec]').forEach(b => b.addEventListener('click', () => { const p = CS.productById(b.dataset.stockDec); setStock(p.id, p.stock - 1); renderSection('inventory'); }));
    qsa('[data-stock]').forEach(inp => inp.addEventListener('change', () => { setStock(inp.dataset.stock, parseInt(inp.value.replace(/\D/g, '')) || 0); CS.toast('Stock actualizado', '', 'success'); renderSection('inventory'); }));
  }

  /* ================= AJUSTES ================= */
  function settingsView(c) {
    c.innerHTML = `<div class="panel" style="max-width:600px">
      <h3 class="mb-16">Ajustes de la tienda</h3>
      <div class="field"><label>Número de WhatsApp para pedidos</label><input class="input" value="${CS.WHATSAPP_NUMBER}" disabled style="opacity:.7"></div>
      <p class="muted" style="font-size:.82rem">Para cambiar el número, edita la constante <b>WHATSAPP_NUMBER</b> en <b>js/core.js</b>.</p>
      <hr style="border:none;border-top:1px solid var(--border);margin:20px 0">
      <h4 class="mb-8">Datos de demostración</h4>
      <p class="muted mb-16">Restablece el catálogo, categorías, marcas y promociones a los valores originales. No borra pedidos ni clientes.</p>
      <button class="btn btn-outline" id="resetData">${icon('refresh')} Restablecer catálogo</button>
      <button class="btn btn-outline" id="wipeAll" style="border-color:var(--danger);color:var(--danger)">${icon('trash')} Borrar TODO</button>
    </div>`;
    qs('#resetData').addEventListener('click', () => { if (confirm('¿Restablecer el catálogo a los valores originales?')) { CS.seed(true); renderSection('settings'); } });
    qs('#wipeAll').addEventListener('click', () => {
      if (confirm('Esto borrará TODOS los datos (productos, pedidos, clientes, carrito). ¿Continuar?')) {
        Object.values(CS.KEY).forEach(k => CS.store.del(k));
        CS.toast('Datos borrados', 'Recargando...', 'info');
        setTimeout(() => location.reload(), 800);
      }
    });
  }

  /* ---------- Init ---------- */
  function boot() { if (CS.isAdmin()) renderApp(); else renderLocked(); }
  window.addEventListener('hashchange', () => { if (CS.isAdmin()) renderApp(); });
  CS.on('auth', boot);
  CS.on('orders', () => { if (CS.isAdmin() && ['dashboard', 'orders'].includes(currentSection())) renderSection(currentSection()); });
  boot();
})();
