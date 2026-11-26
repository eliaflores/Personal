// Lógica de los avisos de Mi Oficina, sin Firebase (para poder probarla sola con `node oficina-avisos/pruebas.js`).
// Cada quien guarda su zona horaria en su perfil; si no hay, se usa la de la Ciudad de México.
const DEFAULT_TZ = "America/Mexico_City";
const DEFAULT_REMIND = ["30m"];
const pad2 = (n) => String(n).padStart(2, "0");
const ISO = /^\d{4}-\d{2}-\d{2}$/;

const validTz = (tz) => { try { if (!tz) return null; new Intl.DateTimeFormat("en-US", { timeZone: tz }); return tz; } catch (_) { return null; } };
const dayNum = (iso) => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const addDays = (iso, n) => new Date((dayNum(iso) + n) * 86400000).toISOString().slice(0, 10);
const dowOf = (iso) => new Date(dayNum(iso) * 86400000).getUTCDay();   // 0 = domingo
const toMin = (t) => { if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return null; const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const minToTime = (m) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;

// Fecha, minuto del día y día de la semana de un instante en una zona horaria.
const fmtCache = {};
function parts(ms, tz = DEFAULT_TZ) {
  const f = fmtCache[tz] || (fmtCache[tz] = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }));
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  const iso = `${p.year}-${p.month}-${p.day}`;
  return { iso, min: Number(p.hour) * 60 + Number(p.minute), dow: dowOf(iso) };
}
// Instante (ms) de una fecha y minuto del día en una zona horaria (sirve también con horario de verano).
function toMs(iso, min, tz = DEFAULT_TZ) {
  const [y, m, d] = iso.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, min);
  const off = (g) => { const p = parts(g, tz), [Y, M, D] = p.iso.split("-").map(Number); return Date.UTC(Y, M - 1, D, 0, p.min) - g; };
  const o1 = off(guess);
  const o2 = off(guess - o1);
  return guess - o2;
}

const REPEATS = ["laborables", "semanal", "mensual", "anual"];
const isTimed = (e) => !e.allDay && toMin(e.time) != null;

// Siguiente fecha (>= from) en que hay una ocurrencia del evento.
function nextStart(e, from) {
  if (!e || !ISO.test(e.date || "")) return null;
  const rep = e.repeat || "no";
  if (from <= e.date) {
    if (rep === "laborables") { let d = e.date; for (let k = 0; k < 7; k++) { const w = dowOf(d); if (w >= 1 && w <= 5) return d; d = addDays(d, 1); } }
    return e.date;
  }
  if (rep === "no") return null;
  if (rep === "laborables") { let d = from; for (let k = 0; k < 7; k++) { const w = dowOf(d); if (w >= 1 && w <= 5) return d; d = addDays(d, 1); } return null; }
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
function occursOn(e, iso) {
  if (!e || !ISO.test(e.date || "") || iso < e.date) return false;
  const rep = e.repeat || "no";
  if (rep === "no") return iso <= (e.endDate && e.endDate > e.date ? e.endDate : e.date);
  return nextStart(e, iso) === iso;
}

// Avisos de un evento que tocan ahora: [{ key, code, occ, left, days, alsoKeys }].
// Códigos: "15m", "30m", "1h", "2h" (antes de la hora), "1d" (un día antes, a la hora del resumen), "0d" (el mismo día).
function dueReminders(e, nowMs, { tz = DEFAULT_TZ, sent = {}, dayMin = 8 * 60 } = {}) {
  const now = parts(nowMs, tz);
  const codes = Array.isArray(e.remind) ? e.remind : DEFAULT_REMIND;
  const out = [];
  const occs = [];
  let o = nextStart(e, now.iso);
  for (let k = 0; o && k < 4 && dayNum(o) - dayNum(now.iso) <= 2; k++) { occs.push(o); o = nextStart(e, addDays(o, 1)); }
  const startMin = isTimed(e) ? toMin(e.time) : null;
  for (const occ of occs) {
    const startMs = toMs(occ, startMin ?? 0, tz);
    for (const code of codes) {
      const m = /^(\d+)([dhm])$/.exec(code); if (!m) continue;
      const n = Number(m[1]), unit = m[2];
      let fire, until;
      if (unit === "d") {
        const day = addDays(occ, -n);
        let at = dayMin;
        if (n === 0 && startMin != null && startMin - 60 < at) at = Math.max(6 * 60, startMin - 60);   // juntas muy temprano: avisa antes
        fire = toMs(day, at, tz);
        until = Math.min(toMs(addDays(day, 1), 0, tz), n === 0 && startMin != null ? startMs : Infinity);
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
  // Si tocan varios a la vez (por ejemplo al crear el evento ya encima), solo se manda el más cercano.
  out.sort((a, b) => b.fire - a.fire);
  return out.slice(0, 1).map((x) => ({ ...x, alsoKeys: out.map((y) => y.key) }));
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fLong = (iso) => { const d = new Date(dayNum(iso) * 86400000); return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}`; };
const fTime = (t) => { const m = toMin(t); if (m == null) return ""; const h = Math.floor(m / 60); return `${h % 12 || 12}:${pad2(m % 60)} ${h < 12 ? "am" : "pm"}`; };
const leftText = (left) => {
  const h = Math.floor((left + 7) / 60), mi = left - h * 60;
  return left < 53 ? `${Math.max(1, left)} min` : h === 1 && mi < 8 ? "1 hora" : mi >= 8 ? `${h} h ${mi} min` : `${h} horas`;
};

function eventMessage(e, r) {
  const t = e.title || "Evento";
  const at = isTimed(e) ? ` a las ${fTime(e.time)}` : "";
  const where = e.place ? ` · ${e.place}` : "";
  const m = /^(\d+)([dhm])$/.exec(r.code), unit = m[2];
  if (unit === "h" || unit === "m") return { title: `En ${leftText(r.left)}: ${t}`, body: `Hoy${at}${where}` };
  if (r.days <= 0) return { title: `Hoy: ${t}`, body: `${isTimed(e) ? "A las " + fTime(e.time) : "Todo el día"}${where}` };
  if (r.days === 1) return { title: `Mañana: ${t}`, body: `${fLong(r.occ)}${at}${where}` };
  return { title: `En ${r.days} días: ${t}`, body: `${fLong(r.occ)}${at}${where}` };
}

// Pendiente con hora: avisa 30 min antes (o en cuanto se pueda si se creó encima), hasta 1 h después de la hora.
function todoReminder(t, nowMs, { tz = DEFAULT_TZ, sent = {} } = {}) {
  if (!t || t.done || !ISO.test(t.due || "") || toMin(t.time) == null) return null;
  const at = toMs(t.due, toMin(t.time), tz);
  if (nowMs < at - 30 * 60000 || nowMs >= at + 60 * 60000) return null;
  const key = `${t.due}T${t.time}:todo`;
  if (sent[key]) return null;
  const left = Math.round((at - nowMs) / 60000);
  return { key, title: left > 0 ? `Pendiente en ${leftText(left)}` : "Pendiente para ahora", body: t.t || "Tienes un pendiente" };
}

// Requisiciones: un día antes de la fecha límite (y el mismo día si no hay resumen), a la hora del resumen.
const reqOpen = (r) => r && (r.estado || "pormeter") === "pormeter" || (r && r.estado === "rechazada");
function reqReminder(r, nowMs, { tz = DEFAULT_TZ, sent = {}, dayMin = 8 * 60, sameDay = false } = {}) {
  if (!reqOpen(r) || !ISO.test(r.due || "")) return null;
  const now = parts(nowMs, tz);
  if (now.min < dayMin || now.min >= dayMin + 4 * 60) return null;
  const days = dayNum(r.due) - dayNum(now.iso);
  if (days === 1) {
    const key = `${r.due}:req1d`;
    if (sent[key]) return null;
    return { key, title: "Mañana hay que meter una requisición", body: r.t || "Requisición" };
  }
  if (days === 0 && sameDay) {
    const key = `${r.due}:req0d`;
    if (sent[key]) return null;
    return { key, title: "Hoy hay que meter una requisición", body: r.t || "Requisición" };
  }
  return null;
}

// ¿Toca mandar el resumen del día? (a la hora elegida, en los días elegidos, hasta 3 h tarde y una vez al día)
function digestDue(cfg, nowMs, { tz = DEFAULT_TZ, last = null } = {}) {
  const c = cfg || {};
  if (c.resumen === false) return null;
  const now = parts(nowMs, tz);
  const dias = Array.isArray(c.dias) && c.dias.length ? c.dias : [1, 2, 3, 4, 5];
  if (!dias.includes(now.dow)) return null;
  const at = toMin(c.hora) ?? 8 * 60;
  if (now.min < at || now.min >= at + 180) return null;
  if (last === now.iso) return null;
  return now.iso;
}
// Texto del resumen: lo que hay hoy. items = eventos de hoy [{title,time,allDay}], todos y reqs abiertos.
function digestMessage({ today, items = [], todos = [], reqs = [] }) {
  const evs = items.slice().sort((a, b) => (toMin(a.time) ?? -1) - (toMin(b.time) ?? -1));
  const timed = evs.filter((e) => !e.allDay && toMin(e.time) != null);
  const tHoy = todos.filter((t) => !t.done && t.due === today).length;
  const tVen = todos.filter((t) => !t.done && ISO.test(t.due || "") && t.due < today).length;
  const rHoy = reqs.filter((r) => reqOpen(r) && r.due === today).length;
  const rVen = reqs.filter((r) => reqOpen(r) && ISO.test(r.due || "") && r.due < today).length;
  const parts = [];
  if (evs.length) parts.push(`${evs.length} ${evs.length === 1 ? "evento" : "eventos"}${timed.length ? ` (el primero a las ${fTime(timed[0].time)}: ${timed[0].title || "evento"})` : ""}`);
  if (tHoy || tVen) parts.push([tHoy ? `${tHoy} ${tHoy === 1 ? "pendiente" : "pendientes"} para hoy` : "", tVen ? `${tVen} ${tVen === 1 ? "vencido" : "vencidos"}` : ""].filter(Boolean).join(", "));
  if (rHoy || rVen) parts.push([rHoy ? `${rHoy} ${rHoy === 1 ? "requisición" : "requisiciones"} por meter hoy` : "", rVen ? `${rVen} ${rVen === 1 ? "atrasada" : "atrasadas"}` : ""].filter(Boolean).join(", "));
  if (!parts.length) return null;
  return { title: `Tu día: ${fLong(today)}`, body: parts.join(" · ") };
}

// Quita del mapa de avisos enviados lo de hace más de una semana (las llaves empiezan con la fecha).
function pruneSent(sent, today) {
  const min = addDays(today, -7), out = {};
  for (const [k, v] of Object.entries(sent || {})) if (k.slice(0, 10) >= min) out[k] = v;
  return out;
}

module.exports = {
  DEFAULT_TZ, DEFAULT_REMIND, REPEATS, validTz, parts, toMs, addDays, dayNum, dowOf, toMin, minToTime, pad2,
  nextStart, occursOn, dueReminders, eventMessage, todoReminder, reqReminder, reqOpen, digestDue, digestMessage, pruneSent, fTime,
};

// Sin resumen del día: los pendientes de hoy sin hora se avisan uno por uno a la hora del resumen.
function todoDayReminder(t, nowMs, { tz = DEFAULT_TZ, sent = {}, dayMin = 8 * 60 } = {}) {
  if (!t || t.done || !ISO.test(t.due || "") || toMin(t.time) != null) return null;
  const now = parts(nowMs, tz);
  if (t.due !== now.iso || now.min < dayMin || now.min >= dayMin + 4 * 60) return null;
  const key = `${t.due}:todo0d`;
  if (sent[key]) return null;
  return { key, title: "Pendiente para hoy", body: t.t || "Tienes un pendiente" };
}
module.exports.todoDayReminder = todoDayReminder;
