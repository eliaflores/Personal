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
  let img = [].concat(p.image || [])[0];
  if (img && typeof img === "object") img = img.url || img.contentUrl;
  return { price, currency, image: typeof img === "string" ? img : "" };
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

function parse(html, url) {
  const host = new URL(url).hostname;
  const r = { price: NaN, currency: "", image: "" };
  for (const p of jsonLdProducts(html)) {
    const x = fromProduct(p);
    if (!okPrice(r.price) && okPrice(x.price)) { r.price = x.price; r.currency = x.currency; }
    if (!r.image && x.image) r.image = x.image;
  }
  if (/amazon\./.test(host)) {
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
  const id = (url.match(/\b(MLM)-?(\d{6,})/i) || []);
  if (!id[2]) return null;
  const res = await fetch(`https://api.mercadolibre.com/items/MLM${id[2]}`, { signal: AbortSignal.timeout(15000), headers: { "User-Agent": UA } });
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

async function leer(url) {
  let html = "", finalUrl = url, status = 0;
  try {
    const res = await fetch(url, {
      redirect: "follow", signal: AbortSignal.timeout(20000),
      headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml", "Accept-Language": "es-MX,es;q=0.9,en;q=0.6" },
    });
    status = res.status; finalUrl = res.url || url;
    if (res.ok) html = (await res.text()).slice(0, 4000000);
  } catch { status = -1; }
  let r = html && !looksBlocked(html, finalUrl) ? parse(html, finalUrl) : { price: NaN, currency: "", image: "" };
  if (!okPrice(r.price) && /mercadoli[bv]re|meli\.la/i.test(finalUrl + url)) {
    try { const api = await mercadoLibreApi(finalUrl + " " + url); if (api) { if (okPrice(api.price)) { r.price = api.price; r.currency = api.currency; } r.image = r.image || api.image; } } catch { /* sin API */ }
  }
  if (!r.image && /amazon\.|amzn\.|a\.co\//i.test(finalUrl + " " + url)) {
    const asin = asinOf(finalUrl) || asinOf(url);
    if (asin) r.image = await amazonImage(asin);
  }
  const blocked = !html || looksBlocked(html, finalUrl);
  let host = ""; try { host = new URL(finalUrl).hostname.replace(/^www\./, ""); } catch { /* link raro */ }
  return { ...r, ok: okPrice(r.price), blocked: blocked && !okPrice(r.price), status, host, size: html.length };
}

module.exports = { leer, parse, num, asinOf };
