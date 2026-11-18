// Lee precio y foto de la página de un producto (Amazon, Mercado Libre, Liverpool y tiendas con datos de producto).
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const decode = (s) => String(s || "")
  .replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&#x2F;/g, "/").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, "&");

// "1,899.00", "$ 1 899", "1.899,00" -> 1899
function num(v) {
  if (typeof v === "number") return v;
  let s = String(v || "").replace(/[^\d.,]/g, "");
  if (!s) return NaN;
  const lc = s.lastIndexOf(","), ld = s.lastIndexOf(".");
  if (lc > -1 && ld > -1) s = lc > ld ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  else if (lc > -1) s = /,\d{1,2}$/.test(s) ? s.replace(",", ".") : s.replace(/,/g, "");
  else if ((s.match(/\./g) || []).length > 1 || /\.\d{3}$/.test(s)) s = s.replace(/\./g, "");
  return parseFloat(s);
}
const okPrice = (n) => Number.isFinite(n) && n > 0 && n < 10000000;
const absUrl = (u, base) => { try { const x = new URL(decode(u).trim(), base); return x.protocol === "https:" || x.protocol === "http:" ? x.href.replace(/^http:/, "https:") : ""; } catch { return ""; } };

function metas(html) {
  const m = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const key = (tag.match(/\b(?:property|name|itemprop)\s*=\s*["']([^"']+)["']/i) || [])[1];
    const val = (tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i) || [])[1];
    if (key && val != null && !(key.toLowerCase() in m)) m[key.toLowerCase()] = decode(val);
  }
  return m;
}

function jsonLdProducts(html) {
  const out = [];
  const walk = (o) => {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) return o.forEach(walk);
    if (o["@graph"]) walk(o["@graph"]);
    const t = [].concat(o["@type"] || []).map(String);
    if (t.some((x) => /product/i.test(x))) out.push(o);
    if (o.mainEntity) walk(o.mainEntity);
  };
  for (const m of html.matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { walk(JSON.parse(m[1].trim())); } catch { /* JSON roto en la página */ }
  }
  return out;
}

function fromProduct(p) {
  let price = NaN, currency = "";
  for (const of of [].concat(p.offers || [])) {
    const cands = [of.price, of.lowPrice, of.priceSpecification && [].concat(of.priceSpecification)[0]?.price];
    for (const c of cands) { const n = num(c); if (okPrice(n)) { price = n; currency = of.priceCurrency || ""; break; } }
    if (okPrice(price)) break;
  }
  // schema.org: offers.shippingDetails.deliveryTime.{handlingTime,transitTime}.maxValue (en días)
  let deliveryDays = null;
  for (const of of [].concat(p.offers || [])) {
    const dt = [].concat(of.shippingDetails || [])[0]?.deliveryTime;
    if (dt) { const h = Number(dt.handlingTime?.maxValue ?? dt.handlingTime?.minValue ?? 0), tr = Number(dt.transitTime?.maxValue ?? dt.transitTime?.minValue); if (Number.isFinite(tr)) { deliveryDays = h + tr; break; } }
  }
  let img = [].concat(p.image || [])[0];
  if (img && typeof img === "object") img = img.url || img.contentUrl;
  return { price, currency, image: typeof img === "string" ? img : "", deliveryDays };
}

// Fecha de entrega: "martes, 25 de noviembre", "24 - 27 de noviembre", "mañana, 20 de nov." -> la fecha más tardía.
const MONTHS = { ene: 1, enero: 1, feb: 2, febrero: 2, mar: 3, marzo: 3, abr: 4, abril: 4, may: 5, mayo: 5, jun: 6, junio: 6, jul: 7, julio: 7, ago: 8, agosto: 8, sep: 9, sept: 9, septiembre: 9, setiembre: 9, oct: 10, octubre: 10, nov: 11, noviembre: 11, dic: 12, diciembre: 12,
  jan: 1, january: 1, february: 2, march: 3, apr: 4, april: 4, june: 6, july: 7, aug: 8, august: 8, september: 9, october: 10, november: 11, dec: 12, december: 12 };
function mxToday() { const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date()).split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); }
function parseDelivery(text, today = mxToday()) {
  const t = String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const dates = [];
  for (const m of t.matchAll(/(\d{1,2})\s*(?:de\s+)?([a-z]{3,10})\.?/g)) {
    const mo = MONTHS[m[2]]; const day = +m[1];
    if (!mo || day < 1 || day > 31) continue;
    let d = new Date(Date.UTC(today.getUTCFullYear(), mo - 1, day));
    if (d - today < -20 * 86400000) d = new Date(Date.UTC(today.getUTCFullYear() + 1, mo - 1, day));
    dates.push(d);
  }
  for (const m of t.matchAll(/\b([a-z]{3,10})\.?\s+(\d{1,2})\b/g)) {     // "November 25"
    const mo = MONTHS[m[1]]; const day = +m[2];
    if (!mo || day < 1 || day > 31) continue;
    let d = new Date(Date.UTC(today.getUTCFullYear(), mo - 1, day));
    if (d - today < -20 * 86400000) d = new Date(Date.UTC(today.getUTCFullYear() + 1, mo - 1, day));
    dates.push(d);
  }
  if (!dates.length) { if (/\bmanana\b|tomorrow/.test(t)) return 1; if (/\bhoy\b|today/.test(t)) return 0; return null; }
  const last = new Date(Math.max(...dates));
  const days = Math.round((last - today) / 86400000);
  return days >= 0 && days < 120 ? days : null;
}
function amazonDelivery(html) {
  const all = [...html.matchAll(/data-csa-c-delivery-time\s*=\s*["']([^"']+)["']/gi)].map((m) => decode(m[1]));
  if (all.length) return all[0];
  const i = html.search(/id=["']mir-layout-DELIVERY_BLOCK["']/);
  if (i > -1) return html.slice(i, i + 3000).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
  return "";
}

function amazon(html) {
  let price = NaN, image = "";
  const i = html.search(/id=["'](corePrice_feature_div|corePriceDisplay_desktop_feature_div|corePrice_desktop|apex_desktop|apex_offerDisplay_mobile)["']/);
  if (i > -1) {
    const m = html.slice(i, i + 8000).match(/class=["']a-offscreen["'][^>]*>\s*([^<]+)</);
    if (m) price = num(decode(m[1]));
  }
  if (!okPrice(price)) { const m = html.match(/"priceAmount"\s*:\s*([\d.]+)/); if (m) price = num(m[1]); }
  const im = html.match(/data-old-hires=["'](https:[^"']+)["']/) || html.match(/"hiRes"\s*:\s*"(https:[^"]+)"/) || html.match(/id=["']landingImage["'][^>]*src=["'](https:[^"']+)["']/);
  if (im) image = im[1];
  return { price, image, currency: "MXN" };
}


  // Nombre del producto: el de la tienda, sin el nombre de la tienda y acortado si es larguísimo.
  const STORE = /(amazon(\.com)?(\.mx)?|mercado ?libre|liverpool|walmart|coppel|sears|el palacio de hierro|palacio de hierro|shein|sanborns|costco|sam'?s club|bodega aurrera|elektra|best buy|home depot|sephora|nike|adidas|zara|h&m)/i;
  function cleanTitle(t) {
    t = decode(String(t || "")).replace(/\s+/g, " ").trim();
    t = t.replace(/^amazon\.com(\.mx)?\s*:\s*/i, "");
    t = t.replace(/\s*:\s*[^:]{2,40}$/, (m) => (/amazon/i.test(m) || m.length < 30 ? "" : m));           // ": Hogar y Cocina"
    t = t.replace(new RegExp("\\s*[|\\-–—:]\\s*" + STORE.source + "[^|]*$", "i"), "");                   // " | Mercado Libre"
    if (!t || t.length < 3 || /captcha|robot|verifica|verify|human|humano|acceso denegado|access denied|page not found|no encontrad/i.test(t) || new RegExp("^" + STORE.source + "$", "i").test(t)) return "";
    if (t.length > 70) { const cut = t.slice(20).search(/,| - | – | \| | \(|\. /); if (cut > -1) t = t.slice(0, 20 + cut); }
    if (t.length > 90) t = t.slice(0, 90).replace(/\s+\S*$/, "");
    return t.replace(/[\s,;:\-–]+$/, "");
  }
  function titleOf(html, prods) {
    const am = html.match(/id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i);
    const cands = [am && am[1].replace(/<[^>]+>/g, " "), ...prods.map((p) => p.name)];
    const meta = (k) => { const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]*content=["']([^"']+)["']`, "i")) || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${k}["']`, "i")); return m && m[1]; };
    cands.push(meta("og:title"), meta("twitter:title"), (html.match(/<title[^>]*>([^<]*)/i) || [])[1]);
    for (const c of cands) { const t = cleanTitle(c); if (t) return t; }
    return "";
  }

function parse(html, url) {
  const host = new URL(url).hostname;
  const r = { price: NaN, currency: "", image: "", deliveryDays: null, title: "" };
  const prods = jsonLdProducts(html);
  r.title = titleOf(html, prods);
  for (const p of prods) {
    const x = fromProduct(p);
    if (r.deliveryDays == null && x.deliveryDays != null) r.deliveryDays = x.deliveryDays;
    if (!okPrice(r.price) && okPrice(x.price)) { r.price = x.price; r.currency = x.currency; }
    if (!r.image && x.image) r.image = x.image;
  }
  if (/amazon\.|amzn\.|^a\.co$/.test(host) || /id=["']corePrice/.test(html)) {
    const dt = amazonDelivery(html);
    if (dt) { r.deliveryDays = parseDelivery(dt); }
    const a = amazon(html);
    if (okPrice(a.price)) { r.price = a.price; r.currency = r.currency || "MXN"; }
    if (a.image) r.image = a.image;
  }
  const m = metas(html);
  if (!okPrice(r.price)) {
    for (const k of ["product:price:amount", "og:price:amount", "price"]) {
      const n = num(m[k]); if (okPrice(n)) { r.price = n; r.currency = m["product:price:currency"] || m["og:price:currency"] || m["pricecurrency"] || ""; break; }
    }
  }
  if (!r.image) r.image = m["og:image:secure_url"] || m["og:image"] || m["twitter:image"] || m["image"] || "";
  r.image = r.image ? absUrl(r.image, url) : "";
  r.currency = String(r.currency || "").toUpperCase();
  return r;
}

function looksBlocked(html, finalUrl) {
  return /captcha|robot check|Type the characters you see|account-verification|access denied/i.test(html.slice(0, 20000)) || /account-verification|captcha/i.test(finalUrl);
}

async function mercadoLibreApi(url) {
  const dec = url;
  const prod = (dec.match(/\/p\/(MLM\d{5,})/i) || [])[1];
  const id = (dec.match(/\b(MLM)-?(\d{6,})/i) || []);
  const detail = process.env.DETALLE === "true";
  if (detail) console.log(`    ML api: id-articulo=${!!id[2]}, id-catalogo=${!!prod}`);
  if (prod) {
    const pr = await fetch(`https://api.mercadolibre.com/products/${prod}`, { signal: AbortSignal.timeout(15000) }).catch(() => null);
    if (detail) console.log(`    ML api products: HTTP ${pr ? pr.status : -1}`);
    if (pr && pr.ok) {
      const j = await pr.json();
      const price = num(j.buy_box_winner && j.buy_box_winner.price);
      const image = (j.pictures && j.pictures[0] && (j.pictures[0].secure_url || j.pictures[0].url)) || "";
      if (okPrice(price) || image) return { price, currency: (j.buy_box_winner && j.buy_box_winner.currency_id) || "MXN", image };
    }
  }
  if (!id[2]) return null;
  const res = await fetch(`https://api.mercadolibre.com/items/MLM${id[2]}`, { signal: AbortSignal.timeout(15000), headers: { "User-Agent": UA } });
  if (detail) console.log(`    ML api items: HTTP ${res.status}`);
  if (!res.ok) return null;
  const j = await res.json();
  return { price: num(j.price), currency: j.currency_id || "MXN", image: (j.pictures && j.pictures[0] && j.pictures[0].secure_url) || j.thumbnail || "" };
}

// Amazon: aunque la página pida captcha, el link trae el código del producto (ASIN) y su servidor de imágenes sí responde.
const asinOf = (u) => (String(u).match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/exec\/obidos\/asin\/)([A-Z0-9]{10})(?:[/?#]|$)/i) || [])[1];
async function amazonImage(asin) {
  const src = `https://m.media-amazon.com/images/P/${asin.toUpperCase()}.01._SCLZZZZZZZ_.jpg`;
  try {
    const r = await fetch(src, { signal: AbortSignal.timeout(15000), headers: { "User-Agent": UA } });
    const b = await r.arrayBuffer();
    return r.ok && /image\//.test(r.headers.get("content-type") || "") && b.byteLength > 2000 ? src : "";   // si no existe, Amazon manda un gif de 1×1
  } catch { return ""; }
}

// Respaldo: Microlink (servicio gratis que abre la página con un navegador real). Plan gratis: ~50 consultas al día.
const PRICE_RULES = [
  [/amazon\./i, "#corePrice_feature_div .a-offscreen, #corePriceDisplay_desktop_feature_div .a-offscreen, #apex_desktop .a-offscreen, #apex_offerDisplay_desktop .a-offscreen, .a-price .a-offscreen", "text"],
  [/mercadoli[bv]re/i, 'meta[itemprop="price"]', "content"],
  [/./, 'meta[property="product:price:amount"], meta[itemprop="price"], meta[property="og:price:amount"]', "content"],
];
const ML_FRACTION = ".ui-pdp-price__second-line .andes-money-amount__fraction, .andes-money-amount__fraction";
let microlinkOff = false;
const isLogo = (u) => /logo|frontend-assets|nav-sprite|favicon|sprite|placeholder/i.test(String(u || ""));

// Segundo respaldo: Jina Reader (gratis) abre la página con un navegador y devuelve el HTML ya cargado.
let jinaOff = false;
async function jina(url, extra = {}) {
  if (jinaOff || process.env.JINA === "off") return null;
  try {
    const r = await fetch("https://r.jina.ai/" + url, { signal: AbortSignal.timeout(60000), headers: { "X-Return-Format": "html", "X-Timeout": "40", "X-Locale": "es-MX", ...extra } });
    if (r.status === 429) { jinaOff = true; return { status: 429 }; }
    const html = r.ok ? (await r.text()).slice(0, 4000000) : "";
    const blocked = !html || looksBlocked(html, url);
    const p = html && !blocked ? parse(html, url) : { price: NaN, image: "", currency: "" };
    if (isLogo(p.image)) p.image = "";
    if (process.env.DETALLE === "true") {
      const tl = ((html.match(/<title[^>]*>([^<]*)/i) || [])[1] || "").trim().length;
      console.log(`    jina: HTTP ${r.status}, página ${html.length} bytes, bloqueo=${blocked}, precio=${okPrice(p.price)}, foto=${!!p.image}, titulo=${tl} letras`);
    }
    return { status: r.status, ...p };
  } catch { return { status: -1 }; }
}   // si se acaba el límite del día, no seguir intentando en esta corrida
async function microlink(url) {
  if (microlinkOff || process.env.MICROLINK === "off") return null;
  const q = new URLSearchParams({ url, meta: "true" });
  const [, sel, attr] = PRICE_RULES.find(([re]) => re.test(url));
  q.set("data.price.selector", sel); q.set("data.price.attr", attr);
  if (/mercadoli[bv]re/i.test(url)) { q.set("data.fraction.selector", ML_FRACTION); q.set("data.fraction.attr", "text"); }
  try {
    const r = await fetch("https://api.microlink.io/?" + q, { signal: AbortSignal.timeout(45000) });
    if (r.status === 429) { microlinkOff = true; return { status: 429 }; }
    const j = await r.json().catch(() => ({}));
    const d = (j && j.data) || {};
    let price = num(d.price);
    if (!okPrice(price)) price = num(d.fraction);
    let image = (d.image && d.image.url) || "";
    if (isLogo(image)) image = "";
    if (process.env.DETALLE === "true") {
      // Solo señales generales, sin el contenido de la página.
      const t = String(d.title || "") + " " + String(d.description || "");
      const kind = !image ? "ninguna" : /mlstatic\.com\/D_|images\/I\//.test(image) ? "producto" : /logo|frontend-assets|nav-sprite/i.test(image) ? "logo" : "otra";
      console.log(`    microlink: estado=${j.status}, campos=${Object.keys(d).join("|")}, price=${d.price == null ? "vacío" : typeof d.price}, fraction=${d.fraction == null ? "vacío" : typeof d.fraction}, foto=${kind}, aviso-bot=${/captcha|robot|verifica|verify|human|humano/i.test(t)}, titulo=${String(d.title || "").length} letras`);
    }
    return { status: r.status, price, image, currency: "" };
  } catch { return { status: -1 }; }
}

// Sigue las redirecciones a mano para conocer los links intermedios (los links cortos de "compartir"
// pasan por la página real del producto antes de caer en la verificación anti-robots).
async function chain(url) {
  const hops = [url]; let cur = url;
  for (let i = 0; i < 8; i++) {
    let r; try { r = await fetch(cur, { redirect: "manual", signal: AbortSignal.timeout(15000), headers: { "User-Agent": UA, "Accept-Language": "es-MX,es;q=0.9" } }); } catch { break; }
    const loc = r.status >= 300 && r.status < 400 && r.headers.get("location");
    if (!loc) break;
    try { cur = new URL(loc, cur).href; } catch { break; }
    hops.push(cur);
  }
  return hops;
}
const isBotUrl = (u) => /account-verification|captcha|validateCaptcha|\/gz\/|login/i.test(u);
const shape = (u) => { try { const x = new URL(u); return x.hostname.replace(/^www\./, "") + "/" + (x.pathname.split("/")[1] || "").replace(/\d{4,}/g, "#").slice(0, 14); } catch { return "?"; } };


// Si la tienda no dio foto: buscarla en Bing Imágenes con el nombre del producto (directo o a través de Jina).
function bingPick(html) {
  const out = [];
  for (const m of html.matchAll(/\bm\s*=\s*"(\{[^"]*?murl[^"]*?\})"/g)) {
    try { const j = JSON.parse(decode(m[1])); if (j.murl || j.turl) out.push(j); } catch { /* resultado raro */ }
    if (out.length >= 8) break;
  }
  if (!out.length) return "";
  const shop = out.find((j) => /mlstatic|media-amazon|ssl-images-amazon|liverpool|walmart|coppel|sears|palaciodehierro|sanborns/i.test(j.murl || ""));
  const j = shop || out[0];
  // La miniatura de Bing siempre carga; se pide más grande. La original a veces no deja mostrarse en otras páginas.
  if (j.turl) { try { const u = new URL(j.turl); u.searchParams.set("w", "600"); u.searchParams.set("h", "600"); u.searchParams.set("c", "7"); return u.href.replace(/^http:/, "https:"); } catch { /* */ } }
  return isLogo(j.murl) ? "" : String(j.murl || "").replace(/^http:/, "https:");
}
async function searchImage(q) {
  q = String(q || "").replace(/\s+/g, " ").trim().slice(0, 100);
  if (q.length < 4) return "";
  const bing = `https://www.bing.com/images/search?q=${encodeURIComponent(q)}&form=HDRSC2&first=1&cc=mx&setlang=es-MX`;
  for (const attempt of ["directo", "jina"]) {
    try {
      const res = attempt === "directo"
        ? await fetch(bing, { signal: AbortSignal.timeout(15000), headers: { "User-Agent": UA, "Accept-Language": "es-MX,es;q=0.9" } })
        : await fetch("https://r.jina.ai/" + bing, { signal: AbortSignal.timeout(45000), headers: { "X-Return-Format": "html" } });
      if (!res.ok) continue;
      const img = bingPick(await res.text());
      if (process.env.DETALLE === "true") console.log(`    busqueda de foto (${attempt}): ${img ? "sí, " + new URL(img).hostname : "no"}`);
      if (img) return img;
    } catch { /* probar el siguiente */ }
  }
  return "";
}
// Palabras del link (amazon.com.mx/Cafetera-Oster-12-tazas/dp/..., articulo.mercadolibre.com.mx/MLM-1-silla-gamer-_JM)
function slugWords(urls) {
  for (const u of urls) {
    try {
      const segs = new URL(u).pathname.split("/").map((x) => decodeURIComponent(x));
      for (const sgm of segs) {
        const w = sgm.replace(/^MLM-?\d+-?/i, "").replace(/_JM.*$/i, "").split(/[-_]+/).filter((x) => x && !/^\d+$/.test(x) && !/^(dp|p|up|ref|sr|gp|product|item|articulo)$/i.test(x));
        if (w.length >= 3) return w.slice(0, 10).join(" ");
      }
    } catch { /* link raro */ }
  }
  return "";
}

async function leer(url) {
  const hops = await chain(url);
  const real = [...hops].reverse().find((u) => !isBotUrl(u)) || url;   // la última dirección antes del bloqueo
  if (process.env.DETALLE === "true") console.log(`    ruta: ${hops.map(shape).join(" → ")}`);
  let html = "", finalUrl = url, status = 0;
  try {
    const res = await fetch(url, {
      redirect: "follow", signal: AbortSignal.timeout(20000),
      headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml", "Accept-Language": "es-MX,es;q=0.9,en;q=0.6" },
    });
    status = res.status; finalUrl = res.url || url;
    if (res.ok) html = (await res.text()).slice(0, 4000000);
  } catch { status = -1; }
  let r = html && !looksBlocked(html, finalUrl) ? parse(html, finalUrl) : { price: NaN, currency: "", image: "", deliveryDays: null, title: "" };
  if (!okPrice(r.price) && /mercadoli[bv]re|meli\.la/i.test(finalUrl + url)) {
    try { const api = await mercadoLibreApi(hops.map((h) => { try { return decodeURIComponent(decodeURIComponent(h)); } catch { return h; } }).join(" ")); if (api) { if (okPrice(api.price)) { r.price = api.price; r.currency = api.currency; } r.image = r.image || api.image; } } catch { /* sin API */ }
  }
  if (!r.image && /amazon\.|amzn\.|a\.co\//i.test(finalUrl + " " + url)) {
    const asin = asinOf(finalUrl) || asinOf(url);
    if (asin) r.image = await amazonImage(asin);
  }
  let via = "";
  const mx = () => (/\.mx$/.test(new URL(real).hostname) || /amzn\.|a\.co|meli\.la/.test(url) ? "MXN" : "");
  if (!okPrice(r.price) || !r.image) {           // 1) Jina: el que mejor funciona con Amazon
    const jn = await jina(real);
    if (jn) {
      via = `jina ${jn.status}`;
      if (!okPrice(r.price) && okPrice(jn.price)) { r.price = jn.price; r.currency = jn.currency || mx(); via += " precio"; }
      if (jn.image && (!r.image || /images\/P\//.test(r.image))) { r.image = jn.image; via += " foto"; }
      if (r.deliveryDays == null && jn.deliveryDays != null) { r.deliveryDays = jn.deliveryDays; via += " entrega"; }
      if (!r.title && jn.title) r.title = jn.title;
    }
  }
  if (!okPrice(r.price) || !r.image) {           // 2) Microlink, si todavía falta algo
    const m = await microlink(real);
    if (m) {
      via += (via ? ", " : "") + `microlink ${m.status}`;
      if (!okPrice(r.price) && okPrice(m.price)) { r.price = m.price; r.currency = mx(); via += " precio"; }
      if (m.image && (!r.image || /images\/P\//.test(r.image))) { r.image = m.image; via += " foto"; }
    }
  }
  const blocked = !html || looksBlocked(html, finalUrl);
  r.slug = slugWords([...hops].reverse());
  let host = ""; try { host = new URL(finalUrl).hostname.replace(/^www\./, ""); } catch { /* link raro */ }
  return { ...r, ok: okPrice(r.price), blocked: blocked && !okPrice(r.price), status, host, size: html.length, via };
}

module.exports = { leer, parse, num, asinOf, parseDelivery, cleanTitle, searchImage, bingPick, slugWords };
