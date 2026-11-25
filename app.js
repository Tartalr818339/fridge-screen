/* 鲜知 FreshSense · 冰箱显示屏交互 */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const content = $('#screen-content');
  const nav = $('#screen-nav');
  const modalRoot = $('#modal-root');
  const toastRoot = $('#toast-root');

  const ico = path => `<svg viewBox="0 0 24 24" fill-rule="evenodd" aria-hidden="true" focusable="false">${path}</svg>`;
  const TABS = [
    { key: 'home', icon: ico('<path d="M12 2 2 11h3v10h6v-6h2v6h6V11h3L12 2z"/>'), label: '总览' },
    { key: 'fridge', icon: ico('<path d="M5 2h14a2 2 0 0 1 2 2v5H3V4a2 2 0 0 1 2-2zm0 9h14v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z"/>'), label: '食材' },
    { key: 'recipes', icon: ico('<path d="M3 11h18a1 1 0 0 1 1 1c0 4.4-4.5 8-10 8S2 16.4 2 12a1 1 0 0 1 1-1zm5-8h2v7H8V3zm4 0h2v7h-2V3z"/>'), label: '食谱' },
    { key: 'restock', icon: ico('<path d="M2 3h2.6l1 3.5h14.1l-2.3 8.5H7.2L6.5 18h11.8v2H5.2a2 2 0 0 1-2-2L2 3zm4.5 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9.5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>'), label: '补货' },
    { key: 'device', icon: ico('<path d="M19.4 13a7.8 7.8 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L15 3.5h-4l-.4 2.4a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.8 7.8 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.6 7.6 0 0 0 1.7 1l.4 2.4h4l.4-2.4a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.5L19.4 13zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/>'), label: '设置' }
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
  let homeRecipeIndex = 0;

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
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    toastRoot.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }
  function renderNav() {
    const page = STATE.appPage;
    nav.innerHTML = TABS.map(t => `<button class="nav-btn ${page === t.key ? 'active' : ''}" data-nav="${t.key}"><span class="nav-ico">${t.icon}</span><span>${t.label}</span></button>`).join('');
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
  function urgentItems() {
    return ITEMS.filter(i => i.remainingDays >= 0 && i.remainingDays <= 2)
      .sort((a, b) => a.remainingDays - b.remainingDays);
  }
  function homeVisual() {
    const layers = currentLayers();
    const fresh = layers.filter(l => !l.includes('冷冻'));
    const cold = layers.filter(l => l.includes('冷冻'));
    const seg = layer => {
      const its = ITEMS.filter(i => i.layer === layer);
      const tone = its.some(i => i.remainingDays <= 1) ? 'red'
        : its.some(i => i.remainingDays <= 2) ? 'yellow'
        : its.length ? 'green' : 'empty';
      return `<button class="fridge-seg ${layer.includes('冷冻') ? 'cold' : ''}" data-action="zone" data-layer="${esc(layer)}">
        <span class="fs-ico">${layerIcon(layer)}</span><span class="fs-name">${esc(layer)}</span>
        <span class="fs-count">${its.length}</span><span class="fs-dot ${tone}"></span>
      </button>`;
    };
    return `<section class="panel home-visual">
      <div class="panel-head"><h2>冰箱一览</h2><span class="hint">点分区看详情</span></div>
      <div class="fridge-illustration">
        <div class="fridge-shell">
          <div class="fridge-zone-label">冷藏 · 2~8℃</div>
          <div class="fridge-top">${fresh.map(seg).join('')}</div>
          <div class="fridge-divider"></div>
          <div class="fridge-zone-label cold">冷冻 · -18℃</div>
          <div class="fridge-bottom">${cold.map(seg).join('')}</div>
          <div class="fridge-handle"></div>
        </div>
      </div>
      <div class="visual-legend"><span><i class="dot green"></i>新鲜</span><span><i class="dot yellow"></i>2 天内</span><span><i class="dot red"></i>尽快吃</span></div>
      <button class="model-line" data-action="model">${esc(currentModel().name)} · ${layers.length} 个分区 <span>更换 ›</span></button>
    </section>`;
  }
  function reminderPanel(list) {
    const hasRestock = STATE.restock.some(r => r.status === '待补');
    const rows = list.slice(0, hasRestock ? 3 : 4).map(i => {
      const tip = i.remainingDays === 0 ? '已过期，建议尽快处理'
        : i.remainingDays === 1 ? '明天到期，今天安排正好'
        : '还剩 2 天，优先吃掉';
      return `<div class="reminder-row" data-action="item" data-id="${i.id}">
        <span class="reminder-emoji">${foodIcon(i.name, i.icon)}</span>
        <span class="reminder-copy"><b>${esc(i.name)}</b><small>${tip}</small></span>
        <span class="reminder-tag ${i.freshness}">${i.remainingDays === 0 ? '过期' : i.remainingDays + '天'}</span>
      </div>`;
    }).join('');
    const restock = STATE.restock.find(r => r.status === '待补');
    const restockRow = restock ? `<div class="reminder-row soft">
      <span class="reminder-emoji">${foodIcon(restock.name, restock.icon || '')}</span>
      <span class="reminder-copy"><b>${esc(restock.name)} <em class="restock-flag">${emojiIcon('🛒')} 待补货</em></b><small>常买清单里还缺，顺手补上吧</small></span>
      <button class="mini-btn" data-action="add-restock" data-name="${esc(restock.name)}">加入补货</button>
    </div>` : '';
    const empty = !rows && !restockRow ? '<div class="empty-note">最近没有需要操心的事，冰箱状态很好</div>' : '';
    return `<section class="panel reminder-panel">
      <div class="panel-head"><h2>温馨提醒</h2><span class="hint">重要的先说</span></div>
      ${rows}${restockRow}${empty}
      <button class="link-btn" data-go="fridge">查看全部食材 ›</button>
    </section>`;
  }
  function recipeCandidates(urgent) {
    const urgentNames = new Set(urgent.map(i => i.name));
    const haveName = n => ITEMS.some(i => i.name === n);
    return RECIPES.slice().sort((a, b) => {
      const score = r => (r.expiring || []).filter(n => urgentNames.has(n)).length * 3
        + r.ingredients.filter(x => haveName(typeof x === 'string' ? x : x.name)).length;
      return score(b) - score(a) || a.minutes - b.minutes;
    });
  }
  function recipePanel(urgent) {
    const list = recipeCandidates(urgent);
    if (!list.length) return '';
    const r = list[homeRecipeIndex % list.length];
    const urgentNames = new Set(urgent.map(i => i.name));
    const used = (r.expiring || []).filter(n => urgentNames.has(n));
    const have = r.ingredients
      .map(x => typeof x === 'string' ? x : (x.have ? x.name : null))
      .filter(Boolean).slice(0, 4);
    return `<section class="panel recipe-spotlight">
      <div class="panel-head"><h2>今日推荐</h2><button class="link-btn" data-action="recipe-next">换一道 ›</button></div>
      <button class="spotlight-main" data-action="recipe" data-id="${r.id}">
        <span class="spotlight-thumb">${r.image ? `<img src="${r.image}" alt="" loading="lazy" />` : r.emoji}</span>
        <span class="spotlight-copy">
          <b>${esc(r.name)}</b>
          <small>⏱ ${r.minutes} 分钟 · ${r.ingredients.length} 样食材</small>
          <em>${used.length ? '正好用掉快到期的 ' + used.map(esc).join('、') : '用冰箱现有食材做点好的'}</em>
        </span>
        <span class="spotlight-arrow">›</span>
      </button>
      <div class="spotlight-have">${have.length ? have.map(n => `<span>✓ ${esc(n)}</span>`).join('') : '<span>冰箱里还没有明确用料</span>'}</div>
      <button class="dish-entry" data-action="dish-modal">想做别的？告诉我想吃什么</button>
    </section>`;
  }
  function pageHome() {
    const layers = currentLayers();
    const urgent = urgentItems();
    return `<div class="page-head home-head">
      <div><h1>冰箱里有什么</h1><p>${ITEMS.length} 件食材 · ${layers.length} 个分区 · 刚刚同步</p></div>
    </div>
    <div class="home-grid">
      <div class="home-side">
        ${reminderPanel(urgent)}
        ${recipePanel(urgent)}
      </div>
      ${homeVisual()}
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
            <div class="item-name"><span class="ico-badge">${foodIcon(i.name, i.icon)}</span>${esc(i.name)} <span class="pill ${i.freshness}">${i.remainingDays === 0 ? '过期' : i.remainingDays + '天'}</span></div>
            <div class="item-meta">${i.quantity}${esc(i.unit)} · 保质至 ${esc(i.expiryDate)}</div>
            <div class="item-bar"><i class="${i.freshness}" style="width:${i.freshPct}%"></i></div>
          </button>`).join('')}</div></div>`;
      }).join('') || '<div class="panel">没有找到匹配的食材</div>'}`;
  }
  function pageRecipes() {
    return `<div class="page-head"><div><h1>今日食谱</h1><p>优先用掉快到期的食材</p></div><button class="btn btn-primary" data-action="dish-modal">${emojiIcon('🍳')} 今天吃什么</button></div>
      <div class="recipe-grid">${RECIPES.map(r => `<button class="recipe-card" data-action="recipe" data-id="${r.id}">
        <div class="recipe-thumb">${r.image ? `<img src="${r.image}" alt="${esc(r.name)}" loading="lazy" />` : r.emoji}</div>
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
        <span class="zd-ico">${foodIcon(i.name, i.icon)}</span><span class="zd-name">${esc(i.name)}</span>
        <span class="zd-qty">${i.quantity}${esc(i.unit)}</span>
        <span class="zd-days ${i.freshness}">${i.remainingDays === 0 ? '已过期' : i.remainingDays + ' 天'}</span>
      </div>`).join('')}</div>` +
      '<div class="modal-actions"><button class="btn btn-ghost" data-action="close">关闭</button><button class="btn btn-primary" data-go="fridge">查看全部食材</button></div>');
  }
  function showItemModal(id) {
    const i = ITEMS.find(x => x.id === id);
    if (!i) return;
    openModal(modalHead(foodIcon(i.name, i.icon), i.name, i.layer) +
      `<div class="detail-row"><span>数量</span><b>${i.quantity}${esc(i.unit)}</b></div>
       <div class="detail-row"><span>保质期至</span><b>${esc(i.expiryDate)}</b></div>
       <div class="detail-row"><span>剩余</span><b>${i.remainingDays === 0 ? '已过期' : i.remainingDays + ' 天'}</b></div>
       <div class="detail-row"><span>来源</span><b>${esc(i.source)}</b></div>
       <div class="modal-actions"><button class="btn btn-ghost" data-action="close">关闭</button><button class="btn btn-primary" data-action="add-restock" data-name="${esc(i.name)}">加入补货清单</button></div>`);
  }
  function showRecipeModal(id) {
    const r = RECIPES.find(x => x.id === id);
    if (!r) return;
    openModal(modalHead(emojiIcon(r.emoji), r.name, r.minutes + ' 分钟') +
      `<div class="detail-row"><span>食材</span><span>${r.ingredients.map(x => (x.have ? '✓ ' : '+ ') + esc(x.name)).join(' · ')}</span></div>` +
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
    openModal(modalHead(emojiIcon('🍳'), '今天吃什么', '想吃什么就输入什么，冰箱食材只用来对照') +
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
    openModal(modalHead(emojiIcon(dish.emoji), dish.name, dish.custom ? '按你想的菜整理好了，再对照冰箱' : '按菜名对照了冰箱食材') +
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
      if (addMode === 'photo') return `<div class="photo-drop" id="photo-drop">${emojiIcon('📷')} 点击选择多张食材照片，一次识别多件</div><input type="file" id="add-photos" accept="image/*" multiple style="display:none" />`;
      return `<div class="field"><textarea id="add-batch-text" rows="6" placeholder="每行写一样：鸡蛋 6枚&#10;牛奶 2盒&#10;番茄 4个"></textarea></div>
        <button class="btn btn-ghost" data-action="add-parse">识别清单</button>`;
    }
    if (addMode === 'manual') return `<div class="field"><label>食材名称</label><input id="m-name" placeholder="如：鸡蛋、牛奶" /><button class="mic-btn" data-action="voice-manual">${emojiIcon('🎤')}</button></div>
      <div class="field"><label>所在分区</label><select id="m-layer">${currentLayers().map(l => `<option>${l}</option>`).join('')}</select></div>
      <div class="field"><label>数量 / 单位 / 保质天数</label><input id="m-qty" type="number" value="1" style="width:70px;display:inline-block" /><input id="m-unit" value="份" style="width:70px;display:inline-block" /><input id="m-days" type="number" value="7" style="width:70px;display:inline-block" /></div>`;
    if (addMode === 'text') return `<div class="field"><input id="add-text" placeholder="例如：买了6个鸡蛋和2盒牛奶放冷藏" /><button class="mic-btn" data-action="voice-text">${emojiIcon('🎤')}</button></div>
      <button class="btn btn-ghost" data-action="add-parse">识别食材</button>`;
    return `<div class="photo-drop" id="photo-drop">${emojiIcon('📷')} 点击选择食材照片</div><input type="file" id="add-photo" accept="image/*" style="display:none" />`;
  }
  function bindAddPanel() {
    const drop = $('#photo-drop');
    if (drop) drop.onclick = () => { const f = $(addBatch ? '#add-photos' : '#add-photo'); if (f) f.click(); };
    const file = $('#add-photo');
    if (file) file.onchange = () => { file.dataset.ready = '1'; drop.innerHTML = `${emojiIcon('✅')} 已识别：全脂牛奶 1盒 · 吐司面包 1袋`; };
    const files = $('#add-photos');
    if (files) files.onchange = () => { files.dataset.ready = '1'; drop.innerHTML = `${emojiIcon('✅')} 已识别 3 样食材：鲜鸡蛋 / 全脂牛奶 / 番茄`; };
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
    openModal(modalHead(emojiIcon('🧺'), '录入食材', '拍照 / 手动 / 一句话，都支持单件或批量') +
      `<div class="add-tabs"><button class="add-tab" data-action="add-tab" data-mode="photo">${emojiIcon('📷')} 拍照</button>
        <button class="add-tab" data-action="add-tab" data-mode="manual">${emojiIcon('✍️')} 手动</button>
        <button class="add-tab" data-action="add-tab" data-mode="text">${emojiIcon('💬')} 一句话</button></div>
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
    openModal(modalHead(emojiIcon('🧊'), '冰箱型号', '不同冰箱的分区结构不同，可按实际情况选择') +
      FRIDGE_MODELS.map(m => `<button class="model-option ${m.key === STATE.fridgeModel ? 'active' : ''}" data-action="choose-model" data-model="${m.key}"><b>${m.name}</b><span>${m.layers.join(' / ')}</span></button>`).join('') +
      `<label class="photo-drop" for="model-photo">${emojiIcon('📷')} 拍照识别冰箱分区</label><input type="file" id="model-photo" accept="image/*" style="display:none" />`);
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
    openModal(modalHead(emojiIcon('📡'), '碰一碰配对', '让手机与冰箱屏保持同步') +
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
    if (a === 'item') { showItemModal(el.dataset.id); return; }
    if (a === 'recipe') { showRecipeModal(el.dataset.id); return; }
    if (a === 'recipe-next') { homeRecipeIndex += 1; render(); return; }
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
      const exists = STATE.restock.some(r => r.name === name);
      if (!exists) STATE.restock.push({ id: 'rs-' + Date.now(), name, suggestQty: 1, unit: '份', source: '手动', status: '待补' });
      closeModal(); render(); toast(exists ? '已在补货清单中' : '已加入补货清单'); return;
    }
    if (a === 'restock-add') {
      const picked = STATE.restock.filter(r => STATE.checked.has(r.id) && r.status === '待补');
      let added = 0;
      picked.forEach(r => { const sku = Object.keys(PRODUCT_MAPPING).find(k => PRODUCT_MAPPING[k] === r.name); if (sku) { addToCart(sku, r.id); added += 1; } });
      render();
      if (added) showCartModal(); else toast('请先勾选可加购的食材');
      return;
    }
    if (a === 'auto-manual') { closeModal(); toast('已保留在补货清单'); return; }
    if (a === 'auto-order') {
      let added = 0;
      STATE.restock.filter(r => r.status === '待补').slice(0, 3).forEach(r => {
        const sku = Object.keys(PRODUCT_MAPPING).find(k => PRODUCT_MAPPING[k] === r.name);
        if (sku) { addToCart(sku, r.id); added += 1; }
      });
      closeModal(); render();
      if (added) showCartModal(); else toast('暂无可自动加购的食材');
      return;
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
