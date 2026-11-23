// Lógica de los avisos de Nuestros Planes, sin Firebase (para poder probarla sola).
// Las fechas y horas de los eventos están en hora de la Ciudad de México.
const TZ = "America/Mexico_City";
const DEFAULT_REMIND = ["7d", "1d", "0d", "1h"];
const DAY_HOUR = 9;          // los avisos de "faltan X días" salen a las 9:00
const pad2 = (n) => String(n).padStart(2, "0");

const dayNum = (iso) => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const addDays = (iso, n) => new Date((dayNum(iso) + n) * 86400000).toISOString().slice(0, 10);
const toMin = (t) => { if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return null; const [h, m] = t.split(":").map(Number); return h * 60 + m; };

// Partes de la fecha/hora en CDMX para un instante.
function mxParts(ms) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { iso: `${p.year}-${p.month}-${p.day}`, min: Number(p.hour) * 60 + Number(p.minute) };
}
// Instante (ms) de una fecha y minuto del día en CDMX.
function mxToMs(iso, min) {
  const [y, m, d] = iso.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, min);
  const p = mxParts(guess), [Y, M, D] = p.iso.split("-").map(Number);
  const off = Date.UTC(Y, M - 1, D, 0, p.min) - guess;   // cuánto adelanta CDMX respecto a UTC (negativo)
  return guess - off;
}

const evEnd = (e) => (e.endDate && e.endDate > e.date && (e.repeat || "no") === "no") ? e.endDate : e.date;
const isTimed = (e) => !e.allDay && toMin(e.time) != null && evEnd(e) === e.date;

// Siguiente fecha (>= from) en que empieza el evento.
function nextStart(e, from) {
  if (!e.date || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return null;
  const rep = e.repeat || "no";
  if (from <= e.date) return e.date;
  if (rep === "no") return null;
  if (rep === "semanal") return addDays(e.date, Math.ceil((dayNum(from) - dayNum(e.date)) / 7) * 7);
  const [, m, d] = e.date.split("-").map(Number);
  let [Y, M] = from.split("-").map(Number);
  for (let k = 0; k < 60; k++) {
    const mm = rep === "anual" ? m : M;
    const cand = new Date(Date.UTC(Y, mm - 1, d));
    if (cand.getUTCMonth() === mm - 1) { const iso = cand.toISOString().slice(0, 10); if (iso >= from) return iso; }
    if (rep === "anual") Y++; else { M++; if (M > 12) { M = 1; Y++; } }
  }
  return null;
}

// Avisos que tocan ahora para un evento: [{ key, code, occ, days }]. `sent` es el mapa de avisos ya enviados.
function dueReminders(e, nowMs, sent = {}) {
  const now = mxParts(nowMs);
  const out = [];
  const codes = Array.isArray(e.remind) ? e.remind : DEFAULT_REMIND;
  // Revisa la ocurrencia de hoy y las próximas (hasta 31 días adelante cubre el aviso de "1 mes").
  const occs = new Set();
  let o = nextStart(e, now.iso);
  for (let k = 0; o && k < 6 && dayNum(o) - dayNum(now.iso) <= 31; k++) { occs.add(o); o = nextStart(e, addDays(o, 1)); }
  const startMin = isTimed(e) ? toMin(e.time) : null;
  for (const occ of occs) {
    const startMs = mxToMs(occ, startMin ?? 0);
    for (const code of codes) {
      const m = /^(\d+)([dhm])$/.exec(code); if (!m) continue;
      const n = Number(m[1]), unit = m[2];
      let fire, until;
      if (unit === "d") {
        const day = addDays(occ, -n);
        let at = DAY_HOUR * 60;
        if (n === 0 && startMin != null && startMin - 120 < at) at = Math.max(6 * 60, startMin - 120);   // eventos temprano: avisa antes
        fire = mxToMs(day, at);
        until = Math.min(mxToMs(addDays(day, 1), 0), startMin != null ? startMs : Infinity);   // si se pasó la hora, aún sale ese mismo día
      } else {
        if (startMin == null) continue;
        fire = startMs - n * (unit === "h" ? 3600000 : 60000);
        until = startMs;
      }
      if (nowMs < fire || nowMs >= until) continue;
      const key = `${occ}T${startMin != null ? e.time : "dia"}:${code}`;
      if (sent[key]) continue;
      out.push({ key, code, occ, fire, left: Math.round((startMs - nowMs) / 60000), days: dayNum(occ) - dayNum(now.iso) });
    }
  }
  // Si tocan varios a la vez (por ejemplo al crear un evento tarde), solo el más cercano al evento.
  out.sort((a, b) => b.fire - a.fire);
  return out.slice(0, 1).map((x) => ({ ...x, alsoKeys: out.map((y) => y.key) }));
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fLong = (iso) => { const d = new Date(dayNum(iso) * 86400000); return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`; };
const fTime = (t) => { const m = toMin(t); if (m == null) return ""; const h = Math.floor(m / 60); return `${h % 12 || 12}:${pad2(m % 60)} ${h < 12 ? "am" : "pm"}`; };
const EMO = { plan: "💞", cita: "🥂", viaje: "✈️", cumple: "🎂", aniversario: "💍", pendiente: "📌", otro: "✨" };

function message(e, r, emoji) {
  const em = emoji || EMO[e.type] || "💞";
  const t = e.title || "su plan";
  const at = isTimed(e) ? ` a las ${fTime(e.time)}` : "";
  const where = e.place ? ` · ${e.place}` : "";
  const m = /^(\d+)([dhm])$/.exec(r.code), n = Number(m[1]), unit = m[2];
  if (unit === "h" || unit === "m") {
    // Lo que de verdad falta (el aviso puede salir unos minutos tarde, o el evento se creó ya encima).
    const left = Number.isFinite(r.left) ? r.left : n * (unit === "h" ? 60 : 1);
    const h = Math.floor((left + 7) / 60), mi = left - h * 60;
    const txt = left < 53 ? `${Math.max(1, left)} min` : h === 1 && mi < 8 ? "1 hora" : mi >= 8 ? `${h} h ${mi} min` : `${h} horas`;
    return { title: `En ${txt}: ${t} ${em}`, body: `Hoy${at}${where}. ¡Ya casi!` };
  }
  if (r.days <= 0) return { title: `Hoy: ${t} ${em}`, body: `${isTimed(e) ? "A las " + fTime(e.time) : "Todo el día"}${where}. Disfrútenlo 💞` };
  if (r.days === 1) return { title: `Mañana: ${t} ${em}`, body: `${fLong(r.occ)}${at}${where}.` };
  return { title: `Faltan ${r.days} días para ${t} ${em}`, body: `${fLong(r.occ)}${at}${where}.` };
}

module.exports = { dueReminders, message, mxParts, mxToMs, nextStart, DEFAULT_REMIND };
