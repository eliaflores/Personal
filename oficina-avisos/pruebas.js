// Pruebas de Mi Oficina (sin Firebase ni internet):  node oficina-avisos/pruebas.js
const L = require("./logica");
const ICS = require("./ics");
const N = require("./notion");
const A = require("./apple");

let f = 0, n = 0;
const ok = (c, m) => { n++; if (!c) { f++; console.log("✗", m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);
const TZ = "America/Mexico_City";
const at = (iso, hhmm, tz = TZ) => L.toMs(iso, L.toMin(hhmm), tz);

(async () => {
  /* ---------- Fechas y zonas horarias ---------- */
  eq(L.parts(Date.UTC(2026, 10, 26, 15, 30), TZ), { iso: "2026-11-26", min: 9 * 60 + 30, dow: 4 }, "15:30 UTC es 9:30 en CDMX (jueves)");
  eq(L.toMs("2026-11-26", 570, TZ), Date.UTC(2026, 10, 26, 15, 30), "9:30 CDMX → UTC");
  eq(L.toMs("2026-07-01", 600, "America/New_York"), Date.UTC(2026, 6, 1, 14, 0), "Nueva York con horario de verano");
  eq(L.toMs("2026-01-15", 600, "America/New_York"), Date.UTC(2026, 0, 15, 15, 0), "Nueva York sin horario de verano");
  ok(L.validTz("Europe/Madrid") && !L.validTz("Marte/Base"), "valida zonas horarias");

  /* ---------- Repeticiones ---------- */
  const daily = { date: "2026-11-20", repeat: "laborables" };   // viernes
  eq(L.nextStart(daily, "2026-11-21"), "2026-11-23", "entre semana: del sábado salta al lunes");
  ok(L.occursOn(daily, "2026-11-24") && !L.occursOn(daily, "2026-11-22"), "entre semana: martes sí, domingo no");
  eq(L.nextStart({ date: "2026-11-02", repeat: "semanal" }, "2026-11-25"), "2026-11-30", "cada semana");
  eq(L.nextStart({ date: "2026-01-31", repeat: "mensual" }, "2026-02-01"), "2026-03-31", "cada mes se salta los meses sin día 31");
  eq(L.nextStart({ date: "2024-02-29", repeat: "anual" }, "2025-01-01"), "2028-02-29", "cada año el 29 de febrero");
  ok(L.occursOn({ date: "2026-12-01", endDate: "2026-12-05" }, "2026-12-03"), "evento de varios días");

  /* ---------- Avisos de eventos ---------- */
  const junta = { title: "Junta de compras", date: "2026-11-26", time: "10:00", place: "Sala 2", remind: ["30m", "1d"] };
  let r = L.dueReminders(junta, at("2026-11-26", "09:35"), { tz: TZ });
  ok(r.length === 1 && r[0].code === "30m", "avisa 30 min antes");
  const m = L.eventMessage(junta, r[0]);
  ok(/^En 25 min: Junta de compras$/.test(m.title) && /10:00 am · Sala 2/.test(m.body), "mensaje de 30 min antes: " + JSON.stringify(m));
  ok(!L.dueReminders(junta, at("2026-11-26", "09:35"), { tz: TZ, sent: { [r[0].key]: "x" } }).length, "no repite un aviso ya enviado");
  ok(!L.dueReminders(junta, at("2026-11-26", "10:05"), { tz: TZ }).length, "no avisa si ya empezó");
  r = L.dueReminders(junta, at("2026-11-25", "08:10"), { tz: TZ, dayMin: 8 * 60 });
  ok(r.length === 1 && r[0].code === "1d" && /^Mañana: /.test(L.eventMessage(junta, r[0]).title), "un día antes, a la hora del resumen");
  ok(!L.dueReminders(junta, at("2026-11-25", "07:50"), { tz: TZ, dayMin: 8 * 60 }).length, "un día antes: no antes de la hora");
  const temprano = { title: "Desayuno", date: "2026-11-26", time: "07:00", remind: ["0d"] };
  ok(L.dueReminders(temprano, at("2026-11-26", "06:05"), { tz: TZ, dayMin: 8 * 60 }).length === 1, "el mismo día: si es temprano avisa 1 h antes");
  const diario = { title: "Daily", date: "2026-11-02", time: "09:00", repeat: "laborables", remind: ["15m"] };
  ok(L.dueReminders(diario, at("2026-11-26", "08:50"), { tz: TZ }).length === 1, "evento de entre semana avisa el jueves");
  ok(!L.dueReminders(diario, at("2026-11-28", "08:50"), { tz: TZ }).length, "evento de entre semana no avisa en sábado");
  const two = L.dueReminders({ ...junta, remind: ["1h", "30m"] }, at("2026-11-26", "09:40"), { tz: TZ });
  ok(two.length === 1 && two[0].code === "30m" && two[0].alsoKeys.length === 2, "si tocan dos a la vez, manda uno y marca los dos");

  /* ---------- Pendientes y requisiciones ---------- */
  const t = { t: "Mandar reporte", due: "2026-11-26", time: "16:00" };
  ok(L.todoReminder(t, at("2026-11-26", "15:40"), { tz: TZ }) && /20 min/.test(L.todoReminder(t, at("2026-11-26", "15:40"), { tz: TZ }).title), "pendiente con hora: 20 min antes");
  ok(!L.todoReminder(t, at("2026-11-26", "15:00"), { tz: TZ }), "pendiente con hora: no tan antes");
  ok(!L.todoReminder({ ...t, done: true }, at("2026-11-26", "15:40"), { tz: TZ }), "pendiente hecho no avisa");
  ok(L.todoDayReminder({ t: "x", due: "2026-11-26" }, at("2026-11-26", "08:20"), { tz: TZ }), "pendiente de hoy sin hora (sin resumen)");
  const q = { t: "Tóner HP 85A", due: "2026-11-27", estado: "pormeter" };
  ok(/Mañana/.test((L.reqReminder(q, at("2026-11-26", "08:15"), { tz: TZ }) || {}).title || ""), "requisición: aviso un día antes");
  ok(!L.reqReminder({ ...q, estado: "metida" }, at("2026-11-26", "08:15"), { tz: TZ }), "requisición ya metida no avisa");
  ok(!L.reqReminder({ ...q, due: "2026-11-26" }, at("2026-11-26", "08:15"), { tz: TZ }), "requisición del día: va en el resumen");
  ok(L.reqReminder({ ...q, due: "2026-11-26" }, at("2026-11-26", "08:15"), { tz: TZ, sameDay: true }), "requisición del día sin resumen");

  /* ---------- Resumen del día ---------- */
  ok(L.digestDue({ hora: "08:00" }, at("2026-11-26", "08:07"), { tz: TZ }) === "2026-11-26", "resumen a las 8 del jueves");
  ok(!L.digestDue({ hora: "08:00" }, at("2026-11-28", "08:07"), { tz: TZ }), "sin resumen en sábado (por omisión)");
  ok(!L.digestDue({ hora: "08:00" }, at("2026-11-26", "08:07"), { tz: TZ, last: "2026-11-26" }), "un resumen al día");
  ok(!L.digestDue({ hora: "08:00" }, at("2026-11-26", "11:30"), { tz: TZ }), "no manda el resumen 3 h tarde");
  ok(!L.digestDue({ resumen: false }, at("2026-11-26", "08:07"), { tz: TZ }), "resumen apagado");
  const dm = L.digestMessage({
    today: "2026-11-26",
    items: [{ title: "Comida", allDay: false, time: "14:00" }, { title: "Junta", time: "09:30" }, { title: "Día de inventario", allDay: true }],
    todos: [{ due: "2026-11-26" }, { due: "2026-11-26" }, { due: "2026-11-20" }, { due: "2026-11-26", done: true }],
    reqs: [{ due: "2026-11-26", estado: "pormeter" }, { due: "2026-11-26", estado: "metida" }],
  });
  ok(dm && /jueves 26 de noviembre/.test(dm.title), "título del resumen: " + (dm && dm.title));
  ok(dm && /3 eventos \(el primero a las 9:30 am: Junta\)/.test(dm.body) && /2 pendientes para hoy, 1 vencido/.test(dm.body) && /1 requisición por meter hoy/.test(dm.body), "texto del resumen: " + (dm && dm.body));
  ok(L.digestMessage({ today: "2026-11-26" }) === null, "sin nada no hay resumen");
  eq(Object.keys(L.pruneSent({ "2026-11-01T10:00:30m": 1, "2026-11-25:req1d": 1 }, "2026-11-26")), ["2026-11-25:req1d"], "limpia avisos viejos");

  /* ---------- Calendarios .ics (Apple / Google) ---------- */
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "X-WR-CALNAME:Trabajo",
    "BEGIN:VTIMEZONE", "TZID:America/Mexico_City", "BEGIN:STANDARD", "DTSTART:19700101T000000", "TZOFFSETFROM:-0600", "TZOFFSETTO:-0600", "END:STANDARD", "END:VTIMEZONE",
    "BEGIN:VEVENT", "UID:a1", "SUMMARY:Junta con\\, proveedores", "DTSTART;TZID=America/Mexico_City:20261126T100000", "DTEND;TZID=America/Mexico_City:20261126T113000",
    "LOCATION:Sala 2", "DESCRIPTION:Llevar la cotización\\nde tóner", "BEGIN:VALARM", "TRIGGER:-PT15M", "SUMMARY:alarma", "END:VALARM", "END:VEVENT",
    "BEGIN:VEVENT", "UID:a2", "SUMMARY:Llamada en UTC", "DTSTART:20261127T170000Z", "DTEND:20261127T173000Z", "END:VEVENT",
    "BEGIN:VEVENT", "UID:a3", "SUMMARY:Vacaciones", "DTSTART;VALUE=DATE:20261221", "DTEND;VALUE=DATE:20261224", "END:VEVENT",
    "BEGIN:VEVENT", "UID:a4", "SUMMARY:Daily", "DTSTART;TZID=America/Mexico_City:20261102T090000", "DTEND;TZID=America/Mexico_City:20261102T091500",
    "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20261204T235959Z", "EXDATE;TZID=America/Mexico_City:20261125T090000", "END:VEVENT",
    "BEGIN:VEVENT", "UID:a4", "RECURRENCE-ID;TZID=America/Mexico_City:20261126T090000", "SUMMARY:Daily (movida)", "DTSTART;TZID=America/Mexico_City:20261126T120000", "DTEND;TZID=America/Mexico_City:20261126T121500", "END:VEVENT",
    "BEGIN:VEVENT", "UID:a5", "SUMMARY:Cancelada", "STATUS:CANCELLED", "DTSTART:20261126T180000Z", "END:VEVENT",
    "BEGIN:VEVENT", "UID:a6", "SUMMARY:Cierre de mes", "DTSTART;VALUE=DATE:20260130", "RRULE:FREQ=MONTHLY;BYDAY=-1FR", "END:VEVENT",
    "BEGIN:VEVENT", "UID:a7", "SUMMARY:Evento con un título muy muy largo que se dobla en varias líneas porque así lo ma", " nda el formato", "DTSTART:20261130T160000Z", "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const cal = ICS.parseICS(ics);
  eq(cal.calName, "Trabajo", "nombre del calendario");
  const evs = ICS.expand(cal, { fromIso: "2026-11-20", toIso: "2026-12-31", tz: TZ });
  const find = (title, date) => evs.find((e) => e.title === title && (!date || e.date === date));
  const j = find("Junta con, proveedores");
  ok(j && j.date === "2026-11-26" && j.time === "10:00" && j.endTime === "11:30" && j.place === "Sala 2" && /cotización\nde tóner/.test(j.note), "evento con zona horaria: " + JSON.stringify(j));
  const u = find("Llamada en UTC");
  ok(u && u.time === "11:00" && u.endTime === "11:30", "evento en UTC pasado a CDMX: " + JSON.stringify(u));
  const v = find("Vacaciones");
  ok(v && v.allDay && v.date === "2026-12-21" && v.endDate === "2026-12-23", "vacaciones de todo el día (DTEND no cuenta): " + JSON.stringify(v));
  const daily2 = evs.filter((e) => e.title === "Daily").map((e) => e.date);
  ok(daily2.includes("2026-11-24") && !daily2.includes("2026-11-25") && !daily2.includes("2026-11-28") && daily2.includes("2026-12-04") && !daily2.includes("2026-12-07"), "serie entre semana con excepción y fin: " + daily2.join(","));
  const mv = find("Daily (movida)");
  ok(mv && mv.date === "2026-11-26" && mv.time === "12:00" && !evs.some((e) => e.title === "Daily" && e.date === "2026-11-26"), "ocurrencia movida reemplaza la original");
  ok(!find("Cancelada"), "eventos cancelados no aparecen");
  const cierre = evs.filter((e) => e.title === "Cierre de mes").map((e) => e.date);
  eq(cierre, ["2026-11-27", "2026-12-25"], "último viernes de cada mes");
  ok(find("Evento con un título muy muy largo que se dobla en varias líneas porque así lo manda el formato"), "líneas dobladas");
  const ny = ICS.expand(ICS.parseICS(["BEGIN:VCALENDAR", "BEGIN:VEVENT", "UID:x", "SUMMARY:NY", "DTSTART;TZID=America/New_York:20261126T100000", "END:VEVENT", "END:VCALENDAR"].join("\n")), { fromIso: "2026-11-01", toIso: "2026-12-01", tz: TZ });
  ok(ny[0] && ny[0].time === "09:00", "evento en Nueva York se ve en hora de CDMX: " + JSON.stringify(ny[0]));
  const win = ICS.expand(ICS.parseICS(["BEGIN:VCALENDAR", "BEGIN:VEVENT", "UID:w", "SUMMARY:Outlook", 'DTSTART;TZID="Central Standard Time (Mexico)":20261126T100000', "END:VEVENT", "END:VCALENDAR"].join("\n")), { fromIso: "2026-11-01", toIso: "2026-12-01", tz: TZ });
  ok(win[0] && win[0].time === "10:00", "zona de Windows (Outlook)");
  const cnt = ICS.expand(ICS.parseICS(["BEGIN:VCALENDAR", "BEGIN:VEVENT", "UID:c", "SUMMARY:3 veces", "DTSTART:20261101T150000Z", "RRULE:FREQ=DAILY;COUNT=3", "END:VEVENT", "END:VCALENDAR"].join("\n")), { fromIso: "2026-10-01", toIso: "2026-12-01", tz: TZ });
  eq(cnt.map((e) => e.date), ["2026-11-01", "2026-11-02", "2026-11-03"], "COUNT");
  eq(ICS.fetchableUrl("webcal://p01-caldav.icloud.com/published/2/abc"), "https://p01-caldav.icloud.com/published/2/abc", "webcal → https");
  ok(!ICS.fetchableUrl("javascript:alert(1)"), "rechaza links raros");

  /* ---------- Calendario para Apple (.ics que genera la app) ---------- */
  const out = ICS.buildICS({
    tz: TZ, appUrl: "https://x.test/oficina/", nowMs: Date.UTC(2026, 10, 26),
    events: [
      { id: "e1", title: "Junta, semanal; importante", date: "2026-11-26", time: "10:00", endTime: "11:00", place: "Sala 2", repeat: "semanal" },
      { id: "e2", title: "Comida", date: "2026-11-27", time: "14:00" },
      { id: "e3", title: "Inventario", date: "2026-12-01", endDate: "2026-12-03", allDay: true },
    ],
    todos: [{ id: "t1", t: "Reporte", due: "2026-11-28" }, { id: "t2", t: "Hecho", due: "2026-11-28", done: true }],
    reqs: [{ id: "r1", t: "Tóner", due: "2026-11-30", estado: "pormeter" }, { id: "r2", t: "Sillas", due: "2026-11-30", estado: "metida" }],
  });
  ok(/\r\n/.test(out) && out.split("\r\n").every((l) => Buffer.byteLength(l) <= 75), "líneas de 75 bytes máximo");
  const back = ICS.expand(ICS.parseICS(out), { fromIso: "2026-11-20", toIso: "2026-12-31", tz: TZ });
  ok(back.filter((e) => e.title === "Junta, semanal; importante").length === 6 && back.find((e) => e.title === "Junta, semanal; importante").time === "10:00", "evento semanal ida y vuelta");
  ok(back.find((e) => e.title === "Comida" && e.time === "14:00"), "evento con hora ida y vuelta");
  ok(back.find((e) => e.title === "Inventario" && e.endDate === "2026-12-03"), "evento de varios días ida y vuelta");
  ok(back.find((e) => e.title === "Pendiente: Reporte") && !back.find((e) => e.title === "Pendiente: Hecho"), "pendientes abiertos con fecha");
  ok(back.find((e) => e.title === "Meter requisición: Tóner") && !back.find((e) => /Sillas/.test(e.title)), "requisiciones por meter");
  ok(/BEGIN:VTIMEZONE/.test(out) && /URL:https:\/\/x.test\/oficina\/#evento\/e1/.test(out), "zona horaria y link a la app");
  const nyTz = ICS.vtimezone("America/New_York", Date.UTC(2026, 5, 1)).join("\n");
  ok(/BEGIN:DAYLIGHT/.test(nyTz) && /DTSTART:20260308T020000/.test(nyTz), "VTIMEZONE con horario de verano");

  /* ---------- Notion ---------- */
  eq(N.dbIdFrom("https://www.notion.so/miespacio/4214949b7d6c81bc96b6efd04e26a90b?v=1234567890abcdef1234567890abcdef"), "4214949b7d6c81bc96b6efd04e26a90b", "id de la base desde el link (ignora la vista)");
  eq(N.dbIdFrom("Calendario-4214949b-7d6c-81bc-96b6-efd04e26a90b"), "4214949b7d6c81bc96b6efd04e26a90b", "id con guiones");
  ok(!N.dbIdFrom("hola"), "sin id");
  const calls = [];
  const pages = { "pg-notion": { id: "pg-notion", url: "https://notion.so/pg", properties: { Nombre: { type: "title", title: [{ plain_text: "Revisión con dirección" }] }, Fecha: { type: "date", date: { start: "2026-11-27T16:00:00.000-06:00", end: "2026-11-27T17:00:00.000-06:00" } } } } };
  const fakeNotion = async (method, path, body) => {
    calls.push([method, path, body]);
    if (method === "GET") return { properties: { Nombre: { type: "title" }, Fecha: { type: "date" }, Lugar: { type: "multi_select" } } };
    if (method === "PATCH" && path.startsWith("/databases/")) return {};
    if (method === "POST" && path === "/pages") return { id: "nuevo-" + calls.length };
    if (method === "PATCH" && path.startsWith("/pages/")) return { archived: !!body.archived };
    if (method === "POST" && path.endsWith("/query")) return { results: [pages["pg-notion"], { id: "x", archived: true, properties: {} }], has_more: false };
    return {};
  };
  const saved = {}, dropped = [], imported = [];
  const st = await N.syncUser({
    notion: fakeNotion, tz: TZ, uid: "u1", appUrl: "https://x.test/oficina/", now: at("2026-11-26", "12:00"),
    prof: { notion: { db: "https://notion.so/4214949b7d6c81bc96b6efd04e26a90b" }, areas: [{ k: "compras", l: "Compras" }] },
    store: {
      changed: [{ id: "e1", title: "Junta", date: "2026-11-26", time: "10:00", endTime: "11:00", area: "compras", updatedAt: 5 }, { id: "e2", title: "Ya", date: "2026-11-26", notionId: "p2", notionDb: "4214949b7d6c81bc96b6efd04e26a90b", notionAt: 3, notionOcc: "2026-11-26", updatedAt: 3 }],
      repeating: [], tombstones: [{ id: "b1", notionId: "p-borrada" }],
      saveEvent: async (id, patch) => (saved[id] = patch), dropTombstone: async (id) => dropped.push(id), saveImported: async (evs) => imported.push(...evs),
    },
  });
  const addCols = calls.find((c) => c[0] === "PATCH" && c[1].startsWith("/databases/"));
  ok(addCols && addCols[2].properties["ID app"] && addCols[2].properties["Notas"] && !addCols[2].properties.Lugar && !addCols[2].properties.Fecha, "agrega solo las columnas que faltan (sin tocar las que ya hay)");
  const created = calls.find((c) => c[0] === "POST" && c[1] === "/pages");
  ok(created && created[2].properties.Nombre.title[0].text.content === "Junta" && created[2].properties.Fecha.date.start === "2026-11-26T10:00:00" && created[2].properties.Fecha.date.time_zone === TZ, "crea la página con fecha y hora");
  ok(created && created[2].properties["Área"].select.name === "Compras" && !created[2].properties.Lugar, "área y sin la columna que es de otro tipo");
  ok(saved.e1 && saved.e1.notionAt === 5 && !saved.e2, "guarda el id de Notion y no reenvía lo que no cambió");
  ok(calls.some((c) => c[1] === "/pages/p-borrada" && c[2].archived) && dropped[0] === "b1", "archiva en Notion lo borrado en la app");
  ok(imported.length === 1 && imported[0].title === "Revisión con dirección" && imported[0].time === "16:00" && imported[0].endTime === "17:00", "trae a la app lo de Notion: " + JSON.stringify(imported[0]));
  const q2 = calls.find((c) => c[1].endsWith("/query"));
  ok(q2 && q2[2].filter.and.some((x) => x.property === "ID app"), "solo trae lo que no vino de la app");
  ok(st.enviados === 1 && st.archivados === 1 && st.traidos === 1, "conteos de Notion");
  const allDay = N.pageToEvent({ id: "p", properties: { T: { title: [{ plain_text: "Día" }] }, F: { date: { start: "2026-12-01", end: "2026-12-03" } } } }, { title: "T", date: "F" }, TZ);
  ok(allDay.allDay && allDay.endDate === "2026-12-03", "página de Notion de varios días");

  /* ---------- Gist para Apple ---------- */
  const gcalls = [];
  const fakeFetch = async (url, o) => { gcalls.push([o.method, url]); return { ok: true, status: 200, json: async () => ({ id: "g123", owner: { login: "alguien" } }) }; };
  const p1 = await A.publish({ token: "t", ics: "BEGIN:VCALENDAR\r\nDTSTAMP:1\r\nEND:VCALENDAR", feed: {}, fetchImpl: fakeFetch });
  ok(p1 && p1.url === "https://gist.githubusercontent.com/alguien/g123/raw/mi-oficina.ics" && gcalls[0][0] === "POST", "crea el gist secreto");
  const p2 = await A.publish({ token: "t", ics: "BEGIN:VCALENDAR\r\nDTSTAMP:2\r\nEND:VCALENDAR", feed: p1, fetchImpl: fakeFetch });
  ok(p2 === null && gcalls.length === 1, "no lo vuelve a subir si solo cambió la marca de tiempo");
  const p3 = await A.publish({ token: "t", ics: "BEGIN:VCALENDAR\r\nX:1\r\nEND:VCALENDAR", feed: p1, fetchImpl: fakeFetch });
  ok(p3 && gcalls[1][0] === "PATCH", "actualiza el gist cuando cambia");

  console.log(f ? `${f} de ${n} pruebas fallaron` : `Las ${n} pruebas de Mi Oficina pasaron.`);
  process.exit(f ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
