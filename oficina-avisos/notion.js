// Notion ↔ Mi Oficina (lo usa avisos.js en el mismo Action):
// - De la app a Notion: cada evento del calendario se copia a la base de datos de Notion que elegiste en Ajustes.
//   Si lo cambias en la app se actualiza en Notion, y si lo borras se archiva allá.
// - De Notion a la app: lo que agregues directo en esa base (con fecha) aparece en el calendario de la app.
// Solo se tocan en Notion las páginas que creó esta sincronización (las que tienen "ID app").
// Funciona con cualquier base: si le faltan columnas, las agrega (Fecha, ID app, Lugar, Notas, Área, Abrir en la app).
const { nextStart, parts, toMs, addDays, pad2 } = require("./logica");

const API = "https://api.notion.com/v1";
const VERSION = "2022-06-28";
const clip = (s, n = 1900) => String(s || "").slice(0, n);
const text = (s) => (s ? [{ type: "text", text: { content: clip(s) } }] : []);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const plain = (arr) => (arr || []).map((t) => t.plain_text || (t.text && t.text.content) || "").join("");

// Saca el id de la base de un link de Notion (o del id pegado tal cual).
function dbIdFrom(link) {
  const s = String(link || "").split("?")[0].split("#")[0];
  const m = s.replace(/-/g, "").match(/([0-9a-f]{32})(?!.*[0-9a-f]{32})/i);
  return m ? m[1].toLowerCase() : null;
}

function makeNotion(token, fetchImpl = fetch) {
  return async function notion(method, path, body) {
    for (let k = 0; k < 5; k++) {
      const res = await fetchImpl(API + path, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Notion-Version": VERSION, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 429 || res.status >= 500) { await sleep(Number((res.headers && res.headers.get && res.headers.get("retry-after")) || 1) * 1000 * (k + 1)); continue; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { const err = new Error(`Notion respondió ${res.status} (${data.code || "error"})`); err.status = res.status; err.code = data.code; throw err; }
      await sleep(340);   // Notion permite ~3 peticiones por segundo
      return data;
    }
    throw new Error("Notion no respondió después de varios intentos");
  };
}

const friendly = (e) => {
  if (e.status === 401) return "El token de Notion no es válido (revisa el secreto NOTION_TOKEN en GitHub).";
  if (e.status === 404 || e.code === "object_not_found") return "Notion no encuentra la base. Ábrela en Notion → ••• → Conexiones y agrega tu integración.";
  if (e.code === "validation_error") return "Notion no aceptó los datos (revisa que la base tenga una columna de fecha).";
  return "No se pudo hablar con Notion. Se intenta otra vez en 15 min.";
};

// Revisa las columnas de la base y agrega las que falten. Devuelve los nombres a usar.
async function ensureSchema(notion, dbId) {
  const db = await notion("GET", `/databases/${dbId}`);
  const props = db.properties || {};
  const byType = (t) => Object.entries(props).filter(([, p]) => p.type === t).map(([n]) => n);
  const title = byType("title")[0] || "Name";
  const dates = byType("date");
  const date = ["Fecha", "Date", "Fecha y hora", "Cuándo"].find((n) => dates.includes(n)) || dates[0] || "Fecha";
  const want = { "ID app": "rich_text", Lugar: "rich_text", Notas: "rich_text", "Área": "select", "Abrir en la app": "url" };
  if (!dates.length) want[date] = "date";
  const add = {};
  for (const [n, t] of Object.entries(want)) if (!props[n]) add[n] = { [t]: {} };
  if (Object.keys(add).length) await notion("PATCH", `/databases/${dbId}`, { properties: add });
  const ok = (n, t) => (props[n] ? props[n].type === t : !!add[n]);
  return { title, date, idApp: ok("ID app", "rich_text"), lugar: ok("Lugar", "rich_text"), notas: ok("Notas", "rich_text"), area: ok("Área", "select"), link: ok("Abrir en la app", "url") };
}

const toMin = (t) => (t && /^\d{1,2}:\d{2}$/.test(t) ? Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]) : null);
function dateProp(e, occ, tz) {
  const multi = e.endDate && e.endDate > e.date && (e.repeat || "no") === "no";
  const s = toMin(e.time);
  if (e.allDay || s == null) return multi ? { start: occ, end: e.endDate } : { start: occ };
  const en = toMin(e.endTime);
  return { start: `${occ}T${e.time}:00`, end: en != null && en > s ? `${occ}T${e.endTime}:00` : null, time_zone: tz };
}
function properties(e, { schema, occ, tz, areaName, appUrl, appId }) {
  const p = { [schema.title]: { title: text(e.title || "Evento") }, [schema.date]: { date: dateProp(e, occ, tz) } };
  if (schema.idApp) p["ID app"] = { rich_text: text(appId) };
  if (schema.lugar) p.Lugar = { rich_text: text(e.place) };
  if (schema.notas) p.Notas = { rich_text: text([e.note, e.link].filter(Boolean).join("\n")) };
  if (schema.area) p["Área"] = areaName ? { select: { name: clip(areaName, 90).replace(/,/g, " ") } } : { select: null };
  if (schema.link) p["Abrir en la app"] = { url: appUrl ? `${appUrl}#evento/${e.id}` : null };
  return p;
}

// Página de Notion → evento para el calendario de la app (en la zona horaria de la persona).
function pageToEvent(pg, schema, tz) {
  const d = ((pg.properties || {})[schema.date] || {}).date;
  if (!d || !d.start) return null;
  const title = plain(((pg.properties || {})[schema.title] || {}).title) || "(Sin título)";
  const lugar = schema.lugar ? plain(((pg.properties || {}).Lugar || {}).rich_text) : "";
  const ev = { id: pg.id, title: title.slice(0, 300), place: lugar.slice(0, 300), note: "", url: pg.url || "" };
  const hhmm = (m) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;
  if (d.start.length === 10) {
    const end = d.end && d.end.length >= 10 ? d.end.slice(0, 10) : "";
    return { ...ev, date: d.start, endDate: end > d.start ? end : "", allDay: true, time: "", endTime: "" };
  }
  // Fecha con hora: puede venir con zona (time_zone) o con el desfase en el texto.
  const msOf = (s) => {
    if (/[zZ]|[+-]\d{2}:\d{2}$/.test(s)) return Date.parse(s);
    const [date, time] = s.split("T");
    return toMs(date, toMin(time.slice(0, 5)), d.time_zone || tz);
  };
  const s = parts(msOf(d.start), tz);
  const en = d.end ? parts(msOf(d.end), tz) : null;
  return { ...ev, date: s.iso, time: hhmm(s.min), endTime: en ? hhmm(en.min) : "", endDate: en && en.iso > s.iso ? en.iso : "", allDay: false };
}

// Sincroniza a una persona. `store` tiene lo que hace falta leer/escribir en Firestore (así se puede probar sin Firebase).
//   store.changed: eventos cambiados desde la última vez · store.repeating: eventos que se repiten · store.tombstones: borrados
//   store.saveEvent(id, patch) · store.dropTombstone(id) · store.saveImported(events)
async function syncUser({ notion, prof, tz, now = Date.now(), appUrl = "", uid = "", store }) {
  const dbId = dbIdFrom(prof && prof.notion && prof.notion.db);
  if (!dbId) return null;
  const today = parts(now, tz).iso;
  const schema = await ensureSchema(notion, dbId);
  const areas = Array.isArray(prof.areas) ? prof.areas : [];
  const stats = { enviados: 0, archivados: 0, traidos: 0 };

  // 1. De la app a Notion
  const todo = new Map();
  for (const e of store.changed) todo.set(e.id, e);
  for (const e of store.repeating) todo.set(e.id, e);
  for (const e of todo.values()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || "")) continue;
    const occ = (e.repeat || "no") !== "no" ? nextStart(e, today) || e.date : e.date;
    const same = e.notionId && e.notionDb === dbId && e.notionAt === (e.updatedAt || 0) && e.notionOcc === occ;
    if (same) continue;
    const area = areas.find((a) => a && a.k === e.area);
    const props = properties(e, { schema, occ, tz, areaName: area ? area.l : "", appUrl, appId: `${uid}/${e.id}` });
    let pageId = e.notionDb === dbId ? e.notionId || null : null;
    if (pageId) {
      try { const p = await notion("PATCH", `/pages/${pageId}`, { properties: props, archived: false }); if (p.archived) pageId = null; }
      catch (err) { if (err.status === 404 || err.code === "validation_error" || err.code === "object_not_found") pageId = null; else throw err; }
    }
    if (!pageId) pageId = (await notion("POST", "/pages", { parent: { database_id: dbId }, properties: props })).id;
    stats.enviados++;
    await store.saveEvent(e.id, { notionId: pageId, notionDb: dbId, notionAt: e.updatedAt || 0, notionOcc: occ });
  }
  // 2. Lo que se borró en la app se archiva en Notion
  for (const t of store.tombstones) {
    if (t.notionId) { try { await notion("PATCH", `/pages/${t.notionId}`, { archived: true }); stats.archivados++; } catch (err) { if (err.status !== 404 && err.code !== "object_not_found" && err.code !== "validation_error") throw err; } }
    await store.dropTombstone(t.id);
  }
  // 3. De Notion a la app: páginas con fecha que no vienen de la app
  const from = addDays(today, -30), to = addDays(today, 180);
  const filter = { and: [{ property: schema.date, date: { on_or_after: from } }, { property: schema.date, date: { on_or_before: to } }] };
  if (schema.idApp) filter.and.push({ property: "ID app", rich_text: { is_empty: true } });
  const imported = [];
  let cursor;
  do {
    const r = await notion("POST", `/databases/${dbId}/query`, { page_size: 100, start_cursor: cursor, filter, sorts: [{ property: schema.date, direction: "ascending" }] });
    for (const pg of r.results || []) { if (pg.archived || pg.in_trash) continue; const ev = pageToEvent(pg, schema, tz); if (ev) imported.push(ev); }
    cursor = r.has_more && imported.length < 800 ? r.next_cursor : undefined;
  } while (cursor);
  stats.traidos = imported.length;
  await store.saveImported(imported);
  return stats;
}

module.exports = { syncUser, makeNotion, ensureSchema, properties, dateProp, pageToEvent, dbIdFrom, friendly };
