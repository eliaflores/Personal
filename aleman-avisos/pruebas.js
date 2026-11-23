// Pruebas de la lógica del recordatorio:  node aleman-avisos/pruebas.js
const { debeAvisar, mensaje, pendientes } = require("./logica");
let f = 0;
const ok = (c, m) => { if (!c) { f++; console.log("✗", m); } };
// 2026-11-23 20:30 en Ciudad de México = 2026-11-24 02:30 UTC
const t = Date.UTC(2026, 10, 24, 2, 30);
const base = { plan: { avisos: true, hora: "20:00", tz: "America/Mexico_City" }, ultimoDia: "2026-11-22", racha: { n: 5, protectores: 0 }, pron: { "2026-11-22": 3, "2026-11-23": 9, "2026-11-24": 4 } };
ok(debeAvisar(base, t, null) && debeAvisar(base, t, null).hoy === "2026-11-23", "avisa a las 20:30 si eligió las 20:00");
ok(!debeAvisar({ ...base, plan: { ...base.plan, hora: "21:00" } }, t, null), "no avisa antes de su hora");
ok(!debeAvisar({ ...base, ultimoDia: "2026-11-23" }, t, null), "no avisa si ya estudió hoy");
ok(!debeAvisar(base, t, "2026-11-23"), "no avisa dos veces el mismo día");
ok(!debeAvisar({ ...base, plan: { ...base.plan, avisos: false } }, t, null), "no avisa si no activó los avisos");
ok(!debeAvisar(base, t + 4 * 3600000, null), "no avisa más de 3 h tarde");
ok(pendientes(base, "2026-11-23") === 12, "pendientes = lo que quedó + lo de hoy");
const m = mensaje(base, "2026-11-23");
ok(/racha de 5/.test(m.title) && /12 repasos/.test(m.body), "mensaje de racha con repasos: " + JSON.stringify(m));
ok(/Hora de tu alemán/.test(mensaje({ ...base, racha: { n: 0 }, pron: {} }, "2026-11-23").title), "mensaje simple sin racha");
console.log(f ? `${f} pruebas fallaron` : "Todas las pruebas del recordatorio pasaron.");
process.exit(f ? 1 : 0);
