// Avisos de festividades de Regalos: 14, 7, 3 y 1 día antes, y el mismo día. Lo corre GitHub Actions
// (ver .github/workflows/regalos-avisos.yml). Cada aviso va solo a los cels de quien creó la festividad.
// Los registros del Action son públicos en un repo público: aquí nunca se imprimen nombres ni fechas.
const admin = require("firebase-admin");

if (process.env.FIRESTORE_EMULATOR_HOST) admin.initializeApp({ projectId: "personal-75acf" });
else {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) { console.error("Falta el secreto FIREBASE_SERVICE_ACCOUNT"); process.exit(1); }
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
}
const db = admin.firestore();
const APP_URL = process.env.APP_URL || "https://eliaflores.github.io/Personal/regalos/";
const MILESTONES = [14, 7, 3, 1, 0];
const TZ = "America/Mexico_City";
const todayISO = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
const dayNum = (iso) => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
const addDays = (iso, n) => new Date((dayNum(iso) + n) * 86400000).toISOString().slice(0, 10);
const name = (f) => f.name || "tu festividad";
const plural = (n, a, b) => (n === 1 ? a : b);

function message(f, days, lateCount) {
  const bought = Object.keys(f.bought || {}).length;
  const title = days === 0 ? `Hoy es ${name(f)} 🎁` : days === 1 ? `Mañana es ${name(f)}` : `Quedan ${days} días para ${name(f)}`;
  let body;
  if (days === 0) body = bought ? `Ya tienes ${bought} ${plural(bought, "regalo", "regalos")}. ¡Que lo disfruten!` : "¿Ya tienes su regalo?";
  else body = bought ? `Llevas ${bought} ${plural(bought, "regalo tachado", "regalos tachados")}. ¿Te falta alguno?` : "¿Ya compraste tus regalos?";
  if (days > 0 && lateCount) body += ` Ojo: ${lateCount} de su wishlist ya no ${plural(lateCount, "llegaría", "llegarían")} a tiempo si lo pides hoy.`;
  return { title, body };
}

(async () => {
  let sent = 0, fiestasAvisadas = 0;
  for (const list of (await db.collection("regalos").get()).docs) {
    const members = (list.data().members || []);
    const items = (await list.ref.collection("items").get()).docs.map((d) => ({ id: d.id, ...d.data() }));
    for (const uid of members) {
      const priv = list.ref.collection("privado").doc(uid);
      const tokens = (await priv.collection("avisos").get()).docs;
      if (!tokens.length) continue;
      const theirs = items.filter((i) => i.owner !== uid);
      for (const fd of (await priv.collection("fiestas").get()).docs) {
        const f = fd.data();
        if (!f.date || !/^\d{4}-\d{2}-\d{2}$/.test(f.date)) continue;
        const days = dayNum(f.date) - dayNum(todayISO);
        if (!MILESTONES.includes(days)) continue;
        const key = `${f.date}:${days}`;
        if ((f.avisos || {})[key]) continue;           // ya se mandó este aviso
        const left = (f.budget || 0) - Object.values(f.bought || {}).reduce((s, b) => s + (Number(b.price) || 0), 0);
        const lateCount = theirs.filter((i) => !(f.bought || {})[i.id] && i.url && i.linkUrl === i.url && Number.isFinite(Number(i.linkDeliveryDays)) && i.linkDeliveryDays != null
          && (Number(i.linkPrice) > 0 ? Number(i.linkPrice) : Number(i.price) || 0) <= left && addDays(todayISO, Number(i.linkDeliveryDays)) > f.date).length;
        const m = message(f, days, lateCount);
        let ok = 0;
        for (const t of tokens) {
          try {
            await admin.messaging().send({
              token: t.data().token,
              data: { title: m.title, body: m.body, tag: "fiesta-" + fd.id, url: APP_URL + "#f/" + fd.id },
              webpush: { headers: { Urgency: "high", TTL: "43200" }, fcmOptions: { link: APP_URL + "#f/" + fd.id } },
            });
            ok++;
          } catch (e) {
            const code = e && e.errorInfo && e.errorInfo.code;
            console.log("No se pudo enviar:", code || e.message);
            if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") await t.ref.delete().catch(() => {});
          }
        }
        if (ok) { await fd.ref.update({ [`avisos.${key}`]: todayISO }); sent += ok; fiestasAvisadas++; }
      }
    }
  }
  console.log(`Día ${todayISO}: ${fiestasAvisadas} festividades avisadas, ${sent} notificaciones enviadas.`);
  process.exit(0);
})().catch((e) => { console.error("Error:", e.message); process.exit(1); });
