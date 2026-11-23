// Copia el calendario de Nuestros Planes a una base de datos de Notion (de la app a Notion, no al revés).
// Lo corre GitHub Actions junto con los avisos (ver .github/workflows/planes-avisos.yml).
// - Cada 15 min manda a Notion lo que se agregó o cambió en la app.
// - Una vez por hora revisa todo: borra (archiva) en Notion lo que ya no existe en la app y mueve los eventos
//   que se repiten (cumpleaños, aniversarios…) a su siguiente fecha.
// Solo toca las páginas de Notion que creó esta sincronización (las que tienen "ID app").
// Los registros del Action son públicos en un repo público: aquí nunca se imprimen nombres, títulos ni fechas.
const { nextStart, mxParts } = require("./logica");

const API = "https://api.notion.com/v1";
const VERSION = "2022-06-28";
const TYPE_L = { plan: "Plan", cita: "Cita", viaje: "Viaje", cumple: "Cumpleaños", aniversario: "Aniversario", pendiente: "Pendiente", otro: "Otro" };
const REP_L = { no: "No", semanal: "Cada semana", mensual: "Cada mes", anual: "Cada año" };
const clip = (s, n = 1900) => String(s || "").slice(0, n);
const text = (s) => (s ? [{ type: "text", text: { content: clip(s) } }] : []);
const toMin = (t) => (t && /^\d{1,2}:\d{2}$/.test(t) ? Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]) : null);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makeNotion(token, fetchImpl = fetch) {
  return async function notion(method, path, body) {
    for (let k = 0; k < 5; k++) {
      const res = await fetchImpl(API + path, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Notion-Version": VERSION, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 429 || res.status >= 500) { await sleep(Number(res.headers.get("retry-after") || 1) * 1000 * (k + 1)); continue; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { const err = new Error(`Notion respondió ${res.status} (${data.code || "error"})`); err.status = res.status; err.code = data.code; throw err; }
      await sleep(340);   // Notion permite ~3 peticiones por segundo
      return data;
    }
    throw new Error("Notion no respondió después de varios intentos");
  };
}

// Fecha para Notion: la ocurrencia que viene (si se repite) o la del evento.
function occOf(e, today) {
  if ((e.repeat || "no") !== "no") return nextStart(e, today) || e.date;
  return e.date;
}
function dateProp(e, occ) {
  const multi = e.endDate && e.endDate > e.date && (e.repeat || "no") === "no";
  const s = toMin(e.time);
  if (multi) return { start: occ, end: e.endDate };
  if (e.allDay || s == null) return { start: occ };
  const en = toMin(e.endTime);
  return { start: `${occ}T${e.time}:00`, end: en != null && en > s ? `${occ}T${e.endTime}:00` : null, time_zone: "America/Mexico_City" };
}
function properties(e, ctx) {
  const custom = (ctx.tipos || []).find((t) => t && t.k === e.type);
  return {
    Nombre: { title: text(e.title || "Plan") },
    Fecha: { date: dateProp(e, ctx.occ) },
    Tipo: { select: { name: clip(custom ? custom.l : TYPE_L[e.type] || "Otro", 90).replace(/,/g, " ") } },
    Lugar: { rich_text: text(e.place) },
    Notas: { rich_text: text(e.note) },
    "Plan conectado": { rich_text: text(ctx.planTitle) },
    "Se repite": { select: { name: REP_L[e.repeat || "no"] || "No" } },
    "Agendó": ctx.who ? { select: { name: clip(ctx.who, 90).replace(/,/g, " ") } } : { select: null },
    "Abrir en la app": { url: ctx.appUrl + "#evento/" + ctx.eid },
    "ID app": { rich_text: text(ctx.appId) },
  };
}

async function sync({ db, notion, dbId, appUrl, now = Date.now(), full = false }) {
  const today = mxParts(now).iso;
  const stats = { creados: 0, actualizados: 0, archivados: 0 };
  const alive = new Set();
  for (const c of (await db.collection("planes").get()).docs) {
    const cd = c.data(), names = cd.names || {}, last = Number(cd.notionSync || 0);
    const doFull = full || !last;
    const startedAt = now;
    const docs = doFull
      ? (await c.ref.collection("eventos").get()).docs
      : (await c.ref.collection("eventos").where("updatedAt", ">", last - 10 * 60000).get()).docs;
    if (doFull) for (const d of docs) alive.add(`${c.id}/${d.id}`);
    const ideas = {};
    const ideaTitle = async (id) => {
      if (!id) return "";
      if (!(id in ideas)) { const s = await c.ref.collection("ideas").doc(id).get(); ideas[id] = s.exists ? s.data().title || "" : ""; }
      return ideas[id];
    };
    for (const d of docs) {
      const e = d.data();
      if (!e.date || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) continue;
      const occ = occOf(e, today);
      const changed = !e.notionId || e.notionAt !== (e.updatedAt || 0) || e.notionOcc !== occ;
      if (!changed) continue;
      const props = properties(e, { occ, tipos: cd.tipos, planTitle: await ideaTitle(e.planId), who: names[e.createdBy] || "", appUrl, eid: d.id, appId: `${c.id}/${d.id}` });
      let pageId = e.notionId || null;
      if (pageId) {
        try { const p = await notion("PATCH", `/pages/${pageId}`, { properties: props, archived: false }); if (p.archived) pageId = null; else stats.actualizados++; }
        catch (err) { if (err.status === 404 || err.code === "validation_error" || err.code === "object_not_found") pageId = null; else throw err; }
      }
      if (!pageId) { pageId = (await notion("POST", "/pages", { parent: { database_id: dbId }, properties: props })).id; stats.creados++; }
      await d.ref.update({ notionId: pageId, notionAt: e.updatedAt || 0, notionOcc: occ });
    }
    await c.ref.update({ notionSync: startedAt });
  }
  // Revisión completa: lo que se borró en la app se archiva en Notion.
  if (full) {
    let cursor;
    do {
      const r = await notion("POST", `/databases/${dbId}/query`, { page_size: 100, start_cursor: cursor, filter: { property: "ID app", rich_text: { is_not_empty: true } } });
      for (const p of r.results || []) {
        const id = ((p.properties["ID app"] || {}).rich_text || []).map((t) => t.plain_text || (t.text && t.text.content) || "").join("");
        if (id && !alive.has(id)) { await notion("PATCH", `/pages/${p.id}`, { archived: true }); stats.archivados++; }
      }
      cursor = r.has_more ? r.next_cursor : undefined;
    } while (cursor);
  }
  return stats;
}

module.exports = { sync, makeNotion, properties, dateProp };

if (require.main === module) {
  const token = process.env.NOTION_TOKEN;
  if (!token) { console.log("No hay NOTION_TOKEN: no se sincroniza con Notion."); process.exit(0); }
  const admin = require("firebase-admin");
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) { console.error("Falta el secreto FIREBASE_SERVICE_ACCOUNT"); process.exit(1); }
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
  const full = process.env.FULL === "true" || new Date().getUTCMinutes() < 15;
  sync({
    db: admin.firestore(), notion: makeNotion(token), full,
    dbId: process.env.NOTION_DB || "4214949b7d6c81bc96b6efd04e26a90b",
    appUrl: process.env.APP_URL || "https://eliaflores.github.io/Personal/planes/",
  }).then((s) => {
    console.log(`Notion${full ? " (revisión completa)" : ""}: ${s.creados} creados, ${s.actualizados} actualizados, ${s.archivados} archivados.`);
    process.exit(0);
  }).catch((e) => {
    console.error("Error con Notion:", e.message);
    if (e.status === 401) console.error("El token de Notion no es válido. Revisa el secreto NOTION_TOKEN.");
    if (e.status === 404) console.error("Notion no encuentra la base. ¿La conectaste con la integración? (en la base: ••• → Conexiones)");
    process.exit(1);
  });
}
