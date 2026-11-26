// Calendarios .ics (iCalendar), sin Firebase:
// - parseICS / expand: lee el calendario público de Apple (iCloud), la dirección secreta de Google o el de Outlook,
//   y saca los eventos de unas semanas atrás a unos meses adelante, ya en la zona horaria de la persona.
// - buildICS: arma el calendario de Mi Oficina para suscribirse desde Apple Calendar (o Google, Outlook…).
const { parts, toMs, addDays, dayNum, dowOf, toMin, pad2, validTz, DEFAULT_TZ } = require("./logica");

// Algunos calendarios (Outlook) usan nombres de zona de Windows.
const WIN_TZ = {
  "Central Standard Time (Mexico)": "America/Mexico_City", "Central Standard Time": "America/Chicago",
  "Mountain Standard Time (Mexico)": "America/Mazatlan", "Pacific Standard Time (Mexico)": "America/Tijuana",
  "Eastern Standard Time": "America/New_York", "Pacific Standard Time": "America/Los_Angeles", "Mountain Standard Time": "America/Denver",
  "SA Pacific Standard Time": "America/Bogota", "Romance Standard Time": "Europe/Paris", "W. Europe Standard Time": "Europe/Berlin",
  "GMT Standard Time": "Europe/London", "UTC": "UTC", "Coordinated Universal Time": "UTC",
};
const tzName = (raw) => { const t = String(raw || "").replace(/^"|"$/g, "").replace(/^\/[^/]*\//, ""); return validTz(t) || validTz(WIN_TZ[t]) || null; };

const unescapeText = (s) => String(s || "").replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");

// Junta las líneas dobladas y separa cada propiedad: { name, params, value }.
function lines(text) {
  const raw = String(text || "").replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  for (const l of raw) {
    if ((l.startsWith(" ") || l.startsWith("\t")) && out.length) out[out.length - 1] += l.slice(1);
    else if (l.trim()) out.push(l);
  }
  return out.map((l) => {
    let i = 0, q = false;
    for (; i < l.length; i++) { const c = l[i]; if (c === '"') q = !q; else if (c === ":" && !q) break; }
    const head = l.slice(0, i), value = l.slice(i + 1);
    const segs = head.split(";");
    const params = {};
    for (const s of segs.slice(1)) { const k = s.indexOf("="); if (k > 0) params[s.slice(0, k).toUpperCase()] = s.slice(k + 1); }
    return { name: segs[0].toUpperCase(), params, value };
  });
}

// Fecha/hora iCalendar → { allDay, iso, min, tz } (tz: zona, "UTC" o null si es "flotante").
function parseDT(value, params = {}) {
  const v = String(value || "").trim();
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(v);
  if (!m) return null;
  const iso = `${m[1]}-${m[2]}-${m[3]}`;
  if (!m[4] || (params.VALUE || "").toUpperCase() === "DATE") return { allDay: true, iso, min: 0, tz: null };
  const min = Number(m[4]) * 60 + Number(m[5]);
  return { allDay: false, iso, min, tz: m[7] ? "UTC" : tzName(params.TZID) };
}
const dtMs = (dt, fallbackTz) => toMs(dt.iso, dt.min, dt.tz || fallbackTz);

function parseDuration(v) {
  const m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(String(v || "").trim());
  if (!m) return null;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * ((Number(m[2] || 0) * 7 + Number(m[3] || 0)) * 86400000 + Number(m[4] || 0) * 3600000 + Number(m[5] || 0) * 60000 + Number(m[6] || 0) * 1000);
}

function parseRRule(v) {
  const r = {};
  for (const kv of String(v || "").split(";")) { const [k, val] = kv.split("="); if (k && val != null) r[k.toUpperCase()] = val; }
  if (!r.FREQ) return null;
  return {
    freq: r.FREQ.toUpperCase(), interval: Math.max(1, Number(r.INTERVAL) || 1), count: r.COUNT ? Number(r.COUNT) : null,
    until: r.UNTIL ? parseDT(r.UNTIL, {}) : null,
    byday: r.BYDAY ? r.BYDAY.split(",").map((s) => { const x = /^([+-]?\d+)?(MO|TU|WE|TH|FR|SA|SU)$/.exec(s.trim().toUpperCase()); return x ? { n: x[1] ? Number(x[1]) : null, d: ["SU", "MO", "TU", "WE", "TH", "FR", "SA"].indexOf(x[2]) } : null; }).filter(Boolean) : null,
    bymonthday: r.BYMONTHDAY ? r.BYMONTHDAY.split(",").map(Number).filter(Boolean) : null,
    bymonth: r.BYMONTH ? r.BYMONTH.split(",").map(Number).filter(Boolean) : null,
  };
}

// Lee el texto .ics y devuelve los VEVENT con sus datos crudos.
function parseICS(text) {
  const ls = lines(text);
  const events = [];
  let cur = null, depth = 0, calName = "";
  for (const l of ls) {
    if (l.name === "BEGIN") {
      if (l.value.toUpperCase() === "VEVENT" && !cur) { cur = { exdates: [] }; depth = 0; continue; }
      if (cur) depth++;
      continue;
    }
    if (l.name === "END") {
      if (cur && l.value.toUpperCase() === "VEVENT" && depth === 0) { events.push(cur); cur = null; continue; }
      if (cur) depth--;
      continue;
    }
    if (!cur) { if (l.name === "X-WR-CALNAME") calName = unescapeText(l.value); continue; }
    if (depth > 0) continue;   // VALARM y otros componentes dentro del evento
    switch (l.name) {
      case "UID": cur.uid = l.value; break;
      case "SUMMARY": cur.summary = unescapeText(l.value); break;
      case "LOCATION": cur.location = unescapeText(l.value); break;
      case "DESCRIPTION": cur.description = unescapeText(l.value); break;
      case "URL": cur.url = l.value; break;
      case "STATUS": cur.status = l.value.toUpperCase(); break;
      case "DTSTART": cur.start = parseDT(l.value, l.params); break;
      case "DTEND": cur.end = parseDT(l.value, l.params); break;
      case "DURATION": cur.duration = parseDuration(l.value); break;
      case "RRULE": cur.rrule = parseRRule(l.value); break;
      case "RECURRENCE-ID": cur.recurrenceId = parseDT(l.value, l.params); break;
      case "EXDATE": for (const v of l.value.split(",")) { const d = parseDT(v, l.params); if (d) cur.exdates.push(d); } break;
    }
  }
  return { calName, events: events.filter((e) => e.start) };
}

// Fechas (en la zona del evento) en que empieza cada ocurrencia de la regla, desde el inicio hasta `toIso`.
function* ruleDates(start, rule, toIso) {
  const first = start.iso;
  const [y0, m0, d0] = first.split("-").map(Number);
  let count = 0, guard = 0;
  const untilIso = rule.until ? (rule.until.tz === "UTC" && !rule.until.allDay ? parts(toMs(rule.until.iso, rule.until.min, "UTC"), start.tz || "UTC").iso : rule.until.iso) : null;
  const emit = function* (iso) {
    if (iso < first) return;
    if (untilIso && iso > untilIso) return;
    count++;
    yield iso;
  };
  const done = (iso) => (iso > toIso) || (untilIso && iso > untilIso) || (rule.count && count >= rule.count) || ++guard > 6000;
  if (rule.freq === "DAILY") {
    for (let iso = first; !done(iso); iso = addDays(iso, rule.interval)) {
      if (rule.byday && !rule.byday.some((b) => b.d === dowOf(iso))) continue;
      yield* emit(iso);
    }
    return;
  }
  if (rule.freq === "WEEKLY") {
    const days = (rule.byday && rule.byday.length ? rule.byday.map((b) => b.d) : [dowOf(first)]).map((d) => (d + 6) % 7).sort((a, b) => a - b);   // lunes = 0
    let wk = addDays(first, -((dowOf(first) + 6) % 7));
    while (true) {
      for (const k of days) {
        const iso = addDays(wk, k);
        if (done(iso)) return;
        yield* emit(iso);
      }
      wk = addDays(wk, 7 * rule.interval);
      if (++guard > 6000) return;
    }
  }
  if (rule.freq === "MONTHLY" || rule.freq === "YEARLY") {
    let Y = y0, M = m0;
    while (true) {
      const months = rule.freq === "YEARLY" ? (rule.bymonth && rule.bymonth.length ? rule.bymonth : [m0]) : [M];
      for (const mm of months) {
        const dim = new Date(Date.UTC(Y, mm, 0)).getUTCDate();
        let days = [];
        if (rule.byday && rule.byday.length && (rule.freq === "MONTHLY" || rule.bymonth)) {
          for (const b of rule.byday) {
            const all = [];
            for (let d = 1; d <= dim; d++) if (new Date(Date.UTC(Y, mm - 1, d)).getUTCDay() === b.d) all.push(d);
            if (b.n == null) days.push(...all); else { const pick = b.n > 0 ? all[b.n - 1] : all[all.length + b.n]; if (pick) days.push(pick); }
          }
        } else if (rule.bymonthday && rule.bymonthday.length) {
          days = rule.bymonthday.map((d) => (d < 0 ? dim + 1 + d : d)).filter((d) => d >= 1 && d <= dim);
        } else if (d0 <= dim) days = [d0];
        for (const d of [...new Set(days)].sort((a, b) => a - b)) {
          const iso = `${Y}-${pad2(mm)}-${pad2(d)}`;
          if (done(iso)) return;
          yield* emit(iso);
        }
      }
      if (rule.freq === "YEARLY") Y += rule.interval; else { M += rule.interval; while (M > 12) { M -= 12; Y++; } }
      if (`${Y}-${pad2(M)}-01` > toIso || ++guard > 6000) return;
    }
  }
}

// Eventos entre fromIso y toIso, ya en la zona horaria `tz`: [{ id, title, date, time, endTime, endDate, allDay, place, note, url }].
function expand(cal, { fromIso, toIso, tz = DEFAULT_TZ, max = 1500 } = {}) {
  const out = [];
  const overrides = new Map();   // uid|inicio original → evento que lo reemplaza
  const keyOf = (uid, dt, evTz) => `${uid}|${dt.allDay ? dt.iso : dtMs(dt, evTz)}`;
  for (const e of cal.events) if (e.recurrenceId && e.uid) overrides.set(keyOf(e.uid, e.recurrenceId, e.start.tz || tz), e);

  const push = (e, startMs, endMs, allDay, sIso, eIso, occKey) => {
    if (e.status === "CANCELLED") return;
    let rec;
    if (allDay) {
      const endDate = eIso && eIso > sIso ? addDays(eIso, -1) : sIso;   // DTEND de los eventos de todo el día no se incluye
      if (endDate < fromIso || sIso > toIso) return;
      rec = { date: sIso, endDate: endDate > sIso ? endDate : "", allDay: true, time: "", endTime: "" };
    } else {
      const s = parts(startMs, tz), en = parts(Math.max(endMs, startMs), tz);
      if (en.iso < fromIso || s.iso > toIso) return;
      const hhmm = (m) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
      rec = { date: s.iso, time: hhmm(s.min), endTime: endMs > startMs ? hhmm(en.min) : "", endDate: en.iso > s.iso ? en.iso : "", allDay: false };
    }
    out.push({
      id: String(occKey).replace(/[^\w@.\-|]/g, "").slice(0, 160),
      title: (e.summary || "(Sin título)").slice(0, 300), place: (e.location || "").slice(0, 300),
      note: (e.description || "").slice(0, 600), url: /^https?:\/\//i.test(e.url || "") ? e.url.slice(0, 500) : "", ...rec,
    });
  };

  for (const e of cal.events) {
    if (e.recurrenceId) continue;   // los reemplazos se agregan al expandir la serie (o solos, abajo)
    const evTz = e.start.tz || tz;
    const allDay = e.start.allDay;
    const startMs0 = allDay ? null : dtMs(e.start, tz);
    const durMs = allDay ? null : (e.end && !e.end.allDay ? dtMs(e.end, tz) - startMs0 : (e.duration || 0));
    const durDays = allDay ? (e.end ? Math.max(1, dayNum(e.end.iso) - dayNum(e.start.iso)) : Math.max(1, Math.round((e.duration || 86400000) / 86400000))) : null;
    const ex = new Set(e.exdates.map((d) => (d.allDay ? d.iso : dtMs(d, evTz))));
    if (!e.rrule) {
      if (allDay) push(e, null, null, true, e.start.iso, addDays(e.start.iso, durDays), e.uid || e.start.iso);
      else push(e, startMs0, startMs0 + durMs, false, null, null, `${e.uid || "ev"}|${startMs0}`);
      continue;
    }
    const lookFrom = addDays(fromIso, -(allDay ? durDays : 2));
    for (const iso of ruleDates(e.start, e.rrule, addDays(toIso, 1))) {
      if (iso < lookFrom) continue;
      const occ = allDay ? { allDay: true, iso, min: 0, tz: null } : { allDay: false, iso, min: e.start.min, tz: e.start.tz };
      const occMs = allDay ? null : dtMs(occ, tz);
      if (ex.has(allDay ? iso : occMs) || (allDay && ex.has(iso))) continue;
      const ov = e.uid && overrides.get(keyOf(e.uid, occ, evTz));
      if (ov) {
        overrides.delete(keyOf(e.uid, occ, evTz));
        const oAll = ov.start.allDay, oS = oAll ? null : dtMs(ov.start, tz);
        const oE = oAll ? null : (ov.end && !ov.end.allDay ? dtMs(ov.end, tz) : oS + (ov.duration || durMs || 0));
        push({ ...e, ...Object.fromEntries(Object.entries(ov).filter(([, v]) => v != null && v !== "")) }, oS, oE, oAll, ov.start.iso, ov.end ? ov.end.iso : addDays(ov.start.iso, 1), `${e.uid}|${iso}`);
      } else if (allDay) push(e, null, null, true, iso, addDays(iso, durDays), `${e.uid || "ev"}|${iso}`);
      else push(e, occMs, occMs + durMs, false, null, null, `${e.uid || "ev"}|${iso}`);
      if (out.length >= max) break;
    }
  }
  // Reemplazos cuya serie no estaba (o cayó fuera): se agregan solos.
  for (const ov of overrides.values()) {
    if (ov.start.allDay) push(ov, null, null, true, ov.start.iso, ov.end ? ov.end.iso : addDays(ov.start.iso, 1), `${ov.uid}|${ov.start.iso}`);
    else { const s = dtMs(ov.start, tz); push(ov, s, ov.end && !ov.end.allDay ? dtMs(ov.end, tz) : s + (ov.duration || 0), false, null, null, `${ov.uid}|${s}`); }
  }
  out.sort((a, b) => (a.date + (a.time || "00:00")).localeCompare(b.date + (b.time || "00:00")));
  const seen = new Set();
  return out.filter((x) => (seen.has(x.id) ? false : seen.add(x.id))).slice(0, max);
}

/* ---------- Calendario de Mi Oficina para suscribirse (feed .ics) ---------- */
const escText = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
// Dobla las líneas a 75 bytes como pide el formato.
function fold(line) {
  const out = [];
  let cur = "", bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch);
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ""; bytes = 0; }
    cur += ch; bytes += b;
  }
  out.push(cur);
  return out.join("\r\n ");
}
const utcStamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const dateVal = (iso) => iso.replace(/-/g, "");
const localStamp = (iso, min) => `${dateVal(iso)}T${pad2(Math.floor(min / 60))}${pad2(min % 60)}00`;
const offStr = (offMin) => `${offMin < 0 ? "-" : "+"}${pad2(Math.floor(Math.abs(offMin) / 60))}${pad2(Math.abs(offMin) % 60)}`;
const offsetAt = (ms, tz) => { const p = parts(ms, tz); const [y, m, d] = p.iso.split("-").map(Number); return Math.round((Date.UTC(y, m - 1, d, 0, p.min) - Math.floor(ms / 60000) * 60000) / 60000); };

// VTIMEZONE de la zona (con sus cambios de horario de verano, si tiene) para los eventos que se repiten.
function vtimezone(tz, nowMs) {
  const y = new Date(nowMs).getUTCFullYear();
  const startMs = Date.UTC(y - 1, 0, 1), endMs = Date.UTC(y + 3, 0, 1);
  const L = ["BEGIN:VTIMEZONE", `TZID:${tz}`];
  const trans = [];
  let prev = offsetAt(startMs, tz);
  for (let t = startMs + 3600000 * 6; t < endMs; t += 3600000 * 6) {
    const o = offsetAt(t, tz);
    if (o !== prev) {
      let lo = t - 3600000 * 6, hi = t;   // busca el minuto exacto del cambio
      while (hi - lo > 60000) { const mid = Math.floor((lo + hi) / 120000) * 60000; if (offsetAt(mid, tz) === prev) lo = mid; else hi = mid; }
      trans.push({ at: hi, from: prev, to: o });
      prev = o;
    }
  }
  if (!trans.length) {
    L.push("BEGIN:STANDARD", "DTSTART:19700101T000000", `TZOFFSETFROM:${offStr(prev)}`, `TZOFFSETTO:${offStr(prev)}`, "END:STANDARD");
  } else {
    const first = trans[0].from;
    L.push("BEGIN:STANDARD", "DTSTART:19700101T000000", `TZOFFSETFROM:${offStr(first)}`, `TZOFFSETTO:${offStr(first)}`, "END:STANDARD");
    for (const t of trans) {
      const kind = t.to > t.from ? "DAYLIGHT" : "STANDARD";
      const local = new Date(t.at + t.from * 60000);
      L.push(`BEGIN:${kind}`, `DTSTART:${utcStamp(local.getTime()).replace("Z", "")}`, `TZOFFSETFROM:${offStr(t.from)}`, `TZOFFSETTO:${offStr(t.to)}`, `END:${kind}`);
    }
  }
  L.push("END:VTIMEZONE");
  return L;
}

const RRULE_OF = { laborables: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", semanal: "FREQ=WEEKLY", mensual: "FREQ=MONTHLY", anual: "FREQ=YEARLY" };

// events/todos/reqs: lo de la app. Devuelve el texto .ics (CRLF).
function buildICS({ name = "Mi Oficina", tz = DEFAULT_TZ, events = [], todos = [], reqs = [], appUrl = "", nowMs = Date.now() }) {
  const stamp = utcStamp(nowMs);
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mi Oficina//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    `X-WR-CALNAME:${escText(name)}`, `X-WR-TIMEZONE:${tz}`, "REFRESH-INTERVAL;VALUE=DURATION:PT30M", "X-PUBLISHED-TTL:PT30M"];
  let needTz = false;
  const body = [];
  const ev = (uid, summary, extra) => body.push("BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${stamp}`, `SUMMARY:${escText(summary)}`, ...extra, "END:VEVENT");
  for (const e of events) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || "")) continue;
    const extra = [];
    const rep = RRULE_OF[e.repeat] || null;
    const s = toMin(e.time);
    if (e.allDay || s == null) {
      const end = e.endDate && e.endDate > e.date && !rep ? e.endDate : e.date;
      extra.push(`DTSTART;VALUE=DATE:${dateVal(e.date)}`, `DTEND;VALUE=DATE:${dateVal(addDays(end, 1))}`);
    } else {
      let en = toMin(e.endTime);
      if (en == null || en <= s) en = Math.min(s + 60, 23 * 60 + 59);
      if (rep) { needTz = true; extra.push(`DTSTART;TZID=${tz}:${localStamp(e.date, s)}`, `DTEND;TZID=${tz}:${localStamp(e.date, en)}`); }
      else extra.push(`DTSTART:${utcStamp(toMs(e.date, s, tz))}`, `DTEND:${utcStamp(toMs(e.date, en, tz))}`);
    }
    if (rep) extra.push(`RRULE:${rep}`);
    if (e.place) extra.push(`LOCATION:${escText(e.place)}`);
    const desc = [e.note, e.link].filter(Boolean).join("\n\n");
    if (desc) extra.push(`DESCRIPTION:${escText(desc)}`);
    if (appUrl && e.id) extra.push(`URL:${appUrl}#evento/${e.id}`);
    ev(`${e.id || Math.random().toString(36).slice(2)}@mi-oficina`, e.title || "Evento", extra);
  }
  for (const t of todos) {
    if (t.done || !/^\d{4}-\d{2}-\d{2}$/.test(t.due || "")) continue;
    const s = toMin(t.time);
    const extra = s == null
      ? [`DTSTART;VALUE=DATE:${dateVal(t.due)}`, `DTEND;VALUE=DATE:${dateVal(addDays(t.due, 1))}`]
      : [`DTSTART:${utcStamp(toMs(t.due, s, tz))}`, `DTEND:${utcStamp(toMs(t.due, s, tz) + 15 * 60000)}`];
    if (t.note) extra.push(`DESCRIPTION:${escText(t.note)}`);
    extra.push("TRANSP:TRANSPARENT");
    ev(`p-${t.id}@mi-oficina`, `Pendiente: ${t.t || ""}`, extra);
  }
  for (const r of reqs) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.due || "")) continue;
    if (!["pormeter", "rechazada", undefined, ""].includes(r.estado)) continue;
    const extra = [`DTSTART;VALUE=DATE:${dateVal(r.due)}`, `DTEND;VALUE=DATE:${dateVal(addDays(r.due, 1))}`, "TRANSP:TRANSPARENT"];
    const desc = [r.qty ? `Cantidad: ${r.qty} ${r.unit || ""}`.trim() : "", r.prov ? `Proveedor: ${r.prov}` : "", r.note || ""].filter(Boolean).join("\n");
    if (desc) extra.push(`DESCRIPTION:${escText(desc)}`);
    ev(`r-${r.id}@mi-oficina`, `Meter requisición: ${r.t || ""}`, extra);
  }
  if (needTz) L.push(...vtimezone(tz, nowMs));
  L.push(...body, "END:VCALENDAR");
  return L.map(fold).join("\r\n") + "\r\n";
}

// Link del calendario como lo pega la persona (webcal://… o https://…) → URL que se puede descargar.
function fetchableUrl(u) {
  let s = String(u || "").trim();
  if (/^webcals?:\/\//i.test(s)) s = s.replace(/^webcals?:\/\//i, "https://");
  try { const x = new URL(s); return /^https?:$/.test(x.protocol) ? x.href : null; } catch (_) { return null; }
}

module.exports = { parseICS, expand, buildICS, parseDT, parseRRule, fetchableUrl, vtimezone, lines };
