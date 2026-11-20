/* 鲜知 FreshSense · 冰箱显示屏交互 */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const content = $('#screen-content');
  const nav = $('#screen-nav');
  const modalRoot = $('#modal-root');
  const toastRoot = $('#toast-root');

  const TABS = [
    { key: 'home', icon: '⌂', label: '总览' },
    { key: 'fridge', icon: '▦', label: '食材' },
    { key: 'recipes', icon: '◔', label: '食谱' },
    { key: 'restock', icon: '⌘', label: '补货' },
    { key: 'device', icon: '⚙', label: '设置' }
  ];

  const FOOD_DICT = [
    { name: '鲜鸡蛋', unit: '枚', days: 10, alias: ['鸡蛋', '蛋'] },
    { name: '全脂牛奶', unit: '盒', days: 8, alias: ['牛奶', '纯牛奶'] },
    { name: '原味酸奶', unit: '杯', days: 7, alias: ['酸奶'] },
    { name: '吐司面包', unit: '袋', days: 7, alias: ['吐司', '面包'] },
    { name: '三文鱼', unit: '块', days: 4, alias: ['三文鱼', '鱼'] },
    { name: '豆腐', unit: '盒', days: 5, alias: ['豆腐'] },
    { name: '鸡胸肉', unit: '块', days: 3, alias: ['鸡胸肉', '鸡肉'] },
    { name: '西兰花', unit: '颗', days: 6, alias: ['西兰花', '花椰菜'] },
    { name: '番茄', unit: '个', days: 5, alias: ['番茄', '西红柿'] },
    { name: '红苹果', unit: '个', days: 12, alias: ['苹果'] },
    { name: '胡萝卜', unit: '根', days: 10, alias: ['胡萝卜'] },
    { name: '生菜', unit: '颗', days: 4, alias: ['生菜', '青菜'] },
    { name: '蓝莓', unit: '盒', days: 6, alias: ['蓝莓'] },
    { name: '柠檬', unit: '个', days: 12, alias: ['柠檬'] },
    { name: '速冻水饺', unit: '袋', days: 90, alias: ['水饺', '饺子'] },
    { name: '冰淇淋', unit: '盒', days: 90, alias: ['冰淇淋', '雪糕'] }
  ];

  let filterLayer = 'all';
  let query = '';
  let addMode = 'photo';
  let addBatch = false;
  let voiceRecognition = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  function currentLayers() {
    const m = FRIDGE_MODELS.find(x => x.key === STATE.fridgeModel) || FRIDGE_MODELS[0];
    return m.layers;
  }
  function currentModel() {
    return FRIDGE_MODELS.find(x => x.key === STATE.fridgeModel) || FRIDGE_MODELS[0];
  }
  function layerIcon(layer) {
    if (layer.includes('冷冻')) return '❄️';
    if (layer === '果蔬抽屉') return '🥬';
    return '🧊';
  }
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    toastRoot.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
  function renderNav() {
    const page = STATE.appPage;
    nav.innerHTML = TABS.map(t => `<button class="nav-btn ${page === t.key ? 'active' : ''}" data-nav="${t.key}"><span class="nav-ico">${t.icon}</span><span>${t.label}</span></button>`).join('') +
      '<div class="nav-foot">碰一碰同步<br/>食材实时可见</div>';
  }
  function render() {
    const p = STATE.appPage;
    let html = '';
    if (p === 'home') html = pageHome();
    else if (p === 'fridge') html = pageFridge();
    else if (p === 'recipes') html = pageRecipes();
    else if (p === 'restock') html = pageRestock();
    else if (p === 'device') html = pageDevice();
    content.innerHTML = `<div class="page-enter">${html}</div>`;
    content.scrollTop = 0;
    renderNav();
    if (p === 'restock' && !STATE.autoRestockAsked) {
      STATE.autoRestockAsked = true;
      setTimeout(showAutoRestock, 120);
    }
  }
  function go(page) { STATE.appPage = page; render(); }

  /* ---------- 页面 ---------- */
  function zoneCard(layer) {
    const its = ITEMS.filter(i => i.layer === layer);
    const urgent = its.filter(i => i.remainingDays <= 2).length;
    const bar = its.map(i => `<i class="${i.freshness}"></i>`).join('') || '<i></i>';
    const foods = its.slice(0, 3).map(i => `<span>${i.icon}</span>`).join('');
    return `<button class="zone-card ${layer.includes('冷冻') ? 'cold' : ''}" data-action="zone" data-layer="${esc(layer)}">
      <div class="zone-top"><span class="zone-ico">${layerIcon(layer)}</span>${esc(layer)}</div>
      <div class="zone-temp">${esc((LAYER_META[layer] || {}).temp || '')}</div>
      <div class="zone-foods">${foods || '<span>这一层还空着</span>'}</div>
      <div class="zone-foot"><span class="mini-bar">${bar}</span><span class="zone-count">${its.length} 件</span>${urgent ? `<span class="zone-urgent">${urgent} 急</span>` : ''}</div>
    </button>`;
  }
  function fridgeVisual() {
    const layers = currentLayers();
    const fresh = layers.filter(l => !l.includes('冷冻'));
    const cold = layers.filter(l => l.includes('冷冻'));
    const seg = layer => {
      const its = ITEMS.filter(i => i.layer === layer);
      const bar = its.map(i => `<i class="${i.freshness}"></i>`).join('') || '<i></i>';
      return `<button class="fridge-seg ${layer.includes('冷冻') ? 'cold' : ''}" data-action="zone" data-layer="${esc(layer)}">
        <span class="fs-ico">${layerIcon(layer)}</span><span class="fs-name">${esc(layer)}</span><span class="fs-count">${its.length}</span><span class="fs-bar">${bar}</span>
      </button>`;
    };
    const urgent = ITEMS.filter(i => i.remainingDays <= 2).sort((a, b) => a.remainingDays - b.remainingDays).slice(0, 3);
    return `<section class="panel visual-panel">
      <div class="panel-head"><h2>冰箱实时视图</h2><span class="hint">点选分区查看</span></div>
      <div class="fridge-illustration">
        <div class="fridge-shell">
          <div class="fridge-zone-label">冷藏区 · 2~8℃</div>
          <div class="fridge-top">${fresh.map(seg).join('')}</div>
          <div class="fridge-divider"></div>
          <div class="fridge-zone-label cold">冷冻区 · -18℃</div>
          <div class="fridge-bottom">${cold.map(seg).join('')}</div>
          <div class="fridge-handle"></div>
        </div>
      </div>
      <div class="food-strip-title">优先吃掉</div>
      <div class="food-card-row">${urgent.map(i => `<div class="food-card"><span>${i.icon}</span><b>${esc(i.name)}</b><small>${i.remainingDays === 0 ? '已过期' : '还剩 ' + i.remainingDays + ' 天'}</small></div>`).join('') || '<div class="hint">没有快到期食材</div>'}</div>
    </section>`;
  }
  function expiryWindows() {
    return [
      { d: 0, label: '已过期', test: i => i.remainingDays === 0 },
      { d: 1, label: '1天内', test: i => i.remainingDays === 1 },
      { d: 2, label: '2天内', test: i => i.remainingDays >= 1 && i.remainingDays <= 2 },
      { d: 3, label: '3天内', test: i => i.remainingDays >= 1 && i.remainingDays <= 3 }
    ];
  }
  function expiryItems() {
    const pool = ITEMS.filter(i => i.remainingDays >= 0 && i.remainingDays <= 3);
    const w = expiryWindows().find(x => x.d === STATE.expiryDay) || expiryWindows()[3];
    return pool.filter(w.test).sort((a, b) => a.remainingDays - b.remainingDays);
  }
  function pageHome() {
    const layers = currentLayers();
    const fresh = layers.filter(l => !l.includes('冷冻'));
    const cold = layers.filter(l => l.includes('冷冻'));
    const soon = ITEMS.filter(i => i.remainingDays >= 0 && i.remainingDays <= 3).length;
    const list = expiryItems().slice(0, 4);
    return `<div class="page-head"><div><h1>早上好，今天想吃些什么</h1><p>冰箱里有 ${ITEMS.length} 件食材 · ${soon} 件建议优先吃掉</p></div><button class="btn btn-primary" data-action="add-open">＋ 录入食材</button></div>
      <div class="grid-home">
        ${fridgeVisual()}
        <section class="panel zones-panel">
          <div class="panel-head"><h2>冰箱分区</h2><button class="link-btn" data-go="fridge">查看全部食材 ›</button></div>
          <div class="model-banner"><div><strong>🧊 ${esc(currentModel().name)}</strong><small>${layers.length} 个分区 · 冷藏与冷冻已区分</small></div><button class="link-btn" data-action="model">更换 / 拍照识别 ›</button></div>
          ${fresh.length ? `<div class="zone-group"><div class="zone-group-title"><i></i>冷藏区 · 2~8℃</div><div class="zone-grid">${fresh.map(zoneCard).join('')}</div></div>` : ''}
          ${cold.length ? `<div class="zone-group cold"><div class="zone-group-title"><i></i>冷冻区 · -18℃</div><div class="zone-grid">${cold.map(zoneCard).join('')}</div></div>` : ''}
        </section>
        <section class="panel expiry-panel">
          <div class="panel-head"><h2>到期提醒</h2><span class="hint">${soon} 件</span></div>
          <div class="expiry-tabs">${expiryWindows().map(w => `<button class="expiry-tab ${STATE.expiryDay === w.d ? 'active' : ''}" data-action="expiry-day" data-day="${w.d}">${w.label}</button>`).join('')}</div>
          ${list.length ? list.map(i => `<div class="expiry-row"><span class="expiry-emoji">${i.icon}</span><span class="expiry-name">${esc(i.name)}</span><span class="expiry-days ${i.freshness}">${i.remainingDays === 0 ? '已过期' : '还剩 ' + i.remainingDays + ' 天'}</span></div>`).join('') : '<div class="hint">这个范围内没有食材</div>'}
          ${expiryItems().length > 4 ? `<button class="link-btn" data-action="expiry-all">查看全部 ${expiryItems().length} 件 ›</button>` : ''}
        </section>
        <section class="panel recipe-panel">
          <div class="panel-head"><h2>今天吃什么</h2><span class="hint">用户想吃什么就做什么</span></div>
          <button class="today-card" data-action="dish-modal" style="width:100%;border:0;text-align:left">
            <span class="today-orb">🍳</span><div><strong>输入任意菜名，帮你对照冰箱</strong><p>冰箱食材只用来帮你省事，不替你换菜</p></div><span class="arrow">›</span>
          </button>
        </section>
      </div>`;
  }
  function pageFridge() {
    const layers = currentLayers();
    const shownLayers = filterLayer === 'all' ? layers : layers.filter(l => l === filterLayer);
    let items = ITEMS.filter(i => (filterLayer === 'all' || i.layer === filterLayer) && (!query || i.name.includes(query)));
    return `<div class="page-head"><div><h1>冰箱食材</h1><p>共 ${ITEMS.length} 件 · ${layers.length} 个分区 · 实时同步</p></div><button class="btn btn-primary" data-action="add-open">＋ 录入食材</button></div>
      <div class="toolbar"><input id="search" class="search" placeholder="搜索食材名称" value="${esc(query)}" />
        <button class="chip ${filterLayer === 'all' ? 'active' : ''}" data-filter="all">全部分区</button>
        ${layers.map(l => `<button class="chip ${filterLayer === l ? 'active' : ''}" data-filter="${esc(l)}">${esc(l)}</button>`).join('')}
      </div>
      ${shownLayers.map(layer => {
        const its = items.filter(i => i.layer === layer);
        if (!its.length) return '';
        return `<div class="section"><h3 class="section-title">${layerIcon(layer)} ${esc(layer)} <span class="hint">${its.length} 件</span></h3>
          <div class="item-grid">${its.map(i => `<button class="item-card" data-action="item" data-id="${i.id}">
            <div class="item-name">${i.icon} ${esc(i.name)} <span class="pill ${i.freshness}">${i.remainingDays === 0 ? '过期' : i.remainingDays + '天'}</span></div>
            <div class="item-meta">${i.quantity}${esc(i.unit)} · 保质至 ${esc(i.expiryDate)}</div>
            <div class="item-bar"><i class="${i.freshness}" style="width:${i.freshPct}%"></i></div>
          </button>`).join('')}</div></div>`;
      }).join('') || '<div class="panel">没有找到匹配的食材</div>'}`;
  }
  function pageRecipes() {
    return `<div class="page-head"><div><h1>今日食谱</h1><p>优先用掉快到期的食材</p></div><button class="btn btn-primary" data-action="dish-modal">🍳 今天吃什么</button></div>
      <div class="recipe-grid">${RECIPES.map(r => `<button class="recipe-card" data-action="recipe" data-id="${r.id}">
        <div class="recipe-thumb" style="background:${r.thumb}">${r.emoji}</div>
        <div class="recipe-body"><h3>${esc(r.name)}</h3><p>⏱ ${r.minutes} 分钟 · ${r.ingredients.length} 样食材</p>
        ${r.expiring.length ? `<div class="recipe-tip">能用掉快到期的：${r.expiring.map(esc).join('、')}</div>` : ''}</div>
      </button>`).join('')}</div>`;
  }
  function pageRestock() {
    const pending = STATE.restock.filter(r => r.status === '待补').length;
    return `<div class="page-head"><div><h1>补货清单</h1><p>冰箱里缺的都在这里，买完回来更新</p></div><div style="display:flex;gap:8px"><button class="btn btn-ghost" data-action="cart-open">购物车 ${STATE.cart.length}</button><button class="btn btn-primary" data-action="pupu">去朴朴采购 ›</button></div></div>
      <div class="panel">${STATE.restock.map(r => {
        const checked = STATE.checked.has(r.id);
        return `<div class="restock-row"><div class="restock-check ${checked ? 'on' : ''}" data-action="restock-toggle" data-id="${r.id}">${checked ? '✓' : ''}</div>
          <div class="flex"><div class="restock-name">${esc(r.name)}</div><div class="restock-meta">建议 ${r.suggestQty}${esc(r.unit)} · ${esc(r.source)}</div></div>
          <span class="restock-status">${r.status === '已加购' ? '已加购' : r.status === '暂不补货' ? '暂不补货' : '待补'}</span></div>`;
      }).join('')}</div>
      <div class="summary-bar"><span>还有 <b>${pending}</b> 项待补 · 勾选后可一次加购</span><button class="btn btn-primary" data-action="restock-add">勾选加入购物车</button></div>`;
  }
  function pageDevice() {
    const d = STATE.device;
    return `<div class="page-head"><div><h1>设备与设置</h1><p>冰箱屏状态 · 分区结构 · 连接</p></div></div>
      <div class="setting-grid">
        <div class="setting-card"><h3>${esc(d.name)}</h3><p>${esc(d.model)} · ${d.online ? '在线' : '离线'} · 电量 ${d.battery}%</p><p>固件 ${esc(d.firmware)} · Wi-Fi ${esc(d.wifi)}</p></div>
        <div class="setting-card"><h3>冰箱分区</h3><p>${esc(currentModel().name)} · ${currentLayers().length} 个分区</p><button class="btn btn-ghost" data-action="model" style="margin-top:10px">更换型号 / 拍照识别</button></div>
        <div class="setting-card"><h3>碰一碰</h3><p>${d.nfcBound ? '已开启 · 手机靠近感应区即可同步' : '未开启'}</p><div class="switch ${d.nfcBound ? 'on' : ''}" data-action="toggle-nfc"></div></div>
        <div class="setting-card"><h3>配对引导</h3><p>屏幕电源键 → 二维码 → NFC 感应区</p><button class="btn btn-ghost" data-action="pair" style="margin-top:10px">查看配对步骤</button></div>
      </div>`;
  }

  /* ---------- 弹窗 ---------- */
  function openModal(inner) {
    modalRoot.innerHTML = `<div class="modal-overlay" data-close="1"><div class="modal-card">${inner}</div></div>`;
  }
  function closeModal() { stopVoice(); modalRoot.innerHTML = ''; }
  function modalHead(icon, title, sub) {
    return `<div class="modal-head"><div class="modal-icon">${icon}</div><div><h3>${esc(title)}</h3><p>${esc(sub)}</p></div><button class="close-x" data-action="close">×</button></div>`;
  }
  function showZoneModal(layer) {
    const its = ITEMS.filter(i => i.layer === layer);
    openModal(modalHead(layerIcon(layer), layer, (LAYER_META[layer] || {}).temp + ' · 共 ' + its.length + ' 件') +
      `<div class="zone-detail-list">${its.map(i => `<div class="zone-detail-row">
        <span class="zd-ico">${i.icon}</span><span class="zd-name">${esc(i.name)}</span>
        <span class="zd-qty">${i.quantity}${esc(i.unit)}</span>
        <span class="zd-days ${i.freshness}">${i.remainingDays === 0 ? '已过期' : i.remainingDays + ' 天'}</span>
      </div>`).join('')}</div>` +
      '<div class="modal-actions"><button class="btn btn-ghost" data-action="close">关闭</button><button class="btn btn-primary" data-go="fridge">查看全部食材</button></div>');
  }
  function showExpiryModal() {
    const items = expiryItems();
    openModal(modalHead('⏰', '快到期食材', '共 ' + items.length + ' 件，按紧急程度排序') +
      items.map(i => `<div class="detail-row"><span>${i.icon} ${esc(i.name)}</span><span>${i.remainingDays === 0 ? '已过期' : '还剩 ' + i.remainingDays + ' 天'} · ${i.quantity}${esc(i.unit)}</span></div>`).join('') +
      '<div class="modal-actions"><button class="btn btn-primary" data-action="close">知道了</button></div>');
  }
  function showItemModal(id) {
    const i = ITEMS.find(x => x.id === id);
    if (!i) return;
    openModal(modalHead(i.icon, i.name, i.layer) +
      `<div class="detail-row"><span>数量</span><b>${i.quantity}${esc(i.unit)}</b></div>
       <div class="detail-row"><span>保质期至</span><b>${esc(i.expiryDate)}</b></div>
       <div class="detail-row"><span>剩余</span><b>${i.remainingDays === 0 ? '已过期' : i.remainingDays + ' 天'}</b></div>
       <div class="detail-row"><span>来源</span><b>${esc(i.source)}</b></div>
       <div class="modal-actions"><button class="btn btn-ghost" data-action="close">关闭</button><button class="btn btn-primary" data-action="add-restock" data-name="${esc(i.name)}">加入补货清单</button></div>`);
  }
  function showRecipeModal(id) {
    const r = RECIPES.find(x => x.id === id);
    if (!r) return;
    openModal(modalHead(r.emoji, r.name, r.minutes + ' 分钟') +
      `<div class="detail-row"><span>食材</span><span>${r.ingredients.map(x => (x.have ? '✅ ' : '＋ ') + esc(x.name)).join(' · ')}</span></div>` +
      r.steps.map((s, n) => `<div class="detail-row"><span>${n + 1}.</span><span>${esc(s)}</span></div>`).join('') +
      '<div class="modal-actions"><button class="btn btn-primary" data-action="close">完成</button></div>');
  }
  function genericSteps(q) {
    if (/汤|炖|煮/.test(q)) return ['食材洗净切好。', '冷水下锅煮开后转小火。', '加盐调味即可。'];
    if (/炒|煎|炸/.test(q)) return ['食材洗净沥干切好。', '热锅下油炒主料。', '调味炒匀出锅。'];
    return ['食材洗净切配。', '按家常做法加热调味。', '装盘享用。'];
  }
  function resolveDish(q) {
    const all = RECIPES.concat(AI_DISHES);
    let hit = all.find(d => d.name === q);
    if (!hit && q.length >= 2) hit = all.find(d => d.name.includes(q) || q.includes(d.name));
    if (!hit) hit = all.find(d => (d.tags || []).some(t => q.includes(t) || t.includes(q)));
    if (hit) {
      const ingredients = (hit.ingredients || []).map(x => typeof x === 'string' ? x : x.name);
      return { name: hit.name, emoji: hit.emoji || '🍽️', minutes: hit.minutes || 15, ingredients, steps: hit.steps || genericSteps(q) };
    }
    return { name: q, emoji: '🍽️', minutes: 15, ingredients: [], steps: genericSteps(q), custom: true };
  }
  function showDishModal() {
    openModal(modalHead('🍳', '今天吃什么', '想吃什么就输入什么，冰箱食材只用来对照') +
      `<div class="field"><input id="dish-input" placeholder="任意菜名，比如：麻辣香锅、奶油蘑菇汤" /></div>
       <div class="add-tabs">${['番茄炒蛋', '麻辣香锅', '豆腐汤'].map(x => `<button class="add-tab" data-action="dish-quick" data-q="${x}">${x}</button>`).join('')}</div>
       <div class="modal-actions"><button class="btn btn-ghost" data-action="close">取消</button><button class="btn btn-primary" data-action="dish-submit">看看怎么做</button></div>`);
    setTimeout(() => { const el = $('#dish-input'); if (el) el.focus(); }, 60);
  }
  function showDishResult(q) {
    q = String(q || '').trim();
    if (!q) { toast('先说说想吃什么'); return; }
    const dish = resolveDish(q);
    const have = dish.ingredients.filter(n => ITEMS.some(i => i.name === n));
    const need = dish.ingredients.filter(n => !ITEMS.some(i => i.name === n));
    openModal(modalHead(dish.emoji, dish.name, dish.custom ? '按你想的菜整理好了，再对照冰箱' : '按菜名对照了冰箱食材') +
      `<div class="detail-row"><span>用时</span><b>${dish.minutes} 分钟</b></div>
       <div class="detail-row"><span>冰箱已有</span><b>${have.length ? have.map(esc).join('、') : '没找到明确用料'}</b></div>
       <div class="detail-row"><span>建议补货</span><b>${need.length ? need.map(esc).join('、') : '暂时不用补'}</b></div>
       <div class="detail-row"><span>做法</span><span>${dish.steps.map(esc).join(' → ')}</span></div>
       <div class="modal-actions"><button class="btn btn-ghost" data-action="dish-modal">换个菜名</button><button class="btn btn-primary" data-action="close">知道了</button></div>`);
  }
  function parseFoodText(text) {
    const s = String(text || '');
    const found = [];
    FOOD_DICT.forEach(f => {
      const alias = f.alias.find(a => s.includes(a));
      if (!alias) return;
      let qty = 1, unit = f.unit;
      const pos = s.indexOf(alias);
      const before = s.slice(Math.max(0, pos - 4), pos);
      const after = s.slice(pos + alias.length, pos + alias.length + 4);
      const mb = before.match(/(\d+)\s*([个盒枚袋瓶根颗块份只])?\s*$/);
      const ma = after.match(/^\s*(\d+)\s*([个盒枚袋瓶根颗块份只])?/);
      if (mb) { qty = Math.max(1, Math.min(99, +mb[1])); if (mb[2]) unit = mb[2]; }
      else if (ma) { qty = Math.max(1, Math.min(99, +ma[1])); if (ma[2]) unit = ma[2]; }
      let layer = defaultLayerForFood(f.name);
      if (/冷冻|冻层/.test(s) || /冻/.test(f.name)) layer = currentLayers().find(l => l.includes('冷冻')) || layer;
      found.push({ name: f.name, qty, unit, layer, days: f.days });
    });
    return found;
  }
  function addParsed(list, source) {
    const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    list.forEach(p => {
      const ex = ITEMS.find(i => i.name === p.name);
      if (ex) { ex.quantity += p.qty; ex.source = source; return; }
      const d = new Date(TODAY); d.setDate(d.getDate() + p.days);
      ITEMS.push({ id: 'it-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), name: p.name,
        icon: iconForFood(p.name), layer: p.layer, purchaseDate: TODAY, expiryDate: iso(d), remainingDays: p.days,
        freshness: p.days <= 1 ? 'red' : p.days === 2 ? 'yellow' : 'green', freshPct: p.days <= 1 ? 15 : p.days === 2 ? 40 : 90,
        quantity: p.qty, unit: p.unit, source });
    });
    render(); toast(`已录入 ${list.length} 样食材`);
  }
  function addPanelHtml() {
    if (addBatch) {
      if (addMode === 'photo') return `<div class="photo-drop" id="photo-drop">📷 点击选择多张食材照片，一次识别多件</div><input type="file" id="add-photos" accept="image/*" multiple style="display:none" />`;
      return `<div class="field"><textarea id="add-batch-text" rows="6" placeholder="每行写一样：鸡蛋 6枚&#10;牛奶 2盒&#10;番茄 4个"></textarea></div>
        <button class="btn btn-ghost" data-action="add-parse">识别清单</button>`;
    }
    if (addMode === 'manual') return `<div class="field"><label>食材名称</label><input id="m-name" placeholder="如：鸡蛋、牛奶" /><button class="mic-btn" data-action="voice-manual">🎤</button></div>
      <div class="field"><label>所在分区</label><select id="m-layer">${currentLayers().map(l => `<option>${l}</option>`).join('')}</select></div>
      <div class="field"><label>数量 / 单位 / 保质天数</label><input id="m-qty" type="number" value="1" style="width:70px;display:inline-block" /><input id="m-unit" value="份" style="width:70px;display:inline-block" /><input id="m-days" type="number" value="7" style="width:70px;display:inline-block" /></div>`;
    if (addMode === 'text') return `<div class="field"><input id="add-text" placeholder="例如：买了6个鸡蛋和2盒牛奶放冷藏" /><button class="mic-btn" data-action="voice-text">🎤</button></div>
      <button class="btn btn-ghost" data-action="add-parse">识别食材</button>`;
    return `<div class="photo-drop" id="photo-drop">📷 点击选择食材照片</div><input type="file" id="add-photo" accept="image/*" style="display:none" />`;
  }
  function bindAddPanel() {
    const drop = $('#photo-drop');
    if (drop) drop.onclick = () => { const f = $(addBatch ? '#add-photos' : '#add-photo'); if (f) f.click(); };
    const file = $('#add-photo');
    if (file) file.onchange = () => { file.dataset.ready = '1'; drop.textContent = '✅ 已识别：全脂牛奶 1盒 · 吐司面包 1袋'; };
    const files = $('#add-photos');
    if (files) files.onchange = () => { files.dataset.ready = '1'; drop.textContent = '✅ 已识别 3 样食材：鲜鸡蛋 / 全脂牛奶 / 番茄'; };
  }
  function renderAddPanel() {
    const panel = $('#add-panel'); if (!panel) return;
    panel.innerHTML = addPanelHtml();
    $$('.add-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === addMode));
    $$('.batch-seg').forEach(b => b.classList.toggle('active', (b.dataset.batch === 'batch') === addBatch));
    const btn = $('[data-action="add-confirm"]');
    if (btn) btn.textContent = (addBatch || addMode === 'text') ? '识别并入库' : '确认添加';
    bindAddPanel();
  }
  function showAddModal(mode) {
    addMode = mode || 'photo'; addBatch = false;
    openModal(modalHead('🧺', '录入食材', '拍照 / 手动 / 一句话，都支持单件或批量') +
      `<div class="add-tabs"><button class="add-tab" data-action="add-tab" data-mode="photo">📷 拍照</button>
        <button class="add-tab" data-action="add-tab" data-mode="manual">✍️ 手动</button>
        <button class="add-tab" data-action="add-tab" data-mode="text">💬 一句话</button></div>
       <div class="batch-toggle"><button class="batch-seg" data-action="add-batch" data-batch="single">单件</button><button class="batch-seg" data-action="add-batch" data-batch="batch">批量</button></div>
       <div id="add-panel"></div>
       <div class="modal-actions"><button class="btn btn-ghost" data-action="close">取消</button><button class="btn btn-primary" data-action="add-confirm">确认添加</button></div>`);
    renderAddPanel();
  }
  function addConfirm() {
    if (addBatch) {
      if (addMode === 'photo') {
        const f = $('#add-photos');
        if (!f || !f.dataset.ready) { toast('请先选择多张照片'); return; }
        addParsed([{ name: '鲜鸡蛋', qty: 6, unit: '枚', layer: '冷藏室中层', days: 10 },
          { name: '全脂牛奶', qty: 1, unit: '盒', layer: '冷藏室上层', days: 8 },
          { name: '番茄', qty: 4, unit: '个', layer: '果蔬抽屉', days: 5 }], '拍照录入');
      } else {
        const text = ($('#add-batch-text') && $('#add-batch-text').value) || '';
        const list = text.split(/\n+/).map(line => {
          const p = parseFoodText(line)[0];
          if (p) return p;
          const m = line.trim().match(/^(.+?)\s*(\d+)\s*([个盒枚袋瓶根颗块份只])?$/);
          if (!m) return null;
          return { name: m[1].trim(), qty: +m[2], unit: m[3] || '份', layer: defaultLayerForFood(m[1].trim()), days: 7 };
        }).filter(Boolean);
        if (!list.length) { toast('每行写一样食材'); return; }
        addParsed(list, '批量录入');
      }
      closeModal(); return;
    }
    if (addMode === 'photo') {
      const f = $('#add-photo');
      if (!f || !f.dataset.ready) { toast('请先选择一张照片'); return; }
      addParsed([{ name: '全脂牛奶', qty: 1, unit: '盒', layer: '冷藏室上层', days: 8 },
        { name: '吐司面包', qty: 1, unit: '袋', layer: '冷藏室上层', days: 7 }], '拍照录入');
      closeModal(); return;
    }
    if (addMode === 'text') {
      const list = parseFoodText(($('#add-text') && $('#add-text').value) || '');
      if (!list.length) { toast('没识别到食材，试试「6个鸡蛋」'); return; }
      addParsed(list, '语音/一句话'); closeModal(); return;
    }
    const name = ($('#m-name') && $('#m-name').value || '').trim();
    if (!name) { toast('请输入食材名称'); return; }
    addParsed([{ name, qty: +($('#m-qty').value || 1), unit: $('#m-unit').value || '份',
      layer: $('#m-layer').value, days: +($('#m-days').value || 7) }], '手动录入');
    closeModal();
  }
  function stopVoice() {
    if (voiceRecognition) { try { voiceRecognition.stop(); } catch (e) {} voiceRecognition = null; }
    $$('.mic-btn').forEach(b => b.classList.remove('listening'));
  }
  function startVoice(type) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('请用 Chrome / Edge 打开以支持语音识别'); return; }
    stopVoice();
    const rec = new SR(); rec.lang = 'zh-CN'; rec.interimResults = false;
    rec.onstart = () => { $$('.mic-btn').forEach(b => b.classList.add('listening')); toast('正在听，请说出食材'); };
    rec.onresult = e => {
      const text = (e.results[0][0].transcript || '').trim();
      if (!text) return;
      if (type === 'text') { const el = $('#add-text'); if (el) el.value = text; addConfirm(); }
      else { const el = $('#m-name'); if (el) el.value = text; toast('已识别：' + text); }
    };
    rec.onerror = () => toast('语音识别失败，请检查麦克风权限');
    rec.onend = () => { $$('.mic-btn').forEach(b => b.classList.remove('listening')); voiceRecognition = null; };
    voiceRecognition = rec;
    try { rec.start(); } catch (e) { toast('语音识别启动失败'); }
  }
  function showModelModal() {
    openModal(modalHead('🧊', '冰箱型号', '不同冰箱的分区结构不同，可按实际情况选择') +
      FRIDGE_MODELS.map(m => `<button class="model-option ${m.key === STATE.fridgeModel ? 'active' : ''}" data-action="choose-model" data-model="${m.key}"><b>${m.name}</b><span>${m.layers.join(' / ')}</span></button>`).join('') +
      '<label class="photo-drop" for="model-photo">📷 拍照识别冰箱分区</label><input type="file" id="model-photo" accept="image/*" style="display:none" />');
    const f = $('#model-photo');
    if (f) f.onchange = () => { closeModal(); applyModel('multi'); toast('已识别：多门冰箱，冷冻区分上 / 中 / 下三层'); };
  }
  function applyModel(key) {
    const m = FRIDGE_MODELS.find(x => x.key === key); if (!m) return;
    ITEMS.forEach(i => {
      if (!m.layers.includes(i.layer)) {
        if (i.layer.includes('冷冻')) i.layer = m.layers.find(l => l.includes('冷冻')) || i.layer;
        else if (i.layer.startsWith('冷藏')) i.layer = m.layers.includes('冷藏室') ? '冷藏室' : (m.layers.find(l => l.startsWith('冷藏')) || '冷藏室中层');
        else i.layer = m.layers[0];
      }
    });
    STATE.fridgeModel = key; closeModal(); render(); toast('已切换为' + m.name);
  }
  function showPairModal() {
    openModal(modalHead('📡', '碰一碰配对', '让手机与冰箱屏保持同步') +
      [['1', '打开冰箱屏电源键'], ['2', '屏幕显示配对二维码'], ['3', '手机靠近冰箱 NFC 感应区'], ['4', '食材与提醒自动同步']].map(s => `<div class="detail-row"><span>${s[0]}</span><span>${s[1]}</span></div>`).join('') +
      '<div class="modal-actions"><button class="btn btn-primary" data-action="close">完成</button></div>');
  }
  function addToCart(sku, rid) {
    const p = PRODUCTS.find(x => x.sku === sku); if (!p) return;
    const exist = STATE.cart.find(c => c.sku === sku);
    if (exist) exist.qty += 1; else STATE.cart.push({ sku, name: p.name, qty: 1, fromRestockId: rid });
    if (rid) { const r = STATE.restock.find(x => x.id === rid); if (r) r.status = '已加购'; }
  }
  function showAutoRestock() {
    const pending = STATE.restock.filter(r => r.status === '待补').slice(0, 3);
    if (!pending.length) return;
    openModal(modalHead('🛒', '要顺手补货吗？', '这几样常买的可能快用完了') +
      `<div class="detail-row"><span>建议补货</span><b>${pending.map(r => esc(r.name)).join('、')}</b></div>
       <div class="modal-actions"><button class="btn btn-ghost" data-action="auto-manual">我自己补</button><button class="btn btn-primary" data-action="auto-order">自动加购</button></div>`);
  }
  function showCartModal() {
    openModal(modalHead('🛒', '购物车', STATE.cart.length + ' 件商品') +
      (STATE.cart.length ? STATE.cart.map((c, idx) => `<div class="detail-row"><span>${esc(c.name)} × ${c.qty}</span><button class="link-btn" data-action="cart-qty" data-idx="${idx}">＋</button></div>`).join('') : '<div class="detail-row"><span>购物车还是空的</span></div>') +
      '<div class="modal-actions"><button class="btn btn-ghost" data-action="close">继续浏览</button><button class="btn btn-primary" data-action="checkout">确认下单 · 自动入库</button></div>');
  }
  function showPupuModal() {
    openModal(modalHead('🛒', '去朴朴采购', '买完回来点一下，食材自动入库') +
      '<div class="detail-row"><span>采购入口</span><b>朴朴超市</b></div>' +
      '<div class="modal-actions"><button class="btn btn-ghost" data-action="close">取消</button><button class="btn btn-primary" data-action="pupu-done">标记已补齐</button></div>');
  }

  /* ---------- 事件 ---------- */
  document.addEventListener('click', e => {
    if (e.target.hasAttribute && e.target.hasAttribute('data-close')) { closeModal(); return; }
    const navBtn = e.target.closest('[data-nav]');
    if (navBtn) { go(navBtn.dataset.nav); return; }
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) { closeModal(); go(goBtn.dataset.go); return; }
    const filter = e.target.closest('[data-filter]');
    if (filter) { filterLayer = filter.dataset.filter; render(); return; }
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const a = el.dataset.action;
    if (a === 'close') { closeModal(); return; }
    if (a === 'zone') { showZoneModal(el.dataset.layer); return; }
    if (a === 'expiry-day') { STATE.expiryDay = +el.dataset.day; render(); return; }
    if (a === 'expiry-all') { showExpiryModal(); return; }
    if (a === 'item') { showItemModal(el.dataset.id); return; }
    if (a === 'recipe') { showRecipeModal(el.dataset.id); return; }
    if (a === 'dish-modal') { showDishModal(); return; }
    if (a === 'dish-quick') { showDishResult(el.dataset.q); return; }
    if (a === 'dish-submit') { const i = $('#dish-input'); showDishResult(i && i.value); return; }
    if (a === 'add-open' || a === 'add-photo') { showAddModal('photo'); return; }
    if (a === 'add-tab') { addMode = el.dataset.mode; renderAddPanel(); return; }
    if (a === 'add-batch') { addBatch = el.dataset.batch === 'batch'; renderAddPanel(); return; }
    if (a === 'add-parse' || a === 'add-confirm') { addConfirm(); return; }
    if (a === 'voice-quick') { showAddModal('text'); setTimeout(() => startVoice('text'), 120); return; }
    if (a === 'voice-manual') { startVoice('manual'); return; }
    if (a === 'voice-text') { startVoice('text'); return; }
    if (a === 'restock-toggle') {
      const id = el.dataset.id;
      if (STATE.checked.has(id)) STATE.checked.delete(id); else STATE.checked.add(id);
      render(); return;
    }
    if (a === 'add-restock') {
      const name = el.dataset.name;
      if (!STATE.restock.some(r => r.name === name)) STATE.restock.push({ id: 'rs-' + Date.now(), name, suggestQty: 1, unit: '份', source: '手动', status: '待补' });
      closeModal(); go('restock'); toast('已加入补货清单'); return;
    }
    if (a === 'restock-add') {
      const picked = STATE.restock.filter(r => STATE.checked.has(r.id) && r.status === '待补');
      const skuFor = PRODUCT_MAPPING && Object.keys(PRODUCT_MAPPING).find(k => PRODUCT_MAPPING[k] === picked[0]?.name);
      picked.forEach(r => { const sku = Object.keys(PRODUCT_MAPPING).find(k => PRODUCT_MAPPING[k] === r.name); if (sku) addToCart(sku, r.id); });
      render(); toast(picked.length ? `已加购 ${picked.length} 项` : '请先勾选食材'); return;
    }
    if (a === 'auto-manual') { closeModal(); toast('已保留在补货清单'); return; }
    if (a === 'auto-order') {
      STATE.restock.filter(r => r.status === '待补').slice(0, 3).forEach(r => {
        const sku = Object.keys(PRODUCT_MAPPING).find(k => PRODUCT_MAPPING[k] === r.name);
        if (sku) addToCart(sku, r.id);
      });
      closeModal(); render(); toast('已自动加购 3 样食材'); return;
    }
    if (a === 'cart-open') { showCartModal(); return; }
    if (a === 'cart-qty') { const c = STATE.cart[+el.dataset.idx]; if (c) c.qty += 1; showCartModal(); return; }
    if (a === 'checkout') {
      STATE.cart.forEach(c => { const it = purchaseToItem(c.sku); if (it) ITEMS.push(it); });
      STATE.cart = []; closeModal(); go('home'); toast('下单成功，食材已自动入库'); return;
    }
    if (a === 'pupu') { showPupuModal(); return; }
    if (a === 'pupu-done') { closeModal(); go('home'); toast('补货完成，冰箱已更新'); return; }
    if (a === 'model') { showModelModal(); return; }
    if (a === 'choose-model') { applyModel(el.dataset.model); return; }
    if (a === 'pair') { showPairModal(); return; }
    if (a === 'toggle-nfc') { STATE.device.nfcBound = !STATE.device.nfcBound; render(); toast(STATE.device.nfcBound ? '碰一碰已开启' : '碰一碰已关闭'); return; }
    if (a === 'reset') { location.reload(); return; }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'search') {
      query = e.target.value.trim(); render();
      const el = $('#search'); if (el) { el.focus(); el.setSelectionRange(query.length, query.length); }
    }
  });
  render();
})();
