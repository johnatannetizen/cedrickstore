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
      { id: 'appearance', label: 'Personalización', icon: 'sparkle' },
      { id: 'products', label: 'Productos', icon: 'bag' },
      { id: 'categories', label: 'Categorías', icon: 'tag' },
      { id: 'orders', label: 'Pedidos', icon: 'box' },
      { id: 'customers', label: 'Clientes', icon: 'users' },
      { id: 'banners', label: 'Banners', icon: 'image' },
      { id: 'promotions', label: 'Promociones', icon: 'tag' },
      { id: 'inventory', label: 'Inventario', icon: 'chip' },
      { id: 'wallet', label: 'Monedero', icon: 'money' },
      { id: 'digital', label: 'Prod. digitales', icon: 'tag' },
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
      dashboard, appearance: appearanceView, products: productsView, categories: categoriesView, orders: ordersView,
      customers: customersView, banners: bannersView, promotions: promotionsView,
      inventory: inventoryView, wallet: walletView, digital: digitalView, settings: settingsView
    }[s] || dashboard)(c);
  }

  /* ---------- Utilidad: leer archivo como data-uri ---------- */
  function readFileAsDataURL(file, cb) {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) { CS.toast('Imagen muy pesada', 'Usa una imagen menor a 1.5 MB.', 'error'); return; }
    const fr = new FileReader();
    fr.onload = () => cb(fr.result);
    fr.readAsDataURL(file);
  }

  /* ================= PERSONALIZACIÓN (Apariencia) ================= */
  function appearanceView(c) {
    const tab = CS.store.get('cs_admin_appearance_tab', 'brand');
    c.innerHTML = `
      <div class="panel">
        <h3 class="mb-16">${icon('sparkle')} Personalización de la tienda</h3>
        <div class="tabs" id="appTabs">
          <button class="tab ${tab === 'brand' ? 'active' : ''}" data-app-tab="brand">Marca y logo</button>
          <button class="tab ${tab === 'colors' ? 'active' : ''}" data-app-tab="colors">Colores y fondos</button>
          <button class="tab ${tab === 'texts' ? 'active' : ''}" data-app-tab="texts">Textos y contacto</button>
          <button class="tab ${tab === 'theme' ? 'active' : ''}" data-app-tab="theme">Tema</button>
        </div>
        <div id="appPane"></div>
      </div>`;
    qsa('#appTabs [data-app-tab]').forEach(b => b.addEventListener('click', () => {
      CS.store.set('cs_admin_appearance_tab', b.dataset.appTab);
      qsa('#appTabs .tab').forEach(x => x.classList.toggle('active', x === b));
      renderAppPane(b.dataset.appTab);
    }));
    renderAppPane(tab);
  }

  function renderAppPane(tab) {
    const pane = qs('#appPane'); const s = CS.settings();
    if (tab === 'brand') {
      pane.innerHTML = `
        <form id="brandForm">
          <div class="form-grid">
            <div class="field"><label>Nombre (parte 1)</label><input class="input" name="name1" value="${escapeHtml(s.brand.name1)}"></div>
            <div class="field"><label>Nombre (parte 2 · dorado)</label><input class="input" name="name2" value="${escapeHtml(s.brand.name2)}"></div>
            <div class="field"><label>Eslogan / subtítulo</label><input class="input" name="tagline" value="${escapeHtml(s.brand.tagline)}"></div>
            <div class="field"><label>WhatsApp (solo dígitos, con país)</label><input class="input" name="whatsapp" value="${escapeHtml(s.whatsapp)}" placeholder="573016515466"></div>
          </div>
          <div class="row gap-24 flex-wrap mt-8">
            <div>
              <label style="font-weight:600;font-size:.88rem">Logo (header/footer)</label>
              <div class="row gap-12" style="align-items:center;margin-top:8px">
                <span class="logo-mark" style="box-shadow:none;background:var(--surface-2)"><img src="${s.logo || 'assets/logo-mark.svg'}" id="logoPreview" alt="" style="width:56px;height:56px"></span>
                <button type="button" class="btn btn-outline btn-sm" id="logoUpload">${icon('image')} Subir logo</button>
                ${s.logo ? '<button type="button" class="btn btn-ghost btn-sm" id="logoRemove">Quitar</button>' : ''}
                <input type="file" accept="image/*" id="logoFile" hidden>
              </div>
            </div>
            <div>
              <label style="font-weight:600;font-size:.88rem">Favicon</label>
              <div class="row gap-12" style="align-items:center;margin-top:8px">
                <img src="${s.favicon || 'assets/favicon.svg'}" id="favPreview" alt="" style="width:40px;height:40px;border-radius:8px;border:1px solid var(--border)">
                <button type="button" class="btn btn-outline btn-sm" id="favUpload">${icon('image')} Subir favicon</button>
                <input type="file" accept="image/*" id="favFile" hidden>
              </div>
            </div>
          </div>
          <button class="btn btn-gold btn-lg mt-24">Guardar marca</button>
          <p class="muted mt-8" style="font-size:.82rem">Al guardar, la página se recargará para aplicar el logo y los textos.</p>
        </form>`;
      let newLogo = null, newFav = null;
      qs('#logoUpload').addEventListener('click', () => qs('#logoFile').click());
      qs('#logoFile').addEventListener('change', e => readFileAsDataURL(e.target.files[0], d => { newLogo = d; qs('#logoPreview').src = d; }));
      qs('#favUpload').addEventListener('click', () => qs('#favFile').click());
      qs('#favFile').addEventListener('change', e => readFileAsDataURL(e.target.files[0], d => { newFav = d; qs('#favPreview').src = d; }));
      qs('#logoRemove') && qs('#logoRemove').addEventListener('click', () => { CS.saveSettings({ logo: '' }); CS.toast('Logo restablecido', '', 'info'); setTimeout(() => location.reload(), 500); });
      qs('#brandForm').addEventListener('submit', e => {
        e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
        const patch = { brand: { name1: d.name1, name2: d.name2, tagline: d.tagline }, whatsapp: d.whatsapp.replace(/\D/g, '') };
        if (newLogo) patch.logo = newLogo;
        if (newFav) patch.favicon = newFav;
        CS.saveSettings(patch);
        CS.toast('Marca actualizada', 'Aplicando cambios...', 'success');
        setTimeout(() => location.reload(), 650);
      });
    }

    else if (tab === 'colors') {
      const L = s.colors.light, D = s.colors.dark;
      const sw = (label, group, key, val) => `<div class="field"><label>${label}</label><div class="row gap-8" style="align-items:center"><input type="color" class="color-input" data-group="${group}" data-key="${key}" value="${val}" style="width:54px;height:42px;padding:3px;border-radius:8px;border:1.5px solid var(--border)"><code style="font-size:.82rem;color:var(--muted)">${val}</code></div></div>`;
      pane.innerHTML = `
        <p class="muted mb-16">Los cambios se aplican <b>en vivo</b>. Pulsa “Guardar colores” para conservarlos.</p>
        <h4 class="mb-8">Modo claro</h4>
        <div class="form-grid">
          ${sw('Dorado / Marca', 'light', '--gold', L['--gold'])}
          ${sw('Acento (botones, precios)', 'light', '--accent', L['--accent'])}
          ${sw('Fondo general', 'light', '--bg', L['--bg'])}
          ${sw('Tarjetas / superficies', 'light', '--surface', L['--surface'])}
          ${sw('Color de texto', 'light', '--text', L['--text'])}
          ${sw('Negro de marca (franjas)', 'light', '--ink', L['--ink'])}
        </div>
        <h4 class="mb-8 mt-16">Modo oscuro</h4>
        <div class="form-grid">
          ${sw('Acento', 'dark', '--accent', D['--accent'])}
          ${sw('Fondo general', 'dark', '--bg', D['--bg'])}
          ${sw('Tarjetas / superficies', 'dark', '--surface', D['--surface'])}
          ${sw('Color de texto', 'dark', '--text', D['--text'])}
        </div>
        <div class="gap-12 row flex-wrap mt-24">
          <button class="btn btn-gold btn-lg" id="saveColors">Guardar colores</button>
          <button class="btn btn-outline btn-lg" id="resetColors">Restablecer paleta</button>
        </div>`;
      const draft = { light: Object.assign({}, L), dark: Object.assign({}, D) };
      qsa('.color-input').forEach(inp => inp.addEventListener('input', () => {
        draft[inp.dataset.group][inp.dataset.key] = inp.value;
        inp.nextElementSibling.textContent = inp.value;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if ((inp.dataset.group === 'dark') === isDark) {
          if (inp.dataset.group === 'light' && inp.dataset.key === '--gold') document.documentElement.style.setProperty('--accent-2', inp.value);
          document.documentElement.style.setProperty(inp.dataset.key, inp.value);
        }
      }));
      qs('#saveColors').addEventListener('click', () => {
        CS.saveSettings({ colors: draft });
        document.documentElement.removeAttribute('style');
        CS.toast('Colores guardados', 'Tu paleta se aplicó en toda la tienda.', 'success');
      });
      qs('#resetColors').addEventListener('click', () => {
        if (!confirm('¿Restablecer la paleta de colores por defecto?')) return;
        CS.saveSettings({ colors: { light: { '--gold': '#c9a227', '--accent': '#b8911f', '--bg': '#f6f6f8', '--surface': '#ffffff', '--ink': '#15151a', '--text': '#15151a' }, dark: { '--accent': '#e6c860', '--bg': '#0c0c0e', '--surface': '#16161c', '--ink': '#15151a', '--text': '#f3f3f6' } } });
        document.documentElement.removeAttribute('style');
        renderAppPane('colors');
        CS.toast('Paleta restablecida', '', 'info');
      });
    }

    else if (tab === 'texts') {
      pane.innerHTML = `
        <form id="textsForm">
          <div class="field"><label>Mensaje de la barra superior</label><input class="input" name="topbar" value="${escapeHtml(s.topbar)}"></div>
          <div class="field"><label>Texto “acerca de” (footer)</label><textarea class="textarea" name="footerAbout">${escapeHtml(s.footerAbout)}</textarea></div>
          <div class="form-grid">
            <div class="field"><label>Dirección</label><input class="input" name="address" value="${escapeHtml(s.contact.address)}"></div>
            <div class="field"><label>Teléfono</label><input class="input" name="phone" value="${escapeHtml(s.contact.phone)}"></div>
            <div class="field"><label>Correo</label><input class="input" name="email" value="${escapeHtml(s.contact.email)}"></div>
            <div class="field"><label>Horario</label><input class="input" name="hours" value="${escapeHtml(s.contact.hours)}"></div>
            <div class="field full"><label>Ubicación del mapa (ciudad o dirección)</label><input class="input" name="mapQuery" value="${escapeHtml(s.contact.mapQuery)}"></div>
          </div>
          <h4 class="mb-8 mt-8">Redes sociales (URL)</h4>
          <div class="form-grid">
            <div class="field"><label>Facebook</label><input class="input" name="facebook" value="${escapeHtml(s.social.facebook)}"></div>
            <div class="field"><label>Instagram</label><input class="input" name="instagram" value="${escapeHtml(s.social.instagram)}"></div>
            <div class="field"><label>Twitter / X</label><input class="input" name="twitter" value="${escapeHtml(s.social.twitter)}"></div>
            <div class="field"><label>YouTube</label><input class="input" name="youtube" value="${escapeHtml(s.social.youtube)}"></div>
          </div>
          <button class="btn btn-gold btn-lg mt-8">Guardar textos</button>
        </form>`;
      qs('#textsForm').addEventListener('submit', e => {
        e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
        CS.saveSettings({
          topbar: d.topbar, footerAbout: d.footerAbout,
          contact: { address: d.address, phone: d.phone, email: d.email, hours: d.hours, mapQuery: d.mapQuery },
          social: { facebook: d.facebook, instagram: d.instagram, twitter: d.twitter, youtube: d.youtube }
        });
        CS.toast('Textos actualizados', 'Aplicando cambios...', 'success');
        setTimeout(() => location.reload(), 650);
      });
    }

    else if (tab === 'theme') {
      pane.innerHTML = `
        <p class="muted mb-16">Elige el tema con el que se mostrará la tienda por defecto a los visitantes.</p>
        <div class="gap-12 row flex-wrap">
          ${['auto', 'light', 'dark'].map(t => `<label class="check" style="border:1.5px solid ${s.defaultTheme === t ? 'var(--accent)' : 'var(--border)'};border-radius:12px;padding:16px 20px;flex:1;min-width:160px"><input type="radio" name="dtheme" value="${t}" ${s.defaultTheme === t ? 'checked' : ''}> <b>${{ auto: 'Automático (según el dispositivo)', light: 'Claro', dark: 'Oscuro' }[t]}</b></label>`).join('')}
        </div>
        <button class="btn btn-gold btn-lg mt-24" id="saveTheme">Guardar tema</button>`;
      qs('#saveTheme').addEventListener('click', () => {
        const v = (qs('input[name="dtheme"]:checked') || {}).value || 'auto';
        CS.saveSettings({ defaultTheme: v });
        if (v === 'auto') CS.store.del(CS.KEY.theme);
        else CS.applyTheme(v);
        CS.toast('Tema guardado', 'Se aplicará a los visitantes.', 'success');
        renderAppPane('theme');
      });
    }
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
        <div class="field">
          <label>Imágenes del producto (sube las tuyas o se generan solas)</label>
          <div id="prodImgs" class="row gap-8 flex-wrap" style="margin-bottom:8px"></div>
          <button type="button" class="btn btn-outline btn-sm" id="prodImgUpload">${icon('image')} Subir imágenes</button>
          <input type="file" accept="image/*" multiple id="prodImgFile" hidden>
        </div>
        <div class="row gap-16 flex-wrap mb-16">
          <label class="check"><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}> Destacado</label>
          <label class="check"><input type="checkbox" name="isNew" ${p.isNew ? 'checked' : ''}> Nuevo</label>
          <label class="check"><input type="checkbox" name="bestseller" ${p.bestseller ? 'checked' : ''}> Más vendido</label>
        </div>
        <button class="btn btn-gold btn-block btn-lg">${id ? 'Guardar cambios' : 'Crear producto'}</button>
      </form>`, (body) => {
      const imgs = (p.images || []).slice();
      const imgsBox = CS.qs('#prodImgs', body);
      function renderImgs() {
        imgsBox.innerHTML = imgs.length
          ? imgs.map((src, idx) => `<div class="compare-thumb"><img src="${src}" alt=""><button type="button" class="x" data-rmimg="${idx}">${CS.ICONS.close}</button></div>`).join('')
          : '<span class="muted" style="font-size:.82rem">Sin imágenes propias: se generará una imagen con el color elegido.</span>';
        CS.qsa('[data-rmimg]', imgsBox).forEach(b => b.addEventListener('click', () => { imgs.splice(+b.dataset.rmimg, 1); renderImgs(); }));
      }
      renderImgs();
      CS.qs('#prodImgUpload', body).addEventListener('click', () => CS.qs('#prodImgFile', body).click());
      CS.qs('#prodImgFile', body).addEventListener('change', ev => { Array.from(ev.target.files || []).forEach(f => readFileAsDataURL(f, d => { imgs.push(d); renderImgs(); })); });
      qs('#prodForm', body).addEventListener('submit', e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.target));
        const specs = {};
        (d.specs || '').split('\n').forEach(line => { const idx = line.indexOf(':'); if (idx > 0) specs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim(); });
        const np = {
          id: p.id, name: d.name, category: d.category, brand: d.brand,
          price: +d.price, oldPrice: d.oldPrice ? +d.oldPrice : null, stock: +d.stock,
          rating: +d.rating, sold: +d.sold, gallery: Math.max(+d.gallery || 1, imgs.length || 1), tone: d.tone,
          images: imgs.slice(),
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
      <thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Vence</th><th>Estado</th></tr></thead>
      <tbody>${orders.map(o => {
        const itemCount = (o.items || []).reduce((n, i) => n + (i.qty || 1), 0);
        const itemNames = (o.items || []).map(i => escapeHtml(i.name)).join(', ');
        const hasExpiry = o.items && o.items.some(i => i.expiresAt);
        const expiry = hasExpiry ? o.items.filter(i => i.expiresAt).map(i => {
          const exp = new Date(i.expiresAt);
          const expired = exp < Date.now();
          return '<span class="status-pill ' + (expired ? 'cancel' : 'done') + '">' + exp.toLocaleDateString('es-CO') + (expired ? ' (Vencido)' : '') + '</span>';
        }).join(' ') : '<span class="muted">—</span>';
        return `<tr>
        <td><b>#${o.id}</b>${o.type === 'digital' ? '<br><span class="tag tag-new" style="font-size:.6rem">Digital</span>' : ''}</td>
        <td>${escapeHtml(o.customer ? o.customer.name : '—')}<div class="muted" style="font-size:.76rem">${escapeHtml(o.userEmail || (o.customer ? o.customer.email : ''))}</div></td>
        <td>${new Date(o.createdAt).toLocaleDateString('es-CO')}</td>
        <td><span title="${escapeHtml(itemNames)}">${itemCount} art.</span></td>
        <td><b>${money(o.totals ? o.totals.total : 0)}</b></td>
        <td>${expiry}</td>
        <td><select class="select status-sel" data-order="${o.id}" style="height:36px;width:auto;font-size:.82rem">
          ${['pending', 'paid', 'ship', 'done', 'cancel'].map(s => `<option value="${s}" ${o.status === s ? 'selected' : ''}>${{ pending: 'Pendiente', paid: 'Pagado', ship: 'Enviado', done: 'Entregado', cancel: 'Cancelado' }[s]}</option>`).join('')}
        </select></td>
      </tr>`; }).join('')}</tbody></table></div>`;
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
        <div class="field">
          <label>Imagen del banner (opcional)</label>
          <div class="row gap-12" style="align-items:center">
            <img id="bannerPreview" alt="" style="width:80px;height:54px;object-fit:cover;border-radius:8px;border:1px solid var(--border);display:none">
            <button type="button" class="btn btn-outline btn-sm" id="bannerImgUpload">${icon('image')} Subir imagen</button>
            <input type="file" accept="image/*" id="bannerImgFile" hidden>
          </div>
        </div>
        <button class="btn btn-gold btn-block">Crear banner</button>
      </form>`, (body) => {
        let bImg = '';
        const bUp = CS.qs('#bannerImgUpload', body), bFile = CS.qs('#bannerImgFile', body);
        bUp && bUp.addEventListener('click', () => bFile.click());
        bFile && bFile.addEventListener('change', ev => readFileAsDataURL(ev.target.files[0], d => { bImg = d; const pv = CS.qs('#bannerPreview', body); pv.src = d; pv.style.display = 'block'; }));
        qs('#bannerForm', body).addEventListener('submit', e => {
          e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
          const list = CS.banners(); list.push({ id: uid('b_'), eyebrow: d.eyebrow, title: d.title, text: d.text, cta: d.cta, link: d.link, badge: d.badge, tone: d.tone, icon: 'sparkle', image: bImg });
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

  /* ================= MONEDERO (WALLET) — Admin ================= */
  function walletView(c) {
    const users = CS.users().filter(u => u.role !== 'admin');
    const txs = CS.walletTransactions();
    c.innerHTML = `
      <div class="panel">
        <div class="between mb-16"><h3>${icon('money')} Monedero de usuarios</h3><button class="btn btn-gold btn-sm" id="rechargeBtn">${icon('plus')} Recargar saldo</button></div>
        <p class="muted mb-16">Recarga saldo a cualquier usuario registrado. El saldo se puede usar para comprar productos digitales.</p>
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>Usuario</th><th>Correo</th><th>Saldo actual</th></tr></thead>
          <tbody>${users.length ? users.map(u => `<tr>
            <td><b>${escapeHtml(u.name)}</b></td>
            <td class="muted">${escapeHtml(u.email)}</td>
            <td><b class="gold-text">${money(CS.walletBalance(u.email))}</b></td>
          </tr>`).join('') : '<tr><td colspan="3" class="muted">No hay usuarios registrados.</td></tr>'}</tbody>
        </table></div>
      </div>
      <div class="panel">
        <h3 class="mb-16">Historial de transacciones</h3>
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>Fecha</th><th>Usuario</th><th>Tipo</th><th>Monto</th><th>Nota</th></tr></thead>
          <tbody>${txs.slice(0, 30).map(t => `<tr>
            <td>${new Date(t.date).toLocaleDateString('es-CO')}</td>
            <td class="muted">${escapeHtml(t.email)}</td>
            <td><span class="status-pill ${t.type === 'recharge' ? 'done' : 'pending'}">${t.type === 'recharge' ? 'Recarga' : 'Compra'}</span></td>
            <td><b style="color:${t.amount > 0 ? 'var(--success)' : 'var(--danger)'}">${t.amount > 0 ? '+' : ''}${money(Math.abs(t.amount))}</b></td>
            <td class="muted">${escapeHtml(t.note || t.reason || '')}</td>
          </tr>`).join('') || '<tr><td colspan="5" class="muted">Sin transacciones.</td></tr>'}</tbody>
        </table></div>
      </div>`;
    qs('#rechargeBtn').addEventListener('click', () => {
      openModal('Recargar saldo', `<form id="rechargeForm">
        <div class="field"><label>Correo del usuario <span class="req">*</span></label>
          <select class="select" name="email">${users.map(u => `<option value="${u.email}">${escapeHtml(u.name)} (${escapeHtml(u.email)})</option>`).join('')}</select>
        </div>
        <div class="field"><label>Monto a recargar <span class="req">*</span></label><input class="input" type="number" name="amount" min="1" required placeholder="Ej: 50000"></div>
        <div class="field"><label>Nota (opcional)</label><input class="input" name="note" placeholder="Motivo de la recarga"></div>
        <button class="btn btn-gold btn-block btn-lg">Recargar</button>
      </form>`, (body) => {
        qs('#rechargeForm', body).addEventListener('submit', e => {
          e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
          if (CS.walletRecharge(d.email, +d.amount, d.note)) {
            CS.toast('Recarga exitosa', money(+d.amount) + ' a ' + d.email, 'success');
            closeModal(); renderSection('wallet');
          }
        });
      });
    });
  }

  /* ================= PRODUCTOS DIGITALES — Admin ================= */
  function digitalView(c) {
    const list = CS.digitalProducts();
    c.innerHTML = `
      <div class="panel">
        <div class="between mb-16"><h3>${icon('chip')} Productos digitales (${list.length})</h3><button class="btn btn-gold btn-sm" id="newDigital">${icon('plus')} Nuevo producto digital</button></div>
        <p class="muted mb-16">Crea productos digitales (códigos, licencias, PINs, etc.). Cada vez que un usuario compra, se descuenta un código del inventario automáticamente.</p>
        <div class="table-wrap"><table class="data-table">
          <thead><tr><th>Producto</th><th>Precio</th><th>Duración</th><th>Stock disponible</th><th>Vendidos</th><th>Acciones</th></tr></thead>
          <tbody>${list.length ? list.map(dp => `<tr>
            <td><b>${escapeHtml(dp.name)}</b><div class="muted" style="font-size:.76rem">${escapeHtml(dp.category)}</div></td>
            <td><b>${money(dp.price)}</b></td>
            <td>${dp.duration || 30} días</td>
            <td><span class="status-pill ${dp.items.length === 0 ? 'cancel' : dp.items.length <= 3 ? 'pending' : 'done'}">${dp.items.length} und</span></td>
            <td>${(dp.sold || []).length}</td>
            <td><div class="row gap-8">
              <button class="icon-btn" data-edit-dp="${dp.id}" style="width:34px;height:34px">${CS.ICONS.edit}</button>
              <button class="icon-btn" data-del-dp="${dp.id}" style="width:34px;height:34px">${CS.ICONS.trash}</button>
            </div></td>
          </tr>`).join('') : '<tr><td colspan="5" class="muted">No hay productos digitales. Crea el primero.</td></tr>'}</tbody>
        </table></div>
      </div>`;
    qs('#newDigital').addEventListener('click', () => digitalForm());
    qsa('[data-edit-dp]').forEach(b => b.addEventListener('click', () => digitalForm(b.dataset.editDp)));
    qsa('[data-del-dp]').forEach(b => b.addEventListener('click', () => {
      if (!confirm('¿Eliminar este producto digital?')) return;
      CS.deleteDigitalProduct(b.dataset.delDp);
      CS.toast('Producto eliminado', '', 'info'); renderSection('digital');
    }));
  }

  function digitalForm(id) {
    const dp = id ? CS.digitalProductById(id) : { id: '', name: '', category: 'digital', price: 0, desc: '', items: [], image: '' };
    const itemsText = (dp.items || []).join('\n');
    openModal(id ? 'Editar producto digital' : 'Nuevo producto digital', `
      <form id="dpForm">
        <div class="field"><label>Nombre del producto <span class="req">*</span></label><input class="input" name="name" required value="${escapeHtml(dp.name)}"></div>
        <div class="form-grid">
          <div class="field"><label>Categoría</label><input class="input" name="category" value="${escapeHtml(dp.category)}" placeholder="digital, pin, licencia..."></div>
          <div class="field"><label>Precio <span class="req">*</span></label><input class="input" type="number" name="price" required value="${dp.price}"></div>
          <div class="field"><label>Duración (días)</label><select class="select" name="duration"><option value="30" ${(dp.duration || 30) === 30 ? 'selected' : ''}>30 días</option><option value="60" ${dp.duration === 60 ? 'selected' : ''}>60 días</option><option value="90" ${dp.duration === 90 ? 'selected' : ''}>90 días</option><option value="365" ${dp.duration === 365 ? 'selected' : ''}>365 días</option></select></div>
        </div>
        <div class="field"><label>Descripción</label><textarea class="textarea" name="desc">${escapeHtml(dp.desc)}</textarea></div>
        <div class="field">
          <label>Códigos / Licencias / PINs (uno por línea)</label>
          <textarea class="textarea" name="items" style="min-height:140px;font-family:monospace" placeholder="ABC-123-XYZ&#10;DEF-456-UVW&#10;GHI-789-RST">${escapeHtml(itemsText)}</textarea>
          <small class="muted">Cada línea es un código que se entregará al comprador. Al venderse, se elimina del inventario.</small>
        </div>
        <button class="btn btn-gold btn-block btn-lg">${id ? 'Guardar cambios' : 'Crear producto'}</button>
      </form>`, (body) => {
      qs('#dpForm', body).addEventListener('submit', e => {
        e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
        const items = (d.items || '').split('\n').map(l => l.trim()).filter(Boolean);
        CS.addDigitalProduct({ id: dp.id || undefined, name: d.name, category: d.category, price: +d.price, duration: +d.duration, desc: d.desc, items, sold: dp.sold || [], image: dp.image });
        CS.toast(id ? 'Producto actualizado' : 'Producto creado', d.name, 'success');
        closeModal(); renderSection('digital');
      });
    });
  }

  /* ================= AJUSTES ================= */
  function settingsView(c) {
    c.innerHTML = `<div class="panel" style="max-width:600px">
      <h3 class="mb-16">Ajustes de la tienda</h3>
      <div class="field"><label>Número de WhatsApp para pedidos</label><input class="input" value="${CS.WHATSAPP_NUMBER}" disabled style="opacity:.7"></div>
      <p class="muted" style="font-size:.82rem">Cámbialo desde <a href="#appearance" class="gold-text">Personalización → Marca y logo</a>.</p>
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
