/* 鲜知 FreshSense · 专属写实风格小图标 */
(function () {
  let seq = 0;
  function wrap(body) {
    const id = 'fico' + (++seq);
    return `<svg viewBox="0 0 32 32" class="food-ico" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0.85" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".72"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>${body.replace(/\{\{G\}\}/g, `url(#${id})`)}</svg>`;
  }

  const ICON = {
    egg: `<ellipse cx="16" cy="18" rx="8" ry="11" fill="#F5E2BC" stroke="#D8BE92" stroke-width="1"/><path d="M10 14c1-4 3-6 6-7" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".85"/><ellipse cx="16" cy="18" rx="8" ry="11" fill="{{G}}"/><circle cx="12.5" cy="20" r=".7" fill="#CDAF80" opacity=".55"/><circle cx="19" cy="16" r=".6" fill="#CDAF80" opacity=".5"/><circle cx="17.5" cy="23" r=".5" fill="#CDAF80" opacity=".45"/>`,
    milk: `<path d="M10 9h12v18H10z" fill="#F8FCFF" stroke="#AFCBDE" stroke-width="1"/><path d="M10 9l6-5 6 5" fill="#E8F2F8" stroke="#AFCBDE" stroke-width="1"/><path d="M12 4.5h8v4h-8z" fill="#D8EAF4"/><rect x="10" y="14" width="12" height="7" rx="1" fill="#3E86D6"/><path d="M12 17h8" stroke="#fff" stroke-width="1" opacity=".75"/><path d="M11 9h10" stroke="#fff" stroke-width="1.5" opacity=".8"/>`,
    yogurt: `<path d="M9 11h14l-2 15H11z" fill="#FFFDFB" stroke="#CBD9D0" stroke-width="1"/><ellipse cx="16" cy="11" rx="7" ry="3" fill="#F2F7F4" stroke="#CBD9D0" stroke-width="1"/><path d="M12 12c2 2 6 2 8 0" stroke="#D9E7DE" fill="none"/><circle cx="13" cy="17" r="1" fill="#E48FA8" opacity=".75"/><circle cx="19" cy="19" r=".9" fill="#E48FA8" opacity=".7"/><path d="M11 12h10" stroke="#fff" stroke-width="1.4" opacity=".8"/>`,
    bread: `<path d="M7 13c0-4 4-6 9-6s9 2 9 6v12H7z" fill="#D69A55" stroke="#A96C31" stroke-width="1"/><path d="M10 14c0-2.6 3-4.2 6-4.2s6 1.6 6 4.2v8H10z" fill="#F3D29A"/><path d="M11 18h10M11 21h10" stroke="#D9A96C" stroke-width="1" opacity=".6"/><path d="M9 12c1-2 3-3 5-3" stroke="#fff" stroke-width="1.5" fill="none" opacity=".5"/>`,
    salmon: `<path d="M5 20c4-8 12-11 22-9l-2 8c-7-1-13 1-18 5z" fill="#EF8759" stroke="#C8633D" stroke-width="1"/><path d="M6.5 21.5c5-4 11-6 17-6M9 23.5c5-3 10-5 15-5" stroke="#FFE3D2" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M4.5 22.5c3.5-1 6-1 8 0" stroke="#8C4F3B" stroke-width="2" stroke-linecap="round"/><path d="M9 18c4-4 9-6 15-6" stroke="#fff" stroke-width="1.2" fill="none" opacity=".45"/><circle cx="22" cy="17" r=".7" fill="#6FA34C"/><circle cx="25" cy="15" r=".6" fill="#6FA34C"/>`,
    tofu: `<path d="M7 12l12-4 7 4-12 5z" fill="#FFFDF6" stroke="#D9D6C8" stroke-width="1"/><path d="M7 12v10l7 4V17z" fill="#F3F0E4" stroke="#D9D6C8" stroke-width="1"/><path d="M14 17l12-5v10l-12 4z" fill="#FFFEFB" stroke="#D9D6C8" stroke-width="1"/><path d="M10 15l4.5-1.6M10 19l4.5-1.6" stroke="#E2DED0" stroke-width="1"/>`,
    chicken: `<path d="M8 20c-1-6 3-11 9-11 5 0 8 4 7 9-1 4-5 6-9 6-4 0-6-1-7-4z" fill="#F1C6B1" stroke="#D39B84" stroke-width="1"/><path d="M12 12c2 3 2 7 0 11M18 12c-1 3-1 7 1 10" stroke="#DFA78F" stroke-width="1" fill="none" opacity=".75"/><path d="M10 13c1-2 3-3 5-3" stroke="#fff" stroke-width="1.4" fill="none" opacity=".55"/>`,
    broccoli: `<path d="M11 27V15M16 27V13M21 27V16" stroke="#7FB45A" stroke-width="4" stroke-linecap="round"/><circle cx="10" cy="11" r="4.2" fill="#4E9A45" stroke="#3D7D37"/><circle cx="17" cy="9" r="4.8" fill="#60AC50" stroke="#3D7D37"/><circle cx="23" cy="12" r="4" fill="#458E3E" stroke="#3D7D37"/><path d="M11 17h10v10H11z" fill="#9CCB72" stroke="#6FA34C" stroke-width="1"/><path d="M12 10c1-1 2-1 3 0" stroke="#fff" stroke-width="1" fill="none" opacity=".55"/>`,
    frozenBroccoli: `<path d="M11 27V15M16 27V13M21 27V16" stroke="#6FA9C9" stroke-width="4" stroke-linecap="round"/><circle cx="10" cy="11" r="4.2" fill="#4E9A45" stroke="#3D7D37"/><circle cx="17" cy="9" r="4.8" fill="#60AC50" stroke="#3D7D37"/><circle cx="23" cy="12" r="4" fill="#458E3E" stroke="#3D7D37"/><path d="M26 22v6M23.5 24.5h5M24.3 22.8l3.4 3.4M27.7 22.8l-3.4 3.4" stroke="#8CC6FF" stroke-width="1.2" stroke-linecap="round"/>`,
    tomato: `<circle cx="16" cy="18" r="9" fill="#E5484D" stroke="#C43B40" stroke-width="1"/><path d="M9 15c2-3 5-4 7-4" stroke="#FF9A9E" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8"/><path d="M16 10l-5-3 3 4-4 1 5 1 1 4 1-4 5-1-4-1 3-4z" fill="#4C9A45" stroke="#3D7D37" stroke-width=".8"/><ellipse cx="16" cy="18" rx="9" ry="9" fill="{{G}}"/>`,
    apple: `<path d="M16 11c-4-3-10 0-10 7 0 6 4 10 8 9 1 0 2 0 3 0 4 1 8-3 8-9 0-7-6-10-9-7z" fill="#E5484D" stroke="#C43B40" stroke-width="1"/><path d="M16 11c0-3 1-5 3-6" stroke="#7A5A34" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M18.5 6c2-2 5-2 6.5 0-2 2-4.5 2-6.5 0z" fill="#4C9A45" stroke="#3D7D37" stroke-width=".8"/><path d="M10 15c1-2 3-3 4-3" stroke="#FF9A9E" stroke-width="2" stroke-linecap="round" fill="none" opacity=".75"/><ellipse cx="16" cy="18" rx="10" ry="10" fill="{{G}}"/>`,
    carrot: `<path d="M11 12l10 12-4 3L8 15z" fill="#F08A3C" stroke="#C96E2A" stroke-width="1"/><path d="M11 12c-2-3-1-6 1-7 1 3 2 5 1 7zM14 11c0-4 2-6 4-6-1 3-1 5-2 7z" fill="#5CAA4F" stroke="#3D7D37" stroke-width=".8"/><path d="M12 17l4 4M15 20l3 3" stroke="#C96E2A" stroke-width="1" opacity=".8"/>`,
    lettuce: `<path d="M7 18c0-7 4-11 9-11s9 4 9 11c0 5-4 8-9 8s-9-3-9-8z" fill="#8CCB6A" stroke="#5C9A45" stroke-width="1"/><path d="M16 8v17M10 13c3 2 4 5 4 9M22 13c-3 2-4 5-4 9" stroke="#5C9A45" stroke-width="1" fill="none" opacity=".75"/><path d="M10 12c2-2 4-3 6-3" stroke="#fff" stroke-width="1.4" fill="none" opacity=".5"/>`,
    blueberry: `<circle cx="10" cy="20" r="5" fill="#4A5FA8" stroke="#35467F" stroke-width="1"/><circle cx="21" cy="19" r="5.5" fill="#5B70BD" stroke="#35467F" stroke-width="1"/><circle cx="16" cy="12" r="5" fill="#3F54A0" stroke="#35467F" stroke-width="1"/><path d="M13.5 10.5l2.5-2 2.5 2M18 7.5l2-2 2 2M8 18l2-2 2 2" stroke="#2C3B70" stroke-width="1.4" stroke-linecap="round" fill="none"/>`,
    lemon: `<ellipse cx="16" cy="18" rx="9" ry="6.5" fill="#F4C542" stroke="#D6A82C" stroke-width="1"/><path d="M8 17c1-2 2-3 3-3M24 17c-1-2-2-3-3-3" stroke="#FFF0A8" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M16 12c-1-2 0-4 2-4" stroke="#6FA34C" stroke-width="2" stroke-linecap="round" fill="none"/><ellipse cx="16" cy="18" rx="9" ry="6.5" fill="{{G}}"/>`,
    dumpling: `<path d="M6 20c0-6 5-10 10-10s10 4 10 10-5 7-10 7-10-1-10-7z" fill="#F7F2E6" stroke="#D8CDB6" stroke-width="1"/><path d="M8 18c3-3 5-3 8 0 3-3 5-3 8 0" stroke="#D8CDB6" stroke-width="1.2" fill="none"/><path d="M10 22c4 2 8 2 12 0" stroke="#E8E0CC" stroke-width="1" fill="none"/>`,
    icecream: `<path d="M10 14h12l-2 13h-8z" fill="#E8B978" stroke="#C99555" stroke-width="1"/><path d="M9 14c0-4 3-7 7-7s7 3 7 7z" fill="#F7E6D0" stroke="#D9C3A5" stroke-width="1"/><path d="M12 12c2-2 5-2 7 0" stroke="#F2B705" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M12 18h8" stroke="#fff" stroke-width="1" opacity=".6"/>`,
    cheese: `<path d="M6 22l14-10 6 8-14 6z" fill="#F2B705" stroke="#D69A00" stroke-width="1"/><path d="M6 22v3l6 1v-3z" fill="#D69A00" opacity=".55"/><circle cx="13" cy="20" r="1.7" fill="#D69A00"/><circle cx="18" cy="18" r="1.2" fill="#D69A00"/><circle cx="20" cy="22" r="1" fill="#D69A00"/>`,
    sausage: `<path d="M8 20c0-4 3-6 6-5 2-3 6-3 8 0 4-1 7 2 6 6-1 4-5 5-8 4-3 2-7 1-9-2-2 0-3-1-3-3z" fill="#D98057" stroke="#B8623D" stroke-width="1"/><path d="M10 19c3 1 5 1 7 0M18 22c2 1 4 0 5-1" stroke="#F0B08C" stroke-width="1.4" stroke-linecap="round" fill="none"/>`,
    juice: `<path d="M11 9h10v18H11z" fill="#F5A623" stroke="#D98B14" stroke-width="1"/><path d="M11 9l5-5 5 5" fill="#F7C15A" stroke="#D98B14" stroke-width="1"/><rect x="12" y="14" width="8" height="8" rx="1" fill="#FFF3D6" opacity=".85"/><path d="M14 18c1-2 3-2 4 0" stroke="#E58A1E" stroke-width="1.4" fill="none"/>`,
    potato: `<ellipse cx="16" cy="18" rx="10" ry="7" fill="#C99A5B" stroke="#A87B42" stroke-width="1" transform="rotate(-18 16 18)"/><circle cx="12" cy="16" r=".8" fill="#A87B42"/><circle cx="19" cy="20" r=".7" fill="#A87B42"/><path d="M10 14c2-2 4-3 6-3" stroke="#fff" stroke-width="1.3" fill="none" opacity=".5"/>`,
    pepper: `<path d="M12 12c0-3 2-5 4-5s4 2 4 5l4 6c-2 7-12 7-16 0z" fill="#4F9E45" stroke="#3D7D37" stroke-width="1"/><path d="M16 8V5" stroke="#3D7D37" stroke-width="2" stroke-linecap="round"/><path d="M11 15c2-2 4-2 5 0" stroke="#fff" stroke-width="1.4" fill="none" opacity=".5"/>`,
    garlic: `<path d="M16 8c5 3 7 8 5 13-2 5-8 5-10 0-2-5 0-10 5-13z" fill="#F4F1E6" stroke="#D5D0BC" stroke-width="1"/><path d="M16 9v13M12 13c1 3 1 6 0 8M20 13c-1 3-1 6 0 8" stroke="#D5D0BC" stroke-width="1" fill="none"/>`,
    scallion: `<path d="M12 27c0-9 1-16 4-22M20 27c0-9-1-16-4-22" stroke="#6FA34C" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M13 24h6" stroke="#4C9A45" stroke-width="2" stroke-linecap="round"/>`,
    ginger: `<path d="M8 18c1-5 5-8 9-7 3 1 3 4 6 5 3 1 3 5-1 7-4 2-8 0-11 1-3 1-4-2-3-6z" fill="#D8B36A" stroke="#B8934E" stroke-width="1"/><path d="M11 16c2 1 3 3 3 6M18 15c-1 3 0 6 2 8" stroke="#B8934E" stroke-width="1" fill="none"/>`,
    cola: `<path d="M11 10h10v17H11z" fill="#E5484D" stroke="#C43B40" stroke-width="1"/><path d="M11 10l5-5 5 5" fill="#F07B7F" stroke="#C43B40" stroke-width="1"/><rect x="12" y="15" width="8" height="5" fill="#fff" opacity=".9"/><path d="M14 17.5h4" stroke="#E5484D" stroke-width="1.2"/>`,
    sugar: `<path d="M8 14h16l-2 13H10z" fill="#FFFDF8" stroke="#D9D6C8" stroke-width="1"/><path d="M8 14l8-5 8 5" fill="#F4F1E6" stroke="#D9D6C8" stroke-width="1"/><path d="M13 19h6" stroke="#D9D6C8" stroke-width="1.4"/>`,
    rice: `<path d="M7 16h18c0 7-4 11-9 11s-9-4-9-11z" fill="#F8FCFF" stroke="#CBD9D0" stroke-width="1"/><ellipse cx="16" cy="16" rx="9" ry="3" fill="#FFF" stroke="#CBD9D0" stroke-width="1"/><path d="M11 20h10" stroke="#E4EDE7" stroke-width="1.2"/>`,
    oat: `<path d="M12 27c-2-7 0-14 4-20 4 6 6 13 4 20z" fill="#D8B36A" stroke="#B8934E" stroke-width="1"/><path d="M16 9v17M13 15l6 4M19 15l-6 4" stroke="#B8934E" stroke-width="1" fill="none"/>`,
    soup: `<path d="M6 15h20c0 6-4 10-10 10S6 21 6 15z" fill="#E8F7EE" stroke="#A9C4B5" stroke-width="1"/><ellipse cx="16" cy="15" rx="10" ry="3" fill="#FFF" stroke="#A9C4B5" stroke-width="1"/><path d="M10 15c2-2 4-2 6 0 2-2 4-2 6 0" stroke="#F2B705" stroke-width="1.6" fill="none"/><path d="M12 10c0-2 2-2 2-4M18 10c0-2 2-2 2-4" stroke="#BEDBCB" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
    pan: `<path d="M7 15h16c0 6-3 9-8 9s-8-3-8-9z" fill="#5B6B63" stroke="#3F4D47" stroke-width="1"/><path d="M23 16h6" stroke="#3F4D47" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="15" cy="15" rx="8" ry="3" fill="#F5E2BC" stroke="#D8BE92" stroke-width="1"/><circle cx="15" cy="15" r="2.4" fill="#F2B705"/>`,
    salad: `<path d="M6 16h20c0 6-4 10-10 10S6 22 6 16z" fill="#FFF" stroke="#A9C4B5" stroke-width="1"/><circle cx="12" cy="14" r="4" fill="#60AC50"/><circle cx="18" cy="13" r="4.5" fill="#8CCB6A"/><circle cx="23" cy="15" r="3.5" fill="#4E9A45"/><circle cx="16" cy="17" r="2.5" fill="#E5484D"/>`,
    sandwich: `<path d="M7 12l18 2-2 6-18-2z" fill="#F3D29A" stroke="#C99555" stroke-width="1"/><path d="M7 18l18 2-2 5-18-2z" fill="#E8B978" stroke="#C99555" stroke-width="1"/><path d="M8 15l18 2" stroke="#6FA34C" stroke-width="2"/><path d="M8 20l18 2" stroke="#F2B705" stroke-width="2"/>`,
    plate: `<circle cx="16" cy="17" r="10" fill="#F8FCFF" stroke="#CBD9D0" stroke-width="1"/><circle cx="16" cy="17" r="6.5" fill="#EAF7EF" stroke="#CBD9D0" stroke-width="1"/><path d="M4 13v8M28 13v8" stroke="#A9C4B5" stroke-width="1.5" stroke-linecap="round"/>`,
    fridge: `<rect x="8" y="3" width="16" height="26" rx="3" fill="#F8FCFF" stroke="#AFCBDE" stroke-width="1"/><path d="M8 12h16" stroke="#AFCBDE" stroke-width="1.5"/><path d="M11 6v4M11 16v8" stroke="#3E86D6" stroke-width="2" stroke-linecap="round"/>`,
    snow: `<circle cx="16" cy="16" r="10" fill="#EEF6FC" stroke="#BFD8EE" stroke-width="1"/><path d="M16 6v20M7.5 11l17 10M24.5 11l-17 10" stroke="#3E86D6" stroke-width="2" stroke-linecap="round"/><path d="M13 9l3 3 3-3M13 23l3-3 3 3" stroke="#3E86D6" stroke-width="1.4" fill="none"/>`,
    leaf: `<path d="M26 6C13 6 7 11 7 19c0 4 3 7 7 7 8 0 12-8 12-20z" fill="#8CCB6A" stroke="#5C9A45" stroke-width="1"/><path d="M9 25C13 17 18 12 25 8" stroke="#5C9A45" stroke-width="1.4" fill="none"/><path d="M14 17l1-4M18 14l2-3" stroke="#5C9A45" stroke-width="1" fill="none"/>`,
    camera: `<rect x="5" y="10" width="22" height="15" rx="3" fill="#EAF7EF" stroke="#6FA34C" stroke-width="1.2"/><circle cx="16" cy="17.5" r="4.5" fill="#F8FCFF" stroke="#6FA34C" stroke-width="1.2"/><circle cx="16" cy="17.5" r="2" fill="#3E86D6"/><path d="M11 10l2-3h6l2 3" fill="#EAF7EF" stroke="#6FA34C" stroke-width="1.2"/>`,
    pen: `<path d="M8 24l2-6 12-12 4 4-12 12z" fill="#F2C705" stroke="#C99A00" stroke-width="1"/><path d="M10 18l4 4" stroke="#fff" stroke-width="1.2"/><path d="M8 24l-2 4 4-2" fill="#5B6B63"/>`,
    chat: `<path d="M6 8h20v14H15l-5 4v-4H6z" fill="#EAF7EF" stroke="#6FA34C" stroke-width="1.2"/><path d="M11 14h10M11 18h7" stroke="#6FA34C" stroke-width="1.4" stroke-linecap="round"/>`,
    basket: `<path d="M6 14h20l-2 12H8z" fill="#F3D29A" stroke="#C99555" stroke-width="1"/><path d="M11 14l5-7 5 7" stroke="#C99555" stroke-width="1.5" fill="none"/><path d="M11 19h10" stroke="#C99555" stroke-width="1"/>`,
    nfc: `<rect x="6" y="5" width="20" height="22" rx="4" fill="#EAF7EF" stroke="#6FA34C" stroke-width="1.2"/><path d="M11 12a7 7 0 0 1 0 8M15 12a11 11 0 0 1 0 8M19 12a15 15 0 0 1 0 8" stroke="#3E86D6" stroke-width="1.6" stroke-linecap="round" fill="none"/>`,
    check: `<circle cx="16" cy="16" r="11" fill="#1DB954"/><path d="M10 16.5l4 4 8-9" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    mic: `<rect x="12" y="5" width="8" height="14" rx="4" fill="#EAF7EF" stroke="#6FA34C" stroke-width="1.2"/><path d="M9 15a7 7 0 0 0 14 0M16 22v5M12 27h8" stroke="#6FA34C" stroke-width="1.6" stroke-linecap="round" fill="none"/>`
  };

  const ALIAS = {
    '鲜鸡蛋': 'egg', '鸡蛋': 'egg', '蛋': 'egg', '🥚': 'egg',
    '全脂牛奶': 'milk', '牛奶': 'milk', '🥛': 'milk',
    '原味酸奶': 'yogurt', '酸奶': 'yogurt', '🥣': 'yogurt',
    '吐司面包': 'bread', '吐司': 'bread', '面包': 'bread', '🍞': 'bread',
    '三文鱼': 'salmon', '鱼': 'salmon', '🐟': 'salmon',
    '豆腐': 'tofu', '🧈': 'tofu',
    '鸡胸肉': 'chicken', '鸡肉': 'chicken', '🍗': 'chicken', '鸡翅': 'chicken', '🍖': 'chicken',
    '西兰花': 'broccoli', '花椰菜': 'broccoli', '🥦': 'broccoli', '冷冻西兰花': 'frozenBroccoli',
    '番茄': 'tomato', '西红柿': 'tomato', '🍅': 'tomato',
    '红苹果': 'apple', '苹果': 'apple', '🍎': 'apple',
    '胡萝卜': 'carrot', '🥕': 'carrot',
    '生菜': 'lettuce', '青菜': 'lettuce', '🥬': 'lettuce',
    '蓝莓': 'blueberry', '🫐': 'blueberry',
    '柠檬': 'lemon', '🍋': 'lemon',
    '速冻水饺': 'dumpling', '水饺': 'dumpling', '饺子': 'dumpling', '🥟': 'dumpling', '汤圆': 'dumpling',
    '冰淇淋': 'icecream', '雪糕': 'icecream', '🍦': 'icecream',
    '奶酪': 'cheese', '🧀': 'cheese',
    '香肠': 'sausage', '🌭': 'sausage',
    '橙汁': 'juice', '🧃': 'juice',
    '土豆': 'potato', '🥔': 'potato',
    '青椒': 'pepper', '🫑': 'pepper',
    '蒜': 'garlic', '🧄': 'garlic', '葱': 'scallion', '🌿': 'scallion', '姜': 'ginger', '🫚': 'ginger',
    '可乐': 'cola', '🥤': 'cola', '糖': 'sugar', '🍬': 'sugar', '米饭': 'rice', '🍚': 'rice', '燕麦': 'oat', '🌾': 'oat',
    '🍳': 'pan', '🍲': 'soup', '🍜': 'soup', '🥗': 'salad', '🥪': 'sandwich', '🍽️': 'plate', '🍽': 'plate',
    '🧊': 'fridge', '❄️': 'snow', '❄': 'snow',
    '📷': 'camera', '✍️': 'pen', '✍': 'pen', '💬': 'chat', '🧺': 'basket', '📡': 'nfc', '✅': 'check', '✔': 'check', '🎤': 'mic'
  };

  function resolve(key) {
    if (!key) return 'plate';
    if (ALIAS[key]) return ALIAS[key];
    if (ICON[key]) return key;
    return 'plate';
  }
  window.foodIcon = function (name, fallback) { return wrap(ICON[resolve(name) === 'plate' && fallback ? resolve(fallback) : resolve(name)] || ICON.plate); };
  window.emojiIcon = function (emoji) { return wrap(ICON[resolve(emoji)] || ICON.plate); };
  window.layerIcon = function (layer) {
    if (String(layer).includes('冷冻')) return wrap(ICON.snow);
    if (String(layer).includes('果蔬')) return wrap(ICON.leaf);
    return wrap(ICON.fridge);
  };
})();
