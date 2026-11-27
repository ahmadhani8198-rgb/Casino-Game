/* أكلتنا v5 — app logic. The reveal engine (engine.js) owns the stage; this file owns dishes, days and rules. */
(function () {
'use strict';

/* ---------- dish catalog: slug, name, type, reveal method, ingredients, emoji, appetite, dinner role ---------- */
const ROWS = [
 ['maqluba','مقلوبة','lunch','flip','🍆 🍚 🍗 🥜','🍲','heavy'],
 ['maqluba-cauliflower','مقلوبة زهرة','lunch','flip','🥦 🍚 🍗 🥜','🍲','heavy'],
 ['mansaf','منسف','lunch','flame','🍖 🍚 🥛 🥜','🍖','heavy'],
 ['musakhan','مسخّن','lunch','taboon','🍗 🧅 🫓 🫒','🍗','heavy'],
 ['mulukhiyah','ملوخية','lunch','rising','🥬 🧄 🍋 🍚','🥣','medium'],
 ['bamia','بامية','lunch','rising','🫛 🍅 🧄 🍚','🍲','medium'],
 ['green-beans','فاصوليا بالزيت','lunch','rising','🫛 🍅 🧅 🫒','🥗','light'],
 ['peas-rice','بازيلاء بالرز','lunch','rising','🫛 🥕 🍚 🥩','🍛','medium'],
 ['sumagiyya','سماقية','lunch','spice','🍖 🫘 🥬 🧄','🍲','heavy'],
 ['sayadieh','صيادية سمك','lunch','iris','🐟 🍚 🧅 🍋','🐟','medium'],
 ['fried-fish','سمك مقلي بالدقة','lunch','mortar','🐟 🍅 🌶️ 🍋','🐟','medium'],
 ['shrimp-zibdiyeh','زبدية جمبري','lunch','mortar','🦐 🍅 🧄 🌶️','🦐','medium'],
 ['stuffed-eggplant','باذنجان محشي','lunch','knife','🍆 🍚 🥩 🍅','🍆','heavy'],
 ['stuffed-zucchini','كوسا محشي','lunch','knife','🥒 🍚 🥩 🍅','🥒','heavy'],
 ['warak-enab','ورق عنب','lunch','foil','🍃 🍚 🍋 🍅','🍃','medium'],
 ['stuffed-cabbage','محشي ملفوف','lunch','foil','🥬 🍚 🥩 🧄','🥬','medium'],
 ['kibbeh','كبة','lunch','knife','🥩 🌾 🧅 🥜','🧆','heavy'],
 ['maftoul','مفتول','lunch','fog','🌾 🍗 🧅 🫘','🍲','heavy'],
 ['freekeh','فريكة بالدجاج','lunch','flame','🌾 🍗 🥜 🧅','🍗','heavy'],
 ['rice-chicken','رز بالدجاج','lunch','flame','🍚 🍗 🥜 🧅','🍗','heavy'],
 ['rice-meat','رز ولحمة','lunch','flame','🍚 🥩 🥜 🧅','🍖','heavy'],
 ['shish-barak','شيش برك','lunch','fog','🥟 🥛 🧄 🌿','🥟','medium'],
 ['oven-chicken','دجاج بالفرن','lunch','foil','🍗 🥔 🧅 🍋','🍗','heavy'],
 ['potato-meat-tray','صينية بطاطا باللحمة','lunch','foil','🥔 🥩 🍅 🧅','🥔','heavy'],
 ['eggplant-tray','صينية باذنجان','lunch','foil','🍆 🥩 🍅 🧅','🍆','heavy'],
 ['mujaddara','مجدّرة','lunch','spice','🫘 🍚 🧅 🥛','🍛','medium'],
 ['lentil-soup','شوربة عدس','lunch','rising','🫘 🥕 🧅 🍋','🥣','light'],
 ['vegetable-soup','شوربة خضار','lunch','rising','🥕 🥔 🫛 🌿','🥣','light'],
 ['kawareh','كوارع','lunch','gauge','🍖 🧄 🍋 🫘','🍲','heavy'],
 ['qidra','قدرة خليلي','lunch','cloth','🍚 🥩 🧄 🫘','🍲','heavy'],
 ['kabsa','كبسة','lunch','spice','🍚 🍗 🌶️ 🧅','🍛','heavy'],
 ['falafel','فلافل','dinner','mortar','🧆 🌿 🧅 🫓','🧆','medium','main'],
 ['hummus','حمص','dinner','mortar','🫘 🍋 🫒 🧄','🥣','light','side'],
 ['ful','فول غزاوي','dinner','mortar','🫘 🍋 🌶️ 🫒','🥣','medium','main'],
 ['fattet-hummus','فتة حمص','dinner','snap','🫘 🫓 🥛 🥜','🥣','medium','main'],
 ['gaza-fatteh','فتة غزاوية','dinner','spice','🫓 🍚 🥩 🥜','🍛','heavy','main'],
 ['shawarma','شاورما','dinner','knife','🍗 🫓 🥒 🧄','🌯','heavy','main'],
 ['qalayet-bandora','قلاية بندورة','dinner','snap','🍅 🌶️ 🧄 🫒','🍳','medium','main'],
 ['shakshuka','شكشوكة','dinner','snap','🍅 🥚 🌶️ 🧅','🍳','medium','main'],
 ['ijjeh','عجّة','dinner','iris','🥚 🌿 🧅 🧀','🍳','medium','main'],
 ['chard-tahini','سلق بالطحينة','dinner','cloth','🥬 🥜 🧅 🍋','🥗','light','side'],
 ['gaza-liver','كبدة غزاوية','dinner','gauge','🍖 🌶️ 🍅 🧄','🍖','heavy','main'],
 ['harrak-osbao','حراق إصبعه','dinner','spice','🫘 🍝 🍋 🧅','🥣','medium','main'],
 ['manakeesh-zaatar','مناقيش زعتر','dinner','taboon','🫓 🌿 🫒 🍅','🫓','medium','main'],
 ['manakeesh-cheese','مناقيش جبنة','dinner','taboon','🫓 🧀 🌿 🫒','🫓','medium','main'],
 ['msabbaha','مسبّحة','dinner','mortar','🫘 🍋 🫒 🧄','🥣','medium','side'],
 ['eggs-sumac','بيض بالسماق','dinner','iris','🥚 🌿 🫒 🧅','🍳','light','side'],
 ['zaatar-bread','خبز بالزعتر والزيت','dinner','taboon','🫓 🌿 🫒 🍅','🫓','light','side'],
 ['fries','بطاطا مقلية','dinner','capsule','🍟 🍅 🧂 🥔','🍟','light','side'],
 ['labneh-sandwich','سندويش لبنة','dinner','capsule','🫓 🥛 🥒 🌿','🥙','light','side'],
 ['spinach-fatayer','فطاير سبانخ','dinner','taboon','🥬 🫓 🧅 🍋','🥟','medium','main'],
 ['sfiha','صفيحة','dinner','taboon','🥩 🫓 🍅 🥜','🥧','medium','main'],
 ['pickles-grills','مخلل ومشاوي','dinner','magnet','🥒 🫒 🌶️ 🍅','🥒','light','side'],
 ['shish-tawook','شيش طاووق','dinner','magnet','🍗 🧄 🍅 🧅','🍢','heavy','main'],
 ['knafeh','كنافة نابلسية','sweet','flip','🧀 🍯 🥜 🌾','🍮','heavy'],
 ['qatayef','قطايف','sweet','lantern','🥞 🥜 🍯 🧀','🥞','medium'],
 ['maamoul','معمول','sweet','ribbon','🌴 🥜 🌾 🧈','🍪','medium'],
 ['baklava','بقلاوة','sweet','ribbon','🥜 🍯 🧈 🌾','🍯','medium'],
 ['basbousa','بسبوسة','sweet','flip','🌾 🍯 🥥 🥜','🍰','medium'],
 ['harissa','هريسة','sweet','flip','🌾 🍯 🥜 🥥','🍰','medium'],
 ['rice-pudding','أرز بالحليب','sweet','bubble','🍚 🥛 🥜 🌸','🍚','light'],
 ['muhallabia','مهلبية','sweet','bubble','🥛 🌸 🥜 🍯','🍮','light'],
 ['awwameh','عوّامة','sweet','lantern','🍩 🍯 🌾 🥥','🍩','medium'],
 ['mushabbak','مشبّك','sweet','lantern','🍯 🌾 🍩 🥜','🍩','medium'],
 ['ghraybeh','غريبة','sweet','basket','🌾 🧈 🥜 🍬','🍪','light'],
 ['sliha','سليحة','sweet','card3d','🌾 🥜 🍬 🍇','🥣','light'],
 ['halva','حلاوة طحينية','sweet','capsule','🥜 🍯 🌾 🍬','🍬','light'],
 ['sweet-pumpkin','قرع حلو','sweet','card3d','🎃 🍯 🥜 🌰','🎃','light'],
 ['haytaliyeh','هيطلية','sweet','bubble','🥛 🌸 🍯 🥜','🍮','light'],
 ['date-kaak','كعك بالتمر','sweet','basket','🌴 🌾 🧈 🥜','🍪','medium'],
 ['dates-coffee','تمر وقهوة','sweet','coffee','🌴 ☕ 🫖 🥜','☕','light'],
 ['sahlab','سحلب','sweet','coffee','🥛 🥥 🥜 🍯','☕','light'],
 ['creme-caramel','كريم كراميل','sweet','flip','🥛 🥚 🍯 🍮','🍮','light']
];
const CATALOG = ROWS.map(r => ({slug:r[0], name:r[1], type:r[2], mode:r[3], ing:r[4].split(' '), emoji:r[5], appetite:r[6], role:r[7] || null}));
const BY_NAME = Object.fromEntries(CATALOG.map(c => [c.name, c]));

const TYPES = {
  lunch: {n:'غدا', badge:'غدا بكرا 🍛', emoji:'🍲', ing:['🍚','🍗','🧅','🧄'], app:'heavy', pool:['flame','rising','foil','flip','fog','gauge','cloth','iris']},
  dinner:{n:'عشا', badge:'عشا بكرا 🫓', emoji:'🫓', ing:['🫓','🧀','🫒','🍅'], app:'medium', pool:['snap','taboon','mortar','magnet','capsule','iris','knife','card3d']},
  sweet: {n:'حلو', badge:'حلو بكرا 🍯', emoji:'🍰', ing:['🍯','🥜','🌾','🥛'], app:'light', pool:['ribbon','bubble','lantern','card3d','basket','flip','coffee']}
};
const TYPE_KEYS = ['lunch','dinner','sweet'];
const MODE_NAMES = {foil:'كشط القصدير', flame:'شعلة الموقد', flip:'القالب المقلوب', mortar:'الهاون والمدقة', taboon:'رغيف الطابون', basket:'السلة التراثية',
  capsule:'كبسولة الحظ', fog:'مسح البخار', bubble:'الفقاعة السحرية', ribbon:'رباط الهدية', snap:'تجميع المكونات', magnet:'المغناطيس',
  iris:'عدسة الضوء', rising:'فقاعات الغليان', card3d:'البطاقة المقلوبة', gauge:'عدّاد الشهية', coffee:'فنجان القهوة', knife:'ضربة السكين',
  spice:'موجة التوابل', cloth:'السفرة المطرّزة', lantern:'ضوء الفانوس'};
const KEYWORD_MODES = [
  [/مقلوب|كنافة|كنافه|بسبوس|هريسة|كراميل|قالب|كيك/, 'flip'],
  [/صينية|صينيه|فرن|محشي|ورق عنب|ملفوف/, 'foil'],
  [/شوربة|شوربه|ملوخية|ملوخيه|بامية|باميه|يخنة|مرقة|فاصوليا|بازيلاء|بازلاء/, 'rising'],
  [/منقوش|مناقيش|فطاير|فطائر|فطيرة|خبز|صفيحة|صفيحه|مسخن|بيتزا|معجنات|كعك/, 'taboon'],
  [/قهوة|قهوه|شاي|سحلب|عصير|كاكاو/, 'coffee'],
  [/قطايف|عوامة|عوامه|مشبك|لقيمات|زلابية/, 'lantern'],
  [/مهلبية|مهلبيه|بالحليب|بحليب|بودينغ|كاسترد|هيطلية|جيلي/, 'bubble'],
  [/بقلاو|معمول|غريبة|غريبه|بسكويت|شوكولا|برازق/, 'ribbon'],
  [/سمك|جمبري|حمص|فول|فلافل|متبل|بابا غنوج/, 'mortar'],
  [/مشاوي|شيش|كباب|مخلل|كفتة|كفته/, 'magnet'],
  [/شاورما|كبة|كبه|كبدة|كبده|ستيك|شرائح/, 'knife'],
  [/شكشوك|بيض|عجة|عجه|سلطة|سلطه|قلاية|قلايه/, 'snap'],
  [/سماق|بهار|مجدر|فتة|فته|برياني|مندي/, 'spice'],
  [/رز|أرز|ارز|كبسة|كبسه|منسف|فريكة|فريكه|دجاج|لحمة|لحمه/, 'flame'],
  [/بطاطا|بطاطس|سندويش|ساندويش|برجر|حلاوة|حلاوه|شيبس/, 'capsule'],
  [/بخار|مفتول|كسكس|دمبلنغ|مانتي/, 'fog']
];
const clean = s => (s || '').replace(/[ً-ْـ]/g, '').trim();
const hash = s => { let h = 7; for (const ch of s) h = (h * 31 + ch.codePointAt(0)) >>> 0; return h; };
function autoMode(name, type) {
  const n = clean(name);
  for (const [re, m] of KEYWORD_MODES) if (re.test(n)) return m;
  const pool = TYPES[type].pool; return pool[hash(n) % pool.length];
}

/* ---------- state ---------- */
const K = 'aklatna-v1';
let S = null;
try { S = JSON.parse(localStorage.getItem(K)); } catch (e) {}
S = S || {};
const AR_TYPE = {'غدا':'lunch','عشا':'dinner','حلو':'sweet'};
function migrate() {
  S.foods = (S.foods || []).map(f => {
    if (typeof f === 'string') f = {name: f, type: 'lunch'};
    const g = {name: f.name, type: AR_TYPE[f.type] || f.type || 'lunch'};
    if (!TYPES[g.type]) g.type = 'lunch';
    if (f.img) g.img = f.img;
    if (f.role) g.role = f.role;
    if (f.mode) g.mode = f.mode;
    return g;
  });
  if (!S.pressed) {
    S.pressed = {lunch: '', dinner: '', sweet: ''};
    if (typeof S.lastPress === 'string') S.pressed.lunch = S.lastPress;
  }
  delete S.lastPress;
  const plan = S.plan || {};
  for (const k of Object.keys(plan)) {
    const e = plan[k];
    if (e && typeof e.food === 'string') plan[k] = {lunch: {food: e.food, changes: e.changes || []}};
  }
  S.plan = plan; S.v = 5;
}
migrate();
const save = () => { try { localStorage.setItem(K, JSON.stringify(S)); return true; } catch (e) { return false; } };
save();

/* ---------- dish helpers ---------- */
const cat = f => BY_NAME[f.name] || null;
const imgOf = f => f.img || (cat(f) ? `img/${cat(f).slug}.webp` : '');
const modeOf = f => f.mode || (cat(f) ? cat(f).mode : autoMode(f.name, f.type));
const roleOf = f => f.role || (cat(f) && cat(f).role) || 'main';
const emojiOf = f => (cat(f) ? cat(f).emoji : TYPES[f.type].emoji);
const ingOf = f => (cat(f) ? cat(f).ing : TYPES[f.type].ing);
const appOf = f => (cat(f) ? cat(f).appetite : TYPES[f.type].app);
const findFood = name => S.foods.find(f => f.name === name) || BY_NAME[name] && {name, type: BY_NAME[name].type} || {name, type: 'lunch'};

/* ---------- dates ---------- */
const keyOf = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const today = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const longDay = d => d.toLocaleDateString('ar', {weekday: 'long', day: 'numeric', month: 'long'});
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };

/* ---------- picking ---------- */
const rnd = a => a[Math.floor(Math.random() * a.length)];
function recentOf(type, n) {
  return Object.keys(S.plan).sort().reverse().map(k => S.plan[k][type]).filter(Boolean).slice(0, n).map(e => e.food);
}
function pickFrom(list, avoid, recentN) {
  if (!list.length) return null;
  let pool = list.filter(f => !avoid.includes(f.name));
  if (!pool.length) pool = list;
  const recent = recentOf(pickFrom.type, Math.min(recentN, pool.length - 1));
  const fresh = pool.filter(f => !recent.includes(f.name));
  return rnd(fresh.length ? fresh : pool);
}
function pickMeal(type, exclude) {
  const all = S.foods.filter(f => f.type === type);
  pickFrom.type = type;
  if (type !== 'dinner') { const f = pickFrom(all, exclude ? [exclude] : [], 5); return f ? {food: f.name, changes: []} : null; }
  const mains = all.filter(f => roleOf(f) === 'main');
  const main = pickFrom(mains.length ? mains : all, exclude ? [exclude] : [], 4);
  if (!main) return null;
  let sides = all.filter(f => roleOf(f) === 'side' && f.name !== main.name);
  if (!sides.length) sides = all.filter(f => f.name !== main.name && f !== main);
  const chosen = [];
  const pool = sides.slice();
  while (chosen.length < 2 && pool.length) chosen.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0].name);
  return {food: main.name, sides: chosen, changes: []};
}

/* ---------- rendering ---------- */
const $ = id => document.getElementById(id);
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
function visual(f, cls) {
  const src = imgOf(f);
  if (src) { const i = el('img', cls || ''); i.src = src; i.alt = ''; i.loading = 'lazy'; return i; }
  return el('span', 'emo', emojiOf(f));
}
const PLATE = '<svg viewBox="0 0 100 100" width="78" height="78" aria-hidden="true"><ellipse cx="50" cy="78" rx="42" ry="9" fill="#EFE3CF" stroke="#4A3426" stroke-width="3"/><path d="M14 74a36 36 0 0 1 72 0z" fill="#E6D8C2" stroke="#4A3426" stroke-width="3"/><circle cx="50" cy="34" r="5" fill="#4A3426"/><text x="50" y="66" text-anchor="middle" font-size="24" font-weight="900" fill="#7E6553" font-family="Cairo,sans-serif">؟</text></svg>';

function render() {
  const t = today(), tk = keyOf(t), tom = addDays(t, 1), gk = keyOf(tom);
  $('sub').textContent = 'أكلات بكرا · ' + longDay(tom);

  const tp = S.plan[tk];
  const tr = $('todayRow'); tr.replaceChildren();
  if (tp && TYPE_KEYS.some(k => tp[k])) {
    tr.append(el('b', null, 'اليوم:'));
    TYPE_KEYS.forEach(k => { if (tp[k]) tr.append(el('span', null, TYPES[k].n + ' ' + tp[k].food + (tp[k].sides && tp[k].sides.length ? ' + ' + tp[k].sides.join(' و') : ''))); });
    tr.hidden = false;
  } else tr.hidden = true;

  const box = $('meals'); box.replaceChildren();
  TYPE_KEYS.forEach(type => {
    const e = (S.plan[gk] || {})[type], used = S.pressed[type] === tk, has = S.foods.some(f => f.type === type);
    const card = el('article', 'meal'); card.dataset.t = type;
    const pic = el('div', 'mpic');
    if (e) pic.append(visual(findFood(e.food))); else pic.innerHTML = PLATE;
    const body = el('div', 'mbody');
    const kick = el('div', 'kick'); kick.append(el('i'), document.createTextNode(TYPES[type].n + ' بكرا'));
    body.append(kick);
    if (e) {
      body.append(el('h3', 'mname', e.food));
      if (e.sides && e.sides.length) {
        const sd = el('div', 'sides');
        e.sides.forEach(n => { const s = el('span', 'side'); s.append(visual(findFood(n)), document.createTextNode(n)); sd.append(s); });
        body.append(sd);
      }
      const row = el('div', 'mrow');
      const again = el('button', 'lnk', 'شوف الكشف'); again.type = 'button'; again.onclick = () => openReveal(type);
      row.append(again);
      if (used && has) { const ch = el('button', 'lnk', 'تغيير بسبب قهري'); ch.type = 'button'; ch.onclick = () => askChange(type); row.append(ch); }
      body.append(row);
      if (e.changes && e.changes.length) body.append(el('div', 'mnote', 'تغيّرت ' + e.changes.length + ' مرة: ' + e.changes.map(c => c.reason).join('، ')));
    } else {
      body.append(el('h3', 'mname wait', has ? 'لسا ما انكشف' : 'ما في أكلات ' + TYPES[type].n + ' بالقائمة'));
      const go = el('button', 'go', 'اكشف ' + TYPES[type].n + ' بكرا'); go.type = 'button';
      go.disabled = used || !has;
      go.onclick = () => reveal(type);
      body.append(go);
      body.append(el('div', 'mnote', !has ? 'ضيفوا أكلات من تحت أول.' : used ? 'استخدمت محاولة اليوم.' : 'معك محاولة وحدة اليوم.'));
    }
    card.append(pic, body); box.append(card);
  });

  const wk = $('week'); wk.replaceChildren();
  for (let i = 0; i < 7; i++) {
    const d = addDays(t, i), p = S.plan[keyOf(d)] || {};
    const c = el('div', 'day' + (i === 1 ? ' tom' : ''));
    c.append(el('b', null, i === 0 ? 'اليوم' : i === 1 ? 'بكرا' : d.toLocaleDateString('ar', {weekday: 'short'})), el('span', null, d.getDate()));
    const th = el('div', 'th');
    TYPE_KEYS.forEach(k => { if (p[k]) th.append(visual(findFood(p[k].food))); });
    c.append(th); wk.append(c);
  }
  const lg = $('log'); lg.replaceChildren();
  const keys = Object.keys(S.plan).filter(k => k >= tk && TYPE_KEYS.some(x => S.plan[k][x])).sort();
  if (!keys.length) lg.append(el('li', null, 'ما في أكلات محددة لسا.'));
  keys.forEach(k => {
    const p = S.plan[k], li = el('li');
    li.append(el('b', null, longDay(fromKey(k))));
    TYPE_KEYS.forEach(x => {
      if (!p[x]) return;
      li.append(el('span', 'rs', TYPES[x].n + ': ' + p[x].food + (p[x].sides && p[x].sides.length ? ' + ' + p[x].sides.join(' و') : '') +
        (p[x].changes && p[x].changes.length ? ' (تغيّرت: ' + p[x].changes.map(c => c.from + ' بسبب ' + c.reason).join('، ') + ')' : '')));
    });
    lg.append(li);
  });
  renderFoods();
}

let filter = 'all';
function renderFoods() {
  $('count').textContent = S.foods.length + ' أكلة';
  const ch = $('chips'); ch.replaceChildren();
  [['all', 'الكل'], ['lunch', 'غدا'], ['dinner', 'عشا'], ['sweet', 'حلو']].forEach(([k, n]) => {
    const b = el('button', 'chip', n); b.type = 'button'; b.setAttribute('aria-pressed', k === filter); b.onclick = () => { filter = k; renderFoods(); }; ch.append(b);
  });
  const g = $('grid'); g.replaceChildren();
  const list = S.foods.filter(f => filter === 'all' || f.type === filter);
  if (!list.length) g.append(el('div', 'empty', S.foods.length ? 'ما في أكلات بهالنوع.' : 'ابدؤوا من "أضف من أكلات المنطقة" أو من زر +.'));
  list.forEach(f => {
    const b = el('button', 'tile'); b.type = 'button';
    const tp = el('div', 'tp'); tp.append(visual(f)); b.append(tp, el('b', null, f.name));
    b.append(el('small', null, TYPES[f.type].n + (f.type === 'dinner' ? (roleOf(f) === 'side' ? ' · جانبي' : ' · رئيسي') : '')));
    b.onclick = () => openFood(f); g.append(b);
  });
}

/* ---------- reveal sheet (bridges to engine.js) ---------- */
let revealDone = false;
function dishForEngine(type) {
  const e = (S.plan[keyOf(addDays(today(), 1))] || {})[type];
  const f = findFood(e.food);
  return {
    name: e.food, category: type, catLabel: TYPES[type].badge, emoji: emojiOf(f), ingredients: ingOf(f), appetite: appOf(f),
    img: imgOf(f), desc: type === 'dinner' ? '' : 'صحة وعافية',
    sides: (e.sides || []).map(n => { const s = findFood(n); return {name: n, img: imgOf(s), emoji: emojiOf(s)}; }),
    mode: modeOf(f)
  };
}
window.putDishVisual = (box, dish, size) => {
  box.replaceChildren();
  if (dish.img) { const i = el('img', 'dv-img'); i.src = dish.img; i.alt = ''; i.style.width = i.style.height = size + 'px'; box.append(i); }
  else box.textContent = dish.emoji;
};
window.fillRevealCard = dish => {
  $('resCategoryBadge').textContent = dish.catLabel;
  $('resIngredientsMini').textContent = dish.ingredients.join('');
  const v = $('resDishSvg'); v.replaceChildren();
  if (dish.img) { const i = el('img', 'res-img'); i.src = dish.img; i.alt = ''; v.append(i); } else v.append(el('span', 'res-emo', dish.emoji));
  $('resDishTitle').textContent = dish.name;
  const d = $('resDishDesc'); d.replaceChildren();
  if (dish.sides && dish.sides.length) {
    d.append(document.createTextNode('ومعه:'));
    const row = el('div', 'res-sides');
    dish.sides.forEach(s => { const c = el('span'); if (s.img) { const i = el('img'); i.src = s.img; i.alt = ''; c.append(i); } else c.append(document.createTextNode(s.emoji)); c.append(document.createTextNode(s.name)); row.append(c); });
    d.append(row);
  } else d.textContent = dish.desc;
};
window.onRevealDone = () => { revealDone = true; render(); };

function openReveal(type) {
  const dish = dishForEngine(type);
  window.__revealDish = dish;
  revealDone = false;
  $('sheetTitle').textContent = TYPES[type].n + ' بكرا';
  $('sheetMode').textContent = 'طريقة الكشف: ' + (MODE_NAMES[dish.mode] || '');
  const sh = $('revealSheet'); sh.hidden = false; document.body.style.overflow = 'hidden';
  activeMode = dish.mode;            /* engine global */
  requestAnimationFrame(() => { setupStage(); $('revealBtn').focus({preventScroll: true}); });
}
function closeReveal() {
  clearTimers(); isBusy = false;     /* engine globals */
  $('revealSheet').hidden = true; document.body.style.overflow = '';
  render();
}
$('revealBtn').onclick = () => { try { ensureAudio(); } catch (e) {} if (revealDone) closeReveal(); else handlePrimaryAction(); };
$('sheetClose').onclick = closeReveal;
$('soundToggleBtn').onclick = () => toggleSound();
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('revealSheet').hidden) closeReveal(); });

function reveal(type) {
  const tk = keyOf(today());
  if (S.pressed[type] === tk) return;
  const m = pickMeal(type);
  if (!m) return;
  const gk = keyOf(addDays(today(), 1));
  S.plan[gk] = S.plan[gk] || {};
  S.plan[gk][type] = m;
  S.pressed[type] = tk;          /* the try is spent the moment you tap, so closing the sheet can't reroll */
  save(); render(); openReveal(type);
}

/* ---------- force-majeure change ---------- */
let changeType = null;
function askChange(type) {
  changeType = type;
  $('whyTitle').textContent = 'تغيير ' + TYPES[type].n + ' بكرا';
  $('reasonSel').value = ''; $('reasonTxt').value = ''; $('reasonTxt').hidden = true; $('whyErr').textContent = '';
  $('whyDlg').showModal();
}
$('reasonSel').onchange = e => { $('reasonTxt').hidden = e.target.value !== 'other'; $('whyErr').textContent = ''; };
$('reasonTxt').oninput = () => { $('whyErr').textContent = ''; };
$('whyCancel').onclick = () => $('whyDlg').close();
$('whyOk').onclick = () => {
  const sel = $('reasonSel').value;
  if (!sel) { $('whyErr').textContent = 'اختار السبب أول.'; return; }
  const reason = sel === 'other' ? $('reasonTxt').value.trim() : sel;
  if (!reason) { $('whyErr').textContent = 'اكتب السبب.'; return; }
  const gk = keyOf(addDays(today(), 1)), cur = (S.plan[gk] || {})[changeType];
  if (!cur) { $('whyDlg').close(); return; }
  const m = pickMeal(changeType, cur.food);
  const same = m && m.food === cur.food && (m.sides || []).join('|') === (cur.sides || []).join('|');
  if (!m || same || (changeType !== 'dinner' && m.food === cur.food)) { $('whyErr').textContent = 'ما في أكلة ثانية من هالنوع. ضيفوا أكلات أكثر.'; return; }
  m.changes = (cur.changes || []).concat({from: cur.food, reason, on: keyOf(today())});
  S.plan[gk][changeType] = m; save();
  $('whyDlg').close(); render(); openReveal(changeType);
};

/* ---------- add / edit dish ---------- */
let editing = null, tmpImg = '';
const modeSel = $('fMode');
modeSel.append(new Option('تلقائي (حسب الأكلة)', ''));
Object.entries(MODE_NAMES).forEach(([k, n]) => modeSel.append(new Option(n, k)));
function setPhoto(src) {
  tmpImg = src || ''; const b = $('photoBox'); b.replaceChildren();
  if (tmpImg) { const i = el('img'); i.src = tmpImg; i.alt = ''; b.append(i); } else b.textContent = '📷 اختار صورة من الألبوم';
}
function syncRole() { $('roleWrap').hidden = $('fType').value !== 'dinner'; }
function updateAutoLabel() {
  const name = $('fName').value.trim(), type = $('fType').value;
  const c = BY_NAME[name], m = c ? c.mode : autoMode(name || 'x', type);
  modeSel.options[0].text = 'تلقائي: ' + MODE_NAMES[m];
}
function openFood(f) {
  editing = f || null;
  $('foodTitle').textContent = f ? 'تعديل الأكلة' : 'أكلة جديدة';
  $('fName').value = f ? f.name : '';
  $('fType').value = f ? f.type : 'lunch';
  $('fRole').value = f ? roleOf(f) : 'main';
  modeSel.value = f && f.mode ? f.mode : '';
  setPhoto(f ? f.img : ''); if (f && !f.img && imgOf(f)) { const b = $('photoBox'); b.replaceChildren(visual(f)); }
  $('delBtn').hidden = !f; $('fErr').textContent = '';
  syncRole(); updateAutoLabel(); $('foodDlg').showModal();
}
$('fType').onchange = () => { syncRole(); updateAutoLabel(); };
$('fName').oninput = () => { $('fErr').textContent = ''; updateAutoLabel(); };
$('addBtn').onclick = () => openFood(null);
$('photoBox').onclick = () => $('fFile').click();
$('photoBox').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('fFile').click(); } };
$('fFile').onchange = async e => { const f = e.target.files[0]; if (f) setPhoto(await shrink(f)); e.target.value = ''; };
$('foodCancel').onclick = () => $('foodDlg').close();
function shrink(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = () => { const i = new Image(); i.onload = () => { const s = Math.min(1, 480 / Math.max(i.width, i.height)), c = document.createElement('canvas');
      c.width = Math.round(i.width * s); c.height = Math.round(i.height * s); c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .78)); };
      i.onerror = () => res(''); i.src = r.result; };
    r.onerror = () => res(''); r.readAsDataURL(file);
  });
}
$('saveBtn').onclick = () => {
  const name = $('fName').value.trim();
  if (!name) { $('fErr').textContent = 'اكتب اسم الأكلة.'; $('fName').focus(); return; }
  if (S.foods.some(x => x.name === name && x !== editing)) { $('fErr').textContent = 'هاي الأكلة موجودة.'; return; }
  const before = JSON.stringify(S);
  const target = editing || {};
  const oldName = editing && editing.name;
  target.name = name; target.type = $('fType').value;
  if (target.type === 'dinner') target.role = $('fRole').value; else delete target.role;
  if (modeSel.value) target.mode = modeSel.value; else delete target.mode;
  if (tmpImg) target.img = tmpImg; else delete target.img;
  if (!editing) S.foods.push(target);
  if (oldName && oldName !== name) Object.values(S.plan).forEach(p => TYPE_KEYS.forEach(k => { const e = p[k]; if (!e) return; if (e.food === oldName) e.food = name; if (e.sides) e.sides = e.sides.map(s => s === oldName ? name : s); }));
  if (!save()) { S = JSON.parse(before); $('fErr').textContent = 'الذاكرة ممتلئة. جرّب صورة أصغر.'; return; }
  $('foodDlg').close(); render();
};
let confirmDel = false;
$('delBtn').onclick = () => {
  if (!editing) return;
  if (!confirmDel) { confirmDel = true; $('delBtn').textContent = 'أكيد؟'; setTimeout(() => { confirmDel = false; $('delBtn').textContent = 'حذف'; }, 2500); return; }
  confirmDel = false; $('delBtn').textContent = 'حذف';
  S.foods = S.foods.filter(x => x !== editing); save(); $('foodDlg').close(); render();
};

/* ---------- regional catalog ---------- */
function openCat() {
  const L = $('catList'); L.replaceChildren();
  TYPE_KEYS.forEach(type => {
    L.append(el('h4', null, TYPES[type].n));
    CATALOG.filter(c => c.type === type).forEach(c => {
      const has = S.foods.some(f => f.name === c.name);
      const row = el('label', 'crow' + (has ? ' has' : ''));
      const cb = el('input'); cb.type = 'checkbox'; cb.checked = has; cb.disabled = has; cb.dataset.n = c.name; cb.onchange = updCat;
      const im = el('img'); im.src = `img/${c.slug}.webp`; im.alt = ''; im.loading = 'lazy';
      row.append(cb, im, el('span', null, c.name), el('small', null, (c.role === 'side' ? 'جانبي · ' : '') + MODE_NAMES[c.mode]));
      L.append(row);
    });
  });
  updCat(); $('catDlg').showModal();
}
const boxes = () => [...$('catList').querySelectorAll('input:not(:disabled)')];
function updCat() { const n = boxes().filter(b => b.checked).length; $('catAdd').textContent = n ? 'إضافة (' + n + ')' : 'إضافة'; $('catAdd').disabled = !n; }
$('catBtn').onclick = openCat;
$('catClose').onclick = () => $('catDlg').close();
$('catAll').onclick = () => { const bs = boxes(), all = bs.every(b => b.checked); bs.forEach(b => b.checked = !all); updCat(); };
$('catAdd').onclick = () => {
  boxes().filter(b => b.checked).forEach(b => { const c = BY_NAME[b.dataset.n]; if (!S.foods.some(f => f.name === c.name)) S.foods.push({name: c.name, type: c.type}); });
  save(); $('catDlg').close(); render();
};

render();
setInterval(() => { if ($('revealSheet').hidden && !document.querySelector('dialog[open]')) render(); }, 60000);
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
})();
