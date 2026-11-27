// Mi Oficina: lo corre GitHub Actions cada 15 minutos (ver .github/workflows/oficina-avisos.yml). Por cada persona:
// 1. Trae sus calendarios de Apple / Google / Outlook (link .ics) y los guarda en oficina/{uid}/externos.
// 2. Sincroniza su calendario con su base de Notion (de la app a Notion y lo nuevo de Notion a la app).
// 3. Publica su calendario para suscribirse desde Apple Calendar (si lo activó y hay GIST_TOKEN).
// 4. Manda los avisos al cel: resumen del día, eventos, pendientes con hora y requisiciones por meter.
// Los registros del Action son públicos en un repo público: aquí nunca se imprimen nombres, títulos, links ni fechas.
const admin = require("firebase-admin");
const L = require("./logica");
const ICS = require("./ics");
const N = require("./notion");
const A = require("./apple");

if (process.env.FIRESTORE_EMULATOR_HOST) admin.initializeApp({ projectId: "personal-75acf" });
else {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) { console.error("Falta el secreto FIREBASE_SERVICE_ACCOUNT"); process.exit(1); }
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
}
const db = admin.firestore();
const DEL = admin.firestore.FieldValue.delete();
const APP_URL = process.env.APP_URL || "https://eliaflores.github.io/Personal/oficina/";
// Llave propia de Mi Oficina (NOTION_TOKEN_OFICINA); si no está, usa la de Nuestros Planes (NOTION_TOKEN).
const NOTION_KEY = process.env.NOTION_TOKEN_OFICINA || process.env.NOTION_TOKEN || "";
const notion = NOTION_KEY ? N.makeNotion(NOTION_KEY) : null;
const GIST_TOKEN = process.env.GIST_TOKEN || "";
const CORREOS = (process.env.OFICINA_CORREOS || "").split(/[,;\s]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);

async function send(tokens, m, path, tag) {
  let ok = 0;
  for (const t of tokens) {
    try {
      await admin.messaging().send({
        token: t.data().token,
        data: { title: m.title, body: m.body || "", tag, url: APP_URL + path },
        webpush: { headers: { Urgency: "high", TTL: "21600" }, fcmOptions: { link: APP_URL + path } },
      });
      ok++;
    } catch (e) {
      const code = e && e.errorInfo && e.errorInfo.code;
      console.log("No se pudo enviar:", code || e.message);
      if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") await t.ref.delete().catch(() => {});
    }
  }
  return ok;
}

async function fetchText(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 25000);
  try {
    const res = await fetch(url, { signal: ctl.signal, redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (compatible; MiOficina/1.0)", Accept: "text/calendar, text/plain, */*" } });
    if (!res.ok) { const e = new Error("http " + res.status); e.status = res.status; throw e; }
    const txt = await res.text();
    if (txt.length > 8 * 1024 * 1024) throw Object.assign(new Error("grande"), { friendly: "El calendario es demasiado grande (más de 8 MB)." });
    return txt;
  } finally { clearTimeout(timer); }
}
const calError = (e) => e.friendly
  || (e.status === 404 ? "Ese calendario ya no existe o el link cambió (404)."
    : e.status === 401 || e.status === 403 ? "No dio permiso. ¿El calendario sigue siendo público?"
      : e.name === "AbortError" ? "Tardó demasiado en responder." : "No se pudo leer el calendario. Se intenta otra vez en 15 min.");

const same = (a, b) => JSON.stringify(a || null) === JSON.stringify(b || null);

(async () => {
  const S = { personas: 0, cal: 0, calErr: 0, notion: 0, notionErr: 0, apple: 0, avisos: 0, resumenes: 0 };
  for (const p of (await db.collection("oficina").get()).docs) {
    const uid = p.id, prof = p.data() || {};
    const tz = L.validTz(prof.tz) || L.DEFAULT_TZ;
    const now = Date.now(), today = L.parts(now, tz).iso;
    const hourly = new Date(now).getUTCMinutes() < 15;
    const upd = {};
    S.personas++;

    // 1. Calendarios de Apple / Google / Outlook
    const cals = (Array.isArray(prof.cals) ? prof.cals : []).filter((c) => c && /^[\w-]{1,40}$/.test(c.id || "") && c.url && c.on !== false).slice(0, 10);
    for (const c of cals) {
      const st = (prof.calStatus || {})[c.id] || {};
      try {
        const url = ICS.fetchableUrl(c.url);
        if (!url) throw Object.assign(new Error("link"), { friendly: "El link no parece de un calendario (debe empezar con webcal:// o https://)." });
        const txt = await fetchText(url);
        if (!/BEGIN:VCALENDAR/i.test(txt)) throw Object.assign(new Error("noics"), { friendly: "Ese link no regresó un calendario. Copia el link de “Calendario público” o la “dirección secreta en formato iCal”." });
        const cal = ICS.parseICS(txt);
        const events = ICS.expand(cal, { fromIso: L.addDays(today, -30), toIso: L.addDays(today, 180), tz });
        const h = A.hash(JSON.stringify(events));
        if (h !== st.hash) await p.ref.collection("externos").doc(c.id).set({ source: "ics", events, at: now });
        const nst = { at: h !== st.hash || !st.ok || hourly ? now : st.at, ok: true, n: events.length, hash: h, name: (cal.calName || "").slice(0, 80) };
        if (!same(nst, st)) upd[`calStatus.${c.id}`] = nst;
        S.cal++;
      } catch (e) {
        const nst = { at: now, ok: false, error: calError(e), hash: st.hash || "" };
        if (st.ok !== false || st.error !== nst.error || hourly) upd[`calStatus.${c.id}`] = nst;
        S.calErr++;
      }
    }
    const notionOn = !!N.dbIdFrom(prof.notion && prof.notion.db) && (prof.notion || {}).on !== false;
    if (hourly) {
      const keep = new Set(cals.map((c) => c.id));
      if (notionOn) keep.add("notion");
      for (const d of (await p.ref.collection("externos").get()).docs) if (!keep.has(d.id)) await d.ref.delete();
      for (const k of Object.keys(prof.calStatus || {})) if (!cals.some((c) => c.id === k)) upd[`calStatus.${k}`] = DEL;
    }

    // Lo que hace falta para lo demás (solo lo que viene, lo que se repite y lo abierto)
    const evMap = new Map();
    for (const d of (await p.ref.collection("eventos").where("date", ">=", L.addDays(today, -30)).get()).docs) evMap.set(d.id, d);
    for (const d of (await p.ref.collection("eventos").where("repeat", "in", L.REPEATS).get()).docs) evMap.set(d.id, d);
    const events = [...evMap.values()].map((d) => ({ id: d.id, ...d.data() }));
    const todoDocs = (await p.ref.collection("pendientes").where("done", "==", false).get()).docs;
    const reqDocs = (await p.ref.collection("requis").where("estado", "in", ["pormeter", "rechazada"]).get()).docs;
    const todos = todoDocs.map((d) => ({ id: d.id, ...d.data() }));
    const reqs = reqDocs.map((d) => ({ id: d.id, ...d.data() }));

    // 2. Notion
    if (notionOn && notion) {
      const dbId = N.dbIdFrom(prof.notion.db);
      const prev = prof.notionStatus || {};
      let hashN = prev.hash || "";
      try {
        const last = Number(prof.notionSync || 0);
        const full = !last || prev.db !== dbId;
        const changed = (full ? await p.ref.collection("eventos").get() : await p.ref.collection("eventos").where("updatedAt", ">", last - 10 * 60000).get()).docs.map((d) => ({ id: d.id, ...d.data() }));
        const tombstones = (await p.ref.collection("borrados").get()).docs.map((d) => ({ id: d.id, ...d.data() }));
        const started = Date.now();
        const r = await N.syncUser({
          notion, prof, tz, now, appUrl: APP_URL, uid,
          store: {
            changed, tombstones, repeating: events.filter((e) => L.REPEATS.includes(e.repeat)),
            saveEvent: (id, patch) => p.ref.collection("eventos").doc(id).update(patch).catch(() => {}),
            dropTombstone: (id) => p.ref.collection("borrados").doc(id).delete(),
            saveImported: async (evs) => { const h = A.hash(JSON.stringify(evs)); if (h !== hashN) await p.ref.collection("externos").doc("notion").set({ source: "notion", events: evs, at: now }); hashN = h; },
          },
        });
        if (changed.length || hourly) upd.notionSync = started;
        const nst = { ok: true, db: dbId, hash: hashN, traidos: r.traidos };
        const moved = r.enviados || r.archivados || !same(nst, { ok: prev.ok, db: prev.db, hash: prev.hash, traidos: prev.traidos });
        if (moved || hourly) upd.notionStatus = { ...nst, at: now, enviados: r.enviados, archivados: r.archivados };
        S.notion++;
      } catch (e) {
        console.log("Notion:", e.status || "", e.code || e.message);
        upd.notionStatus = { at: now, ok: false, error: N.friendly(e), db: prev.db || "", hash: hashN };
        S.notionErr++;
      }
    } else if (notionOn && !notion && !(prof.notionStatus && prof.notionStatus.error)) {
      upd.notionStatus = { at: now, ok: false, error: "Falta el secreto NOTION_TOKEN_OFICINA en GitHub (Settings → Secrets → Actions)." };
    }

    // 3. Calendario para suscribirse desde Apple
    const feed = prof.feed || {}, fst = prof.feedStatus || {};
    if (feed.on) {
      try {
        if (!GIST_TOKEN) throw Object.assign(new Error("sin token"), { friendly: "Falta el secreto GIST_TOKEN en GitHub (mira el README)." });
        if (!CORREOS.length) throw Object.assign(new Error("sin correos"), { friendly: "Falta el secreto OFICINA_CORREOS en GitHub con tu correo." });
        const u = await admin.auth().getUser(uid);
        if (!u.email || !CORREOS.includes(u.email.toLowerCase())) throw Object.assign(new Error("correo"), { friendly: "Tu correo no está en el secreto OFICINA_CORREOS." });
        const ics = ICS.buildICS({ name: "Mi Oficina", tz, events, todos, reqs, appUrl: APP_URL, nowMs: now });
        const r = await A.publish({ token: GIST_TOKEN, ics, feed: fst });
        if (r) { upd.feedStatus = { ...r, at: now, ok: true }; S.apple++; }
        else if (!fst.ok) { upd["feedStatus.ok"] = true; upd["feedStatus.error"] = DEL; }
      } catch (e) {
        if (!e.friendly) console.log("Apple:", e.status || e.message);
        const error = e.friendly || A.friendly(e);
        if (fst.error !== error) upd.feedStatus = { ...fst, ok: false, error, at: now };
      }
    } else if (fst.gistId && GIST_TOKEN) {
      try { await A.remove({ token: GIST_TOKEN, gistId: fst.gistId }); upd.feedStatus = DEL; } catch (e) { console.log("Apple (borrar):", e.status || e.message); }
    }

    // 4. Avisos al cel
    const tokens = (await p.ref.collection("avisos").get()).docs;
    if (tokens.length) {
      const cfg = prof.avisos || {};
      const dayMin = L.toMin(cfg.hora) ?? 8 * 60;
      const digestOn = cfg.resumen !== false;
      const mark = async (d, data, keys) => { const sent = L.pruneSent(data.sent, today); keys.forEach((k) => (sent[k] = today)); await d.ref.update({ sent }); };

      if (cfg.eventos !== false) {
        for (const d of evMap.values()) {
          const e = d.data();
          const due = L.dueReminders(e, now, { tz, sent: e.sent || {}, dayMin });
          if (!due.length) continue;
          const ok = await send(tokens, L.eventMessage(e, due[0]), "#evento/" + d.id, "ev-" + d.id);
          if (ok) { S.avisos++; await mark(d, e, due[0].alsoKeys); }
        }
      }
      if (cfg.pendientes !== false) {
        for (const d of todoDocs) {
          const t = d.data();
          const r = L.todoReminder(t, now, { tz, sent: t.sent || {} }) || (!digestOn && L.todoDayReminder(t, now, { tz, sent: t.sent || {}, dayMin }));
          if (!r) continue;
          const ok = await send(tokens, r, "#pendientes", "pend-" + d.id);
          if (ok) { S.avisos++; await mark(d, t, [r.key]); }
        }
      }
      if (cfg.requis !== false) {
        for (const d of reqDocs) {
          const q = d.data();
          const r = L.reqReminder(q, now, { tz, sent: q.sent || {}, dayMin, sameDay: !digestOn });
          if (!r) continue;
          const ok = await send(tokens, r, "#requis", "req-" + d.id);
          if (ok) { S.avisos++; await mark(d, q, [r.key]); }
        }
      }
      const day = L.digestDue(cfg, now, { tz, last: prof.digestSent || null });
      if (day) {
        const ext = (await p.ref.collection("externos").get()).docs.flatMap((d) => d.data().events || []);
        const items = [
          ...events.filter((e) => L.occursOn(e, today)),
          ...ext.filter((x) => x.date === today || (x.endDate && x.date <= today && today <= x.endDate)),
        ];
        const m = L.digestMessage({ today, items, todos, reqs });
        if (m && (await send(tokens, m, "#inicio", "resumen"))) S.resumenes++;
        upd.digestSent = today;
      }
    }

    if (Object.keys(upd).length) await p.ref.update(upd);
  }
  console.log(`${S.personas} personas · calendarios: ${S.cal} leídos, ${S.calErr} con error · Notion: ${S.notion} ok, ${S.notionErr} con error · Apple: ${S.apple} actualizados · ${S.avisos} avisos y ${S.resumenes} resúmenes enviados.`);
  process.exit(0);
})().catch((e) => { console.error("Error:", e.message); process.exit(1); });
