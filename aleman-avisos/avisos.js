// Recordatorio diario de Täglich (alemán). Lo corre GitHub Actions cada hora (ver .github/workflows/aleman-avisos.yml).
// A la hora que cada quien eligió en la app (en su zona horaria), si ese día todavía no ha estudiado, le llega un aviso.
// Los registros del Action son públicos en un repo público: aquí nunca se imprimen nombres, correos ni progreso.
const admin = require("firebase-admin");
const { debeAvisar, mensaje } = require("./logica");

if (process.env.FIRESTORE_EMULATOR_HOST) admin.initializeApp({ projectId: "personal-75acf" });
else {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) { console.error("Falta el secreto FIREBASE_SERVICE_ACCOUNT"); process.exit(1); }
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
}
const db = admin.firestore();
const APP_URL = process.env.APP_URL || "https://eliaflores.github.io/Personal/aleman/";

(async () => {
  const now = Date.now();
  let usuarios = 0, enviados = 0;
  for (const d of (await db.collection("aleman").get()).docs) {
    const perfil = d.data() || {};
    if (!perfil.plan || !perfil.plan.avisos) continue;
    const estadoRef = d.ref.collection("privado").doc("aviso");
    const estado = await estadoRef.get();
    const dec = debeAvisar(perfil, now, estado.exists ? estado.data().dia : null);
    if (!dec) continue;
    const tokens = (await d.ref.collection("avisos").get()).docs;
    if (!tokens.length) continue;
    const m = mensaje(perfil, dec.hoy);
    let ok = 0;
    for (const t of tokens) {
      try {
        await admin.messaging().send({
          token: t.data().token,
          data: { title: m.title, body: m.body, tag: m.tag, url: APP_URL },
          webpush: { headers: { Urgency: "high", TTL: "10800" }, fcmOptions: { link: APP_URL } },
        });
        ok++;
      } catch (e) {
        const code = e && e.errorInfo && e.errorInfo.code;
        console.log("No se pudo enviar:", code || e.message);
        if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") await t.ref.delete().catch(() => {});
      }
    }
    await estadoRef.set({ dia: dec.hoy, at: now });
    if (ok) { usuarios++; enviados += ok; }
  }
  console.log(`Recordatorios: ${enviados} enviados a ${usuarios} ${usuarios === 1 ? "persona" : "personas"}`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
