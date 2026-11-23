// Lógica del recordatorio diario de Täglich, sin Firebase (para poder probarla sola con `node aleman-avisos/pruebas.js`).
const TZ = "America/Mexico_City";
const VENTANA = 180;   // el Action corre cada hora y a veces se retrasa: se avisa hasta 3 h después de la hora elegida

// Fecha (YYYY-MM-DD) y minuto del día en una zona horaria.
function partesEn(ms, tz = TZ) {
  let f;
  try { f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); }
  catch (e) { f = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }); }
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { iso: `${p.year}-${p.month}-${p.day}`, min: Number(p.hour) * 60 + Number(p.minute) };
}
const diaNum = (iso) => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d) / 86400000; };

// ¿Toca avisarle ahora? Solo si activó los avisos, ya pasó su hora, hoy no ha estudiado y hoy no se le avisó.
function debeAvisar(perfil, now, ultimoAviso) {
  const plan = (perfil && perfil.plan) || {};
  if (!plan.avisos) return null;
  const { iso, min } = partesEn(now, plan.tz || TZ);
  if (ultimoAviso === iso || perfil.ultimoDia === iso) return null;
  const [h, m] = String(plan.hora || "20:00").split(":").map(Number);
  const objetivo = (h || 0) * 60 + (m || 0);
  if (min < objetivo || min > objetivo + VENTANA) return null;
  return { hoy: iso };
}

// Repasos pendientes estimados: lo que quedó pendiente al terminar la última sesión + lo que vencía hasta hoy.
function pendientes(perfil, hoy) {
  const pron = perfil.pron || {};
  const desde = perfil.ultimoDia || hoy;
  return Object.entries(pron).filter(([k]) => k >= desde && k <= hoy).reduce((s, [, n]) => s + (Number(n) || 0), 0);
}

function mensaje(perfil, hoy) {
  const r = perfil.racha || {};
  const ayer = perfil.ultimoDia && diaNum(hoy) - diaNum(perfil.ultimoDia) === 1;
  const protegida = perfil.ultimoDia && diaNum(hoy) - diaNum(perfil.ultimoDia) - 1 <= (r.protectores || 0);
  const n = r.n || 0;
  const pend = pendientes(perfil, hoy);
  const rep = pend ? `Tienes ${pend} ${pend === 1 ? "repaso pendiente" : "repasos pendientes"}. ` : "";
  if (n >= 2 && (ayer || protegida)) return { title: `🔥 ¡No pierdas tu racha de ${n} días!`, body: `${rep}Con 5 minutos basta.`, tag: "racha-" + hoy };
  if (pend >= 5) return { title: "🧠 Tus palabras se están olvidando", body: `${pend} palabras están en su punto justo para repasarlas. Recupéralas hoy y se te quedan.`, tag: "repaso-" + hoy };
  return { title: "☕ Hora de tu alemán", body: `${rep}Una lección cortita y listo. Jeden Tag ein bisschen!`, tag: "dia-" + hoy };
}

module.exports = { partesEn, debeAvisar, mensaje, pendientes, TZ };
