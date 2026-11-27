// Mi Oficina: tablero de trabajo para el cel y la compu (calendario, pendientes y requisiciones por meter).
// Mismo proyecto de Firebase que las otras apps, pero todo se guarda aparte en oficina/{uid} y solo lo ve su dueño.
// Para agregar otra sección: súmala a TABS (abajo) con su función de vista; Inicio puede mostrar un resumen de ella.

const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
const firebaseConfig = {
  apiKey: "AIzaSyC2j-keohRRLs8dnQk6hQXGT9eItJXmzik",
  authDomain: "personal-75acf.firebaseapp.com",
  projectId: "personal-75acf",
  storageBucket: "personal-75acf.firebasestorage.app",
  messagingSenderId: "12344295289",
  appId: "1:12344295289:web:5b54150483457bb94439a8",
};
const VAPID_KEY = "BBAeJ9V9CTbcTl3AYxrgkdhqwP3SM7l55cJ-TdnDuH2WG11sF5ROXub4S5ZGS7Ys59P5e-ZbdM8_HqGssgGNYBQ";

/* ---------- Iconos ---------- */
const P = {
  home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  note: '<path d="M5 4h14v10l-6 6H5z"/><path d="M13 20v-6h6"/>',
  clip: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM9 11h6M9 15h4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevL: '<path d="M15 6l-6 6 6 6"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  out: '<path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  repeat: '<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.6M20 4v4.6h-4.6M20 12a8 8 0 0 1-13.7 5.7L4 15.4M4 20v-4.6h4.6"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  box: '<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/>',
  truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  money: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',
  hash: '<path d="M9 3L7 21M17 3l-2 18M4 8h17M3 16h17"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-1 2-2 0-1.5-1.5-1.5-1.5-3 0-1 .8-1.5 2-1.5H17a4 4 0 0 0 4-4c0-4.4-4-7.5-9-7.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  notion: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M9 16V8l6 8V8"/>',
  apple: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M12 13.5v4M10 15.5h4"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
};
const I = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k] || ""}</svg>`;
const LOGO = `<svg class="logo" viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="12" width="44" height="44" rx="2" fill="#FFE58A" transform="rotate(-5 32 34)"/><path d="M18 32h26M18 40h20M18 48h14" stroke="#B9902E" stroke-width="3" stroke-linecap="round" transform="rotate(-5 32 34)"/><circle cx="31" cy="15" r="7" fill="#D8392C"/><circle cx="29" cy="13" r="2.4" fill="#FF9C8F"/></svg>`;
const GOOGLE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>`;

/* ---------- Catálogos ---------- */
const POSTIT = [
  { k: "amarillo", c: "#FFE58A" }, { k: "rosa", c: "#FFB8CB" }, { k: "azul", c: "#AFD9FF" },
  { k: "verde", c: "#C2EBA8" }, { k: "naranja", c: "#FFCA94" }, { k: "lila", c: "#DCCBFF" },
];
const CAL_COLORS = ["#F4A39A", "#8EC1F7", "#9AD5A6", "#FFD970", "#C9A6F5", "#FDB57D", "#BDB5AA"];
const PIN_COLORS = ["#2F6FD0", "#2E9E5B", "#E0A21A", "#8A55D6", "#D8392C"];
const DEFAULT_AREAS = [{ k: "general", l: "General", c: "#FFE58A" }, { k: "compras", l: "Compras", c: "#AFD9FF" }, { k: "juntas", l: "Juntas", c: "#C2EBA8" }];
const REMINDERS = [{ k: "15m", l: "15 min antes" }, { k: "30m", l: "30 min antes" }, { k: "1h", l: "1 hora antes" }, { k: "1d", l: "1 día antes" }];
const DEFAULT_REMIND = ["30m"];
const REPEATS = [{ k: "no", l: "No se repite" }, { k: "laborables", l: "Entre semana" }, { k: "semanal", l: "Cada semana" }, { k: "mensual", l: "Cada mes" }, { k: "anual", l: "Cada año" }];
const ESTADOS = {
  pormeter: { l: "Por meter", next: "metida", nextL: "Ya la metí" },
  metida: { l: "Metida", next: "autorizada", nextL: "Ya la autorizaron", stamp: "Metida" },
  autorizada: { l: "Autorizada", next: "recibida", nextL: "Ya llegó", stamp: "Autorizada" },
  recibida: { l: "Recibida", stamp: "Recibida" },
  rechazada: { l: "Rechazada", next: "metida", nextL: "La volví a meter", stamp: "Rechazada" },
};
const COLUMNS = [
  { k: "pormeter", l: "Por meter", has: ["pormeter", "rechazada"] }, { k: "metida", l: "Metidas", has: ["metida"] },
  { k: "autorizada", l: "Autorizadas", has: ["autorizada"] }, { k: "recibida", l: "Recibidas", has: ["recibida"] },
];
const NOTION_COLOR = "#D9CFC4";

/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $("#app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u) => { u = String(u || "").trim(); if (!u) return ""; if (!/^https?:\/\//i.test(u)) u = "https://" + u; try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch (e) { return ""; } };
const okHex = (c) => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c);
const pad2 = (n) => String(n).padStart(2, "0");
const isoOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayISO = () => isoOf(new Date());
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const parse = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (iso, n) => { const d = parse(iso); d.setDate(d.getDate() + n); return isoOf(d); };
const addMonths = (ym, n) => { const [y, m] = ym.split("-").map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; };
const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
const weekStart = (iso) => { const d = parse(iso); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return isoOf(d); };
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const DIAS3 = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const DIAS1 = ["D", "L", "M", "M", "J", "V", "S"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MES3 = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fLong = (iso) => { const d = parse(iso); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? " de " + d.getFullYear() : ""}`; };
const fMed = (iso) => { const d = parse(iso); return `${DIAS3[d.getDay()]} ${d.getDate()} ${MES3[d.getMonth()]}`; };
const toMin = (t) => { if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return null; const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fTime = (t) => { const m = toMin(t); if (m == null) return ""; const h = Math.floor(m / 60), mi = m % 60; return `${h % 12 || 12}:${pad2(mi)} ${h < 12 ? "am" : "pm"}`; };
const fTimeS = (t) => { const m = toMin(t); if (m == null) return ""; const h = Math.floor(m / 60), mi = m % 60; return `${h % 12 || 12}${mi ? ":" + pad2(mi) : ""}${h < 12 ? "am" : "pm"}`; };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
const mxn = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n || 0);
const num = (v) => { const n = Number(String(v ?? "").replace(/[^\d.]/g, "")); return Number.isFinite(n) ? n : 0; };
const hashStr = (t) => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return h >>> 0; };
const newId = () => { const a = crypto.getRandomValues(new Uint8Array(14)); return Array.from(a, (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join(""); };
const deviceTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City"; } catch (e) { return "America/Mexico_City"; } };
function localStore(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
const ago = (ms) => {
  if (!ms) return "";
  const s = (Date.now() - ms) / 1000;
  if (s < 90) return "hace un momento";
  if (s < 3600) return `hace ${Math.round(s / 60)} min`;
  if (s < 86400) return `hace ${Math.round(s / 3600)} h`;
  return `el ${fMed(isoOf(new Date(ms)))}`;
};
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");
const firstName = (s) => String(s || "").trim().split(/\s+/)[0] || "";

/* ---------- Repeticiones (igual que en oficina-avisos/logica.js) ---------- */
const dow = (iso) => parse(iso).getDay();
function nextStart(e, from) {
  if (!e || !ISO.test(e.date || "")) return null;
  const rep = e.repeat || "no";
  const firstWeekday = (d) => { for (let k = 0; k < 7; k++) { const w = dow(d); if (w >= 1 && w <= 5) return d; d = addDays(d, 1); } return null; };
  if (from <= e.date) return rep === "laborables" ? firstWeekday(e.date) : e.date;
  if (rep === "no") return null;
  if (rep === "laborables") return firstWeekday(from);
  if (rep === "semanal") return addDays(e.date, Math.ceil(diffDays(e.date, from) / 7) * 7);
  const [, m, d] = e.date.split("-").map(Number);
  let [Y, M] = from.split("-").map(Number);
  for (let k = 0; k < 60; k++) {
    const mm = rep === "anual" ? m : M;
    const cand = new Date(Y, mm - 1, d);
    if (cand.getMonth() === mm - 1) { const iso = isoOf(cand); if (iso >= from) return iso; }
    if (rep === "anual") Y++; else { M++; if (M > 12) { M = 1; Y++; } }
  }
  return null;
}
function occursOn(e, iso) {
  if (!e || !ISO.test(e.date || "") || iso < e.date) return false;
  const rep = e.repeat || "no";
  if (rep === "no") return iso <= (e.endDate && e.endDate > e.date ? e.endDate : e.date);
  return nextStart(e, iso) === iso;
}

/* ---------- Estado ---------- */
const S = {
  authReady: false, user: null, demo: false, error: "",
  prof: null, events: [], todos: [], reqs: [], ext: {},
  sel: todayISO(), month: todayISO().slice(0, 7), calView: localStore("oficina.calView") || "mes",
  todoF: "abiertos", todoArea: "", reqCol: "pormeter",
  hide: new Set((() => { try { return JSON.parse(localStore("oficina.ocultos") || "[]"); } catch (e) { return []; } })()),
};
let fb = null;          // { app, auth, db, U, F }
let unsubs = [];
let pendingOpen = null; // lo que pidió abrir un aviso (#evento/ID) mientras cargaba

const areas = () => (Array.isArray(S.prof?.areas) && S.prof.areas.length ? S.prof.areas : DEFAULT_AREAS).filter((a) => a && a.k && a.l);
const area = (k) => areas().find((a) => a.k === k) || null;
const areaColor = (k) => { const a = area(k); return a && okHex(a.c) ? a.c : "#FFE58A"; };
const todoColor = (t) => (okHex(t.color) ? t.color : t.area && area(t.area) ? areaColor(t.area) : POSTIT[0].c);
const isOpenReq = (r) => ["pormeter", "rechazada", "", undefined].includes(r.estado);
const cals = () => (Array.isArray(S.prof?.cals) ? S.prof.cals : []).filter((c) => c && c.id);
const notionOn = () => !!(S.prof?.notion?.db && S.prof.notion.on !== false);
function extMeta(k) {
  if (k === "notion") return notionOn() ? { name: "Notion", color: NOTION_COLOR, kind: "Notion" } : null;
  const c = cals().find((x) => x.id === k);
  return c && c.on !== false ? { name: c.name || "Calendario", color: okHex(c.color) ? c.color : CAL_COLORS[0], kind: /google/i.test(c.url || "") ? "Google" : /icloud/i.test(c.url || "") ? "Apple" : "Calendario" } : null;
}

/* ---------- Qué hay cada día ---------- */
const byTime = (a, b) => (a.allDay === b.allDay ? (toMin(a.time) ?? -1) - (toMin(b.time) ?? -1) || String(a.title).localeCompare(String(b.title)) : a.allDay ? -1 : 1);
function dayItems(iso, { all = false, only = null } = {}) {
  const hidden = (k) => !all && S.hide.has(k);
  const want = (k) => !only || only.includes(k);
  const out = [];
  if (want("ev") && !hidden("app")) for (const e of S.events) if (occursOn(e, iso)) {
    const multi = (e.repeat || "no") === "no" && e.endDate && e.endDate > e.date;
    const timed = !e.allDay && toMin(e.time) != null && !multi;
    out.push({ kind: "ev", id: e.id, title: e.title || "Evento", time: timed ? e.time : "", endTime: timed ? e.endTime : "", allDay: !timed, color: areaColor(e.area), place: e.place, link: e.link, src: "Mi Oficina", repeat: e.repeat });
  }
  if (want("ext")) for (const [k, x] of Object.entries(S.ext)) {
    const meta = extMeta(k);
    if (!meta || hidden("ext:" + k)) continue;
    for (const v of x.events || []) {
      if (!(v.date === iso || (v.endDate && v.date <= iso && iso <= v.endDate))) continue;
      const first = v.date === iso;
      out.push({ kind: "ext", src: k, id: v.id, title: v.title, time: !v.allDay && first ? v.time : "", endTime: !v.allDay && first && !v.endDate ? v.endTime : "", allDay: !!v.allDay || !first, color: meta.color, place: v.place, srcName: meta.name, srcKind: meta.kind });
    }
  }
  if (want("todo") && !hidden("todo")) for (const t of S.todos) if (!t.done && t.due === iso) out.push({ kind: "todo", id: t.id, title: t.t, time: t.time || "", allDay: !t.time, color: todoColor(t) });
  if (want("req") && !hidden("req")) for (const r of S.reqs) if (isOpenReq(r) && r.due === iso) out.push({ kind: "req", id: r.id, title: "Meter: " + (r.t || "requisición"), allDay: true, color: "#FFFFFF" });
  return out.sort(byTime);
}
const meetings = (iso) => dayItems(iso, { all: true, only: ["ev", "ext"] });

/* ---------- Orden y etiquetas ---------- */
function sortTodos(list) {
  const t = todayISO();
  const grp = (x) => (x.due ? (x.due < t ? 0 : x.due === t ? 1 : 2) : 3);
  return list.slice().sort((a, b) => grp(a) - grp(b) || (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0) || String(a.due || "").localeCompare(String(b.due || "")) || (toMin(a.time) ?? 9999) - (toMin(b.time) ?? 9999) || (a.createdAt || 0) - (b.createdAt || 0));
}
const sortReqs = (list) => list.slice().sort((a, b) => (a.due ? 0 : 1) - (b.due ? 0 : 1) || String(a.due || "").localeCompare(String(b.due || "")) || (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0) || (a.createdAt || 0) - (b.createdAt || 0));
function dueInfo(iso, time) {
  if (!iso) return { t: "Sin fecha", c: "none" };
  const d = diffDays(todayISO(), iso);
  const tm = time ? " · " + fTimeS(time) : "";
  if (d < 0) return { t: d === -1 ? "Venció ayer" : `Venció hace ${-d} días`, c: "late" };
  if (d === 0) return { t: "Hoy" + tm, c: "today" };
  if (d === 1) return { t: "Mañana" + tm, c: "" };
  if (d < 7) return { t: DIAS[parse(iso).getDay()][0].toUpperCase() + DIAS[parse(iso).getDay()].slice(1) + tm, c: "" };
  return { t: fMed(iso) + tm, c: "" };
}
function reqDue(r) {
  if (!r.due) return { t: "Sin fecha", c: "" };
  const d = diffDays(todayISO(), r.due);
  if (d < 0) return { t: d === -1 ? "Atrasada 1 día" : `Atrasada ${-d} días`, c: "late" };
  if (d === 0) return { t: "Meter hoy", c: "today" };
  if (d === 1) return { t: "Mañana", c: "" };
  return { t: fMed(r.due), c: "" };
}

/* ---------- Firebase ---------- */
async function loadFirebase() {
  if (fb) return fb;
  const [A, U, F] = await Promise.all([import(FB + "firebase-app.js"), import(FB + "firebase-auth.js"), import(FB + "firebase-firestore.js")]);
  const fapp = A.initializeApp(firebaseConfig, "oficina");
  const auth = U.getAuth(fapp);
  let db;
  try { db = F.initializeFirestore(fapp, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
  catch (e) { db = F.initializeFirestore(fapp, {}); }
  fb = { app: fapp, auth, db, U, F };
  return fb;
}
const me = () => (S.demo ? "demo" : S.user?.uid);
const colRef = (c) => fb.F.collection(fb.db, "oficina", me(), c);
const docRef = (c, id) => fb.F.doc(fb.db, "oficina", me(), c, id);
const profRef = () => fb.F.doc(fb.db, "oficina", me());
const LISTS = { eventos: "events", pendientes: "todos", requis: "reqs" };
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

function writeErr(e) {
  console.error(e);
  toast(e && e.code === "permission-denied" ? "Firebase no dio permiso: faltan las reglas nuevas (con “oficina”)." : "No se pudo guardar. Revisa tu internet.");
}
// Guarda (crea o actualiza) sin esperar a internet: Firestore lo sube cuando haya conexión.
function put(col, id, data) {
  const now = Date.now(), isNew = !id;
  id = id || newId();
  const rec = clean({ ...data, updatedAt: now, ...(isNew ? { createdAt: now } : {}) });
  if (S.demo) {
    const list = S[LISTS[col]], i = list.findIndex((x) => x.id === id);
    if (i >= 0) list[i] = { ...list[i], ...rec }; else list.push({ id, ...rec });
    demoSave(); schedule();
    return id;
  }
  fb.F.setDoc(docRef(col, id), rec, { merge: true }).catch(writeErr);
  return id;
}
function del(col, id) {
  if (S.demo) { S[LISTS[col]] = S[LISTS[col]].filter((x) => x.id !== id); demoSave(); schedule(); return; }
  const e = col === "eventos" && S.events.find((x) => x.id === id);
  if (e && e.notionId) fb.F.setDoc(docRef("borrados", id), { notionId: e.notionId, at: Date.now() }).catch(() => {});
  fb.F.deleteDoc(docRef(col, id)).catch(writeErr);
}
function putProf(patch) {
  if (S.demo) { deepMerge(S.prof, patch); demoSave(); schedule(); return; }
  fb.F.setDoc(profRef(), patch, { merge: true }).catch(writeErr);
}
function deepMerge(t, s) { for (const [k, v] of Object.entries(s)) { if (v && typeof v === "object" && !Array.isArray(v) && t[k] && typeof t[k] === "object" && !Array.isArray(t[k])) deepMerge(t[k], v); else t[k] = v; } return t; }

function stopAll() { unsubs.forEach((u) => { try { u(); } catch (e) {} }); unsubs = []; }
function listen() {
  const { F } = fb;
  const fail = (e) => {
    console.error(e);
    S.error = e && e.code === "permission-denied"
      ? "Firebase no dio permiso. En la consola de Firebase → Firestore Database → Rules pega las reglas nuevas (deben incluir “oficina”) y dale Publicar."
      : "No se pudo conectar. Revisa tu internet.";
    render();
  };
  unsubs.push(F.onSnapshot(profRef(), (snap) => {
    if (!snap.exists()) { createProfile(); return; }
    S.prof = snap.data();
    if (S.prof.tz !== deviceTz() && !S._tzFixed) { S._tzFixed = true; putProf({ tz: deviceTz() }); }
    schedule();
  }, fail));
  const sub = (c, set) => unsubs.push(F.onSnapshot(colRef(c), (q) => { set(q.docs.map((d) => ({ id: d.id, ...d.data() }))); schedule(); }, fail));
  sub("eventos", (v) => (S.events = v));
  sub("pendientes", (v) => (S.todos = v));
  sub("requis", (v) => (S.reqs = v));
  unsubs.push(F.onSnapshot(colRef("externos"), (q) => { S.ext = Object.fromEntries(q.docs.map((d) => [d.id, d.data()])); schedule(); }, () => {}));
}
function newProfile() {
  return { name: firstName(S.user?.displayName), tz: deviceTz(), areas: DEFAULT_AREAS, cals: [], notion: { db: "", on: false }, feed: { on: false },
    avisos: { resumen: true, hora: "08:00", dias: [1, 2, 3, 4, 5], eventos: true, pendientes: true, requis: true }, createdAt: Date.now() };
}
function createProfile() { fb.F.setDoc(profRef(), newProfile(), { merge: true }).catch((e) => { S.error = e && e.code === "permission-denied" ? "Firebase no dio permiso. Faltan las reglas nuevas de Firestore (con “oficina”)." : "No se pudo crear tu oficina."; render(); }); }

let raf = 0;
function schedule() { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; render(); }); }

/* ---------- Modo demo (sin cuenta: todo se queda en este dispositivo) ---------- */
function demoData() {
  const t = todayISO(), d = (n) => addDays(t, n), ws = weekStart(t);
  const id = () => newId();
  const now = Date.now();
  return {
    prof: { ...newProfile(), name: "", areas: [...DEFAULT_AREAS, { k: "ti", l: "Sistemas", c: "#DCCBFF" }], cals: [{ id: "cdemo", name: "Personal (Apple)", url: "webcal://p01-caldav.icloud.com/published/2/demo", color: "#F4A39A", on: true }], notion: { db: "https://www.notion.so/demo-0123456789abcdef0123456789abcdef", on: true },
      calStatus: { cdemo: { ok: true, at: now - 6 * 60000, n: 3 } }, notionStatus: { ok: true, at: now - 9 * 60000, traidos: 1 } },
    events: [
      { id: id(), title: "Daily con el equipo", date: ws, time: "09:00", endTime: "09:15", repeat: "laborables", area: "juntas", place: "Meet", link: "https://meet.google.com/", remind: ["15m"] },
      { id: id(), title: "Junta semanal de compras", date: addDays(ws, 1), time: "11:00", endTime: "12:00", repeat: "semanal", area: "compras", place: "Sala 2", remind: ["30m"] },
      { id: id(), title: "Revisión de presupuesto", date: t, time: "12:30", endTime: "13:30", area: "general", place: "Sala de juntas 3", remind: ["30m", "1d"], note: "Llevar el comparativo de cotizaciones." },
      { id: id(), title: "Llamada con proveedor de papelería", date: d(1), time: "10:00", endTime: "10:30", area: "compras", remind: ["15m"] },
      { id: id(), title: "Cierre de mes", date: d(4), allDay: true, area: "general", remind: ["1d"] },
      { id: id(), title: "Capacitación de seguridad", date: d(6), time: "16:00", endTime: "18:00", area: "general", place: "Auditorio" },
      { id: id(), title: "Comida con dirección", date: d(2), time: "14:30", endTime: "16:00", area: "juntas", place: "La Fonda" },
    ],
    todos: [
      { id: id(), t: "Mandar reporte de gastos a contabilidad", due: t, time: "16:00", urgente: true, area: "general", createdAt: now - 5e6 },
      { id: id(), t: "Llamar a Sistemas por la impresora del piso 3", due: d(-1), area: "ti", createdAt: now - 4e6 },
      { id: id(), t: "Firmar vacaciones de Ana", due: t, area: "general", color: "#FFB8CB", createdAt: now - 3e6 },
      { id: id(), t: "Actualizar inventario de papelería", due: d(2), area: "compras", createdAt: now - 2e6 },
      { id: id(), t: "Preparar presentación de resultados del trimestre", area: "juntas", color: "#C2EBA8", createdAt: now - 1e6 },
      { id: id(), t: "Responder correo de Recursos Humanos", due: d(5), color: "#FFCA94", createdAt: now - 9e5 },
      { id: id(), t: "Pedir firmas del contrato de limpieza", done: true, doneAt: now - 3600000, createdAt: now - 8e6 },
    ],
    reqs: [
      { id: id(), t: "Tóner HP 85A", qty: "4", unit: "piezas", prov: "Office Depot", monto: 3200, area: "compras", due: t, estado: "pormeter", createdAt: now - 6e6 },
      { id: id(), t: "Proyector para la sala 2", qty: "1", unit: "pieza", prov: "Cyberpuerta", monto: 11500, area: "ti", due: d(1), estado: "rechazada", note: "Pidieron otra cotización.", createdAt: now - 5e6 },
      { id: id(), t: "Sillas ergonómicas", qty: "2", unit: "piezas", prov: "Muebles Ofik", monto: 8900, area: "compras", due: d(3), estado: "pormeter", urgente: true, createdAt: now - 4e6 },
      { id: id(), t: "Licencias de Adobe Acrobat", qty: "5", unit: "licencias", prov: "Adobe", monto: 7450, area: "ti", estado: "metida", folio: "REQ-2026-0412", metidaEl: d(-3), createdAt: now - 7e6 },
      { id: id(), t: "Papel bond carta", qty: "10", unit: "cajas", prov: "Office Depot", monto: 6800, area: "compras", estado: "autorizada", folio: "REQ-2026-0398", metidaEl: d(-8), createdAt: now - 9e6 },
      { id: id(), t: "Cables HDMI de 3 m", qty: "6", unit: "piezas", prov: "Steren", monto: 1290, area: "ti", estado: "recibida", folio: "REQ-2026-0377", metidaEl: d(-15), createdAt: now - 1e7, updatedAt: now - 2e5 },
    ],
    ext: {
      cdemo: { events: [{ id: "x1", title: "Dentista", date: d(3), time: "18:00", endTime: "19:00", allDay: false, place: "Consultorio" }, { id: "x2", title: "Cumpleaños de mamá", date: d(8), allDay: true }, { id: "x3", title: "Gym", date: t, time: "19:30", endTime: "20:30" }] },
      notion: { events: [{ id: "n1", title: "Revisión de OKRs (Notion)", date: d(1), time: "16:00", endTime: "17:00", allDay: false, url: "https://www.notion.so/" }] },
    },
  };
}
function demoSave() { if (S.demo) localStore("oficina.demo", JSON.stringify({ prof: S.prof, events: S.events, todos: S.todos, reqs: S.reqs, ext: S.ext })); }
function startDemo() {
  let data = null;
  try { data = JSON.parse(localStore("oficina.demo") || "null"); } catch (e) {}
  if (!data || !data.prof) data = demoData();
  Object.assign(S, { demo: true, user: null, prof: data.prof, events: data.events || [], todos: data.todos || [], reqs: data.reqs || [], ext: data.ext || {}, error: "" });
  localStore("oficina.modo", "demo");
  render();
}
function endDemo() { localStore("oficina.modo", null); localStore("oficina.demo", null); location.href = location.pathname; }

/* ---------- Rutas y pestañas ---------- */
const TABS = [
  { k: "inicio", l: "Inicio", i: "home", view: viewInicio, add: () => openChooser() },
  { k: "calendario", l: "Calendario", i: "cal", view: viewCalendario, add: () => openEvent(null, { date: S.sel }) },
  { k: "pendientes", l: "Pendientes", i: "note", view: viewPendientes, add: () => openTodo(), count: () => S.todos.filter((t) => !t.done).length },
  { k: "requis", l: "Requisiciones", short: "Requis", i: "clip", view: viewRequis, add: () => openReq(), count: () => S.reqs.filter(isOpenReq).length },
  { k: "ajustes", l: "Ajustes", i: "gear", view: viewAjustes },
];
function route() {
  const [v, arg] = decodeURIComponent(location.hash.slice(1)).split("/");
  if (v === "evento") return { v: "calendario", open: "evento", id: arg };
  if (v === "pendiente") return { v: "pendientes", open: "pendiente", id: arg };
  if (v === "requi") return { v: "requis", open: "requi", id: arg };
  return { v: TABS.some((t) => t.k === v) ? v : "inicio" };
}
const go = (v) => { if (location.hash !== "#" + v) location.hash = v; else render(); };

/* ---------- Pintar ---------- */
function render() {
  if (S.error) return renderError();
  if (!S.demo && !S.authReady) return;
  if (!S.demo && !S.user) return renderSignIn();
  if (!S.prof) { app.innerHTML = `<div class="loading"><div class="paper">Abriendo tu oficina…</div></div>`; return; }
  const r = route();
  const tab = TABS.find((t) => t.k === r.v) || TABS[0];
  // Si alguien está escribiendo en algo de la pantalla, no se le borra al repintar.
  const a = document.activeElement, keep = a && app.contains(a) && a.id ? { id: a.id, v: a.value, s: a.selectionStart, e: a.selectionEnd } : null;
  app.innerHTML = shell(tab, tab.view());
  if (keep) { const el = document.getElementById(keep.id); if (el) { el.value = keep.v; el.focus(); try { el.setSelectionRange(keep.s, keep.e); } catch (e) {} } }
  document.title = tab.k === "inicio" ? "Mi Oficina" : `${tab.l} · Mi Oficina`;
  if (r.open && r.id && !pendingOpen) pendingOpen = r;
  if (pendingOpen) tryPendingOpen();
}
function tryPendingOpen() {
  const r = pendingOpen;
  const found = r.open === "evento" ? S.events.find((e) => e.id === r.id) : r.open === "pendiente" ? S.todos.find((t) => t.id === r.id) : S.reqs.find((q) => q.id === r.id);
  if (!found) { if (S.demo || (S._loadedAt && Date.now() - S._loadedAt > 4000)) pendingOpen = null; return; }
  pendingOpen = null;
  history.replaceState(null, "", "#" + route().v);
  if (r.open === "evento") { S.sel = nextStart(found, todayISO()) || found.date; S.month = S.sel.slice(0, 7); render(); openEventDetail(found.id, S.sel); }
  else if (r.open === "pendiente") openTodo(found.id);
  else openReq(found.id);
}
function avatarHtml() {
  const ph = S.user?.photoURL;
  const n = S.prof?.name || S.user?.displayName || (S.demo ? "Demo" : "");
  return ph ? `<img src="${esc(ph)}" alt="" referrerpolicy="no-referrer">` : esc((n[0] || "?").toUpperCase());
}
function shell(tab, content) {
  const t = todayISO();
  const nav = (cls) => TABS.map((x) => { const c = x.count ? x.count() : 0; return `<a href="#${x.k}" ${x.k === tab.k ? 'aria-current="page"' : ""}>${I(x.i)}<span>${esc(cls === "bottom" ? x.short || x.l : x.l)}</span>${cls === "tabs" && c ? `<i class="count">${c}</i>` : ""}</a>`; }).join("");
  return `<div class="shell">
    <header class="top">
      <a class="brand" href="#inicio">${LOGO}<span>Mi Oficina</span></a>
      <div class="grow"></div>
      <span class="today"><span class="long">${esc(cap(fLong(t)))}</span><span class="short">${esc(cap(fMed(t)))}</span></span>
      <button class="avatar" data-go="ajustes" aria-label="Ajustes">${avatarHtml()}</button>
    </header>
    <nav class="tabs" aria-label="Secciones">${nav("tabs")}</nav>
    <div class="frame"><main class="board"><div class="board-in">${S.demo ? demoBanner() : ""}${content}</div></main></div>
    <nav class="bottom" aria-label="Secciones">${nav("bottom")}</nav>
    ${tab.add ? `<button class="fab" data-act="fab" aria-label="Agregar">${I("plus")}</button>` : ""}
  </div>`;
}
const demoBanner = () => `<div class="paper taped" style="padding:10px 14px;margin:6px 0 22px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-weight:700;font-size:14px;--r:0">
  <span style="flex:1;min-width:200px">Estás viendo la demo: lo que cambies se queda solo en este dispositivo.</span>
  <button class="btn btn-sm btn-ink" data-act="demo-exit">${GOOGLE}Entrar con Google</button></div>`;

/* ---------- Pedacitos ---------- */
function postitHtml(t, { small = false } = {}) {
  const h = hashStr(t.id || t.t || "x");
  const r = ((h % 9) - 4) * 0.6;
  const deco = h % 3 === 0 ? "taped" : "pinned";
  const pinc = t.urgente ? "#D8392C" : PIN_COLORS[h % 4];
  const di = dueInfo(t.due, t.time);
  const a = area(t.area);
  return `<div class="postit ${deco} ${t.done ? "done" : ""}" style="--pc:${todoColor(t)};--r:${r}deg;--pinc:${pinc}" role="button" tabindex="0" data-act="todo" data-id="${esc(t.id)}" aria-label="${esc(t.t)}">
    ${a && !small ? `<span class="area">${esc(a.l)}</span>` : ""}
    ${t.urgente && !t.done ? `<span class="urg">URGENTE</span>` : ""}
    <div class="txt">${esc(t.t)}</div>
    <div class="ft"><span class="due ${t.done ? "" : di.c}">${t.done ? "Hecho" : esc(di.t)}</span>
    <button class="tick" data-act="todo-done" data-id="${esc(t.id)}" aria-label="${t.done ? "Marcar como pendiente" : "Marcar como hecho"}">${I("check")}</button></div>
  </div>`;
}
function rowHtml(x, { iso, showDay = false } = {}) {
  const t = todayISO(), nm = nowMin();
  const st = toMin(x.time), en = toMin(x.endTime) ?? (st != null ? st + 30 : null);
  const isToday = iso === t;
  const past = isToday && st != null && en <= nm;
  const now = isToday && st != null && st <= nm && nm < en;
  const meta = [x.allDay ? "Todo el día" : x.endTime ? `${fTime(x.time)} – ${fTime(x.endTime)}` : fTime(x.time), x.place].filter(Boolean).join(" · ");
  const side = x.kind === "ext" ? `<span class="badge">${esc(x.srcKind || x.srcName)}</span>` : x.kind === "todo" ? `<span class="badge">Pendiente</span>` : x.kind === "req" ? `<span class="badge">Requi</span>` : x.repeat && x.repeat !== "no" ? `<span class="side" title="Se repite">${I("repeat")}</span>` : "";
  const act = x.kind === "ev" ? `data-act="ev" data-id="${esc(x.id)}" data-date="${iso}"` : x.kind === "ext" ? `data-act="ext" data-src="${esc(x.src)}" data-id="${esc(x.id)}"` : x.kind === "todo" ? `data-act="todo" data-id="${esc(x.id)}"` : `data-act="req" data-id="${esc(x.id)}"`;
  return `<button class="row ${past ? "past" : ""} ${now ? "now" : ""}" ${act}>
    <span class="tm">${x.allDay ? "—" : esc(fTimeS(x.time))}</span>
    <span class="tx"><span class="t1"><i class="sw" style="background:${x.color}"></i>${esc(x.title)}</span><span class="t2 d-block">${esc(showDay ? fMed(iso) + " · " + meta : meta)}</span></span>
    ${side}
  </button>`;
}
function reqCardHtml(r) {
  const est = ESTADOS[r.estado] || ESTADOS.pormeter;
  const a = area(r.area);
  const d = reqDue(r);
  return `<div class="paper req" role="button" tabindex="0" data-act="req" data-id="${esc(r.id)}" style="--ac:${a ? a.c : "var(--line)"}">
    <div class="hd"><span>Requisición${a ? " · " + esc(a.l) : ""}</span><span>${r.folio ? "Folio " + esc(r.folio) : "Sin folio"}</span></div>
    ${est.stamp ? `<span class="stamp st-${esc(r.estado)}">${esc(est.stamp)}</span>` : ""}
    <div class="ttl">${esc(r.t || "Requisición")}</div>
    <dl>
      ${r.qty ? `<dt>Cantidad</dt><dd>${esc(r.qty)} ${esc(r.unit || "")}</dd>` : ""}
      ${r.prov ? `<dt>Proveedor</dt><dd>${esc(r.prov)}</dd>` : ""}
      ${r.monto ? `<dt>Monto</dt><dd>${esc(mxn(num(r.monto)))}</dd>` : ""}
      ${r.metidaEl && r.estado !== "pormeter" ? `<dt>Se metió</dt><dd>${esc(fMed(r.metidaEl))}</dd>` : ""}
    </dl>
    <div class="req-acts">${isOpenReq(r) ? `<span class="pill ${d.c}">${esc(d.t)}</span>` : `<span class="pill">${esc(est.l)}</span>`}
      ${est.next ? `<button class="btn btn-sm ${r.estado === "pormeter" ? "btn-ink" : ""}" data-act="req-next" data-id="${esc(r.id)}">${I("check")}${esc(est.nextL)}</button>` : ""}</div>
  </div>`;
}
const lbl = (txt, cls = "") => `<h2 class="lbl ${cls}">${txt}</h2>`;

/* ---------- Inicio ---------- */
function viewInicio() {
  const t = todayISO(), nm = nowMin(), h = new Date().getHours();
  const hi = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  const name = S.prof?.name || "";
  const todayEv = meetings(t);
  const timed = todayEv.filter((x) => !x.allDay);
  const next = timed.find((x) => (toMin(x.endTime) ?? toMin(x.time) + 30) > nm);
  const open = sortTodos(S.todos.filter((x) => !x.done));
  const late = open.filter((x) => x.due && x.due < t);
  const forToday = open.filter((x) => x.due === t);
  const reqOpen = sortReqs(S.reqs.filter(isOpenReq));
  const reqSoon = reqOpen.filter((r) => r.due && diffDays(t, r.due) <= 2);
  const inFlight = S.reqs.filter((r) => r.estado === "metida" || r.estado === "autorizada");
  const total = reqOpen.reduce((s, r) => s + num(r.monto), 0);
  const tom = meetings(addDays(t, 1));

  const sentence = [
    todayEv.length ? plural(todayEv.length, "evento", "eventos") : "agenda libre",
    forToday.length ? `${plural(forToday.length, "pendiente", "pendientes")} para hoy` : open.length ? plural(open.length, "pendiente", "pendientes") : "sin pendientes",
    reqOpen.length ? `${plural(reqOpen.length, "requisición", "requisiciones")} por meter` : "",
  ].filter(Boolean).join(", ");

  const mini = (n, txt, c, go, r) => `<a class="postit mini pinned" href="#${go}" style="--pc:${c};--r:${r}deg;--pinc:${PIN_COLORS[Math.abs(Math.round(r * 3)) % 4]}"><b>${n}</b><span>${txt}</span></a>`;

  const ws = weekStart(t);
  const week = Array.from({ length: 7 }, (_, i) => {
    const iso = addDays(ws, i), items = dayItems(iso, { all: true });
    const dots = items.slice(0, 4).map((x) => `<i style="background:${x.color}"></i>`).join("");
    return `<button class="paper wd ${iso === t ? "today" : ""} ${iso < t ? "past" : ""}" data-act="day-go" data-date="${iso}" style="transform:rotate(${((hashStr(iso) % 5) - 2) * 0.4}deg)">
      <span class="d1">${DIAS3[parse(iso).getDay()]}</span><span class="d2">${parse(iso).getDate()}</span>
      <span class="dots">${dots}</span><span class="d3">${items.length ? `<b>${items.length}</b> <span class="w">${items.length === 1 ? "cosa" : "cosas"}</span>` : "—"}</span></button>`;
  }).join("");

  const shown = open.slice(0, 7);
  return `<div class="home">
    <section class="a-hero"><div class="paper hero pinned" style="--pinc:#2F6FD0">
      <div class="date">${esc(fLong(t))}</div>
      <h1>${hi}${name ? ", " + esc(name) : ""}</h1>
      <p>Hoy: ${esc(sentence)}.</p>
      ${next ? `<div class="next-up">${I("clock")}<span>${toMin(next.time) <= nm ? "Ahora" : "Sigue"}: <b>${esc(fTime(next.time))}</b> · ${esc(next.title)}</span></div>` : ""}
    </div></section>

    <section class="a-notes" aria-label="Resumen"><div class="notes4">
      ${mini(todayEv.length, todayEv.length === 1 ? "evento hoy" : "eventos hoy", "#AFD9FF", "calendario", -2)}
      ${mini(open.length, open.length === 1 ? "pendiente" : "pendientes", "#FFE58A", "pendientes", 1.5)}
      ${mini(late.length, late.length === 1 ? "vencido" : "vencidos", late.length ? "#FFB8CB" : "#C2EBA8", "pendientes", -1)}
      ${mini(reqOpen.length, "requis por meter", "#FFCA94", "requis", 2)}
    </div></section>

    <section class="a-week"><div class="sec-h">${lbl("Esta semana")}<span class="sp"></span><a class="btn btn-sm" href="#calendario">${I("cal")}Calendario</a></div>
      <div class="week">${week}</div></section>

    <section class="a-today"><div class="sec-h">${lbl("Hoy", "red")}<span class="sp"></span><button class="btn btn-sm" data-act="add-ev" data-date="${t}">${I("plus")}Evento</button></div>
      <div class="paper idx">
        <div class="idx-h"><b>Agenda</b><span>${esc(fMed(t))}</span></div>
        <div class="idx-list">${todayEv.length ? todayEv.map((x) => rowHtml(x, { iso: t })).join("") : `<div class="idx-empty">Sin juntas hoy. ¡A darle!</div>`}</div>
        <div class="idx-foot">${tom.length ? `Mañana: ${plural(tom.length, "evento", "eventos")}${tom.find((x) => !x.allDay) ? ` · el primero a las ${fTime(tom.find((x) => !x.allDay).time)}` : ""}` : "Mañana: nada agendado"}</div>
      </div></section>

    <section class="a-todos"><div class="sec-h">${lbl(`Pendientes <small>${open.length}</small>`)}<span class="sp"></span><a class="btn btn-sm" href="#pendientes">Ver todos</a></div>
      <div class="postits">
        <form class="postit blank pinned" data-form="quick-todo" style="--r:-1deg;--pinc:#2E9E5B">
          <textarea id="quickTodo" rows="3" maxlength="300" placeholder="Escribe un pendiente…" aria-label="Nuevo pendiente"></textarea>
          <div class="ft"><span class="hint">Enter para pegarlo</span><button class="tick" type="submit" aria-label="Agregar pendiente" style="color:rgba(0,0,0,.5)">${I("plus")}</button></div>
        </form>
        ${shown.map((x) => postitHtml(x)).join("")}
      </div>
      ${open.length > shown.length ? `<p class="on-board" style="margin:16px 2px 0">Y ${plural(open.length - shown.length, "más", "más")} en <a href="#pendientes">Pendientes</a>.</p>` : ""}
    </section>

    <section class="a-reqs"><div class="sec-h">${lbl("Por meter", "blue")}<span class="sp"></span><button class="btn btn-sm" data-act="add-req">${I("plus")}Requi</button></div>
      <div class="clipboard"><div class="sheet">
        <h3><span>Requisiciones por meter</span><span>${reqOpen.length}</span></h3>
        ${reqOpen.length ? reqOpen.slice(0, 7).map((r) => {
          const d = reqDue(r);
          return `<div class="rq" role="button" tabindex="0" data-act="req" data-id="${esc(r.id)}">
            <button class="box" data-act="req-next" data-id="${esc(r.id)}" aria-label="Ya la metí">${I("check")}</button>
            <span><span class="t1">${esc(r.t)}${r.estado === "rechazada" ? ` <span class="pill late" style="font-size:10px">Rechazada</span>` : ""}</span>
            <span class="t2 d-block">${esc([r.qty ? `${r.qty} ${r.unit || ""}`.trim() : "", r.prov, r.monto ? mxn(num(r.monto)) : ""].filter(Boolean).join(" · ") || "Sin detalles")}</span></span>
            <span class="pill ${d.c}">${esc(d.t)}</span></div>`;
        }).join("") : `<div class="empty-note">${I("check")}Nada por meter.</div>`}
        <div class="clip-foot"><span>${total ? `Total: <b>${esc(mxn(total))}</b>` : ""}${reqSoon.length ? `${total ? " · " : ""}<b>${reqSoon.length}</b> vencen pronto` : ""}</span>
          <a href="#requis">${inFlight.length ? `${plural(inFlight.length, "en trámite", "en trámite")} →` : "Ver todas →"}</a></div>
      </div></div></section>
  </div>`;
}

/* ---------- Calendario ---------- */
function viewCalendario() {
  const t = todayISO();
  const sources = [
    { k: "app", l: "Mis eventos", c: areaColor("general") },
    { k: "todo", l: "Pendientes", c: "#FFB8CB" },
    { k: "req", l: "Requis", c: "#FFFFFF" },
    ...cals().filter((c) => c.on !== false).map((c) => ({ k: "ext:" + c.id, l: c.name || "Calendario", c: okHex(c.color) ? c.color : CAL_COLORS[0] })),
    ...(notionOn() ? [{ k: "ext:notion", l: "Notion", c: NOTION_COLOR }] : []),
  ];
  const filt = `<div class="chips scroll" style="margin-bottom:16px">${sources.map((s) => `<button class="chip ${S.hide.has(s.k) ? "off" : ""}" data-act="hide" data-k="${esc(s.k)}" aria-pressed="false"><span class="dot" style="background:${s.c}"></span>${esc(s.l)}</button>`).join("")}</div>`;
  const head = `<div class="sec-h">${lbl("Calendario", "red")}<span class="sp"></span>
    <div class="chips"><button class="chip" data-act="calview" data-v="mes" aria-pressed="${S.calView === "mes"}">Mes</button><button class="chip" data-act="calview" data-v="agenda" aria-pressed="${S.calView === "agenda"}">Agenda</button></div>
    <button class="btn btn-sm btn-ink" data-act="add-ev" data-date="${S.sel}">${I("plus")}Evento</button></div>`;
  if (S.calView === "agenda") {
    const days = [];
    for (let i = 0; i < 60; i++) { const iso = addDays(t, i), items = dayItems(iso); if (items.length) days.push({ iso, items }); }
    return head + filt + (days.length ? days.map(({ iso, items }) => `<div class="paper idx agenda-day">
      <div class="idx-h"><b>${iso === t ? "Hoy" : iso === addDays(t, 1) ? "Mañana" : esc(cap(DIAS[parse(iso).getDay()]))}</b><span>${esc(fLong(iso))}</span></div>
      <div class="idx-list">${items.map((x) => rowHtml(x, { iso })).join("")}</div></div>`).join("")
      : `<div class="paper idx"><div class="idx-empty" style="padding-left:20px">Nada en los próximos dos meses.</div></div>`);
  }
  const [y, m] = S.month.split("-").map(Number);
  const first = `${S.month}-01`, start = weekStart(first);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const iso = addDays(start, i);
    if (i === 35 && iso.slice(0, 7) !== S.month) break;
    const items = dayItems(iso);
    const out = iso.slice(0, 7) !== S.month, we = [0, 6].includes(parse(iso).getDay());
    cells.push(`<button class="cell ${out ? "out" : ""} ${we ? "we" : ""} ${iso === t ? "today" : ""} ${iso === S.sel ? "sel" : ""}" data-act="day" data-date="${iso}" aria-label="${esc(fLong(iso))}${items.length ? ", " + plural(items.length, "cosa", "cosas") : ""}">
      <span class="num">${parse(iso).getDate()}</span>
      <span class="dots">${items.slice(0, 4).map((x) => `<i style="background:${x.color}"></i>`).join("")}</span>
      <span class="chs">${items.slice(0, 3).map((x) => `<span class="ch" style="background:${x.color}">${x.time ? esc(fTimeS(x.time)) + " " : ""}${esc(x.title)}</span>`).join("")}${items.length > 3 ? `<span class="ch more">+${items.length - 3} más</span>` : ""}</span>
    </button>`);
  }
  const selItems = dayItems(S.sel);
  const rings = Array.from({ length: 8 }, (_, i) => `<i style="left:${6 + i * 12.5}%"></i>`).join("");
  return head + filt + `<div class="cal-wrap">
    <div class="paper wallcal"><div class="bind">${rings}</div>
      <div class="mhead"><button class="icon-btn" data-act="month" data-d="-1" aria-label="Mes anterior">${I("chevL")}</button>
        <h2>${MESES[m - 1]} <small>${y}</small></h2>
        ${S.month !== t.slice(0, 7) ? `<button class="btn btn-sm" data-act="month" data-d="0">Hoy</button>` : ""}
        <button class="icon-btn" data-act="month" data-d="1" aria-label="Mes siguiente">${I("chevR")}</button></div>
      <div class="g7">${["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map((d) => `<div class="dow">${d}</div>`).join("")}${cells.join("")}</div>
    </div>
    <div class="paper idx pinned" style="--pinc:#2E9E5B">
      <div class="idx-h"><b>${S.sel === t ? "Hoy" : esc(cap(DIAS[parse(S.sel).getDay()]))}</b><span>${esc(fLong(S.sel))}</span></div>
      <div class="idx-list">${selItems.length ? selItems.map((x) => rowHtml(x, { iso: S.sel })).join("") : `<div class="idx-empty">Nada agendado.</div>`}</div>
      <div class="idx-foot"><button class="btn btn-sm" data-act="add-ev" data-date="${S.sel}">${I("plus")}Agendar este día</button></div>
    </div>
  </div>`;
}

/* ---------- Pendientes ---------- */
function viewPendientes() {
  const t = todayISO();
  const open = S.todos.filter((x) => !x.done);
  const inArea = (x) => !S.todoArea || x.area === S.todoArea;
  const F = {
    abiertos: { l: "Abiertos", f: (x) => !x.done },
    hoy: { l: "Para hoy", f: (x) => !x.done && x.due && x.due <= t },
    semana: { l: "Esta semana", f: (x) => !x.done && x.due && x.due <= addDays(weekStart(t), 6) },
    sinfecha: { l: "Sin fecha", f: (x) => !x.done && !x.due },
    hechos: { l: "Hechos", f: (x) => x.done },
  };
  const cur = F[S.todoF] || F.abiertos;
  let list = S.todos.filter(cur.f).filter(inArea);
  list = S.todoF === "hechos" ? list.sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)) : sortTodos(list);
  const late = open.filter((x) => x.due && x.due < t).length;
  return `<div class="sec-h">${lbl(`Pendientes <small>${open.length}</small>`)}${late ? `<span class="pill late">${plural(late, "vencido", "vencidos")}</span>` : ""}<span class="sp"></span>
      <button class="btn btn-sm btn-ink" data-act="add-todo">${I("plus")}Pendiente</button></div>
    <div class="chips scroll" style="margin-bottom:8px">${Object.entries(F).map(([k, v]) => `<button class="chip" data-act="todoF" data-v="${k}" aria-pressed="${S.todoF === k}">${esc(v.l)} <span class="n">${S.todos.filter(v.f).filter(inArea).length}</span></button>`).join("")}</div>
    <div class="chips scroll" style="margin-bottom:18px"><button class="chip" data-act="todoArea" data-v="" aria-pressed="${!S.todoArea}">Todas las áreas</button>${areas().map((a) => `<button class="chip" data-act="todoArea" data-v="${esc(a.k)}" aria-pressed="${S.todoArea === a.k}"><span class="dot" style="background:${a.c}"></span>${esc(a.l)}</button>`).join("")}</div>
    ${list.length ? `<div class="postits">${list.map((x) => postitHtml(x)).join("")}</div>`
      : `<div class="postits"><div class="postit pinned" style="--pc:#FFFFFF;--r:-1.5deg"><div class="txt">${S.todoF === "hechos" ? "Todavía no tachas nada." : "Nada por aquí. ¡Bien!"}</div></div></div>`}
    ${S.todoF === "hechos" && list.length ? `<p style="margin-top:22px"><button class="btn btn-sm" data-act="clear-done">${I("trash")}Quitar los hechos</button></p>` : ""}`;
}

/* ---------- Requisiciones ---------- */
function viewRequis() {
  const by = (col) => S.reqs.filter((r) => col.has.includes(r.estado || "pormeter"));
  const open = S.reqs.filter(isOpenReq);
  const total = open.reduce((s, r) => s + num(r.monto), 0);
  const counts = Object.fromEntries(COLUMNS.map((c) => [c.k, by(c).length]));
  const list = (col) => {
    let l = by(col);
    if (col.k === "recibida") l = l.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 15);
    else if (col.k === "pormeter") l = sortReqs(l);
    else l = l.sort((a, b) => String(b.metidaEl || "").localeCompare(String(a.metidaEl || "")));
    return l.length ? l.map(reqCardHtml).join("") : `<div class="empty-note" style="color:var(--on-board);font-size:18px">${col.k === "pormeter" ? `${I("check")}Nada por meter.` : "—"}</div>`;
  };
  return `<div class="sec-h">${lbl("Requisiciones", "blue")}<span class="sp"></span><button class="btn btn-sm btn-ink" data-act="add-req">${I("plus")}Requisición</button></div>
    <div class="paper summary taped"><span><b>${counts.pormeter}</b>por meter${total ? ` (${esc(mxn(total))})` : ""}</span><span><b>${counts.metida}</b>metidas</span><span><b>${counts.autorizada}</b>autorizadas</span><span><b>${counts.recibida}</b>recibidas</span></div>
    <div class="chips scroll m-only" style="margin-bottom:16px">${COLUMNS.map((c) => `<button class="chip" data-act="reqCol" data-v="${c.k}" aria-pressed="${S.reqCol === c.k}">${esc(c.l)} <span class="n">${counts[c.k]}</span></button>`).join("")}</div>
    <div class="trays">${COLUMNS.map((c) => `<div class="tray ${S.reqCol === c.k ? "on" : ""}"><div class="sec-h">${lbl(`${c.l} <small>${counts[c.k]}</small>`, c.k === "pormeter" ? "red" : "")}</div>${list(c)}</div>`).join("")}</div>`;
}

/* ---------- Ajustes ---------- */
function viewAjustes() {
  const p = S.prof || {};
  const av = { resumen: true, hora: "08:00", dias: [1, 2, 3, 4, 5], eventos: true, pendientes: true, requis: true, ...(p.avisos || {}) };
  const theme = document.documentElement.getAttribute("data-theme") || "auto";
  const sw = (act, on, label) => `<label class="sw"><input type="checkbox" data-change="${act}" ${on ? "checked" : ""} aria-label="${esc(label)}"><span></span></label>`;
  const calRows = cals().map((c) => {
    const st = (p.calStatus || {})[c.id];
    const s = !st ? `<span>Esperando la primera lectura (máx. 15 min).</span>` : st.ok ? `<span class="st-ok">Al día · ${plural(st.n || 0, "evento", "eventos")} · ${esc(ago(st.at))}</span>` : `<span class="st-err">${esc(st.error || "No se pudo leer")}</span>`;
    return `<div class="set-row"><span class="dot" style="width:14px;height:14px;border-radius:4px;background:${okHex(c.color) ? c.color : CAL_COLORS[0]}"></span><div class="sx"><b>${esc(c.name || "Calendario")}</b>${s}</div>
      <button class="icon-btn" data-act="cal-edit" data-id="${esc(c.id)}" aria-label="Editar ${esc(c.name)}">${I("edit")}</button></div>`;
  }).join("");
  const ns = p.notionStatus || {};
  const notionTxt = !notionOn() ? "" : !ns.at ? `<span>Conectando… (máx. 15 min)</span>` : ns.ok ? `<span class="st-ok">Al día · ${plural(ns.traidos || 0, "evento traído", "eventos traídos")} de Notion · ${esc(ago(ns.at))}</span>` : `<span class="st-err">${esc(ns.error || "No se pudo conectar")}</span>`;
  const fst = p.feedStatus || {};
  const feedOn = !!(p.feed && p.feed.on);
  const feedUrl = fst.url || "";
  const webcal = feedUrl.replace(/^https:\/\//, "webcal://");
  const push = pushStateText();
  return `<div class="sec-h">${lbl("Ajustes")}</div>
  <div class="settings">
    <section class="paper card pinned" style="--pinc:#2F6FD0">
      <h2>${I("sparkle")}Tú</h2>
      <div class="field"><span class="fl">¿Cómo te saludo?</span><div style="display:flex;gap:8px"><input class="input" id="setName" maxlength="30" value="${esc(p.name || "")}" placeholder="Tu nombre"><button class="btn btn-ink" data-act="save-name">Guardar</button></div></div>
      <div class="field"><span class="fl">Tema</span><div class="chips">
        <button class="chip" data-act="theme" data-v="auto" aria-pressed="${theme === "auto"}">Automático</button>
        <button class="chip" data-act="theme" data-v="corcho" aria-pressed="${theme === "corcho"}">Corcho</button>
        <button class="chip" data-act="theme" data-v="pizarron" aria-pressed="${theme === "pizarron"}">Pizarrón</button></div></div>
      <div class="set-row"><div class="sx"><b>${esc(S.demo ? "Modo demo" : S.user?.email || "")}</b><span>${S.demo ? "Lo que hagas se queda solo en este dispositivo." : "Tus datos solo los ves tú."}</span></div>
        ${S.demo ? `<button class="btn btn-sm btn-ink" data-act="demo-exit">Salir de la demo</button>` : `<button class="btn btn-sm" data-act="signout">${I("out")}Salir</button>`}</div>
    </section>

    <section class="paper card taped">
      <h2>${I("bell")}Avisos al cel</h2>
      <p>Te llegan aunque la app esté cerrada. Salen cada 15 minutos, así que pueden llegar unos minutos tarde.</p>
      <div class="set-row"><div class="sx"><b>Avisos en este dispositivo</b><span id="pushS">${esc(push)}</span></div><button class="btn btn-sm btn-ink" data-act="push">${I("bell")}${typeof Notification !== "undefined" && Notification.permission === "granted" && localStore("oficina.push") ? "Probar" : "Activar"}</button></div>
      <div class="set-row"><div class="sx"><b>Resumen del día</b><span>“3 eventos, 2 pendientes para hoy, 1 requisición por meter”.</span></div>${sw("av-resumen", av.resumen, "Resumen del día")}</div>
      <div class="set-row" ${av.resumen ? "" : 'style="display:none"'}><div class="sx"><b>¿A qué hora y qué días?</b>
        <div class="chips" style="margin-top:8px">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<button class="chip" data-act="av-dia" data-v="${d}" aria-pressed="${av.dias.includes(d)}" aria-label="${DIAS[d]}">${DIAS1[d]}</button>`).join("")}</div></div>
        <input class="input" type="time" data-change="av-hora" value="${esc(av.hora)}" style="width:140px" aria-label="Hora del resumen"></div>
      <div class="set-row"><div class="sx"><b>Eventos</b><span>Según lo que elijas en cada evento (por omisión, 30 min antes).</span></div>${sw("av-eventos", av.eventos !== false, "Avisos de eventos")}</div>
      <div class="set-row"><div class="sx"><b>Pendientes con hora</b><span>30 minutos antes de la hora que les pongas.</span></div>${sw("av-pendientes", av.pendientes !== false, "Avisos de pendientes")}</div>
      <div class="set-row"><div class="sx"><b>Requisiciones</b><span>Un día antes de la fecha para meterlas.</span></div>${sw("av-requis", av.requis !== false, "Avisos de requisiciones")}</div>
    </section>

    <section class="paper card pinned" style="--pinc:#E0A21A">
      <h2>${I("apple")}Calendarios de Apple y Google</h2>
      <p>Trae tus calendarios a la app para verlos junto con lo demás. Se actualizan solos cada 15 min.</p>
      ${calRows}
      <div class="set-row"><button class="btn btn-block" data-act="cal-add">${I("plus")}Agregar un calendario</button></div>
      <details class="how"><summary>¿De dónde saco el link?</summary><ol>
        <li><b>Apple (iPhone):</b> app Calendario → <i>Calendarios</i> → toca la <b>ⓘ</b> del calendario → activa <i>Calendario público</i> → <i>Compartir enlace</i> → <i>Copiar</i>.</li>
        <li><b>Apple (Mac):</b> Calendario → clic derecho en el calendario → <i>Compartir calendario</i> → marca <i>Calendario público</i> → copia el link <code>webcal://…</code>.</li>
        <li><b>Google:</b> calendar.google.com → ⚙ <i>Configuración</i> → tu calendario → <i>Dirección secreta en formato iCal</i>.</li>
        <li><b>Outlook:</b> Configuración → Calendario → Calendarios compartidos → <i>Publicar un calendario</i> → link ICS.</li>
      </ol>Cualquiera con ese link puede ver ese calendario, así que no lo compartas.</details>
    </section>

    <section class="paper card taped">
      <h2>${I("notion")}Notion</h2>
      <p>Lo que agendas aquí se copia a una base de datos de Notion, y lo que agregues con fecha en esa base aparece aquí.</p>
      ${notionOn() ? `<div class="set-row"><div class="sx"><b>Conectado</b>${notionTxt}</div><button class="btn btn-sm" data-act="notion-off">Desconectar</button></div>` : ""}
      <div class="field"><span class="fl">Link de la base de datos</span><div style="display:flex;gap:8px"><input class="input" id="setNotion" value="${esc(p.notion?.db || "")}" placeholder="https://www.notion.so/…"><button class="btn btn-ink" data-act="notion-save">Guardar</button></div></div>
      <details class="how"><summary>Cómo conectarla</summary><ol>
        <li>En Notion crea una base de datos (por ejemplo “Mi Oficina”) o usa una que ya tengas con una columna de fecha.</li>
        <li>En esa base toca <b>•••</b> → <i>Conexiones</i> → agrega tu integración (la misma de “Nuestros Planes” sirve).</li>
        <li>Toca <b>•••</b> → <i>Copiar enlace</i> y pégalo aquí arriba.</li>
        <li>Listo: en máx. 15 min se copian tus eventos. Si a la base le faltan columnas (ID app, Lugar, Notas, Área), se agregan solas.</li>
      </ol>Lo que creas en la app se edita en la app; lo que creas en Notion se edita en Notion.</details>
    </section>

    <section class="paper card pinned" style="--pinc:#8A55D6">
      <h2>${I("cal")}Ver Mi Oficina en Apple Calendar</h2>
      <p>Un calendario con tus eventos, pendientes y requisiciones con fecha, para suscribirte desde el iPhone, la Mac o Google.</p>
      <div class="set-row"><div class="sx"><b>Publicar mi calendario</b>${feedOn ? (fst.url ? `<span class="st-ok">Listo · ${esc(ago(fst.at))}</span>` : fst.error ? `<span class="st-err">${esc(fst.error)}</span>` : `<span>Preparándolo… (máx. 15 min)</span>`) : `<span>Apagado.</span>`}</div>${sw("feed", feedOn, "Publicar mi calendario")}</div>
      ${feedOn && feedUrl ? `<div class="copybox"><code>${esc(webcal)}</code><button class="btn btn-sm" data-act="copy" data-v="${esc(webcal)}">${I("copy")}Copiar</button></div>
        <div class="acts" style="margin-top:10px"><a class="btn btn-ink" href="${esc(webcal)}">${I("apple")}Suscribirme en este dispositivo</a></div>
        <details class="how"><summary>Otras formas de suscribirte</summary><ol>
          <li><b>iPhone:</b> Ajustes → Calendario → Cuentas → Agregar cuenta → Otra → <i>Agregar calendario suscrito</i> → pega el link.</li>
          <li><b>Mac:</b> Calendario → Archivo → <i>Nueva suscripción a calendario</i> → pega el link (elige que se actualice cada 5 o 15 min).</li>
          <li><b>Google:</b> Otros calendarios → + → <i>Desde URL</i> → pega el link con <code>https://</code>.</li>
        </ol>Es un link secreto: no lo compartas.</details>` : ""}
    </section>

    <section class="paper card taped">
      <h2>${I("tag")}Áreas</h2>
      <p>Para separar tus pendientes, requisiciones y eventos (y darles color).</p>
      <div class="chips">${areas().map((a) => `<button class="chip" data-act="area-edit" data-k="${esc(a.k)}"><span class="dot" style="background:${a.c}"></span>${esc(a.l)}</button>`).join("")}<button class="chip" data-act="area-add">${I("plus")}Nueva</button></div>
    </section>

    <section class="paper card pinned" style="--pinc:#2E9E5B">
      <h2>${I("phone")}Tenerla en el cel</h2>
      <p><b>iPhone:</b> ábrela en Safari → Compartir → <i>Agregar a inicio</i>. Los avisos en iPhone solo funcionan desde la app agregada a inicio.<br><b>Android:</b> Chrome → menú ⋮ → <i>Instalar app</i>.</p>
    </section>
  </div>`;
}

/* ---------- Hojas ---------- */
function openSheet(inner, mount, { cls = "", style = "" } = {}) {
  const root = $("#sheetRoot");
  root.innerHTML = `<div class="sheet-bg" id="sheetBg"><div class="sheet ${cls}" style="${style}" role="dialog" aria-modal="true"><div class="grip" aria-hidden="true"></div>${inner}</div></div>`;
  document.body.style.overflow = "hidden";
  const bg = $("#sheetBg");
  bg.addEventListener("click", (e) => { if (e.target === bg || e.target.closest("[data-close]")) closeSheet(); });
  const sheet = bg.querySelector(".sheet");
  mount && mount(sheet);
  const f = sheet.querySelector("[autofocus]");
  if (f && matchMedia("(hover: hover)").matches) f.focus();
}
function closeSheet() { $("#sheetRoot").innerHTML = ""; document.body.style.overflow = ""; }
const pressed = (root, sel) => $$(sel + '[aria-pressed="true"]', root).map((b) => b.dataset.v);
function wireChips(root, sel, { multi = false, onChange } = {}) {
  $$(sel, root).forEach((b) => b.addEventListener("click", () => {
    if (multi) b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true");
    else $$(sel, root).forEach((x) => x.setAttribute("aria-pressed", x === b));
    onChange && onChange(b.dataset.v);
  }));
}
// Botón de borrar que pide confirmar con un segundo toque.
function wireDelete(btn, fn) {
  if (!btn) return;
  let armed = false;
  const orig = btn.innerHTML;
  btn.addEventListener("click", () => { if (!armed) { armed = true; btn.textContent = "¿Seguro? Toca otra vez"; setTimeout(() => { armed = false; btn.innerHTML = orig; }, 3500); return; } fn(); });
}
const areaChips = (cur, name = "ar") => `<div class="chips"><button type="button" class="chip" data-${name} data-v="" aria-pressed="${!cur}">Sin área</button>${areas().map((a) => `<button type="button" class="chip" data-${name} data-v="${esc(a.k)}" aria-pressed="${cur === a.k}"><span class="dot" style="background:${a.c}"></span>${esc(a.l)}</button>`).join("")}</div>`;

function openChooser() {
  const o = (act, icon, txt, c, r) => `<button class="postit pinned" data-close data-act="${act}" style="--pc:${c};--r:${r}deg;--pinc:${PIN_COLORS[Math.abs(r * 2) % 4]}">${I(icon)}<b>${txt}</b></button>`;
  openSheet(`<h2>¿Qué quieres agregar?</h2>
    <div class="choose">${o("add-todo", "note", "Pendiente", "#FFE58A", -2)}${o("add-ev", "cal", "Evento", "#AFD9FF", 1)}${o("add-req", "clip", "Requisición", "#FFCA94", -1)}</div>`);
}

function openEvent(id, pre = {}) {
  const e = id ? S.events.find((x) => x.id === id) : null;
  const v = e ? { ...e } : { title: "", date: pre.date || todayISO(), time: pre.time || "", endTime: "", allDay: false, place: "", link: "", note: "", area: "", remind: DEFAULT_REMIND, repeat: "no", endDate: "" };
  const rem = Array.isArray(v.remind) ? v.remind : DEFAULT_REMIND;
  openSheet(`<h2>${e ? "Editar evento" : "Nuevo evento"}</h2>
    <label class="field"><span class="fl">¿Qué es?</span><input class="input" id="evT" maxlength="140" value="${esc(v.title)}" placeholder="Ej. Junta con proveedores" autofocus></label>
    <div class="r2"><label class="field"><span class="fl">Fecha</span><input class="input" type="date" id="evD" value="${esc(v.date)}"></label>
      <label class="field"><span class="fl">Todo el día</span><span class="inline" style="min-height:46px"><span class="muted" style="font-weight:700">Sin hora</span><label class="sw"><input type="checkbox" id="evAll" ${v.allDay ? "checked" : ""}><span></span></label></span></label></div>
    <div class="r2" id="evTimes" ${v.allDay ? 'style="display:none"' : ""}><label class="field"><span class="fl">Empieza</span><input class="input" type="time" id="evS" value="${esc(v.time || "")}"></label>
      <label class="field"><span class="fl">Termina</span><input class="input" type="time" id="evE" value="${esc(v.endTime || "")}"></label></div>
    <label class="field" id="evEndW" ${v.allDay ? "" : 'style="display:none"'}><span class="fl">Hasta (si dura varios días)</span><input class="input" type="date" id="evED" value="${esc(v.endDate || "")}"></label>
    <div class="r2"><label class="field"><span class="fl">Lugar</span><input class="input" id="evP" maxlength="140" value="${esc(v.place || "")}" placeholder="Sala 2, oficina…"></label>
      <label class="field"><span class="fl">Link de la junta</span><input class="input" id="evL" maxlength="500" inputmode="url" value="${esc(v.link || "")}" placeholder="Meet, Zoom, Teams…"></label></div>
    <div class="field"><span class="fl">Área</span>${areaChips(v.area)}</div>
    <div class="field"><span class="fl">Avisarme</span><div class="chips">${REMINDERS.map((r) => `<button type="button" class="chip" data-rem data-v="${r.k}" aria-pressed="${rem.includes(r.k)}">${esc(r.l)}</button>`).join("")}</div></div>
    <div class="field"><span class="fl">Se repite</span><div class="chips">${REPEATS.map((r) => `<button type="button" class="chip" data-rep data-v="${r.k}" aria-pressed="${(v.repeat || "no") === r.k}">${esc(r.l)}</button>`).join("")}</div></div>
    <label class="field"><span class="fl">Notas</span><textarea class="input" id="evN" maxlength="2000" placeholder="Qué llevar, temas, contactos…">${esc(v.note || "")}</textarea></label>
    <div class="acts">${e ? `<button class="btn del" id="evDel">${I("trash")}Borrar</button>` : ""}<button class="btn" data-close>Cancelar</button><button class="btn btn-ink" id="evOk">${I("check")}Guardar</button></div>`,
  (root) => {
    wireChips(root, "[data-ar]"); wireChips(root, "[data-rem]", { multi: true }); wireChips(root, "[data-rep]");
    const all = $("#evAll", root);
    all.addEventListener("change", () => { $("#evTimes", root).style.display = all.checked ? "none" : ""; $("#evEndW", root).style.display = all.checked ? "" : "none"; });
    $("#evS", root).addEventListener("change", () => { const s = toMin($("#evS", root).value), en = $("#evE", root); if (s != null && (!en.value || toMin(en.value) <= s)) { const m = Math.min(s + 60, 23 * 60 + 59); en.value = `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`; } });
    $("#evOk", root).addEventListener("click", () => {
      const title = $("#evT", root).value.trim(), date = $("#evD", root).value;
      if (!title) { $("#evT", root).focus(); toast("Ponle un nombre"); return; }
      if (!ISO.test(date)) { toast("Elige la fecha"); return; }
      const allDay = all.checked;
      const time = allDay ? "" : $("#evS", root).value, endTime = allDay ? "" : $("#evE", root).value;
      const ed = allDay ? $("#evED", root).value : "";
      const link = $("#evL", root).value.trim();
      const rec = { title, date, allDay: allDay || !time, time, endTime: toMin(endTime) > toMin(time) ? endTime : "", endDate: ed && ed > date ? ed : "", place: $("#evP", root).value.trim(),
        link: link ? safeUrl(link) : "", note: $("#evN", root).value.trim(), area: pressed(root, "[data-ar]")[0] || "", remind: pressed(root, "[data-rem]"), repeat: pressed(root, "[data-rep]")[0] || "no" };
      put("eventos", e ? e.id : null, rec);
      closeSheet(); toast(e ? "Evento actualizado" : "¡Agendado!");
      S.sel = date; S.month = date.slice(0, 7);
    });
    wireDelete($("#evDel", root), () => { del("eventos", e.id); closeSheet(); toast("Evento borrado"); });
  });
}

function whenText(x, iso) {
  const d = iso || x.date;
  const multi = x.endDate && x.endDate > x.date;
  if (x.allDay || !x.time) return multi ? `Del ${fLong(x.date)} al ${fLong(x.endDate)}` : `${fLong(d)} · todo el día`;
  return `${fLong(d)} · ${fTime(x.time)}${x.endTime ? " – " + fTime(x.endTime) : ""}`;
}
function openEventDetail(id, iso) {
  const e = S.events.find((x) => x.id === id);
  if (!e) return;
  const a = area(e.area);
  const rep = REPEATS.find((r) => r.k === (e.repeat || "no"));
  const rem = (Array.isArray(e.remind) ? e.remind : DEFAULT_REMIND).map((k) => REMINDERS.find((r) => r.k === k)?.l).filter(Boolean);
  openSheet(`<div class="hd2"><h2>${esc(e.title)}</h2><button class="icon-btn" data-close aria-label="Cerrar">${I("x")}</button></div>
    <div class="detail">
      <div class="dl">${I("clock")}<span>${esc(whenText(e, iso))}</span></div>
      ${e.repeat && e.repeat !== "no" ? `<div class="dl">${I("repeat")}<span>${esc(rep?.l || "")}</span></div>` : ""}
      ${e.place ? `<div class="dl">${I("pin")}<span>${esc(e.place)}</span></div>` : ""}
      ${a ? `<div class="dl">${I("tag")}<span><span class="chip" style="padding:3px 10px"><span class="dot" style="background:${a.c}"></span>${esc(a.l)}</span></span></div>` : ""}
      <div class="dl">${I("bell")}<span>${rem.length ? esc(rem.join(", ")) : "Sin avisos"}</span></div>
      ${e.note ? `<div class="note">${esc(e.note)}</div>` : ""}
    </div>
    ${e.link ? `<a class="btn btn-ink btn-block" href="${esc(e.link)}" target="_blank" rel="noopener" style="margin-top:8px">${I("video")}Abrir el link de la junta</a>` : ""}
    <div class="acts"><button class="btn" id="dEdit">${I("edit")}Editar</button><a class="btn" href="${esc(gcalUrl(e, iso))}" target="_blank" rel="noopener">${I("ext")}Google Calendar</a><button class="btn" id="dIcs">${I("download")}Apple (.ics)</button></div>`,
  (root) => {
    $("#dEdit", root).addEventListener("click", () => openEvent(e.id));
    $("#dIcs", root).addEventListener("click", () => downloadIcs(e, iso));
  });
}
function openExtDetail(src, id) {
  const x = (S.ext[src]?.events || []).find((v) => v.id === id);
  const meta = extMeta(src);
  if (!x || !meta) return;
  openSheet(`<div class="hd2"><h2>${esc(x.title)}</h2><button class="icon-btn" data-close aria-label="Cerrar">${I("x")}</button></div>
    <div class="detail">
      <div class="dl">${I("clock")}<span>${esc(whenText(x))}</span></div>
      ${x.place ? `<div class="dl">${I("pin")}<span>${esc(x.place)}</span></div>` : ""}
      <div class="dl">${I(src === "notion" ? "notion" : "cal")}<span>De <b>${esc(meta.name)}</b>. ${src === "notion" ? "Se edita en Notion." : "Se edita en su calendario."}</span></div>
      ${x.note ? `<div class="note">${esc(x.note)}</div>` : ""}
    </div>
    ${x.url ? `<a class="btn btn-ink btn-block" href="${esc(x.url)}" target="_blank" rel="noopener" style="margin-top:8px">${I("ext")}${src === "notion" ? "Abrir en Notion" : "Abrir link"}</a>` : ""}`);
}
function gcalUrl(e, iso) {
  const d = (iso || e.date).replace(/-/g, "");
  const p = new URLSearchParams({ action: "TEMPLATE", text: e.title || "Evento" });
  if (e.allDay || !e.time) { const end = e.endDate && e.endDate > e.date ? e.endDate : iso || e.date; p.set("dates", `${d}/${addDays(end, 1).replace(/-/g, "")}`); }
  else { const s = e.time.replace(":", ""), en = (e.endTime || fmtMin(Math.min(toMin(e.time) + 60, 1439))).replace(":", ""); p.set("dates", `${d}T${s}00/${d}T${en}00`); p.set("ctz", deviceTz()); }
  const det = [e.note, e.link].filter(Boolean).join("\n\n");
  if (det) p.set("details", det);
  if (e.place) p.set("location", e.place);
  return "https://calendar.google.com/calendar/render?" + p.toString();
}
const fmtMin = (m) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
function downloadIcs(e, iso) {
  const d = iso || e.date;
  const esc2 = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  const utc = (iso2, t) => { const [y, m, dd] = iso2.split("-").map(Number), [h, mi] = t.split(":").map(Number); return new Date(y, m - 1, dd, h, mi).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); };
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mi Oficina//ES", "BEGIN:VEVENT", `UID:${e.id}-${d}@mi-oficina`, `DTSTAMP:${utc(todayISO(), "00:00")}`, `SUMMARY:${esc2(e.title)}`];
  if (e.allDay || !e.time) { const end = e.endDate && e.endDate > e.date ? e.endDate : d; L.push(`DTSTART;VALUE=DATE:${d.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${addDays(end, 1).replace(/-/g, "")}`); }
  else L.push(`DTSTART:${utc(d, e.time)}`, `DTEND:${utc(d, e.endTime || fmtMin(Math.min(toMin(e.time) + 60, 1439)))}`);
  if (e.place) L.push(`LOCATION:${esc2(e.place)}`);
  const det = [e.note, e.link].filter(Boolean).join("\n\n");
  if (det) L.push(`DESCRIPTION:${esc2(det)}`);
  L.push("END:VEVENT", "END:VCALENDAR");
  const url = URL.createObjectURL(new Blob([L.join("\r\n")], { type: "text/calendar" }));
  const a = document.createElement("a"); a.href = url; a.download = (e.title || "evento").replace(/[^\w\sáéíóúñü-]/gi, "").slice(0, 40) + ".ics";
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function openTodo(id, pre = {}) {
  const t = id ? S.todos.find((x) => x.id === id) : null;
  const v = t ? { ...t } : { t: pre.t || "", due: pre.due || "", time: "", urgente: false, area: "", color: "", note: "" };
  const c0 = todoColor(v);
  openSheet(`<h2>${t ? "Pendiente" : "Nuevo pendiente"}</h2>
    <label class="field"><span class="fl">¿Qué hay que hacer?</span><textarea class="input hand" id="tdT" maxlength="300" placeholder="Ej. Mandar el reporte de gastos" autofocus>${esc(v.t)}</textarea></label>
    <div class="field"><span class="fl">Color del post-it</span><div class="colors">${POSTIT.map((p) => `<button type="button" data-col data-v="${p.c}" style="background:${p.c}" aria-label="${p.k}" aria-pressed="${c0.toLowerCase() === p.c.toLowerCase()}"></button>`).join("")}</div></div>
    <div class="r2"><label class="field"><span class="fl">Para cuándo</span><input class="input" type="date" id="tdD" value="${esc(v.due || "")}"></label>
      <label class="field"><span class="fl">Hora (te aviso)</span><input class="input" type="time" id="tdH" value="${esc(v.time || "")}"></label></div>
    <div class="chips" style="margin:-4px 0 6px">${[["Hoy", 0], ["Mañana", 1], ["En una semana", 7]].map(([l, n]) => `<button type="button" class="chip" data-quick="${n}">${l}</button>`).join("")}<button type="button" class="chip" data-quick="">Sin fecha</button></div>
    <div class="inline" style="margin:12px 0"><span>${I("flag")} Urgente</span><label class="sw"><input type="checkbox" id="tdU" ${v.urgente ? "checked" : ""}><span></span></label></div>
    <div class="field"><span class="fl">Área</span>${areaChips(v.area)}</div>
    <label class="field"><span class="fl">Notas</span><textarea class="input" id="tdN" maxlength="2000">${esc(v.note || "")}</textarea></label>
    <div class="acts">${t ? `<button class="btn del" id="tdDel">${I("trash")}Borrar</button>` : ""}${t ? `<button class="btn" id="tdDone">${I("check")}${t.done ? "Reabrir" : "Hecho"}</button>` : `<button class="btn" data-close>Cancelar</button>`}<button class="btn btn-ink" id="tdOk">${I("check")}Guardar</button></div>`,
  (root) => {
    let color = okHex(v.color) ? v.color : "";
    wireChips(root, "[data-col]", { onChange: (c) => { color = c; root.style.setProperty("--pc", c); } });
    wireChips(root, "[data-ar]", { onChange: (k) => { if (!okHex(v.color) && !color) root.style.setProperty("--pc", k ? areaColor(k) : POSTIT[0].c); } });
    $$("[data-quick]", root).forEach((b) => b.addEventListener("click", () => { $("#tdD", root).value = b.dataset.quick === "" ? "" : addDays(todayISO(), Number(b.dataset.quick)); if (b.dataset.quick === "") $("#tdH", root).value = ""; }));
    const save = (extra = {}) => {
      const txt = $("#tdT", root).value.trim();
      if (!txt) { $("#tdT", root).focus(); toast("Escribe qué hay que hacer"); return false; }
      const due = $("#tdD", root).value;
      put("pendientes", t ? t.id : null, { t: txt, due: ISO.test(due) ? due : "", time: ISO.test(due) ? $("#tdH", root).value : "", urgente: $("#tdU", root).checked, area: pressed(root, "[data-ar]")[0] || "", color, note: $("#tdN", root).value.trim(), ...(t ? {} : { done: false }), ...extra });
      return true;
    };
    $("#tdOk", root).addEventListener("click", () => { if (save()) { closeSheet(); toast(t ? "Pendiente actualizado" : "¡Pegado en el corcho!"); } });
    $("#tdDone", root)?.addEventListener("click", () => { if (save({ done: !t.done, doneAt: !t.done ? Date.now() : 0 })) { closeSheet(); toast(t.done ? "Reabierto" : "¡Tachado!"); } });
    wireDelete($("#tdDel", root), () => { del("pendientes", t.id); closeSheet(); toast("Pendiente borrado"); });
    const ta = $("#tdT", root);
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && !t) { e.preventDefault(); $("#tdOk", root).click(); } });
  }, { cls: "as-postit", style: `--pc:${c0}` });
}
function toggleTodo(id) {
  const t = S.todos.find((x) => x.id === id);
  if (!t) return;
  put("pendientes", id, { done: !t.done, doneAt: !t.done ? Date.now() : 0 });
  toast(t.done ? "Lo regresé a pendientes" : "¡Tachado!");
}

function openReq(id) {
  const r = id ? S.reqs.find((x) => x.id === id) : null;
  const v = r ? { ...r } : { t: "", qty: "", unit: "", prov: "", monto: "", area: "", due: "", urgente: false, estado: "pormeter", folio: "", metidaEl: "", link: "", note: "" };
  openSheet(`<h2>${r ? "Requisición" : "Nueva requisición"}</h2>
    <label class="field"><span class="fl">¿Qué se pide?</span><input class="input" id="rqT" maxlength="160" value="${esc(v.t)}" placeholder="Ej. Tóner HP 85A" autofocus></label>
    <div class="r3"><label class="field"><span class="fl">Cantidad</span><input class="input" id="rqQ" maxlength="20" inputmode="decimal" value="${esc(v.qty || "")}" placeholder="4"></label>
      <label class="field"><span class="fl">Unidad</span><input class="input" id="rqU" maxlength="30" value="${esc(v.unit || "")}" placeholder="piezas"></label>
      <label class="field"><span class="fl">Monto aprox.</span><input class="input" id="rqM" maxlength="15" inputmode="decimal" value="${esc(v.monto || "")}" placeholder="$"></label></div>
    <div class="r2"><label class="field"><span class="fl">Proveedor</span><input class="input" id="rqP" maxlength="80" value="${esc(v.prov || "")}" placeholder="Opcional"></label>
      <label class="field"><span class="fl">¿Para cuándo meterla?</span><input class="input" type="date" id="rqD" value="${esc(v.due || "")}"></label></div>
    <div class="field"><span class="fl">Área / centro de costos</span>${areaChips(v.area)}</div>
    <div class="inline" style="margin:12px 0"><span>${I("flag")} Urgente</span><label class="sw"><input type="checkbox" id="rqUrg" ${v.urgente ? "checked" : ""}><span></span></label></div>
    <div class="field"><span class="fl">¿Cómo va?</span><div class="chips">${Object.entries(ESTADOS).map(([k, e]) => `<button type="button" class="chip" data-est data-v="${k}" aria-pressed="${(v.estado || "pormeter") === k}">${esc(e.l)}</button>`).join("")}</div></div>
    <div class="r2" id="rqFolW" ${(v.estado || "pormeter") === "pormeter" ? 'style="display:none"' : ""}><label class="field"><span class="fl">Folio</span><input class="input" id="rqF" maxlength="40" value="${esc(v.folio || "")}" placeholder="REQ-0000"></label>
      <label class="field"><span class="fl">Se metió el</span><input class="input" type="date" id="rqME" value="${esc(v.metidaEl || "")}"></label></div>
    <label class="field"><span class="fl">Link (cotización, sistema…)</span><input class="input" id="rqL" maxlength="500" inputmode="url" value="${esc(v.link || "")}" placeholder="https://"></label>
    <label class="field"><span class="fl">Notas</span><textarea class="input" id="rqN" maxlength="2000">${esc(v.note || "")}</textarea></label>
    ${v.link ? `<a class="btn btn-block" href="${esc(v.link)}" target="_blank" rel="noopener">${I("ext")}Abrir el link</a>` : ""}
    <div class="acts">${r ? `<button class="btn del" id="rqDel">${I("trash")}Borrar</button>` : ""}<button class="btn" data-close>Cancelar</button><button class="btn btn-ink" id="rqOk">${I("check")}Guardar</button></div>`,
  (root) => {
    wireChips(root, "[data-ar]");
    wireChips(root, "[data-est]", { onChange: (k) => { $("#rqFolW", root).style.display = k === "pormeter" ? "none" : ""; if (k !== "pormeter" && !$("#rqME", root).value) $("#rqME", root).value = todayISO(); } });
    $("#rqOk", root).addEventListener("click", () => {
      const t = $("#rqT", root).value.trim();
      if (!t) { $("#rqT", root).focus(); toast("¿Qué se pide?"); return; }
      const due = $("#rqD", root).value, estado = pressed(root, "[data-est]")[0] || "pormeter", link = $("#rqL", root).value.trim();
      put("requis", r ? r.id : null, { t, qty: $("#rqQ", root).value.trim(), unit: $("#rqU", root).value.trim(), monto: num($("#rqM", root).value) || 0, prov: $("#rqP", root).value.trim(),
        due: ISO.test(due) ? due : "", area: pressed(root, "[data-ar]")[0] || "", urgente: $("#rqUrg", root).checked, estado, folio: $("#rqF", root).value.trim(),
        metidaEl: estado === "pormeter" ? "" : $("#rqME", root).value || todayISO(), link: link ? safeUrl(link) : "", note: $("#rqN", root).value.trim() });
      closeSheet(); toast(r ? "Requisición actualizada" : "Requisición anotada");
    });
    wireDelete($("#rqDel", root), () => { del("requis", r.id); closeSheet(); toast("Requisición borrada"); });
  });
}
function reqNext(id) {
  const r = S.reqs.find((x) => x.id === id);
  if (!r) return;
  const est = ESTADOS[r.estado] || ESTADOS.pormeter;
  if (!est.next) return;
  if (est.next === "metida") {
    openSheet(`<h2>¡Ya la metiste!</h2><p class="sub">${esc(r.t)}</p>
      <label class="field"><span class="fl">¿Qué folio le dieron? (opcional)</span><input class="input" id="nfF" maxlength="40" value="${esc(r.folio || "")}" placeholder="REQ-0000" autofocus></label>
      <label class="field"><span class="fl">¿Cuándo?</span><input class="input" type="date" id="nfD" value="${todayISO()}"></label>
      <div class="acts"><button class="btn" data-close>Cancelar</button><button class="btn btn-ink" id="nfOk">${I("check")}Listo</button></div>`, (root) => {
      const ok = () => { put("requis", r.id, { estado: "metida", folio: $("#nfF", root).value.trim(), metidaEl: $("#nfD", root).value || todayISO() }); closeSheet(); toast("Sellada como metida"); };
      $("#nfOk", root).addEventListener("click", ok);
      $("#nfF", root).addEventListener("keydown", (e) => { if (e.key === "Enter") ok(); });
    });
    return;
  }
  put("requis", r.id, { estado: est.next });
  toast(est.next === "autorizada" ? "¡Autorizada!" : "Marcada como recibida");
}

function openCal(id) {
  const c = id ? cals().find((x) => x.id === id) : null;
  const v = c ? { ...c } : { name: "", url: "", color: CAL_COLORS[cals().length % CAL_COLORS.length], on: true };
  openSheet(`<h2>${c ? "Calendario" : "Agregar un calendario"}</h2>
    <p class="sub">De Apple (calendario público), Google (dirección secreta en formato iCal) u Outlook.</p>
    <label class="field"><span class="fl">Nombre</span><input class="input" id="cN" maxlength="40" value="${esc(v.name)}" placeholder="Ej. Trabajo (Apple)" autofocus></label>
    <label class="field"><span class="fl">Link del calendario</span><input class="input" id="cU" maxlength="1000" inputmode="url" value="${esc(v.url)}" placeholder="webcal://… o https://….ics"></label>
    <div class="field"><span class="fl">Color</span><div class="colors">${CAL_COLORS.map((x) => `<button type="button" data-col data-v="${x}" style="background:${x}" aria-label="Color" aria-pressed="${x === v.color}"></button>`).join("")}</div></div>
    ${c ? `<div class="inline"><span>Mostrarlo</span><label class="sw"><input type="checkbox" id="cOn" ${c.on !== false ? "checked" : ""}><span></span></label></div>` : ""}
    <div class="acts">${c ? `<button class="btn del" id="cDel">${I("trash")}Quitar</button>` : ""}<button class="btn" data-close>Cancelar</button><button class="btn btn-ink" id="cOk">${I("check")}Guardar</button></div>`,
  (root) => {
    wireChips(root, "[data-col]");
    $("#cOk", root).addEventListener("click", () => {
      const name = $("#cN", root).value.trim() || "Calendario", url = $("#cU", root).value.trim();
      if (!/^(webcals?|https?):\/\/\S+$/i.test(url)) { toast("Pega el link completo (webcal://… o https://…)"); $("#cU", root).focus(); return; }
      const rec = { id: c ? c.id : "c" + newId().slice(0, 9), name, url, color: pressed(root, "[data-col]")[0] || v.color, on: c ? $("#cOn", root).checked : true };
      putProf({ cals: c ? cals().map((x) => (x.id === c.id ? rec : x)) : [...cals(), rec].slice(0, 10) });
      closeSheet(); toast(c ? "Calendario guardado" : "Listo. En unos minutos aparecen sus eventos");
    });
    wireDelete($("#cDel", root), () => { putProf({ cals: cals().filter((x) => x.id !== c.id) }); closeSheet(); toast("Calendario quitado"); });
  });
}
function openArea(k) {
  const a = k ? area(k) : null;
  const v = a ? { ...a } : { l: "", c: POSTIT[areas().length % POSTIT.length].c };
  openSheet(`<h2>${a ? "Área" : "Nueva área"}</h2>
    <label class="field"><span class="fl">Nombre</span><input class="input" id="aN" maxlength="24" value="${esc(v.l)}" placeholder="Ej. Recursos Humanos" autofocus></label>
    <div class="field"><span class="fl">Color</span><div class="colors">${[...POSTIT.map((p) => p.c), "#BFE3D6", "#F2C6CF", "#D6D0C2"].map((x) => `<button type="button" data-col data-v="${x}" style="background:${x}" aria-label="Color" aria-pressed="${x.toLowerCase() === String(v.c).toLowerCase()}"></button>`).join("")}</div></div>
    <div class="acts">${a && areas().length > 1 ? `<button class="btn del" id="aDel">${I("trash")}Borrar</button>` : ""}<button class="btn" data-close>Cancelar</button><button class="btn btn-ink" id="aOk">${I("check")}Guardar</button></div>`,
  (root) => {
    wireChips(root, "[data-col]");
    $("#aOk", root).addEventListener("click", () => {
      const l = $("#aN", root).value.trim();
      if (!l) { $("#aN", root).focus(); return; }
      const c = pressed(root, "[data-col]")[0] || v.c;
      const list = areas();
      putProf({ areas: a ? list.map((x) => (x.k === a.k ? { ...x, l, c } : x)) : [...list, { k: "a" + newId().slice(0, 7), l, c }].slice(0, 30) });
      closeSheet(); toast("Área guardada");
    });
    wireDelete($("#aDel", root), () => { putProf({ areas: areas().filter((x) => x.k !== a.k) }); closeSheet(); toast("Área borrada"); });
  });
}

/* ---------- Avisos (push) ---------- */
function pushStateText() {
  if (S.demo) return "En la demo no se mandan avisos. Entra con Google para activarlos.";
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return /iPhone|iPad/.test(navigator.userAgent) ? "En iPhone: primero agrega la app a tu pantalla de inicio y ábrela desde ahí." : "Este navegador no permite avisos.";
  if (Notification.permission === "granted" && localStore("oficina.push")) return "Activados en este dispositivo.";
  if (Notification.permission === "denied") return "Bloqueados. Actívalos en los ajustes del cel para esta app.";
  return "Toca Activar para recibir avisos aquí.";
}
async function enablePush() {
  if (S.demo) { toast("En la demo no hay avisos"); return; }
  if (!("Notification" in window) || !("serviceWorker" in navigator)) { toast(pushStateText()); return; }
  try {
    const M = await import(FB + "firebase-messaging.js");
    if (!(await M.isSupported())) { toast("Este navegador no permite avisos con la app cerrada"); return; }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { toast("No se activaron los avisos"); render(); return; }
    const reg = await navigator.serviceWorker.register("sw.js"); await navigator.serviceWorker.ready;
    const had = localStore("oficina.push") || "";
    const token = await M.getToken(M.getMessaging(fb.app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
    if (!token) { toast("No se pudo registrar este dispositivo"); return; }
    await fb.F.setDoc(docRef("avisos", "t-" + hashStr(token).toString(36)), { token, device: (navigator.userAgent || "").slice(0, 140), createdAt: Date.now() });
    localStore("oficina.push", token);
    if (had === token) { await reg.showNotification("En 30 min: Junta de compras", { body: "Así se verán tus avisos.", icon: "icon-192.png" }); toast("Te mandé un aviso de prueba"); }
    else toast("¡Listo! Te avisaré aquí");
    render();
  } catch (e) { console.error(e); toast(e && e.code === "permission-denied" ? "Firebase no dio permiso. Faltan las reglas nuevas." : "No se pudieron activar: " + ((e && (e.code || e.message)) || "error")); }
}

/* ---------- Avisos cortos ---------- */
let toastTimer = 0;
function toast(msg) {
  const root = $("#toastRoot");
  root.innerHTML = `<div class="toast" role="status">${esc(msg)}</div>`;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (root.innerHTML = ""), 2800);
}

/* ---------- Clics (un solo escucha para toda la app) ---------- */
document.addEventListener("click", (ev) => {
  const g = ev.target.closest("[data-go]");
  if (g) { go(g.dataset.go); return; }
  const el = ev.target.closest("[data-act]");
  if (!el) return;
  const d = el.dataset, act = d.act;
  if (["todo-done", "req-next"].includes(act)) ev.stopPropagation();
  switch (act) {
    case "fab": { const tab = TABS.find((t) => t.k === route().v) || TABS[0]; tab.add && tab.add(); break; }
    case "add-todo": openTodo(); break;
    case "add-ev": openEvent(null, { date: d.date || todayISO() }); break;
    case "add-req": openReq(); break;
    case "todo": openTodo(d.id); break;
    case "todo-done": toggleTodo(d.id); break;
    case "req": openReq(d.id); break;
    case "req-next": reqNext(d.id); break;
    case "ev": openEventDetail(d.id, d.date); break;
    case "ext": openExtDetail(d.src, d.id); break;
    case "day": S.sel = d.date; if (d.date.slice(0, 7) !== S.month) S.month = d.date.slice(0, 7); render(); if (matchMedia("(max-width: 1139px)").matches) $(".cal-wrap .idx")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); break;
    case "day-go": S.sel = d.date; S.month = d.date.slice(0, 7); S.calView = "mes"; go("calendario"); break;
    case "month": S.month = d.d === "0" ? todayISO().slice(0, 7) : addMonths(S.month, Number(d.d)); if (d.d === "0") S.sel = todayISO(); render(); break;
    case "calview": S.calView = d.v; localStore("oficina.calView", d.v); render(); break;
    case "hide": S.hide.has(d.k) ? S.hide.delete(d.k) : S.hide.add(d.k); localStore("oficina.ocultos", JSON.stringify([...S.hide])); render(); break;
    case "todoF": S.todoF = d.v; render(); break;
    case "todoArea": S.todoArea = d.v; render(); break;
    case "reqCol": S.reqCol = d.v; render(); break;
    case "clear-done": { const done = S.todos.filter((t) => t.done); if (!el.dataset.armed) { el.dataset.armed = "1"; el.textContent = `¿Quitar ${plural(done.length, "pendiente hecho", "pendientes hechos")}? Toca otra vez`; return; } done.forEach((t) => del("pendientes", t.id)); toast("Listo, corcho limpio"); break; }
    case "theme": document.documentElement.setAttribute("data-theme", d.v); localStore("oficina.tema", d.v); setThemeColor(); render(); break;
    case "save-name": putProf({ name: $("#setName").value.trim().slice(0, 30) }); toast("Guardado"); break;
    case "push": enablePush(); break;
    case "av-dia": { const cur = new Set((S.prof.avisos && S.prof.avisos.dias) || [1, 2, 3, 4, 5]); const n = Number(d.v); cur.has(n) ? cur.delete(n) : cur.add(n); putProf({ avisos: { dias: [...cur].sort() } }); break; }
    case "cal-add": openCal(); break;
    case "cal-edit": openCal(d.id); break;
    case "area-add": openArea(); break;
    case "area-edit": openArea(d.k); break;
    case "notion-save": { const v = $("#setNotion").value.trim(); if (v && !/[0-9a-f]{32}/i.test(v.replace(/-/g, ""))) { toast("Ese link no parece de una base de Notion"); return; } putProf({ notion: { db: v, on: !!v } }); toast(v ? "Guardado. En unos minutos se conecta" : "Notion desconectado"); break; }
    case "notion-off": putProf({ notion: { db: "", on: false } }); toast("Notion desconectado"); break;
    case "copy": navigator.clipboard?.writeText(d.v).then(() => toast("Link copiado"), () => toast("No se pudo copiar")); break;
    case "signout": stopAll(); fb.U.signOut(fb.auth); break;
    case "demo-exit": endDemo(); break;
    case "demo": startDemo(); break;
    case "signin": signIn(); break;
  }
});
document.addEventListener("change", (ev) => {
  const el = ev.target.closest("[data-change]");
  if (!el) return;
  const k = el.dataset.change;
  if (k.startsWith("av-")) {
    const f = k.slice(3);
    putProf({ avisos: { [f]: el.type === "checkbox" ? el.checked : el.value } });
  } else if (k === "feed") putProf({ feed: { on: el.checked } });
});
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape" && $("#sheetBg")) closeSheet();
  const el = ev.target.closest && ev.target.closest('[role="button"][data-act]');
  if (el && (ev.key === "Enter" || ev.key === " ") && ev.target === el) { ev.preventDefault(); el.click(); }
  if (ev.target.id === "quickTodo" && ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); ev.target.form.requestSubmit(); }
});
document.addEventListener("submit", (ev) => {
  const f = ev.target.closest("[data-form]");
  if (!f) return;
  ev.preventDefault();
  if (f.dataset.form === "quick-todo") {
    const ta = $("#quickTodo"), v = ta.value.trim();
    if (!v) { ta.focus(); return; }
    ta.value = "";
    put("pendientes", null, { t: v.slice(0, 300), due: "", time: "", urgente: false, area: "", color: "", note: "", done: false });
    toast("¡Pegado en el corcho!");
  }
});

/* ---------- Entrar ---------- */
function renderSignIn() {
  app.innerHTML = `<div class="signin"><div class="postit pinned">
    <h1>${LOGO}Mi Oficina</h1>
    <p>Tu tablero de trabajo, en el cel y en la compu.</p>
    <ul><li>${I("cal")}Calendario con Apple, Google y Notion</li><li>${I("note")}Pendientes en post-its</li><li>${I("clip")}Requisiciones por meter</li><li>${I("bell")}Avisos al cel y resumen del día</li></ul>
    <button class="btn btn-block g-btn" data-act="signin">${GOOGLE}Entrar con Google</button>
    <button class="btn btn-flat btn-block" data-act="demo" style="text-decoration:underline">Ver la demo sin cuenta</button>
  </div></div>`;
}
async function signIn() {
  try {
    await loadFirebase();
    const provider = new fb.U.GoogleAuthProvider();
    try { await fb.U.signInWithPopup(fb.auth, provider); }
    catch (e) {
      if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) fb.U.signInWithRedirect(fb.auth, provider);
      else if (e && e.code === "auth/unauthorized-domain") toast("Falta autorizar este sitio en Firebase → Authentication → Authorized domains: " + location.hostname);
      else if (e && e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") toast("No se pudo iniciar sesión.");
    }
  } catch (e) { toast("No se pudo cargar Firebase. Revisa tu internet."); }
}
function renderError() {
  app.innerHTML = `<div class="signin"><div class="paper err-card pinned"><h2>Algo no salió</h2><p>${esc(S.error)}</p>
    <div class="acts"><button class="btn btn-ink" onclick="location.reload()">${I("repeat")}Reintentar</button>${S.user ? `<button class="btn" data-act="signout">Salir</button>` : ""}</div></div></div>`;
}
function setThemeColor() {
  requestAnimationFrame(() => { const c = getComputedStyle(document.documentElement).getPropertyValue("--bar").trim(); const m = $('meta[name="theme-color"]'); if (m && c) m.setAttribute("content", c); });
}

/* ---------- Arranque ---------- */
window.addEventListener("hashchange", () => { closeSheet(); render(); window.scrollTo(0, 0); });
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", setThemeColor);
setThemeColor();
// Repinta cada minuto para que "ahora" y "sigue" estén al día (si no hay una hoja abierta).
setInterval(() => { if (!$("#sheetBg") && !(document.activeElement && document.activeElement.id === "quickTodo")) render(); }, 60000);
// Atajos de la pantalla de inicio (manifest): ?nuevo=pendiente | evento | requisicion
const nuevo = new URLSearchParams(location.search).get("nuevo");
function openNuevo() {
  if (!nuevo) return;
  history.replaceState(null, "", location.pathname + location.hash);
  setTimeout(() => (nuevo === "evento" ? openEvent() : nuevo === "requisicion" ? openReq() : openTodo()), 50);
}
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

if (new URLSearchParams(location.search).has("demo") || localStore("oficina.modo") === "demo") { startDemo(); openNuevo(); }
else {
  loadFirebase().then(({ auth, U }) => {
    U.onAuthStateChanged(auth, (user) => {
      stopAll();
      Object.assign(S, { authReady: true, user, prof: null, events: [], todos: [], reqs: [], ext: {}, error: "" });
      render();
      if (user) { listen(); S._loadedAt = Date.now(); setTimeout(openNuevo, 600); }
    });
  }).catch((e) => {
    console.error(e);
    S.authReady = true;
    app.innerHTML = `<div class="signin"><div class="paper err-card pinned"><h2>Sin conexión</h2><p>No se pudo cargar Firebase. Revisa tu internet y vuelve a intentar.</p>
      <div class="acts"><button class="btn btn-ink" onclick="location.reload()">Reintentar</button><button class="btn" data-act="demo">Ver la demo</button></div></div></div>`;
  });
}
