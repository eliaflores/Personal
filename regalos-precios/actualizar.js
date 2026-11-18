// Revisa los links de la wishlist de Regalos y guarda el precio y la foto de la tienda.
// Lo corre GitHub Actions (ver .github/workflows/regalos-precios.yml). Solo toca la colección "regalos".
// Los registros del Action son públicos en un repo público: aquí nunca se imprimen links, nombres ni precios.
const admin = require("firebase-admin");
const { leer } = require("./leer");

if (process.env.FIRESTORE_EMULATOR_HOST) admin.initializeApp({ projectId: "personal-75acf" });
else {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) { console.error("Falta el secreto FIREBASE_SERVICE_ACCOUNT"); process.exit(1); }
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
}
const db = admin.firestore();
const DEL = admin.firestore.FieldValue.delete();

const HOUR = 3600 * 1000;
const RECHECK_OK = 3 * HOUR;      // precio leído bien: se vuelve a revisar cada 3 horas
const RECHECK_FAIL = 3 * HOUR;    // la tienda no dejó leer: se reintenta más tarde
const MAX_PER_RUN = Number(process.env.MAX_PER_RUN || 80);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const FORCE = process.env.FORCE === "true";   // corrida a mano para revisar todo ya
function due(it, now) {
  if (!it.url) return !!it.linkUrl;            // le quitaron el link: limpiar
  if (FORCE) return true;
  if (it.linkUrl !== it.url || !it.linkCheckedAt) return true;
  // Lo que se lee con servicios gratis (Jina, Microlink) se revisa cada 6 h para no pasar sus límites.
  const every = it.linkVia === "servicio" ? 6 * HOUR : it.linkStatus === "ok" ? RECHECK_OK : RECHECK_FAIL;
  return now - it.linkCheckedAt > every;
}

(async () => {
  const now = Date.now();
  const todo = [];
  for (const list of (await db.collection("regalos").get()).docs) {
    for (const d of (await list.ref.collection("items").get()).docs) {
      const it = d.data();
      if (due(it, now)) todo.push({ ref: d.ref, it, fresh: it.linkUrl !== it.url || !it.linkCheckedAt });
    }
  }
  todo.sort((a, b) => (b.fresh - a.fresh) || ((a.it.linkCheckedAt || 0) - (b.it.linkCheckedAt || 0)));
  const stats = { revisados: 0, conPrecio: 0, sinPrecio: 0, bloqueados: 0, limpiados: 0 };
  for (const { ref, it } of todo.slice(0, MAX_PER_RUN)) {
    if (!it.url) {
      await ref.update({ linkUrl: DEL, linkPrice: DEL, linkImage: DEL, linkCheckedAt: DEL, linkStatus: DEL, linkDeliveryDays: DEL, linkDeliveryAt: DEL });
      stats.limpiados++; continue;
    }
    stats.revisados++;
    const r = await leer(it.url);
    const sameUrl = it.linkUrl === it.url;
    const upd = { linkUrl: it.url, linkCheckedAt: Date.now(), linkVia: r.via ? "servicio" : "directo" };
    const mxn = !r.currency || r.currency === "MXN" || r.currency === "MXP";
    if (r.ok && mxn) {
      upd.linkPrice = Math.round(r.price * 100) / 100; upd.linkPriceAt = Date.now(); upd.linkStatus = "ok"; stats.conPrecio++;
    } else {
      const fail = r.ok ? "otra-moneda" : r.blocked ? "bloqueado" : "sin-precio";
      // Si esta vez falló pero ya teníamos un precio de este mismo link, se conserva (con su fecha).
      if (sameUrl && Number(it.linkPrice) > 0) { upd.linkStatus = "ok"; upd.linkLastFail = fail; }
      else { upd.linkStatus = fail; upd.linkPrice = DEL; upd.linkPriceAt = DEL; }
      r.blocked ? stats.bloqueados++ : stats.sinPrecio++;
    }
    // Entrega: días que tarda si se pide hoy (la app los cuenta desde el día en que se ve).
    if (r.deliveryDays != null) { upd.linkDeliveryDays = r.deliveryDays; upd.linkDeliveryAt = Date.now(); }
    else if (!sameUrl) { upd.linkDeliveryDays = DEL; upd.linkDeliveryAt = DEL; }
    else if (it.linkDeliveryAt && Date.now() - it.linkDeliveryAt > 3 * 24 * HOUR) { upd.linkDeliveryDays = DEL; upd.linkDeliveryAt = DEL; }   // muy viejo: mejor no adivinar
    // Nombre: si la persona no escribió uno, se pone el de la tienda.
    if (it.titleAuto && r.title) { upd.title = r.title.slice(0, 120); upd.titleAuto = false; }
    if (r.image) upd.linkImage = r.image;
    else if (!sameUrl || /logo|frontend-assets|nav-sprite|favicon|sprite/i.test(it.linkImage || "")) upd.linkImage = DEL;   // quitar logos que se colaron antes
    // Solo la tienda y el resultado: nunca el link, el nombre del regalo ni el precio.
    console.log(`- ${r.host || "?"}: ${upd.linkStatus}, HTTP ${r.status}, página ${r.size} bytes, foto ${r.image ? "sí" : "no"}, entrega ${r.deliveryDays != null ? "sí" : "no"}${r.via ? ", " + r.via : ""}`);
    await ref.update(upd);
    await sleep(r.via ? 3000 : 1500);
  }
  console.log(`Pendientes: ${todo.length}.`, Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join(", "));
  process.exit(0);
})().catch((e) => { console.error("Error:", e.message); process.exit(1); });
