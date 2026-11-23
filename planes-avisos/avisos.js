// Avisos de Nuestros Planes. Lo corre GitHub Actions cada 15 minutos (ver .github/workflows/planes-avisos.yml).
// - Cuenta regresiva de cada evento del calendario ("Faltan 7 días para…", "Mañana…", "En 1 hora…"),
//   según los avisos elegidos en el evento. Les llega a los dos.
// - Cuando uno propone un plan o agenda algo, le avisa al otro.
// Los registros del Action son públicos en un repo público: aquí nunca se imprimen nombres, títulos ni fechas.
const admin = require("firebase-admin");
const { dueReminders, message, mxParts } = require("./logica");

if (process.env.FIRESTORE_EMULATOR_HOST) admin.initializeApp({ projectId: "personal-75acf" });
else {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) { console.error("Falta el secreto FIREBASE_SERVICE_ACCOUNT"); process.exit(1); }
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
}
const db = admin.firestore();
const APP_URL = process.env.APP_URL || "https://eliaflores.github.io/Personal/planes/";
const NEW_WINDOW = 2 * 86400000;   // solo se avisa de lo nuevo de los últimos 2 días

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

(async () => {
  const now = Date.now(), today = mxParts(now).iso;
  let sent = 0, recordatorios = 0, nuevos = 0;
  for (const c of (await db.collection("planes").get()).docs) {
    const members = c.data().members || [];
    const names = c.data().names || {};
    const tokensOf = {};
    for (const uid of members) tokensOf[uid] = (await c.ref.collection("privado").doc(uid).collection("avisos").get()).docs;
    const all = members.flatMap((u) => tokensOf[u]);
    if (!all.length) continue;

    // Solo se leen los eventos que vienen (o que se repiten), no todo el historial.
    const evs = new Map();
    for (const d of (await c.ref.collection("eventos").where("date", ">=", today).get()).docs) evs.set(d.id, d);
    for (const d of (await c.ref.collection("eventos").where("repeat", "in", ["semanal", "mensual", "anual"]).get()).docs) evs.set(d.id, d);

    for (const d of evs.values()) {
      const e = d.data();
      const upd = {};
      // Cuenta regresiva
      const due = dueReminders(e, now, e.avisos || {});
      if (due.length) {
        const r = due[0];
        const m = message(e, r);
        const ok = await send(all, m, "#evento/" + d.id, "ev-" + d.id);
        if (ok) { sent += ok; recordatorios++; r.alsoKeys.forEach((k) => (upd[`avisos.${k}`] = today)); }
      }
      // Evento nuevo: avisarle a la otra persona
      if (!e.nuevoAvisado && e.createdAt && now - e.createdAt < NEW_WINDOW && now - e.createdAt > 60000) {
        const other = members.filter((u) => u !== e.createdBy).flatMap((u) => tokensOf[u]);
        if (other.length) {
          const who = names[e.createdBy] || "Tu pareja";
          const ok = await send(other, { title: `${who} agendó algo`, body: `${e.title || "Un plan"} · ${e.date}` }, "#evento/" + d.id, "nuevo-ev-" + d.id);
          sent += ok; if (ok) nuevos++;
        }
        upd.nuevoAvisado = true;
      }
      if (Object.keys(upd).length) await d.ref.update(upd);
    }

    // Pendientes: el día de su fecha límite (desde las 9:00) y cuando uno le agrega uno al otro.
    const mxNow = mxParts(now);
    const forWho = (t) => (t.para && t.para !== "ambos" && members.includes(t.para)) ? [t.para] : members;
    if (mxNow.min >= 9 * 60) {
      for (const d of (await c.ref.collection("pendientes").where("due", "==", today).get()).docs) {
        const t = d.data();
        if (t.done || t.avisoDia === today) continue;
        const to = forWho(t).flatMap((u) => tokensOf[u]);
        if (to.length) {
          const ok = await send(to, { title: "Pendiente para hoy", body: t.t || "Tienen un pendiente" }, "#pendientes", "pend-" + d.id);
          sent += ok; if (ok) recordatorios++;
        }
        await d.ref.update({ avisoDia: today });
      }
    }
    for (const d of (await c.ref.collection("pendientes").where("createdAt", ">", now - NEW_WINDOW).get()).docs) {
      const t = d.data();
      if (t.nuevoAvisado || now - t.createdAt < 60000) continue;
      const to = forWho(t).filter((u) => u !== t.createdBy).flatMap((u) => tokensOf[u]);
      if (to.length) {
        const who = names[t.createdBy] || "Tu pareja";
        const ok = await send(to, { title: `${who} agregó un pendiente`, body: (t.t || "") + (t.due ? ` · para el ${t.due}` : "") }, "#pendientes", "nuevo-pend-" + d.id);
        sent += ok; if (ok) nuevos++;
      }
      await d.ref.update({ nuevoAvisado: true });
    }

    // Ideas nuevas: avisarle a la otra persona
    for (const d of (await c.ref.collection("ideas").where("createdAt", ">", now - NEW_WINDOW).get()).docs) {
      const i = d.data();
      if (i.nuevoAvisado || now - i.createdAt < 60000) continue;
      const other = members.filter((u) => u !== i.owner).flatMap((u) => tokensOf[u]);
      if (other.length) {
        const who = names[i.owner] || "Tu pareja";
        const yours = i.by && i.by !== i.owner;   // la anotó por la otra persona
        const m = yours ? { title: `${who} anotó una idea tuya`, body: `${i.title || "Una idea"}. Ya cuenta como tuya.` } : { title: `${who} propuso un plan`, body: `${i.title || "Una idea nueva"}. ¿Te late?` };
        const ok = await send(other, m, "#idea/" + d.id, "nueva-idea-" + d.id);
        sent += ok; if (ok) nuevos++;
      }
      await d.ref.update({ nuevoAvisado: true });
    }
  }
  console.log(`${recordatorios} recordatorios y ${nuevos} avisos de cosas nuevas; ${sent} notificaciones enviadas.`);
  process.exit(0);
})().catch((e) => { console.error("Error:", e.message); process.exit(1); });
