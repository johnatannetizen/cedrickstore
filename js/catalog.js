/* =========================================================================
   CedrickStore — Catálogo (catalog.js)
   Filtros (precio, categoría, marca, rating, disponibilidad), orden,
   vista grid/lista, paginación. Lee parámetros de URL.
   ========================================================================= */
(function () {
  'use strict';
  const { qs, qsa, icon, money, escapeHtml, param } = CS;
  const PER_PAGE = 9;

  const state = {
    q: param('q') || '',
    cat: param('cat') ? [param('cat')] : [],
    brand: param('brand') ? [param('brand')] : [],
    min: null, max: null,
    inStock: false,
    onSale: param('filter') === 'sale',
    minRating: 0,
    sort: param('sort') || 'relevance',
    view: CS.store.get('cs_view', 'grid'),
    page: 1
  };

  /* ---------- Inyectar íconos en botones de la toolbar ---------- */
  function setupIcons() {
    qs('#openFilters') && (qs('#openFilters .ico').innerHTML = CS.ICONS.filter);
    const vt = qs('#viewToggle');
    if (vt) {
      vt.querySelector('[data-view="grid"]').innerHTML = CS.ICONS.grid;
      vt.querySelector('[data-view="list"]').innerHTML = CS.ICONS.list;
    }
  }

  /* ---------- Construir filtros ---------- */
  function buildFilters() {
    const all = CS.products();
    const catCounts = {}, brandCounts = {};
    all.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1; });

    qs('#filterCats').innerHTML = CS.categories().map(c =>
      `<label class="check"><input type="checkbox" value="${c.id}" class="f-cat" ${state.cat.includes(c.id) ? 'checked' : ''}> ${escapeHtml(c.name)} <span class="cnt">${catCounts[c.id] || 0}</span></label>`).join('');

    qs('#filterBrands').innerHTML = CS.brands().map(b =>
      `<label class="check"><input type="checkbox" value="${b.id}" class="f-brand" ${state.brand.includes(b.id) ? 'checked' : ''}> ${escapeHtml(b.name)} <span class="cnt">${brandCounts[b.id] || 0}</span></label>`).join('');

    qs('#filterRating').innerHTML = [4, 3, 2].map(r =>
      `<label class="check"><input type="radio" name="frating" value="${r}" class="f-rating"> ${CS.stars(r)} <span style="margin-left:4px">y más</span></label>`).join('') +
      `<label class="check"><input type="radio" name="frating" value="0" class="f-rating" checked> Todas</label>`;

    // listeners
    qsa('.f-cat').forEach(c => c.addEventListener('change', () => { state.cat = qsa('.f-cat:checked').map(x => x.value); state.page = 1; render(); }));
    qsa('.f-brand').forEach(c => c.addEventListener('change', () => { state.brand = qsa('.f-brand:checked').map(x => x.value); state.page = 1; render(); }));
    qsa('.f-rating').forEach(c => c.addEventListener('change', () => { state.minRating = +qs('.f-rating:checked').value; state.page = 1; render(); }));
    qs('#fInStock').addEventListener('change', e => { state.inStock = e.target.checked; state.page = 1; render(); });
    qs('#fOnSale').checked = state.onSale;
    qs('#fOnSale').addEventListener('change', e => { state.onSale = e.target.checked; state.page = 1; render(); });

    const pmin = qs('#priceMin'), pmax = qs('#priceMax'), range = qs('#priceRange'), rangeVal = qs('#priceRangeVal');
    const maxPrice = Math.max(...all.map(p => p.price), 2000000);
    range.max = Math.ceil(maxPrice / 100000) * 100000; range.value = range.max;
    const applyPrice = CS.debounce(() => {
      state.min = pmin.value ? +pmin.value : null;
      state.max = pmax.value ? +pmax.value : null;
      state.page = 1; render();
    }, 350);
    pmin.addEventListener('input', applyPrice);
    pmax.addEventListener('input', applyPrice);
    range.addEventListener('input', () => {
      rangeVal.textContent = money(+range.value);
      pmax.value = range.value; state.max = +range.value; state.page = 1;
      CS.debounce(render, 200)();
    });
  }

  /* ---------- Render ---------- */
  function render() {
    const list = CS.filterProducts(state);
    const grid = qs('#catalogGrid');
    grid.className = 'product-grid' + (state.view === 'list' ? ' list-view' : '');

    // título dinámico
    let title = 'Catálogo de productos';
    if (state.q) title = 'Resultados para "' + state.q + '"';
    else if (state.cat.length === 1) title = CS.categoryName(state.cat[0]);
    else if (state.brand.length === 1) title = CS.brandName(state.brand[0]);
    else if (state.onSale) title = 'Ofertas especiales';
    qs('#catalogTitle').textContent = title;
    qs('#crumbCat').textContent = title;

    qs('#resultCount').innerHTML = `<b>${list.length}</b> producto${list.length !== 1 ? 's' : ''} encontrado${list.length !== 1 ? 's' : ''}`;

    const pages = Math.ceil(list.length / PER_PAGE) || 1;
    if (state.page > pages) state.page = pages;
    const slice = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);
    CS.renderGrid(grid, slice);
    renderPagination(pages);
  }

  function renderPagination(pages) {
    const pag = qs('#pagination');
    if (pages <= 1) { pag.innerHTML = ''; return; }
    let html = `<button ${state.page === 1 ? 'disabled' : ''} data-pg="${state.page - 1}">${CS.ICONS.chevL}</button>`;
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) {
        html += `<button class="${i === state.page ? 'active' : ''}" data-pg="${i}">${i}</button>`;
      } else if (Math.abs(i - state.page) === 2) {
        html += `<button disabled>…</button>`;
      }
    }
    html += `<button ${state.page === pages ? 'disabled' : ''} data-pg="${state.page + 1}">${CS.ICONS.chevR}</button>`;
    pag.innerHTML = html;
    qsa('#pagination button[data-pg]').forEach(b => b.addEventListener('click', () => {
      const pg = +b.dataset.pg; if (pg < 1 || pg > pages) return;
      state.page = pg; render();
      window.scrollTo({ top: qs('.page-head').offsetHeight, behavior: 'smooth' });
    }));
  }

  /* ---------- Toolbar ---------- */
  function setupToolbar() {
    const sort = qs('#sortSelect');
    sort.value = state.sort;
    sort.addEventListener('change', () => { state.sort = sort.value; state.page = 1; render(); });

    qsa('#viewToggle button').forEach(b => b.addEventListener('click', () => {
      qsa('#viewToggle button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.view = b.dataset.view; CS.store.set('cs_view', state.view); render();
    }));
    qs('#viewToggle [data-view="' + state.view + '"]').classList.add('active');
    qs('#viewToggle [data-view="' + (state.view === 'grid' ? 'list' : 'grid') + '"]').classList.remove('active');

    qs('#clearFilters').addEventListener('click', () => {
      state.cat = []; state.brand = []; state.min = state.max = null; state.inStock = false; state.onSale = false; state.minRating = 0; state.q = ''; state.page = 1;
      qsa('.f-cat,.f-brand').forEach(c => c.checked = false);
      qs('#fInStock').checked = false; qs('#fOnSale').checked = false;
      qs('#priceMin').value = ''; qs('#priceMax').value = '';
      qs('.f-rating[value="0"]').checked = true;
      render();
    });

    // filtros móviles
    const panel = qs('#filtersPanel');
    qs('#openFilters').addEventListener('click', () => { panel.classList.add('mobile-open'); qs('#applyFiltersMobile').style.display = ''; document.body.style.overflow = 'hidden'; });
    qs('#applyFiltersMobile').addEventListener('click', e => { e.preventDefault(); panel.classList.remove('mobile-open'); document.body.style.overflow = ''; });
  }

  setupIcons();
  buildFilters();
  setupToolbar();
  render();
})();
