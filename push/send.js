// Envía las notificaciones de Mi Cartera. Lo corre GitHub Actions (ver .github/workflows/recordatorios.yml).
// Mañana (9:00 CDMX): avisos del día que la app dejó programados (compras, pagos fijos, créditos, tarjetas, sueldo)
//                    y, máximo una vez por semana, si vas gastando más o menos de lo normal.
// Noche (20:00 CDMX): si no registraste ningún gasto hoy, te lo recuerda.
const admin = require("firebase-admin");

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) { console.error("Falta el secreto FIREBASE_SERVICE_ACCOUNT"); process.exit(1); }
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
const db = admin.firestore();

const APP_URL = process.env.APP_URL || "https://personal-75acf.firebaseapp.com/";
const TZ = "America/Mexico_City";
const mxDate = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
const today = mxDate(new Date());
const mode = process.env.MODE || (new Date().getUTCHours() < 10 ? "evening" : "morning");
const money = (n) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);

function paceMessage(exps) {
  const [y, m, d] = today.split("-").map(Number);
  if (d < 5) return null;
  const key = today.slice(0, 7);
  const regular = exps.filter((e) => !(+e.msi > 1) && e.date);
  const sum = (a) => a.reduce((s, e) => s + (+e.amount || 0), 0);
  const cur = sum(regular.filter((e) => e.date.slice(0, 7) === key && e.date <= today));
  const prev = [1, 2, 3].map((k) => {
    const dt = new Date(Date.UTC(y, m - 1 - k, 1));
    const kk = dt.toISOString().slice(0, 7);
    return sum(regular.filter((e) => e.date.slice(0, 7) === kk));
  }).filter((v) => v > 0);
  if (!prev.length) return null;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const expected = (prev.reduce((a, b) => a + b, 0) / prev.length) * d / daysInMonth;
  if (expected <= 0) return null;
  const r = cur / expected;
  if (r >= 1.2) return { title: `Vas gastando ${Math.round((r - 1) * 100)}% más de lo normal`, body: `Llevas ${money(cur)} este mes; a estas alturas sueles llevar ${money(expected)}.`, tag: "pace" };
  if (r <= 0.75) return { title: `Vas gastando ${Math.round((1 - r) * 100)}% menos de lo normal`, body: `Llevas ${money(cur)}; sueles llevar ${money(expected)}. ¡Vas bien!`, tag: "pace" };
  return null;
}

async function sendAll(tokens, msgs, userRef) {
  let sent = 0;
  for (const t of tokens) {
    for (const m of msgs) {
      try {
        await admin.messaging().send({
          token: t.token,
          data: { title: m.title, body: m.body || "", tag: m.tag || "", url: APP_URL + (m.hash || "#resumen") },
          webpush: { headers: { Urgency: "high", TTL: "43200" }, fcmOptions: { link: APP_URL } },
        });
        sent++;
      } catch (e) {
        const code = e && e.errorInfo && e.errorInfo.code;
        console.log("No se pudo enviar:", code || e.message);
        if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
          await userRef.collection("items").doc(t.id).delete().catch(() => {});
        }
      }
    }
  }
  return sent;
}

async function main() {
  console.log(`Modo ${mode}, día ${today}`);
  const users = await db.collection("users").listDocuments();
  for (const userRef of users) {
    const snap = await userRef.collection("items").get();
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const tokens = docs.filter((d) => d.kind === "pushtoken" && d.token);
    if (!tokens.length) continue;
    const msgs = [];
    if (mode === "morning") {
      const rem = docs.find((d) => d.id === "reminders");
      const due = ((rem && rem.list) || []).filter((r) => r.on === today);
      if (due.length && due.length <= 3) due.forEach((r) => msgs.push({ title: r.title, body: r.body, tag: r.key, hash: r.hash }));
      else if (due.length > 3) msgs.push({ title: `Mi Cartera: ${due.length} avisos hoy`, body: due.slice(0, 4).map((r) => "• " + r.title).join("\n"), tag: "hoy-" + today });
      const state = docs.find((d) => d.id === "pushstate") || {};
      const pace = paceMessage(docs.filter((d) => d.kind === "exp"));
      const daysSince = state.paceSentOn ? (Date.parse(today) - Date.parse(state.paceSentOn)) / 86400000 : 99;
      if (pace && daysSince >= 7) {
        msgs.push({ ...pace, hash: "#gastos" });
        await userRef.collection("items").doc("pushstate").set({ kind: "pushstate", paceSentOn: today }, { merge: true });
      }
    } else {
      const logged = docs.some((d) => d.kind === "exp" && (d.date === today || (d.createdAt && mxDate(new Date(d.createdAt)) === today)));
      if (!logged) msgs.push({ title: "¿Ya registraste tus gastos de hoy?", body: "Anótalos en Mi Cartera para que tu plan esté al día.", tag: "log-" + today, hash: "#gastos" });
    }
    if (!msgs.length) { console.log("Sin avisos para un usuario"); continue; }
    const n = await sendAll(tokens, msgs, userRef);
    console.log(`Enviadas ${n} notificaciones`);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
