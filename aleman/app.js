// Täglich · alemán todos los días. App principal: cuenta, base de datos, ruta, práctica, estadísticas y ajustes.
import * as M from "./motor.js";
import { A1 } from "./vocab-a1.js";
import { A2 } from "./vocab-a2.js";
import { B1 } from "./vocab-b1.js";
import { TEMAS } from "./gramatica.js";
import { LECTURAS } from "./lecturas.js";
import { CIENCIA } from "./ciencia.js";
import { $, $$, esc, ls, toast, openSheet, closeSheet, sheetAbierta, Voz, Oido, Sonido, confeti, I, DECO, circ, pastelNivel, pastelGenero, flechaAnillo, flechaDiag } from "./servicios.js";
import { correr, htmlPalabra, formasVerbo, botonAudio, botonLento } from "./sesion.js";

/* ============================ Contenido ============================ */
const GRAM = M.prepararGramatica(TEMAS);
const C = M.prepararContenido([...A1, ...A2, ...B1], GRAM);
const LEX = M.indiceFormas(C.vocab);
const LECT = Object.fromEntries(LECTURAS.map((l) => [l.id, l]));
const NODOS = C.unidades.flatMap((u) => u.nodos.map((n) => ({ ...n, unidad: u })));
const NODO = Object.fromEntries(NODOS.map((n, i) => [n.id, Object.assign(n, { idx: i })]));
const NIVELES = ["A1", "A2", "B1"];

/* ============================ Firebase ============================ */
// Mismo proyecto que Mi Cartera, Regalos y Planes, pero los datos van aparte en la colección "aleman".
const FIREBASE = {
  apiKey: "AIzaSyC2j-keohRRLs8dnQk6hQXGT9eItJXmzik",
  authDomain: "personal-75acf.firebaseapp.com",
  projectId: "personal-75acf",
  storageBucket: "personal-75acf.firebasestorage.app",
  messagingSenderId: "12344295289",
  appId: "1:12344295289:web:5b54150483457bb94439a8",
};
const FBV = "https://www.gstatic.com/firebasejs/10.12.2/";
const VAPID_KEY = "BBAeJ9V9CTbcTl3AYxrgkdhqwP3SM7l55cJ-TdnDuH2WG11sF5ROXub4S5ZGS7Ys59P5e-ZbdM8_HqGssgGNYBQ";
const FB = { ok: false };
const conTiempo = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("tiempo")), ms))]);
async function cargarFirebase() {
  if (FB.ok) return true;
  try {
    const [app, auth, fs] = await conTiempo(Promise.all(["firebase-app", "firebase-auth", "firebase-firestore"].map((m) => import(FBV + m + ".js"))), 12000);
    FB.app = app.initializeApp(FIREBASE, "aleman");
    FB.a = auth; FB.fs = fs; FB.auth = auth.getAuth(FB.app);
    try { FB.db = fs.initializeFirestore(FB.app, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) }); }
    catch (e) { FB.db = fs.initializeFirestore(FB.app, {}); }
    FB.ok = true;
    return true;
  } catch (e) { console.warn("Firebase no disponible:", e); return false; }
}

/* ============================ Estado ============================ */
const LOCAL = "aleman.local.v1";
const CUBETAS = 8;
const S = { modo: null, user: null, perfil: null, cards: {}, perf: 0.85, enSesion: false, ob: null, filtro: "todas", busca: "", fbError: false };
const P = () => S.perfil;
const A = () => S.perfil.ajustes;
const hoy = () => M.dayNum();
const hoyISO = () => M.dayISO(M.dayNum());

function perfilNuevo(nombre = "") {
  return {
    v: 1, nombre, creado: Date.now(), onboarding: false,
    ajustes: { meta: 40, nuevas: 10, retencion: 0.9, vel: 0.9, autoAudio: true, sonidos: true, escuchar: true, hablar: true },
    plan: { motivo: "", momento: "", hora: "20:00", avisos: false, tz: zona() },
    xp: 0, racha: { n: 0, max: 0, ultimo: null, protectores: 1 },
    dias: {}, nodos: {}, tipos: {}, pron: {}, ultimoDia: null,
  };
}
const zona = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City"; } catch (e) { return "America/Mexico_City"; } };
function normalizarPerfil(p) {
  const base = perfilNuevo(p.nombre || "");
  return { ...base, ...p, ajustes: { ...base.ajustes, ...(p.ajustes || {}) }, plan: { ...base.plan, ...(p.plan || {}) }, racha: { ...base.racha, ...(p.racha || {}) }, dias: p.dias || {}, nodos: p.nodos || {}, tipos: p.tipos || {} };
}
function dia(iso = hoyISO()) {
  const d = P().dias;
  return d[iso] || (d[iso] = { xp: 0, ex: 0, ok: 0, ms: 0, ses: 0, nuevas: 0, rev: 0, revOk: 0 });
}

/* ============================ Base de datos ============================ */
// Nube: aleman/{uid} (perfil) + aleman/{uid}/srs/c0…c7 (estado de repaso de cada palabra, repartido en 8 documentos).
// Sin cuenta: todo en localStorage de este dispositivo.
const store = {
  tipo: null, uid: null, sucios: new Set(), t: null, error: null,
  async cargar() {
    if (this.tipo === "local") { const d = ls.get(LOCAL, {}) || {}; return { perfil: d.perfil || null, cards: d.cards || {} }; }
    const { doc, getDoc, collection, getDocs } = FB.fs;
    const [main, snap] = await Promise.all([getDoc(doc(FB.db, "aleman", this.uid)), getDocs(collection(FB.db, "aleman", this.uid, "srs"))]);
    const cards = {};
    snap.forEach((d) => Object.assign(cards, (d.data() || {}).c || {}));
    return { perfil: main.exists() ? main.data() : null, cards };
  },
  marcar(id) { this.sucios.add(id); },
  pronto() { clearTimeout(this.t); this.t = setTimeout(() => this.guardar(), 2500); },
  guardar() {
    clearTimeout(this.t);
    if (!S.perfil) return;
    podarDias();
    if (this.tipo === "local") { if (!ls.set(LOCAL, { perfil: S.perfil, cards: S.cards })) toast("No se pudo guardar en este dispositivo"); this.sucios.clear(); return; }
    const { doc, setDoc } = FB.fs;
    const porCubeta = {};
    for (const id of this.sucios) { const b = M.hashStr(id) % CUBETAS; (porCubeta[b] || (porCubeta[b] = {}))[id] = S.cards[id]; }
    this.sucios.clear();
    const limpio = (o) => JSON.parse(JSON.stringify(o));
    const ops = Object.entries(porCubeta).map(([b, c]) => setDoc(doc(FB.db, "aleman", this.uid, "srs", "c" + b), { c: limpio(c) }, { merge: true }));
    ops.push(setDoc(doc(FB.db, "aleman", this.uid), limpio(S.perfil)));
    // Con la caché de Firestore se guarda al instante en el cel y se sube cuando hay internet.
    Promise.all(ops).then(() => { this.error = null; }).catch((e) => {
      console.error(e); this.error = e;
      for (const c of Object.values(porCubeta)) for (const id of Object.keys(c)) this.sucios.add(id);
      toast(e && e.code === "permission-denied" ? "Firebase no dio permiso: faltan las reglas de «aleman»." : "No se pudo guardar en la nube. Se reintentará.");
    });
  },
  async borrarTodo() {
    if (this.tipo === "local") { ls.del(LOCAL); return; }
    const { doc, deleteDoc } = FB.fs;
    await Promise.all([...Array(CUBETAS).keys()].map((b) => deleteDoc(doc(FB.db, "aleman", this.uid, "srs", "c" + b)).catch(() => {})));
    await deleteDoc(doc(FB.db, "aleman", this.uid)).catch(() => {});
  },
};
function podarDias() {
  const d = P().dias, ks = Object.keys(d).sort();
  if (ks.length > 420) for (const k of ks.slice(0, ks.length - 420)) delete d[k];
}
function guardarTodo() {
  for (const id of Object.keys(S.cards)) store.marcar(id);
  store.guardar();
}

/* ============================ Entrar ============================ */
async function entrarLocal() {
  S.modo = "local"; store.tipo = "local"; ls.set("aleman.modo", "local");
  const d = await store.cargar();
  S.cards = d.cards || {};
  S.perfil = normalizarPerfil(d.perfil || perfilNuevo(""));
  arrancar();
}
async function entrarNube(user) {
  S.modo = "nube"; S.user = user; store.tipo = "nube"; store.uid = user.uid;
  ls.del("aleman.modo");
  pintarCargando("Cargando tu progreso…");
  try {
    const d = await conTiempo(store.cargar(), 20000);
    S.cards = d.cards || {};
    if (d.perfil) S.perfil = normalizarPerfil(d.perfil);
    else {
      // Primera vez con cuenta: si había progreso en este dispositivo, se sube a la cuenta.
      const loc = ls.get(LOCAL, null);
      if (loc && loc.perfil && Object.keys(loc.cards || {}).length) {
        S.perfil = normalizarPerfil({ ...loc.perfil, nombre: loc.perfil.nombre || nombreDe(user) });
        S.cards = loc.cards;
        guardarTodo();
        toast("Subimos a tu cuenta el progreso que tenías en este dispositivo ☁️", 4000);
      } else S.perfil = perfilNuevo(nombreDe(user));
    }
    if (!S.perfil.nombre) S.perfil.nombre = nombreDe(user);
    arrancar();
  } catch (e) {
    console.error(e);
    pintarError(e && e.code === "permission-denied"
      ? "Firebase no dio permiso para leer tus datos. Falta pegar las reglas nuevas: en Firebase → Firestore Database → Rules pega el archivo firestore.rules (debe incluir «aleman») y toca Publicar."
      : "No se pudo cargar tu progreso. Revisa tu internet e intenta de nuevo.");
  }
}
const nombreDe = (u) => ((u && (u.displayName || (u.email || "").split("@")[0])) || "").split(" ")[0];
function arrancar() {
  Sonido.on = A().sonidos !== false;
  Voz.vel = A().vel || 0.9;
  render();
}
async function salirCuenta() {
  store.guardar();
  if (S.modo === "nube" && FB.ok) await FB.a.signOut(FB.auth);
  ls.del("aleman.modo");
  Object.assign(S, { modo: null, user: null, perfil: null, cards: {} });
  location.hash = "";
  pintarEntrar();
}

/* ============================ Progreso ============================ */
const aprendida = (id) => !!(S.cards[id] && S.cards[id].last);
function nodoCompleto(n) {
  if (P().nodos[n.id]) return true;
  if (n.tipo === "lectura") return false;
  return n.items.length > 0 && n.items.every((it) => aprendida(it.id));
}
function idxActual() { const i = NODOS.findIndex((n) => !nodoCompleto(n)); return i < 0 ? NODOS.length : i; }
const nodoActual = () => NODOS[idxActual()] || null;
function repasosVencidos() {
  return M.vencidas(S.cards, hoy()).map(({ id, c }) => ({ item: C.porId.get(id), card: c })).filter((r) => r.item);
}
function rachaVisible() {
  const r = P().racha;
  if (r.ultimo == null) return 0;
  const gap = hoy() - r.ultimo - 1;
  return gap <= (r.protectores || 0) ? r.n : 0;
}
function actualizarRacha() {
  const r = P().racha, h = hoy();
  if (r.ultimo === h) return { sube: false, usado: false };
  const gap = r.ultimo == null ? Infinity : h - r.ultimo - 1;
  let usado = false;
  if (gap === 0) r.n++;
  else if (gap <= (r.protectores || 0)) { r.protectores -= gap; r.n++; usado = true; }
  else r.n = 1;
  r.ultimo = h; r.max = Math.max(r.max || 0, r.n);
  // Cada 7 días seguidos ganas un protector de racha (máximo 2).
  if (r.n % 7 === 0 && (r.protectores || 0) < 2) r.protectores = (r.protectores || 0) + 1;
  P().ultimoDia = hoyISO();
  return { sube: true, usado };
}
function actualizarPronostico() {
  const r = M.resumen(S.cards, hoy());
  const pron = {};
  r.pronostico.forEach((n, k) => { pron[M.dayISO(hoy() + k)] = n + (k === 0 ? 0 : 0); });
  pron[hoyISO()] = r.pendientes;
  P().pron = pron;
}
function nivelUsuario() {
  const por = {};
  for (const nv of NIVELES) { const its = C.vocab.filter((v) => v.nivel === nv); por[nv] = { total: its.length, hechas: its.filter((v) => aprendida(v.id)).length }; }
  let nivel = "Principiante";
  for (const nv of NIVELES) if (por[nv].hechas / por[nv].total >= 0.8) nivel = nv;
  return { nivel, por };
}

/* ============================ Sesiones ============================ */
let corredor = null;
function ctxEjercicios() {
  return { pool: C.vocab, lexico: LEX, audio: A().escuchar !== false, voz: A().hablar !== false && Oido.ok };
}
function aplicar(cals) {
  if (S.examen) return;
  const now = Date.now(), d = dia();
  for (const c of cals) {
    S.cards[c.id] = M.programar(S.cards[c.id], c.g, now, { retencion: A().retencion || 0.9, primeraLeccion: c.nueva });
    store.marcar(c.id);
    if (c.nueva) d.nuevas++;
    else if (!c.mismoDia) { d.rev++; if (c.g > 1) d.revOk++; }
  }
  store.pronto();
}
function iniciar(sesion, { examen = null } = {}) {
  if (!sesion.pasos.length) { toast("No hay nada que practicar aquí por ahora."); return; }
  // La explicación de gramática solo se muestra la primera vez.
  sesion.pasos = sesion.pasos.filter((p) => p.tipo !== "gintro" || !GRAM[p.item.tema].items.some((d) => aprendida(d.id)));
  S.enSesion = true; S.examen = examen; S.sesionActual = sesion;
  closeSheet();
  document.body.classList.add("sin-nav", "en-sesion");
  corredor = correr($("#app"), {
    sesion, ctx: ctxEjercicios(), temas: GRAM, ajustes: A(),
    onCalificar: aplicar,
    onFin: (st, o) => (examen ? terminarExamen(st, examen) : terminar(sesion, st, o)),
    onCerrar: (seguir) => {
      S.enSesion = false; S.examen = null; corredor = null; document.body.classList.remove("en-sesion"); render(); window.scrollTo(0, 0);
      if (seguir === true) { const n = nodoActual(); if (n) setTimeout(() => empezarNodo(n), 60); }
    },
  });
}
function terminar(sesion, st, { parcial }) {
  if (!st.total) return null;
  const perfecto = !parcial && st.total >= 6 && st.ok === st.total;
  const bonus = parcial ? 0 : 5 + (perfecto ? 5 : 0);
  const xp = st.xp + bonus;
  const d = dia(), meta = A().meta, antes = d.xp;
  d.xp += xp; d.ex += st.total; d.ok += st.ok; d.ms += Date.now() - st.inicio; d.ses++;
  P().xp += xp;
  for (const [k, [ok, n]] of Object.entries(st.porTipo)) { const t = P().tipos[k] || (P().tipos[k] = [0, 0]); t[0] += ok; t[1] += n; }
  S.perf = sesion.perf;
  const r = actualizarRacha();
  actualizarPronostico();
  let nuevas = 0, repasos = 0;
  for (const id of sesion.calificadas.keys()) { if (sesion.nuevos.has(id)) nuevas++; else repasos++; }
  store.guardar();
  const res = M.resumen(S.cards, hoy());
  const mensajes = perfecto ? ["Ni un error. Tu cerebro está en modo esponja."] : st.ok / st.total >= 0.85 ? ["Justo en la zona ideal de dificultad (~85%).", "Así se aprende: con un poco de esfuerzo."] : ["Los errores de hoy son los aciertos de mañana.", "Fallar y corregir fija mejor la memoria."];
  return {
    xp, total: st.total, ok: st.ok, ms: Date.now() - st.inicio, perfecto, racha: P().racha.n, rachaSube: r.sube, protectorUsado: r.usado,
    xpHoy: d.xp, meta, metaRecienCumplida: antes < meta && d.xp >= meta, nuevas, repasos, manana: res.pronostico[1], mensaje: mensajes[Math.floor(Math.random() * mensajes.length)], siguiente: infoSiguiente(),
  };
}
// Actividad sin sesión (lecturas): suma XP y cuenta para la racha.
function sumarActividad(xp, ms) {
  const d = dia(); d.xp += xp; d.ms += ms; d.ses++;
  P().xp += xp;
  const r = actualizarRacha();
  store.guardar();
  return r;
}

function sesionDeNodo(n, { repasar = false } = {}) {
  const pend = n.items.filter((it) => !aprendida(it.id));
  const tope = n.tipo === "gramatica" ? 8 : 7;
  // Si sobrarían 3 o menos para otra sesión, se hacen todas de una vez.
  const nuevos = repasar ? [] : pend.length <= tope + 3 ? pend : pend.slice(0, tope);
  let repasos = repasosVencidos();
  if (nuevos.length) {
    repasos = repasos.slice(0, 6);
    // Sesiones muy cortas se completan con repasos de la misma unidad (lo que menos recuerdas).
    if (nuevos.length + repasos.length < 6) {
      const ya = new Set(repasos.map((r) => r.item.id));
      const extra = n.unidad.nodos.flatMap((x) => x.items || []).filter((it) => aprendida(it.id) && !ya.has(it.id))
        .map((it) => ({ item: it, card: S.cards[it.id], R: M.retencionActual(S.cards[it.id]) })).sort((a, b) => a.R - b.R).slice(0, 6 - nuevos.length - repasos.length);
      repasos.push(...extra.map(({ item, card }) => ({ item, card })));
    }
  }
  else {
    // Repasar una lección ya hecha: sus palabras, de la menos a la más recordada.
    const propias = n.items.filter((it) => aprendida(it.id)).map((it) => ({ item: it, card: S.cards[it.id], R: M.retencionActual(S.cards[it.id]) })).sort((a, b) => a.R - b.R).slice(0, 12);
    repasos = propias.map(({ item, card }) => ({ item, card }));
  }
  return new M.Sesion({ nuevos, repasos, perf: S.perf });
}
function empezarNodo(n, opciones = {}) {
  if (n.tipo === "lectura") { location.hash = "#lectura/" + n.lectura; return; }
  const d = dia();
  const pend = n.items.filter((it) => !aprendida(it.id)).length;
  if (!opciones.repasar && !opciones.forzar && pend && n.tipo === "leccion" && d.nuevas >= A().nuevas) {
    openSheet(`
      <h3>Ya aprendiste ${d.nuevas} palabras nuevas hoy</h3>
      <p class="muted">Tu límite diario es ${A().nuevas}. Lo nuevo se olvida rápido si no se consolida: repasar ahora (y dormir) vale más que meter más palabras.</p>
      <div class="pie-fila"><button class="btn sec" data-mas>Aprender más</button><button class="btn primario" data-rep>Repasar mejor</button></div>`, (sh) => {
      sh.querySelector("[data-mas]").onclick = () => empezarNodo(n, { forzar: true });
      sh.querySelector("[data-rep]").onclick = () => empezarRepaso();
    });
    return;
  }
  iniciar(sesionDeNodo(n, opciones));
}
function empezarRepaso(limite = 20) {
  const due = repasosVencidos();
  if (!due.length) {
    const flojas = Object.entries(S.cards).filter(([, c]) => c.last).map(([id, c]) => ({ item: C.porId.get(id), card: c, R: M.retencionActual(c) })).filter((x) => x.item).sort((a, b) => a.R - b.R).slice(0, 12);
    if (!flojas.length) { toast("Primero aprende algunas palabras en la Ruta."); return; }
    toast("No tienes repasos pendientes: practicamos las que más se te están olvidando.");
    return iniciar(new M.Sesion({ repasos: flojas.map(({ item, card }) => ({ item, card })), perf: S.perf }));
  }
  iniciar(new M.Sesion({ repasos: due.slice(0, limite), perf: S.perf }));
}
function aprendidas(filtro = () => true) {
  return Object.entries(S.cards).filter(([, c]) => c && c.last).map(([id, c]) => ({ item: C.porId.get(id), card: c, R: M.retencionActual(c) })).filter((x) => x.item && filtro(x.item, x.card));
}
function empezarPractica(modo) {
  const conf = MODOS[modo];
  let lista = aprendidas(conf.filtro);
  if (conf.orden) lista.sort(conf.orden); else lista.sort((a, b) => a.R - b.R);
  lista = lista.slice(0, conf.max || 15);
  if (lista.length < (conf.min || 3)) { toast(conf.vacio || "Aprende unas palabras más en la Ruta para desbloquear esta práctica."); return; }
  const repasos = M.shuffle(lista).map(({ item, card }) => ({ item, card, forzar: conf.tipos }));
  const s = new M.Sesion({ repasos, perf: S.perf, conMatch: false });
  if (conf.tipos) s.pasos.forEach((p) => { if (p.tipo === "rev") p.forzar = conf.tipos; });
  iniciar(s);
}
const MODOS = {
  errores: { titulo: "Mis errores", emoji: "🩹", desc: "Las palabras que más has fallado", filtro: (it, c) => c.lapses > 0 || c.d >= 6 || (c.lw && Date.now() - c.lw < 21 * M.DAY), orden: (a, b) => (b.card.lapses - a.card.lapses) || a.R - b.R, min: 1, vacio: "¡No tienes errores recientes! 🎉" },
  escuchar: { titulo: "Escuchar", emoji: "🎧", desc: "Dictados y comprensión auditiva", tipos: ["listen_mc", "listen_type", "dictation", "listen_order"], filtro: (it) => it.t !== "g" },
  hablar: { titulo: "Hablar", emoji: "🗣️", desc: "Pronuncia y la app te escucha", tipos: ["speak"], filtro: (it) => it.t !== "g" },
  articulos: { titulo: "der · die · das", emoji: "🎨", desc: "Entrena el género de los sustantivos", tipos: ["article"], filtro: (it) => it.t === "n" && it.g !== "pl", max: 20 },
  verbos: { titulo: "Conjugar", emoji: "🔁", desc: "Presente y Perfekt de tus verbos", tipos: ["conj", "perfekt"], filtro: (it) => it.t === "v" },
  escribir: { titulo: "Escribir", emoji: "✍️", desc: "Producción: del español al alemán", tipos: ["type_de", "cloze_type", "plural"], filtro: (it) => it.t !== "g" },
  frases: { titulo: "Frases", emoji: "🧩", desc: "Ordena y completa frases reales", tipos: ["order", "cloze_mc", "cloze_type"], filtro: (it) => it.t !== "g" && !!it.exTarget },
};

/* ---------- Examen para saltar unidades ---------- */
function examenHasta(u) {
  const previas = C.unidades.filter((x) => x.i < u.i);
  if (!previas.length) return;
  const muestra = [];
  const porU = Math.max(1, Math.round(14 / previas.length));
  for (const x of previas.slice(-7)) muestra.push(...M.shuffle(x.lecciones.flatMap((l) => l.items)).slice(0, porU));
  const elegidas = M.shuffle(muestra).slice(0, 14);
  const repasos = elegidas.map((it) => ({ item: it, card: { s: 5, st: 2, reps: 3 } }));
  const s = new M.Sesion({ repasos, perf: 0.85, sinReintentos: true, conMatch: false });
  toast("Examen: responde sin ayuda. Necesitas 80% para saltar.", 3500);
  iniciar(s, { examen: { unidad: u.id } });
}
function terminarExamen(st, ex) {
  const u = C.unidades.find((x) => x.id === ex.unidad);
  const pct = st.total ? st.ok / st.total : 0;
  const aprobado = pct >= 0.8 && st.total >= 8;
  if (aprobado) saltarHasta(u);
  const d = dia(), xp = aprobado ? 20 : 5;
  d.xp += xp; d.ex += st.total; d.ok += st.ok; d.ms += Date.now() - st.inicio; d.ses++; P().xp += xp;
  const r = actualizarRacha();
  actualizarPronostico();
  guardarTodo();
  return {
    xp, total: st.total, ok: st.ok, ms: Date.now() - st.inicio, perfecto: false, racha: P().racha.n, rachaSube: r.sube, protectorUsado: r.usado,
    xpHoy: d.xp, meta: A().meta, nuevas: 0, repasos: 0, manana: 0, siguiente: aprobado ? infoSiguiente() : null,
    mensaje: aprobado ? `¡Aprobaste con ${Math.round(pct * 100)}%! Se desbloqueó «${u.titulo}». Las palabras anteriores entran a tus repasos poco a poco.` : `Sacaste ${Math.round(pct * 100)}%. Te conviene empezar un poco antes: así no se te escapan huecos.`,
  };
}
function saltarHasta(u) {
  const now = Date.now(), h = hoy();
  for (const n of NODOS) {
    if (n.unidad.i >= u.i) break;
    P().nodos[n.id] = P().nodos[n.id] || now;
    for (const it of n.items) {
      if (aprendida(it.id)) continue;
      const c = M.programar(null, 4, now, { retencion: A().retencion });
      c.due = h + 2 + Math.floor(Math.random() * 30);   // se reparten para no tener cientos de repasos el mismo día
      S.cards[it.id] = c;
    }
  }
}

/* ============================ Pantallas ============================ */
const app = () => $("#app");
function ruta() { const [v, ...r] = (location.hash || "#hoy").slice(1).split("/"); return { v: v || "hoy", arg: decodeURIComponent(r.join("/")) }; }
function conNav(on) { document.body.classList.toggle("sin-nav", !on); }

function render() {
  if (S.enSesion) return;
  if (!S.perfil) return;
  if (!P().onboarding) return pintarOnboarding();
  conNav(true);
  app().onclick = null;
  const r = ruta();
  const vistas = { hoy: vHoy, ruta: vRuta, practicar: vPracticar, palabras: vPalabras, yo: vYo, ajustes: vAjustes, ciencia: vCiencia, gramatica: vGramatica, lecturas: vLecturas, lectura: vLectura };
  const fn = vistas[r.v] || vHoy;
  app().innerHTML = fn(r.arg);
  const tab = { ajustes: "yo", ciencia: "yo", gramatica: "practicar", lecturas: "practicar", lectura: "practicar" }[r.v] || r.v;
  $$("#nav [data-nav]").forEach((b) => b.classList.toggle("on", b.dataset.nav === tab));
  if (montar[r.v]) montar[r.v](r.arg);
}
const montar = {};

function pintarCargando(msg = "") {
  conNav(false);
  app().innerHTML = `<div class="centro"><div class="logo-anim">${logo()}</div><p class="muted">${esc(msg)}</p></div>`;
}
function pintarError(msg) {
  conNav(false);
  app().innerHTML = `<div class="centro"><div class="logo-anim">${logo()}</div><h2>Algo falló</h2><p class="muted" style="max-width:420px">${esc(msg)}</p>
    <div class="pie-fila" style="max-width:420px;width:100%"><button class="btn sec" data-local>Usar sin cuenta</button><button class="btn primario" data-reint>Reintentar</button></div></div>`;
  $("[data-reint]").onclick = () => location.reload();
  $("[data-local]").onclick = () => entrarLocal();
}
const logo = () => `<img class="logo" src="icon-512.png" alt="" width="88" height="88">`;

/* ---------- Entrar ---------- */
const GOOGLE = `<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20"><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>`;
function pintarEntrar(modoCorreo = null) {
  conNav(false);
  const hayLocal = !!(ls.get(LOCAL, null) || {}).perfil;
  app().innerHTML = `
    <div class="entrar anim">
      <div class="entrar-hero">
        ${DECO}${DECO.replace('class="deco"', 'class="deco izq"')}
        <div class="hero-marca"><img class="logo chico" src="icon-512.png" alt="" width="44" height="44"><b>Täglich</b></div>
        <div class="cartas" aria-hidden="true">
          <div class="carta c3"><span class="circ p-menta">🏠</span><div><b class="g-n">das Haus</b><small>la casa</small></div><i>${I("audio")}</i></div>
          <div class="carta c2"><span class="circ p-rosa">🐈</span><div><b class="g-f">die Katze</b><small>el gato</small></div><i>${I("audio")}</i></div>
          <div class="carta c1"><span class="circ p-cielo">🐕</span><div><b class="g-m">der Hund</b><small>el perro</small></div><i>${I("audio")}</i><em><s style="width:72%"></s></em></div>
        </div>
      </div>
      <div class="entrar-hoja">
        <h1>Aprende alemán<br>todos los días</h1>
        <p class="lema">Repetición espaciada, dificultad que se adapta a ti y ejercicios de escuchar, escribir y hablar. ${C.vocab.length} palabras del A1 al B1.</p>
        <div class="feats"><span>${I("repetir")} Repaso espaciado</span><span>${I("diana")} Zona del 85%</span><span>${I("mic")} Voz</span></div>
        ${modoCorreo ? formCorreo(modoCorreo) : `
        <div class="entrar-acc">
          <button class="btn primario ancho g-btn" data-a="google" ${S.fbError ? "disabled" : ""}>${GOOGLE}<span>Entrar con Google</span></button>
          <button class="btn sec ancho" data-a="correo" ${S.fbError ? "disabled" : ""}>Entrar con correo</button>
          <button class="link" data-a="local">${hayLocal ? "Seguir sin cuenta (en este dispositivo)" : "Probar sin cuenta"}</button>
        </div>
        ${S.fbError ? `<p class="aviso">No se pudo conectar con Firebase. Revisa tu internet; mientras tanto puedes usarla sin cuenta.</p>` : ""}`}
        <p class="mini">Tu progreso se guarda en tu cuenta y solo tú puedes verlo.</p>
      </div>
    </div>`;
  const root = app();
  root.onclick = async (e) => {
    const a = e.target.closest("[data-a]"); if (!a) return;
    const k = a.dataset.a;
    if (k === "google") loginGoogle();
    else if (k === "correo") pintarEntrar("entrar");
    else if (k === "local") entrarLocal();
    else if (k === "crear") pintarEntrar("crear");
    else if (k === "yaTengo") pintarEntrar("entrar");
    else if (k === "volver") pintarEntrar();
    else if (k === "olvide") olvideContrasena();
  };
  const f = $("#formCorreo");
  if (f) f.onsubmit = (e) => { e.preventDefault(); loginCorreo(modoCorreo, f); };
}
function formCorreo(modo) {
  return `<form id="formCorreo" class="form-correo">
    ${modo === "crear" ? `<label>Tu nombre<input name="nombre" autocomplete="given-name" required maxlength="40"></label>` : ""}
    <label>Correo<input name="email" type="email" autocomplete="email" required></label>
    <label>Contraseña<input name="pass" type="password" autocomplete="${modo === "crear" ? "new-password" : "current-password"}" required minlength="6"></label>
    <button class="btn primario ancho" type="submit">${modo === "crear" ? "Crear cuenta" : "Entrar"}</button>
    <div class="fila-links">
      ${modo === "crear" ? `<button type="button" class="link" data-a="yaTengo">Ya tengo cuenta</button>` : `<button type="button" class="link" data-a="crear">Crear cuenta nueva</button><button type="button" class="link" data-a="olvide">Olvidé mi contraseña</button>`}
    </div>
    <button type="button" class="link muted" data-a="volver">← Otras formas de entrar</button>
  </form>`;
}
const ERRORES_AUTH = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.", "auth/wrong-password": "Contraseña incorrecta.", "auth/user-not-found": "No hay una cuenta con ese correo.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Entra con ella.", "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/invalid-email": "Ese correo no es válido.", "auth/too-many-requests": "Demasiados intentos. Espera un momento.", "auth/network-request-failed": "Sin conexión. Revisa tu internet.",
  "auth/operation-not-allowed": "Falta activar «Correo electrónico/contraseña» en Firebase → Authentication → Sign-in method.",
  "auth/unauthorized-domain": "Falta autorizar este sitio en Firebase → Authentication → Settings → Authorized domains.",
};
async function loginGoogle() {
  if (!(await cargarFirebase())) { S.fbError = true; return pintarEntrar(); }
  const prov = new FB.a.GoogleAuthProvider();
  try { await FB.a.signInWithPopup(FB.auth, prov); }
  catch (e) {
    if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) FB.a.signInWithRedirect(FB.auth, prov);
    else if (e && !["auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(e.code)) toast(ERRORES_AUTH[e.code] || "No se pudo iniciar sesión.", 5000);
  }
}
async function loginCorreo(modo, f) {
  if (!(await cargarFirebase())) { S.fbError = true; return pintarEntrar(); }
  const email = f.email.value.trim(), pass = f.pass.value;
  const btn = f.querySelector("[type=submit]"); btn.disabled = true;
  try {
    if (modo === "crear") {
      const cred = await FB.a.createUserWithEmailAndPassword(FB.auth, email, pass);
      const nombre = f.nombre.value.trim();
      if (nombre) { await FB.a.updateProfile(cred.user, { displayName: nombre }); if (S.perfil) S.perfil.nombre = nombre; }
    } else await FB.a.signInWithEmailAndPassword(FB.auth, email, pass);
  } catch (e) { btn.disabled = false; toast(ERRORES_AUTH[e && e.code] || "No se pudo: " + ((e && e.code) || "error"), 5000); }
}
async function olvideContrasena() {
  const f = $("#formCorreo"); const email = f && f.email.value.trim();
  if (!email) { toast("Escribe tu correo primero."); return; }
  try { await FB.a.sendPasswordResetEmail(FB.auth, email); toast("Te mandamos un correo para cambiar tu contraseña.", 4000); }
  catch (e) { toast(ERRORES_AUTH[e && e.code] || "No se pudo mandar el correo.", 4500); }
}

/* ---------- Primeros pasos ---------- */
const MOTIVOS = [["viajar", "✈️", "Viajar"], ["trabajo", "💼", "Trabajo"], ["estudiar", "🎓", "Estudiar"], ["vivir", "🏠", "Vivir allá"], ["familia", "❤️", "Pareja o familia"], ["gusto", "🧠", "Por gusto"]];
const METAS = [[20, "Relajada", "5 min al día"], [40, "Normal", "10 min al día"], [60, "Seria", "15 min al día"], [100, "Intensa", "20+ min al día"]];
const MOMENTOS = [["despertar", "☀️", "Al despertar"], ["cafe", "☕", "Con el café"], ["transporte", "🚇", "En el transporte"], ["comida", "🍽️", "A la hora de comer"], ["trabajo", "🏃", "Al salir del trabajo"], ["dormir", "🌙", "Antes de dormir"]];
const NIVEL_INICIO = [["cero", "🌱", "Desde cero", "No sé nada de alemán", null], ["basico", "🙂", "Sé lo básico", "Saludos, números, presentarme", "u04"], ["a1", "💬", "Ya me defiendo", "Terminé un curso A1", "u11"], ["a2", "🚀", "Nivel intermedio", "Tengo un A2", "u19"]];
function pintarOnboarding() {
  conNav(false);
  const ob = S.ob || (S.ob = { paso: 0, motivo: "", nivel: "cero", meta: 40, momento: "", hora: "20:00", nombre: P().nombre || "" });
  const opcion = (campo, k, e, t, sub) => {
    const on = String(ob[campo]) === String(k);
    return `<button class="opcion ${sub ? "fila" : ""} ${on ? "on" : ""}" data-ob="${campo}" data-v="${k}"><span class="op-emoji">${e}</span>${sub ? `<div><b>${t}</b><small>${sub}</small></div>` : `<b>${t}</b>`}<span class="op-check">${I("check")}</span></button>`;
  };
  const pasos = [
    () => `<h2>¡Hallo${ob.nombre ? ", " + esc(ob.nombre) : ""}! 👋<br>¿Para qué quieres el alemán?</h2><p class="muted">Tener un motivo claro te ayuda a no dejarlo.</p>
      ${!P().nombre ? `<label class="campo-ob">¿Cómo te llamas?<input id="obNombre" value="${esc(ob.nombre)}" maxlength="30" autocomplete="given-name"></label>` : ""}
      <div class="opciones-grid">${MOTIVOS.map(([k, e, t]) => opcion("motivo", k, e, t)).join("")}</div>`,
    () => `<h2>¿Cuánto alemán sabes?</h2><p class="muted">Si ya sabes algo, un examen corto te deja saltar lo que ya dominas.</p>
      <div class="opciones-lista">${NIVEL_INICIO.map(([k, e, t, d]) => opcion("nivel", k, e, t, d)).join("")}</div>`,
    () => `<h2>Tu meta diaria</h2><p class="muted">Mejor poco todos los días que mucho de vez en cuando: el repaso espaciado necesita constancia.</p>
      <div class="opciones-lista">${METAS.map(([xp, t, d]) => opcion("meta", xp, xp === 20 ? "🐢" : xp === 40 ? "🚶" : xp === 60 ? "🏃" : "🔥", t + (xp === 40 ? " · recomendada" : ""), `${d} · ${xp} XP`)).join("")}</div>`,
    () => `<h2>¿Cuándo vas a estudiar?</h2><p class="muted">Decidir de antemano <b>cuándo y dónde</b> (una «intención de implementación») casi duplica las probabilidades de cumplir un hábito.</p>
      <div class="opciones-grid">${MOMENTOS.map(([k, e, t]) => opcion("momento", k, e, t)).join("")}</div>
      <label class="campo-ob">¿A qué hora, más o menos?<input id="obHora" type="time" value="${esc(ob.hora)}"></label>
      ${ob.momento ? `<div class="plan-frase">${I("brillo")}<span>«${esc(fraseIntencion(ob.momento, ob.hora, ob.meta))}»</span></div>` : ""}`,
  ];
  const ultimo = ob.paso === pasos.length - 1;
  const puede = [ob.motivo, ob.nivel, ob.meta, ob.momento][ob.paso];
  app().innerHTML = `
    <div class="onb anim">
      <div class="onb-top">
        ${ob.paso ? `<button class="circ-btn" data-obnav="-1" aria-label="Atrás">${I("atras")}</button>` : `<span class="circ-btn fantasma" aria-hidden="true"></span>`}
        <div class="onb-puntos">${pasos.map((_, i) => `<i class="${i <= ob.paso ? "on" : ""}"></i>`).join("")}</div>
        <span class="onb-n">${ob.paso + 1}/${pasos.length}</span>
      </div>
      <div class="onb-cuerpo">${pasos[ob.paso]()}</div>
      <div class="onb-pie"><button class="btn primario ancho" data-obnav="1" ${puede ? "" : "disabled"}>${ultimo ? "¡Empezar!" : "Siguiente"} ${I("flechaR")}</button></div>
    </div>`;
  const root = app();
  const nom = $("#obNombre"); if (nom) nom.oninput = () => { ob.nombre = nom.value.trim(); };
  const hora = $("#obHora"); if (hora) hora.onchange = () => { ob.hora = hora.value || "20:00"; pintarOnboarding(); };
  root.onclick = (e) => {
    const o = e.target.closest("[data-ob]");
    if (o) { const v = o.dataset.v; ob[o.dataset.ob] = o.dataset.ob === "meta" ? +v : v; pintarOnboarding(); return; }
    const nav = e.target.closest("[data-obnav]");
    if (!nav || nav.disabled) return;
    if (+nav.dataset.obnav < 0) { ob.paso--; return pintarOnboarding(); }
    if (!ultimo) { ob.paso++; return pintarOnboarding(); }
    // Terminar
    Object.assign(P(), { onboarding: true, nombre: ob.nombre || P().nombre });
    Object.assign(A(), { meta: ob.meta });
    Object.assign(P().plan, { motivo: ob.motivo, momento: ob.momento, hora: ob.hora, tz: zona() });
    store.guardar();
    root.onclick = null;
    const destino = (NIVEL_INICIO.find((x) => x[0] === ob.nivel) || [])[4];
    S.ob = null;
    location.hash = "#hoy";
    render();
    if (destino) {
      const u = C.unidades.find((x) => x.id === destino);
      openSheet(`<h3>Examen para saltar</h3><p class="muted">Responde ${14} preguntas de las unidades 1 a ${u.i}. Con 80% o más empiezas directo en «${esc(u.titulo)}».</p>
        <div class="pie-fila"><button class="btn sec" data-close>Mejor desde el inicio</button><button class="btn primario" data-ex>Hacer el examen</button></div>`, (sh) => { sh.querySelector("[data-ex]").onclick = () => examenHasta(u); });
    } else empezarNodo(NODOS[0]);
  };
}
function fraseIntencion(momento, hora, meta) {
  const m = (MOMENTOS.find((x) => x[0] === momento) || [, , "En mi momento"])[2];
  const min = (METAS.find((x) => x[0] === meta) || [, , "10 min"])[2].split(" ")[0];
  return `${m}, como a las ${hora}, practico alemán ${min} minutos.`;
}

/* ---------- Hoy ---------- */
function saludo() { const h = new Date().getHours(); return h < 11 ? "Guten Morgen" : h < 18 ? "Guten Tag" : "Guten Abend"; }
function palabraDelDia() {
  const pool = C.vocab.filter((v) => v.t !== "g" && v.ex);
  const n = M.hashStr(hoyISO() + (P().nombre || "")) % pool.length;
  return pool[n];
}
const fmtFecha = (dn, o = { day: "numeric", month: "short" }) => new Date(dn * M.DAY).toLocaleDateString("es-MX", { ...o, timeZone: "UTC" });
function avatar() {
  const u = S.user;
  return u && u.photoURL ? `<img class="avatar" src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">` : `<span class="avatar">${esc((P().nombre || "?")[0].toUpperCase())}</span>`;
}
// Emojis de las palabras encimados en círculos (como las fotos de perfil de las referencias).
function pilaEmojis(items, max = 3) {
  const e = [...new Set(items.map((i) => i.emoji).filter(Boolean))];
  if (!e.length) return "<span></span>";
  return `<span class="pila">${e.slice(0, max).map((x) => `<i>${esc(x)}</i>`).join("")}${e.length > max ? `<b>+${e.length - max}</b>` : ""}</span>`;
}
// Gráfica de barras tipo píldora: una sola tinta, la barra actual resaltada y el valor arriba de cada una.
function barrasPildora(datos, aria) {
  const max = Math.max(1, ...datos.map((d) => d.v));
  return `<div class="pildoras" role="img" aria-label="${esc(aria)}">${datos.map((d) => {
    const h = d.v ? Math.max(24, Math.round((100 * d.v) / max)) : 0;
    return `<div class="pild ${d.hoy ? "hoy" : ""}" data-tip="${esc(d.tip || "")}"><div class="pild-pista"><div class="pild-val" style="height:${h}%"><b class="pild-badge">${d.v}</b>${d.dentro && h >= 45 ? `<span>${esc(d.dentro)}</span>` : ""}</div></div><small>${esc(d.et)}</small></div>`;
  }).join("")}</div>`;
}
const tituloNodo = (n) => (n.tipo === "lectura" ? (LECT[n.lectura] || {}).titulo || "Lectura" : n.titulo);
const emojiNodo = (n) => (n.tipo === "gramatica" ? GRAM[n.tema].emoji : n.tipo === "lectura" ? "📖" : (n.items[0] || {}).emoji || n.unidad.emoji);
const tipoNodo = (n) => (n.tipo === "gramatica" ? "Gramática" : n.tipo === "lectura" ? "Lectura" : "Lección");
function progresoUnidad(u) { const ns = u.nodos.map((x) => NODO[x.id]); return ns.filter(nodoCompleto).length / ns.length; }
function infoSiguiente() {
  const n = nodoActual(); if (!n) return null;
  return { emoji: emojiNodo(n), titulo: tituloNodo(n), sub: `${tipoNodo(n)} · Unidad ${n.unidad.i + 1}`, pastel: pastelNivel(n.unidad.nivel), prog: progresoUnidad(n.unidad) };
}
function tarjetaNodo(n) {
  const u = n.unidad, pend = n.items.filter((it) => !aprendida(it.id));
  const sub = n.tipo === "lectura" ? "Texto corto con audio y preguntas" : `${pend.length} ${n.tipo === "gramatica" ? "ejercicios" : pend.length === 1 ? "palabra nueva" : "palabras nuevas"} · ~${n.tipo === "gramatica" ? 4 : 5} min`;
  return `<button class="leccion-card ${pastelNivel(u.nivel)}" data-a="continuar">
    ${DECO}<span class="lc-marca" aria-hidden="true">${esc(u.emoji)}</span>
    <div class="lc-top">${circ(esc(emojiNodo(n)))}<span class="chip-b">${I("estrella")} ${u.nivel}</span></div>
    <span class="lc-cat">${tipoNodo(n)} · Unidad ${u.i + 1}: ${esc(u.titulo)}</span>
    <b class="lc-tit">${esc(tituloNodo(n))}</b>
    <span class="lc-sub">${esc(sub)}</span>
    <div class="lc-pie">${n.tipo === "leccion" ? pilaEmojis(pend.length ? pend : n.items) : `<span class="lc-nota">${I("brillo")} ${n.tipo === "gramatica" ? "Explicación + práctica" : "Lee, escucha y responde"}</span>`}${flechaAnillo(progresoUnidad(u))}</div>
  </button>`;
}
function tarjetaRepaso(lista) {
  const due = lista.length, urg = due >= 5;
  return `<button class="leccion-card ${urg ? "p-mantequilla" : "p-arena"}" data-a="repasar">
    ${DECO}<span class="lc-marca" aria-hidden="true">🧠</span>
    <div class="lc-top">${circ(I("repetir"))}<span class="chip-b">${I("reloj")} ${due}</span></div>
    <span class="lc-cat">Repaso inteligente</span>
    <b class="lc-tit">${due} ${due === 1 ? "palabra por repasar" : "palabras por repasar"}</b>
    <span class="lc-sub">${urg ? "Empieza por aquí: se te están empezando a olvidar." : "Repaso rápido de lo que toca hoy."}</span>
    <div class="lc-pie">${pilaEmojis(lista.map((r) => r.item).filter((x) => x.t !== "g"))}${flechaAnillo(null)}</div>
  </button>`;
}
function vHoy() {
  const d = dia(), meta = A().meta, racha = rachaVisible(), estudio = P().racha.ultimo === hoy();
  const vencidos = repasosVencidos(), due = vencidos.length;
  const n = nodoActual();
  const pal = palabraDelDia();
  const tip = CIENCIA[hoy() % CIENCIA.length];
  const semana = [...Array(7).keys()].map((k) => {
    const dn = hoy() - 6 + k, xp = (P().dias[M.dayISO(dn)] || {}).xp || 0;
    return { et: ["D", "L", "M", "M", "J", "V", "S"][new Date(dn * M.DAY).getUTCDay()], v: xp, hoy: dn === hoy(), tip: `${dn === hoy() ? "Hoy" : fmtFecha(dn, { weekday: "long", day: "numeric" })}: ${xp} XP` };
  });
  const xpSemana = semana.reduce((t, x) => t + x.v, 0), diasSemana = semana.filter((x) => x.v > 0).length;
  const nombre = P().nombre;
  return `<div class="wrap">
    <header class="cab">
      ${avatar()}
      <div class="cab-txt"><b>${saludo()}${nombre ? ", " + esc(nombre) : ""}</b>
        <span class="cab-meta" title="Meta de hoy">${I("libro")}<span class="cab-barra"><i style="width:${Math.min(100, (100 * d.xp) / meta)}%"></i></span><small>${d.xp}/${meta} XP</small></span></div>
      <button class="circ-btn racha ${estudio ? "on" : ""}" data-go="#yo" aria-label="Racha de ${racha} días">${I("fuego")}<b>${racha}</b></button>
    </header>
    <div class="titulo-fila"><h1 class="titulo">Tu progreso<br>de hoy</h1><button class="circ-btn grande" data-go="#palabras" aria-label="Buscar palabras">${I("buscar")}</button></div>
    ${due >= 5 ? tarjetaRepaso(vencidos) : ""}
    ${n ? tarjetaNodo(n) : `<section class="leccion-card p-mantequilla">${DECO}<div class="lc-top">${circ("🏆")}</div><b class="lc-tit">¡Terminaste toda la ruta!</b><span class="lc-sub">Sigue con los repasos diarios para no olvidar nada.</span></section>`}
    ${due && due < 5 ? tarjetaRepaso(vencidos) : ""}
    <div class="grid2">
      <button class="tile p-mantequilla" data-go="#yo">${DECO}<span class="tile-top">${circ(I("fuego"))}<span>Racha</span></span><b class="tile-num">${racha}</b><span class="tile-sub">${racha === 1 ? "día de racha" : "días de racha"}</span>${flechaDiag()}</button>
      <button class="tile p-cielo" data-go="#yo">${DECO}<span class="tile-top">${circ(I("rayo"))}<span>${d.xp >= meta ? "¡Meta lista!" : "Hoy"}</span></span><b class="tile-num">${d.xp}</b><span class="tile-sub">de ${meta} XP hoy</span>${flechaDiag()}</button>
    </div>
    <section class="bloque">
      <div class="bloque-cab">${circ(I("grafica"), "sm")}<h2>Esta semana</h2><span class="bloque-dato">${xpSemana} XP · ${diasSemana}/7 días</span></div>
      <div class="card pild-card">${barrasPildora(semana, "XP por día esta semana")}</div>
    </section>
    ${pal ? `<section class="card palabra-dia">${DECO}
      <div class="lc-top">${circ(esc(pal.emoji), pastelGenero(pal))}<span class="chip-b suave">${I("brillo")} Palabra del día</span></div>
      <div class="pd-de">${htmlPalabra(pal)} ${botonAudio(M.conArticulo(pal))}</div><div class="pd-es">${esc(pal.es)}</div>
      <button class="pd-ej" data-say="${esc(pal.ex)}"><b>${esc(pal.ex)}</b><i>${esc(pal.exEs)}</i></button>
    </section>` : ""}
    <div class="grid2">
      <button class="tile p-menta" data-go="#practicar">${DECO}<span class="tile-top">${circ(I("practicar"))}<span>Practicar</span></span><b class="tile-txt">Escuchar, hablar, der·die·das…</b>${flechaDiag()}</button>
      <button class="tile p-rosa" data-go="#lecturas">${DECO}<span class="tile-top">${circ(I("libro"))}<span>Lecturas</span></span><b class="tile-txt">${LECTURAS.length} textos con audio</b>${flechaDiag()}</button>
    </div>
    <section class="card ciencia-tip" data-go="#ciencia">
      <div class="lc-top">${circ(esc(tip.emoji), "p-arena")}<span class="chip-b suave">${I("ciencia")} ¿Por qué funciona?</span></div>
      <b>${esc(tip.titulo)}</b><p>${esc(tip.idea)}</p>
    </section>
  </div>`;
}
montar.hoy = () => tooltips();

/* ---------- Ruta ---------- */
const OFFSETS = [0, 42, 64, 42, 0, -42, -64, -42];
function vRuta() {
  const actual = idxActual();
  return `<div class="wrap ruta">
    <div class="titulo-fila"><div><div class="saludo">Tu camino del A1 al B1</div><h1 class="titulo">Ruta</h1></div><span class="chip-b grande">${I("estrella")} ${nivelUsuario().nivel}</span></div>
    ${C.unidades.map((u) => {
      const nodos = u.nodos.map((n) => NODO[n.id]);
      const hechos = nodos.filter(nodoCompleto).length;
      const bloqueada = nodos[0].idx > actual;
      return `<section class="unidad ${bloqueada ? "bloq" : ""}" id="${u.id}">
        <div class="leccion-card u-card ${pastelNivel(u.nivel)}">
          ${DECO}<span class="lc-marca" aria-hidden="true">${esc(u.emoji)}</span>
          <div class="lc-top">${circ(esc(u.emoji))}<span class="chip-b">${bloqueada ? I("candado") : I("estrella")} ${u.nivel}</span></div>
          <span class="lc-cat">Unidad ${u.i + 1}</span>
          <b class="lc-tit">${esc(u.titulo)}</b>
          <span class="lc-sub">${esc(u.desc)}</span>
          <div class="u-prog-fila"><span class="u-barra"><i style="width:${(100 * hechos) / nodos.length}%"></i></span><b>${hechos}/${nodos.length}</b></div>
          ${bloqueada ? `<button class="pill-btn" data-saltar="${u.id}">${I("rayo")} Examen para saltar aquí</button>` : ""}
        </div>
        <div class="camino">
          ${nodos.map((n, k) => {
            const est = nodoCompleto(n) ? "hecho" : n.idx === actual ? "actual" : n.idx < actual ? "hecho" : "bloq";
            return `<div class="nodo-wrap" style="--x:${OFFSETS[k % OFFSETS.length]}px">
              ${est === "actual" ? `<div class="nodo-globo">¡Aquí vas!</div>` : ""}
              <button class="nodo ${est} t-${n.tipo}" data-nodo="${n.id}" aria-label="${esc(tituloNodo(n))}">
                <span class="nodo-ico">${est === "bloq" ? I("candado") : esc(emojiNodo(n))}</span>${est === "hecho" ? `<span class="nodo-ok">${I("check")}</span>` : ""}
              </button>
              <div class="nodo-tit">${esc(tituloNodo(n))}</div>
            </div>`;
          }).join("")}
        </div>
      </section>`;
    }).join("")}
  </div>`;
}
montar.ruta = () => {
  const act = $(".nodo.actual");
  if (act) setTimeout(() => act.scrollIntoView({ block: "center" }), 30);
};
function abrirNodo(id) {
  const n = NODO[id]; if (!n) return;
  const est = nodoCompleto(n) ? "hecho" : n.idx === idxActual() ? "actual" : n.idx < idxActual() ? "hecho" : "bloq";
  const tipo = n.tipo === "gramatica" ? "Gramática" : n.tipo === "lectura" ? "Lectura" : "Lección";
  let cuerpo = "";
  if (n.tipo === "leccion") cuerpo = `<div class="prev-pal">${n.items.map((it) => `<button class="pp ${aprendida(it.id) ? "ok" : ""}" data-palabra="${it.id}"><span>${esc(it.emoji)}</span>${htmlPalabra(it)}<small>${esc(it.es)}</small></button>`).join("")}</div>`;
  else if (n.tipo === "gramatica") cuerpo = `<p class="muted">${n.items.length} ejercicios · ${n.items.filter((d) => aprendida(d.id)).length} hechos</p><button class="link" data-vergram="${n.tema}">Leer la explicación</button>`;
  else cuerpo = `<p class="muted">${esc((LECT[n.lectura] || {}).titulo || "")} · ${(LECT[n.lectura] || {}).nivel || ""}</p>`;
  openSheet(`
    <div class="hoja-cab"><small>${tipo} · Unidad ${n.unidad.i + 1}</small><h3>${esc(n.tipo === "lectura" ? (LECT[n.lectura] || {}).titulo || "Lectura" : n.titulo)}</h3></div>
    ${cuerpo}
    <div class="pie-fila">
      ${est === "bloq" ? `<button class="btn sec ancho" data-close>Primero termina las anteriores</button>` : est === "hecho" ? `<button class="btn primario ancho" data-empezar="rep">${n.tipo === "lectura" ? "Leer otra vez" : "Practicar otra vez"}</button>` : `<button class="btn primario ancho" data-empezar="1">Empezar</button>`}
    </div>`, (sh) => {
    sh.onclick = (e) => {
      const b = e.target.closest("[data-empezar]");
      if (b) { closeSheet(); empezarNodo(n, { repasar: b.dataset.empezar === "rep" }); return; }
      const p = e.target.closest("[data-palabra]"); if (p) { abrirPalabra(p.dataset.palabra); return; }
      const g = e.target.closest("[data-vergram]"); if (g) { closeSheet(); location.hash = "#gramatica/" + g.dataset.vergram; }
    };
  });
}

/* ---------- Practicar ---------- */
const COLOR_MODO = { errores: "p-rosa", escuchar: "p-cielo", hablar: "p-mantequilla", articulos: "p-menta", verbos: "p-cielo", escribir: "p-rosa", frases: "p-menta" };
function vPracticar() {
  const due = repasosVencidos().length;
  const total = aprendidas().length;
  const filas = Object.entries(MODOS).filter(([k]) => k !== "hablar" || Oido.ok).map(([k, m]) => {
    const lista = aprendidas(m.filtro), n = lista.length, poco = n < (m.min || 3);
    const fuerza = n ? lista.reduce((t, x) => t + x.R, 0) / n : 0;
    return `<button class="modo-fila ${poco ? "poco" : ""}" data-modo="${k}" ${poco ? "data-poco=1" : ""}>
      <span class="mf-ico ${COLOR_MODO[k]}">${m.emoji}</span>
      <span class="mf-txt"><b>${esc(m.titulo)}</b><small>${poco ? (k === "errores" ? "Sin errores recientes 🎉" : "Aprende más palabras para desbloquear") : `${n} ${n === 1 ? "palabra" : "palabras"} · recuerdas ${Math.round(fuerza * 100)}%`}</small>
        <span class="mf-barra"><i style="width:${Math.round(fuerza * 100)}%"></i></span></span>
      <span class="flecha-negra">${poco ? I("candado") : I("flechaR")}</span>
    </button>`;
  }).join("");
  return `<div class="wrap">
    <div class="titulo-fila"><div><div class="saludo">${total} ${total === 1 ? "palabra aprendida" : "palabras aprendidas"}</div><h1 class="titulo">Practicar</h1></div><button class="circ-btn grande" data-go="#palabras" aria-label="Palabras">${I("palabras")}</button></div>
    <button class="banner" data-a="repasar">${DECO}
      <span class="banner-txt"><small>${I("repetir")} Repaso inteligente</small><b>${due ? `${due} ${due === 1 ? "repaso pendiente" : "repasos pendientes"}` : "¡Estás al día!"}</b><span>${due ? "Según tu curva del olvido, estas son las que tocan hoy." : "Practica las que más se te están olvidando."}</span></span>
      <span class="pill-oscuro">Empezar</span>
    </button>
    <div class="bloque-cab">${circ(I("diana"), "sm")}<h2>Entrena una habilidad</h2></div>
    <div class="lista-modos">${filas}</div>
    <div class="bloque-cab">${circ(I("libro"), "sm")}<h2>Aprender más</h2></div>
    <div class="grid2">
      <button class="tile p-cielo" data-go="#gramatica">${DECO}<span class="tile-top">${circ(I("gramatica"))}<span>Gramática</span></span><b class="tile-num">${Object.keys(GRAM).length}</b><span class="tile-sub">temas explicados</span>${flechaDiag()}</button>
      <button class="tile p-rosa" data-go="#lecturas">${DECO}<span class="tile-top">${circ(I("libro"))}<span>Lecturas</span></span><b class="tile-num">${LECTURAS.length}</b><span class="tile-sub">textos con audio</span>${flechaDiag()}</button>
    </div>
  </div>`;
}

/* ---------- Gramática ---------- */
function vGramatica(id) {
  const g = GRAM[id];
  if (!g) {
    return `<div class="wrap">
      <header class="top"><button class="atras" data-go="#practicar">${I("atras")}</button><div><div class="saludo">A1 → B1</div><h1>Gramática</h1></div></header>
      ${NIVELES.map((nv) => `<h3 class="sec-tit">${nv}</h3><div class="lista">${Object.values(GRAM).filter((t) => t.nivel === nv).map((t) => {
        const hechos = t.items.filter((d) => aprendida(d.id)).length;
        return `<button class="fila" data-go="#gramatica/${t.id}"><span class="f-emoji">${esc(t.emoji)}</span><span class="f-txt"><b>${esc(t.titulo)}</b><small>${hechos}/${t.items.length} ejercicios</small></span><span class="mini-barra"><i style="width:${(100 * hechos) / Math.max(1, t.items.length)}%"></i></span></button>`;
      }).join("")}</div>`).join("")}
    </div>`;
  }
  const hechos = g.items.filter((d) => aprendida(d.id)).length;
  return `<div class="wrap">
    <header class="top"><button class="atras" data-go="#gramatica">${I("atras")}</button><div><div class="saludo">Gramática · ${g.nivel}</div><h1>${esc(g.emoji)} ${esc(g.titulo)}</h1></div></header>
    <article class="card gram">${g.html}</article>
    <button class="btn primario ancho" data-practgram="${g.id}">${hechos < g.items.length ? `Practicar (${g.items.length - hechos} nuevos)` : "Repasar este tema"}</button>
  </div>`;
}
function practicarGramatica(id) {
  const g = GRAM[id];
  const nuevos = g.items.filter((d) => !aprendida(d.id)).slice(0, 8);
  const viejos = g.items.filter((d) => aprendida(d.id)).map((d) => ({ item: d, card: S.cards[d.id] }));
  const repasos = nuevos.length ? M.shuffle(viejos).slice(0, 3) : M.shuffle(viejos).slice(0, 10);
  iniciar(new M.Sesion({ nuevos, repasos, perf: S.perf }));
}

/* ---------- Lecturas ---------- */
function vLecturas() {
  return `<div class="wrap">
    <header class="top"><button class="atras" data-go="#practicar">${I("atras")}</button><div><div class="saludo">Input comprensible</div><h1>Lecturas</h1></div></header>
    <p class="muted">Lee un poquito por encima de tu nivel. Toca cualquier palabra para ver qué significa y escucha el texto en voz alta.</p>
    ${NIVELES.map((nv) => `<h3 class="sec-tit">${nv}</h3><div class="lista">${LECTURAS.filter((l) => l.nivel === nv).map((l) => {
      const leida = !!P().nodos["l-" + l.id];
      return `<button class="fila" data-go="#lectura/${l.id}"><span class="f-emoji">${esc(l.emoji)}</span><span class="f-txt"><b>${esc(l.titulo)}</b><small>${l.frases.length} frases · ${l.preguntas.length} preguntas</small></span>${leida ? `<span class="ok-badge">${I("check")}</span>` : I("flecha")}</button>`;
    }).join("")}</div>`).join("")}
  </div>`;
}
function tokensFrase(f) {
  return f.split(/(\s+)/).map((t) => {
    if (/^\s+$/.test(t)) return t;
    const m = t.match(/^([„“"«(¿¡]*)(.*?)([.,!?;:“”"»)…–-]*)$/);
    const [, a, w, b] = m || [null, "", t, ""];
    return w ? `${esc(a)}<span class="w" data-w="${esc(w)}">${esc(w)}</span>${esc(b)}` : esc(t);
  }).join("");
}
function vLectura(id) {
  const l = LECT[id];
  if (!l) return vLecturas();
  return `<div class="wrap lectura">
    <header class="top"><button class="atras" data-go="#lecturas">${I("atras")}</button><div><div class="saludo">Lectura · ${l.nivel}</div><h1>${esc(l.emoji)} ${esc(l.titulo)}</h1></div></header>
    <div class="lect-barra">
      <button class="btn sec chico" data-a="leerTodo">${I("audio")} Escuchar</button>
      <button class="btn sec chico" data-a="leerLento">${I("tortuga")} Lento</button>
      <label class="switch"><input type="checkbox" id="verTrad"><span>Traducción</span></label>
    </div>
    <article class="card texto" id="texto">
      ${l.frases.map(([de, es], i) => `<div class="frase" data-fi="${i}"><p>${tokensFrase(de)} <button class="mini-audio" data-say="${esc(de)}" aria-label="Escuchar frase">${I("audio")}</button></p><p class="trad">${esc(es)}</p></div>`).join("")}
    </article>
    <h3 class="sec-tit">¿Entendiste?</h3>
    <div id="preguntas">${l.preguntas.map((p, i) => `<div class="card pregunta" data-pq="${i}"><b>${esc(p.q)}</b><div class="ops">${p.opts.map((o, j) => `<button class="op" data-resp="${i}:${j}"><span class="op-t">${esc(o)}</span></button>`).join("")}</div></div>`).join("")}</div>
    <div id="lectFin"></div>
  </div>`;
}
montar.lectura = (id) => {
  const l = LECT[id]; if (!l) return;
  const t0 = Date.now(), resp = {};
  const chk = $("#verTrad");
  chk.onchange = () => $("#texto").classList.toggle("con-trad", chk.checked);
  const root = app();
  let leyendo = false;
  const leer = (lento) => {
    if (leyendo) { Voz.parar(); leyendo = false; $$(".frase.leyendo").forEach((f) => f.classList.remove("leyendo")); return; }
    leyendo = true;
    const paso = (i) => {
      $$(".frase.leyendo").forEach((f) => f.classList.remove("leyendo"));
      if (!leyendo || i >= l.frases.length) { leyendo = false; return; }
      const el = $(`.frase[data-fi="${i}"]`); el.classList.add("leyendo");
      Voz.hablar(l.frases[i][0], { lento, fin: () => setTimeout(() => paso(i + 1), 250) });
    };
    paso(0);
  };
  root.onclick = (e) => {
    const a = e.target.closest("[data-a]");
    if (a && a.dataset.a === "leerTodo") return leer(false);
    if (a && a.dataset.a === "leerLento") return leer(true);
    const w = e.target.closest("[data-w]");
    if (w) return glosa(w.dataset.w, l);
    const r = e.target.closest("[data-resp]");
    if (r && !r.disabled) {
      const [qi, oi] = r.dataset.resp.split(":").map(Number);
      const p = l.preguntas[qi];
      const cont = r.closest(".pregunta");
      $$("[data-resp]", cont).forEach((b, j) => { b.disabled = true; if (j === p.a) b.classList.add("bien"); else if (j === oi) b.classList.add("mal"); });
      resp[qi] = oi === p.a;
      if (resp[qi]) Sonido.bien(); else Sonido.mal();
      if (Object.keys(resp).length === l.preguntas.length) {
        const ok = Object.values(resp).filter(Boolean).length;
        const primera = !P().nodos["l-" + l.id];
        P().nodos["l-" + l.id] = P().nodos["l-" + l.id] || Date.now();
        const xp = primera ? 10 + ok * 2 : 4 + ok;
        const rr = sumarActividad(xp, Date.now() - t0);
        $("#lectFin").innerHTML = `<section class="card fin-lect"><b>${ok}/${l.preguntas.length} correctas · +${xp} XP</b><p class="muted">${rr.sube ? "¡Racha +1! " : ""}${ok === l.preguntas.length ? "Comprensión perfecta. 🎉" : "Vuelve a leer las frases de las preguntas que fallaste."}</p>
          <button class="btn primario ancho" data-go="${nodoActual() && nodoActual().tipo !== "lectura" ? "#hoy" : "#lecturas"}">Continuar</button></section>`;
        if (ok === l.preguntas.length) confeti();
      }
    }
  };
};
function glosa(palabra, l) {
  const k = M.norm(palabra);
  const g = l && l.glosario ? (l.glosario[k] || l.glosario[palabra.toLowerCase()]) : null;
  const it = LEX.get(k) || LEX.get(M.norm(palabra.replace(/(e|en|er|es|em|n|s)$/i, ""))) || null;
  Voz.hablar(palabra);
  openSheet(`<div class="glosa">
    <div class="glosa-de">${esc(palabra)} ${botonAudio(palabra)}</div>
    ${g ? `<div class="glosa-es">${esc(g)}</div>` : ""}
    ${it ? `<div class="glosa-it"><span>${esc(it.emoji)}</span>${htmlPalabra(it)} <small>= ${esc(it.es)}</small></div><button class="link" data-palabra="${it.id}">Ver la palabra completa</button>` : ""}
    ${!g && !it ? `<p class="muted">No tengo esta palabra en el diccionario. Mira la traducción de la frase.</p>` : ""}
  </div>`, (sh) => { sh.onclick = (e) => { const p = e.target.closest("[data-palabra]"); if (p) abrirPalabra(p.dataset.palabra); const s = e.target.closest("[data-say]"); if (s) Voz.hablar(s.dataset.say); }; });
}

/* ---------- Palabras ---------- */
const FILTROS = [["todas", "Todas"], ["aprendidas", "Aprendidas"], ["repasar", "Por repasar"], ["dificiles", "Difíciles"], ["der", "der"], ["die", "die"], ["das", "das"], ["verbos", "Verbos"]];
function filtrarPalabras() {
  const q = M.norm(S.busca), qs = M.sinAcentos(q), h = hoy();
  return C.vocab.filter((it) => {
    const c = S.cards[it.id];
    switch (S.filtro) {
      case "aprendidas": if (!c) return false; break;
      case "repasar": if (!c || c.due > h) return false; break;
      case "dificiles": if (!c || !(c.lapses > 0 || c.d > 7)) return false; break;
      case "der": if (it.t !== "n" || it.g !== "m") return false; break;
      case "die": if (it.t !== "n" || it.g !== "f") return false; break;
      case "das": if (it.t !== "n" || it.g !== "n") return false; break;
      case "verbos": if (it.t !== "v") return false; break;
    }
    if (!q) return true;
    return M.norm(it.de).includes(q) || M.sinUmlaut(M.norm(it.de)).includes(M.sinUmlaut(q)) || M.sinAcentos(M.norm(it.es + " " + (it.esAlt || []).join(" "))).includes(qs);
  });
}
function filaPalabra(it) {
  const c = S.cards[it.id];
  const R = c ? M.retencionActual(c) : 0;
  const est = !c ? `<span class="est nueva">Nueva</span>` : `<span class="ret" title="Recuerdo estimado hoy"><i style="width:${Math.round(R * 100)}%" class="${R < 0.8 ? "baja" : ""}"></i></span>`;
  return `<button class="fila" data-palabra="${it.id}"><span class="f-emoji ${pastelGenero(it)}">${esc(it.emoji)}</span><span class="f-txt">${htmlPalabra(it)}<small>${esc(it.es)}</small></span>${est}</button>`;
}
function vPalabras() {
  const lista = filtrarPalabras();
  const res = M.resumen(S.cards, hoy());
  return `<div class="wrap">
    <div class="titulo-fila"><div><div class="saludo">${res.total} de ${C.vocab.length} aprendidas</div><h1 class="titulo">Palabras</h1></div><span class="chip-b grande">${I("palabras")} ${C.vocab.length}</span></div>
    <div class="buscador">${I("buscar")}<input id="busca" type="search" placeholder="Buscar en alemán o español…" value="${esc(S.busca)}" autocomplete="off" autocapitalize="off" spellcheck="false"></div>
    <div class="chips-fila">${FILTROS.map(([k, t]) => `<button class="fchip ${S.filtro === k ? "on" : ""} ${["der", "die", "das"].includes(k) ? "g-" + { der: "m", die: "f", das: "n" }[k] : ""}" data-filtro="${k}">${t}</button>`).join("")}</div>
    <div class="lista" id="listaPal">${lista.slice(0, 200).map(filaPalabra).join("") || `<p class="muted centro-txt">No hay palabras con ese filtro.</p>`}</div>
    ${lista.length > 200 ? `<p class="muted centro-txt">… y ${lista.length - 200} más. Usa el buscador.</p>` : ""}
  </div>`;
}
montar.palabras = () => {
  const inp = $("#busca");
  inp.oninput = () => {
    S.busca = inp.value;
    const lista = filtrarPalabras();
    $("#listaPal").innerHTML = lista.slice(0, 200).map(filaPalabra).join("") || `<p class="muted centro-txt">No hay resultados.</p>`;
  };
};
function enDias(n) { return n <= 0 ? "hoy" : n === 1 ? "mañana" : n < 30 ? `en ${n} días` : n < 365 ? `en ${Math.round(n / 30)} ${Math.round(n / 30) === 1 ? "mes" : "meses"}` : `en ${(n / 365).toFixed(1)} años`; }
function abrirPalabra(id) {
  const it = C.porId.get(id); if (!it || it.t === "g") return;
  const c = S.cards[id];
  const regla = M.reglaGenero(it);
  let tabla = "";
  if (it.t === "v") {
    const f = M.presente(it.v);
    tabla = `<table class="tabla conj">${M.PRONOMBRES.map((p, i) => `<tr><td>${p}</td><td><b>${esc(M.conjugar(it.v, i))}</b></td></tr>`).join("")}${it.v.perf !== "—" ? `<tr><td>Perfekt</td><td><b>${esc(M.perfektDe(it.v))}</b></td></tr>` : ""}</table>`;
    void f;
  }
  openSheet(`<div class="ficha-pal">
    <div class="fp-emoji">${esc(it.emoji)}</div>
    <div class="fp-de">${htmlPalabra(it)}</div>
    <div class="fp-audios">${botonAudio(M.conArticulo(it))}${botonLento(M.conArticulo(it))}</div>
    <div class="fp-es">${esc([it.es, ...(it.esAlt || [])].join(" · "))}</div>
    ${it.t === "n" ? `<div class="fp-extra">${it.pl ? `Plural: <b class="g-pl">die ${esc(it.pl)}</b>` : it.g === "pl" ? "Solo en plural" : "Sin plural"}</div>` : ""}
    ${regla ? `<div class="tip genero g-${it.g}">🎨 ${esc(regla)}</div>` : ""}
    ${tabla}
    ${it.ex ? `<button class="intro-ej" data-say="${esc(it.ex)}">${I("audio")}<span><b>${esc(it.ex)}</b><i>${esc(it.exEs)}</i></span></button>` : ""}
    ${it.nota ? `<div class="tip">💡 ${esc(it.nota)}</div>` : ""}
    <div class="fp-srs">
      ${c ? `<div><small>Recuerdo hoy</small><b>${Math.round(M.retencionActual(c) * 100)}%</b></div><div><small>Próximo repaso</small><b>${enDias(c.due - hoy())}</b></div><div><small>Estabilidad</small><b>${c.s < 1 ? "<1" : Math.round(c.s)} ${Math.round(c.s) === 1 ? "día" : "días"}</b></div><div><small>Repasos · fallos</small><b>${c.reps} · ${c.lapses}</b></div>`
        : `<div class="ancho"><small>Todavía no la aprendes</small><b>Unidad ${it.u + 1}: ${esc(C.unidades[it.u].titulo)}</b></div>`}
    </div>
  </div>`, (sh) => { sh.onclick = (e) => { const s = e.target.closest("[data-say]"); if (s) Voz.hablar(s.dataset.say, { lento: !!s.dataset.lento }); }; });
  if (A().autoAudio) Voz.hablar(M.conArticulo(it));
}

/* ---------- Yo (estadísticas) ---------- */
function mapaCalor() {
  const semanas = 18, fin = hoy();
  const finSemana = fin + ((7 - new Date(fin * M.DAY).getUTCDay()) % 7);   // semanas de lunes a domingo
  const ini = finSemana - semanas * 7 + 1;
  const vals = [];
  for (let d = ini; d <= finSemana; d++) vals.push({ d, xp: d > fin ? null : ((P().dias[M.dayISO(d)] || {}).xp || 0) });
  const max = Math.max(1, ...vals.map((v) => v.xp || 0));
  const nivel = (x) => (x == null ? "fut" : !x ? 0 : x < max * 0.25 ? 1 : x < max * 0.5 ? 2 : x < max * 0.8 ? 3 : 4);
  const cols = [];
  for (let s = 0; s < semanas; s++) cols.push(vals.slice(s * 7, s * 7 + 7));
  const fmt = (d) => new Date(d * M.DAY).toLocaleDateString("es-MX", { day: "numeric", month: "short", timeZone: "UTC" });
  return `<div class="hm" role="img" aria-label="XP por día en las últimas ${semanas} semanas">
    ${cols.map((col) => `<div class="hm-col">${col.map((v) => `<i class="hm-c n${nivel(v.xp)}" data-tip="${v.xp == null ? "" : `${fmt(v.d)}: ${v.xp} XP`}"></i>`).join("")}</div>`).join("")}
  </div>
  <div class="leyenda"><span>Menos</span>${[0, 1, 2, 3, 4].map((n) => `<i class="hm-c n${n}"></i>`).join("")}<span>Más</span></div>`;
}
function graficaPronostico(res) {
  const vals = res.pronostico.slice(0, 14);
  vals[0] = res.pendientes;
  const max = Math.max(1, ...vals);
  const imax = vals.indexOf(Math.max(...vals));
  const dias = ["D", "L", "M", "M", "J", "V", "S"];
  return `<div class="barras" role="img" aria-label="Repasos de los próximos 14 días">
    ${vals.map((v, k) => {
      const dn = hoy() + k, f = new Date(dn * M.DAY);
      return `<div class="barra-col" data-tip="${k === 0 ? "Hoy" : k === 1 ? "Mañana" : f.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", timeZone: "UTC" })}: ${v} repasos">
        <span class="barra-val">${k === 0 || k === imax ? v : ""}</span>
        <i class="barra" style="height:${v ? Math.max(4, (100 * v) / max) : 0}%"></i>
        <span class="barra-et ${k === 0 ? "hoy" : ""}">${k === 0 ? "hoy" : dias[f.getUTCDay()]}</span>
      </div>`;
    }).join("")}
  </div>`;
}
function barraEstados(res) {
  const nuevas = C.vocab.length + Object.values(GRAM).reduce((s, g) => s + g.items.length, 0) - res.total;
  const partes = [["Por aprender", nuevas, "e0"], ["Aprendiendo", res.aprendiendo, "e1"], ["Jóvenes (<21 días)", res.jovenes, "e2"], ["Dominadas (21+ días)", res.maduras, "e3"]];
  const tot = partes.reduce((s, p) => s + p[1], 0) || 1;
  return `<div class="estados">${partes.filter((p) => p[1]).map(([t, n, c]) => `<i class="${c}" style="flex:${n}" data-tip="${t}: ${n}"></i>`).join("")}</div>
    <div class="leyenda-est">${partes.map(([t, n, c]) => `<span><i class="${c}"></i>${t} <b>${n}</b></span>`).join("")}</div>`;
  void tot;
}
function vYo() {
  const res = M.resumen(S.cards, hoy());
  const lv = nivelUsuario();
  const dias = Object.entries(P().dias);
  const ult30 = dias.filter(([k]) => M.isoDay(k) > hoy() - 30);
  const rev = ult30.reduce((t, [, d]) => t + (d.rev || 0), 0), revOk = ult30.reduce((t, [, d]) => t + (d.revOk || 0), 0);
  const horas = dias.reduce((t, [, d]) => t + (d.ms || 0), 0) / 3600000;
  const tipos = Object.entries(P().tipos).filter(([, [, n]]) => n >= 3).map(([k, [ok, n]]) => ({ k, p: ok / n, n })).sort((a, b) => b.n - a.n).slice(0, 8);
  const dificiles = Object.entries(S.cards).filter(([, c]) => c.lapses > 0 || c.d >= 6).sort((a, b) => b[1].lapses - a[1].lapses || b[1].d - a[1].d).slice(0, 6).map(([id]) => C.porId.get(id)).filter((x) => x && x.t !== "g");
  const semanas = [...Array(6).keys()].map((k) => {
    const fin = hoy() - (5 - k) * 7;
    let xp = 0;
    for (let x = fin - 6; x <= fin; x++) xp += (P().dias[M.dayISO(x)] || {}).xp || 0;
    return { et: k === 5 ? "Esta" : fmtFecha(fin - 6), v: xp, hoy: k === 5, dentro: "XP", tip: `${fmtFecha(fin - 6)} – ${fmtFecha(fin)}: ${xp} XP` };
  });
  return `<div class="wrap">
    <header class="cab">${avatar()}<div class="cab-txt"><b>${esc(P().nombre || "Tú")}</b><small class="muted">${S.modo === "nube" ? esc((S.user && S.user.email) || "Cuenta") : "Solo en este dispositivo"}</small></div>
      <button class="circ-btn" data-go="#ajustes" aria-label="Ajustes">${I("ajustes")}</button></header>
    <div class="titulo-fila"><h1 class="titulo">Tu<br>aprendizaje</h1><span class="chip-b grande">${I("estrella")} ${lv.nivel}</span></div>
    <div class="grid2">
      <button class="tile p-menta" data-go="#palabras">${DECO}<span class="tile-top">${circ(I("palabras"))}<span>Palabras</span></span><b class="tile-num">${res.total}</b><span class="tile-sub">aprendidas</span>${flechaDiag()}</button>
      <button class="tile p-mantequilla" data-go="#hoy">${DECO}<span class="tile-top">${circ(I("reloj"))}<span>${horas < 1 ? "Minutos" : "Horas"}</span></span><b class="tile-num">${horas < 1 ? Math.round(horas * 60) : horas.toFixed(1)}</b><span class="tile-sub">estudiando</span>${flechaDiag()}</button>
    </div>
    <div class="mini-stats">
      <div class="ms">${circ(I("fuego"), "p-mantequilla")}<div><b>${rachaVisible()}</b><small>racha · máx. ${P().racha.max || 0}</small></div></div>
      <div class="ms">${circ(I("rayo"), "p-cielo")}<div><b>${P().xp}</b><small>XP total</small></div></div>
      <div class="ms">${circ(I("estrella"), "p-menta")}<div><b>${res.maduras}</b><small>dominadas</small></div></div>
      <div class="ms">${circ(I("diana"), "p-rosa")}<div><b>${rev ? Math.round((100 * revOk) / rev) + "%" : "—"}</b><small>retención real</small></div></div>
    </div>
    <section class="bloque">
      <div class="bloque-cab">${circ(I("grafica"), "sm")}<h2>Progreso</h2><span class="bloque-dato">XP por semana</span></div>
      <div class="card pild-card">${barrasPildora(semanas, "XP por semana en las últimas 6 semanas")}</div>
    </section>
    <section class="card nivel-card">
      <div class="nv-cab"><small>Tu nivel estimado</small><b>${lv.nivel}</b></div>
      ${NIVELES.map((nv) => `<div class="nv-fila"><span class="chip-nv ${pastelNivel(nv)}">${nv}</span><div class="meta-barra"><i style="width:${(100 * lv.por[nv].hechas) / lv.por[nv].total}%"></i></div><small>${lv.por[nv].hechas}/${lv.por[nv].total}</small></div>`).join("")}
    </section>
    <section class="card"><div class="bloque-cab dentro">${circ(I("fuego"), "sm p-mantequilla")}<h3>Tu constancia</h3></div>${mapaCalor()}</section>
    <section class="card"><div class="bloque-cab dentro">${circ(I("repetir"), "sm p-cielo")}<h3>Repasos que vienen</h3></div><p class="muted chico">Así reparte la repetición espaciada tu trabajo en los próximos 14 días.</p>${graficaPronostico(res)}</section>
    <section class="card"><div class="bloque-cab dentro">${circ(I("estrella"), "sm p-menta")}<h3>Tu memoria</h3></div>${barraEstados(res)}</section>
    ${tipos.length ? `<section class="card"><div class="bloque-cab dentro">${circ(I("diana"), "sm p-rosa")}<h3>Aciertos por tipo de ejercicio</h3></div><div class="tipos">${tipos.map((t) => `<div class="tipo-fila"><span>${esc(M.NOMBRES_TIPO[t.k] || t.k)}</span><div class="meta-barra"><i style="width:${Math.round(t.p * 100)}%"></i></div><b>${Math.round(t.p * 100)}%</b></div>`).join("")}</div></section>` : ""}
    ${dificiles.length ? `<section class="card"><div class="bloque-cab dentro">${circ("🩹", "sm p-rosa")}<h3>Tus palabras más difíciles</h3></div><div class="lista">${dificiles.map(filaPalabra).join("")}</div><button class="btn sec ancho" data-modo="errores">Practicar mis errores</button></section>` : ""}
    <div class="lista">
      <button class="fila" data-go="#ciencia"><span class="f-emoji p-rosa">🧪</span><span class="f-txt"><b>La ciencia detrás de la app</b><small>Por qué cada cosa está hecha así</small></span><span class="flecha-negra">${I("flechaR")}</span></button>
      <button class="fila" data-go="#ajustes"><span class="f-emoji p-cielo">⚙️</span><span class="f-txt"><b>Ajustes</b><small>Meta, voz, avisos, tema y cuenta</small></span><span class="flecha-negra">${I("flechaR")}</span></button>
    </div>
  </div>`;
}
montar.yo = () => tooltips();
function tooltips() {
  let tip = $("#tip");
  if (!tip) { tip = document.createElement("div"); tip.id = "tip"; tip.className = "tooltip"; document.body.appendChild(tip); }
  const mostrar = (el) => {
    const t = el.dataset.tip; if (!t) return;
    tip.textContent = t; tip.classList.add("on");
    const r = el.getBoundingClientRect(), w = tip.offsetWidth;
    tip.style.left = Math.min(innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2)) + "px";
    tip.style.top = (r.top + scrollY - tip.offsetHeight - 8) + "px";
  };
  $$("[data-tip]").forEach((el) => {
    el.addEventListener("pointerenter", () => mostrar(el));
    el.addEventListener("pointerleave", () => tip.classList.remove("on"));
    el.addEventListener("click", () => { mostrar(el); setTimeout(() => tip.classList.remove("on"), 1800); });
  });
}

/* ---------- Ciencia ---------- */
function vCiencia() {
  return `<div class="wrap">
    <header class="top"><button class="atras" data-go="#yo">${I("atras")}</button><div><div class="saludo">Por qué funciona</div><h1>La ciencia</h1></div></header>
    <p class="muted">Cada parte de Täglich está basada en investigación sobre memoria y adquisición de idiomas. Esto es lo que usa y por qué.</p>
    ${CIENCIA.map((c) => `<section class="card ciencia">
      <h3>${esc(c.emoji)} ${esc(c.titulo)}</h3>
      <p>${esc(c.idea)}</p>
      <div class="en-app"><small>En la app</small><p>${esc(c.app)}</p></div>
      <p class="ref">${esc(c.ref)}</p>
    </section>`).join("")}
  </div>`;
}

/* ---------- Ajustes ---------- */
function seg(nombre, val, ops) {
  return `<div class="seg" role="radiogroup">${ops.map(([v, t, sub]) => `<button class="${String(val) === String(v) ? "on" : ""}" data-aj="${nombre}" data-v="${v}" role="radio" aria-checked="${String(val) === String(v)}"><b>${t}</b>${sub ? `<small>${sub}</small>` : ""}</button>`).join("")}</div>`;
}
function interruptor(nombre, on, titulo, sub, deshab) {
  return `<label class="toggle ${deshab ? "deshab" : ""}"><span><b>${titulo}</b>${sub ? `<small>${sub}</small>` : ""}</span><input type="checkbox" data-tog="${nombre}" ${on ? "checked" : ""} ${deshab ? "disabled" : ""}><i></i></label>`;
}
const ajCab = (ico, t, sub) => `<div class="aj-cab"><span class="aj-ico">${I(ico)}</span><div><h3>${t}</h3>${sub ? `<small>${sub}</small>` : ""}</div></div>`;
function vAjustes() {
  const a = A(), pl = P().plan, tema = ls.get("aleman.tema", "auto") || "auto";
  const avisosTxt = S.modo !== "nube" ? "Necesitan una cuenta (Google o correo)" : !("Notification" in window) ? (/iPhone|iPad/.test(navigator.userAgent) ? "En iPhone: agrega la app a tu pantalla de inicio y ábrela desde ahí" : "Este navegador no permite avisos") : pl.avisos && Notification.permission === "granted" ? `Activados · te aviso a las ${pl.hora} si no has estudiado` : Notification.permission === "denied" ? "Bloqueados en los ajustes del cel" : "Te aviso si no has estudiado";
  return `<div class="wrap ajustes">
    <header class="top"><button class="atras" data-go="#yo" aria-label="Atrás">${I("atras")}</button><div><div class="saludo">Hazla tuya</div><h1>Ajustes</h1></div></header>
    <div class="banner estatico">${DECO}<span class="banner-txt"><small>${I("brillo")} Tu plan</small><b>${esc(pl.momento ? fraseIntencion(pl.momento, pl.hora, a.meta) : "Elige cuándo vas a estudiar")}</b><span>${pl.avisos ? "Con recordatorio diario" : "Sin recordatorio todavía"}</span></span></div>
    <section class="card">${ajCab("diana", "Meta diaria")}${seg("meta", a.meta, METAS.map(([x, t]) => [x, t, x + " XP"]))}</section>
    <section class="card">${ajCab("estrella", "Palabras nuevas por día", "Más palabras nuevas = más repasos los días siguientes.")}${seg("nuevas", a.nuevas, [[5, "5"], [10, "10"], [15, "15"], [25, "25"]])}</section>
    <section class="card">${ajCab("ciencia", "Qué tanto quieres recordar", "Probabilidad de recordar cada palabra cuando te toca repasarla. Más alto = repasos más seguidos.")}
      ${seg("retencion", a.retencion, [[0.85, "85%", "menos repasos"], [0.9, "90%", "equilibrado"], [0.95, "95%", "más repasos"]])}</section>
    <section class="card">${ajCab("audio", "Voz y audio")}
      ${seg("vel", a.vel, [[0.75, "Lenta"], [0.9, "Normal"], [1.05, "Rápida"]])}
      <button class="btn sec ancho" data-a="probarVoz">${I("audio")} Probar voz${Voz.nombre ? " · " + esc(Voz.nombre) : ""}</button>
      ${!Voz.ok ? `<p class="aviso">Este navegador no tiene voz en alemán.</p>` : !Voz.voz ? `<p class="muted chico">No encontré una voz alemana instalada. Instala «Deutsch» en las voces de tu sistema para que suene mejor.</p>` : ""}
      ${interruptor("autoAudio", a.autoAudio, "Audio automático", "Escuchar cada palabra al aparecer")}
      ${interruptor("escuchar", a.escuchar, "Ejercicios de escuchar", "Dictados y comprensión auditiva")}
      ${interruptor("hablar", a.hablar && Oido.ok, "Ejercicios de hablar", Oido.ok ? "Usa el micrófono" : "Tu navegador no tiene reconocimiento de voz", !Oido.ok)}
      ${interruptor("sonidos", a.sonidos, "Sonidos", "Al acertar y fallar")}
    </section>
    <section class="card">${ajCab("campana", "Tu plan y avisos")}
      <div class="chips-fila">${MOMENTOS.map(([k, e, t]) => `<button class="fchip ${pl.momento === k ? "on" : ""}" data-momento="${k}">${e} ${t}</button>`).join("")}</div>
      <label class="campo-ob">Hora<input type="time" id="ajHora" value="${esc(pl.hora || "20:00")}"></label>
      <button class="toggle-btn" data-a="avisos"><span class="aj-ico">${I("campana")}</span><span><b>Recordatorio diario</b><small>${esc(avisosTxt)}</small></span><span class="flecha-negra">${I("flechaR")}</span></button>
    </section>
    <section class="card">${ajCab("luna", "Tema")}${seg("tema", tema, [["auto", "Auto"], ["claro", "Claro"], ["oscuro", "Oscuro"]])}</section>
    <section class="card">${ajCab("yo", "Cuenta y datos")}
      ${S.modo === "local" ? `<p class="muted chico">Estás usando la app sin cuenta: tu progreso solo está en este dispositivo.</p><button class="btn primario ancho" data-a="crearCuenta">${I("nube")} Guardar mi progreso en una cuenta</button>` : `<p class="muted chico">Conectado como ${esc((S.user && S.user.email) || "")}. Tu progreso se sincroniza entre dispositivos.</p>`}
      <button class="btn sec ancho" data-a="exportar">${I("descargar")} Descargar mi progreso</button>
      <button class="btn sec ancho" data-a="salir">${I("salir")} ${S.modo === "nube" ? "Cerrar sesión" : "Salir"}</button>
      <button class="btn peligro ancho" data-a="borrar">${I("basura")} Borrar todo mi progreso</button>
    </section>
    <p class="mini centro-txt">Täglich · ${C.vocab.length} palabras · ${Object.values(GRAM).reduce((t, g) => t + g.items.length, 0)} ejercicios de gramática · ${LECTURAS.length} lecturas</p>
  </div>`;
}
montar.ajustes = () => {
  const h = $("#ajHora");
  if (h) h.onchange = () => { P().plan.hora = h.value || "20:00"; P().plan.tz = zona(); store.guardar(); toast("Hora guardada"); };
};
function cambiarAjuste(k, v) {
  if (k === "tema") { ls.set("aleman.tema", v); document.documentElement.setAttribute("data-theme", v); render(); return; }
  A()[k] = ["meta", "nuevas", "retencion", "vel"].includes(k) ? +v : v;
  if (k === "vel") { Voz.vel = +v; Voz.hablar("Guten Tag! Wie geht es dir?"); }
  if (k === "sonidos") Sonido.on = !!v;
  store.guardar();
  render();
}
async function activarAvisos() {
  if (S.modo !== "nube") { toast("Los avisos necesitan una cuenta. Ve a «Guardar mi progreso en una cuenta»."); return; }
  if (!("Notification" in window) || !("serviceWorker" in navigator)) { toast(/iPhone|iPad/.test(navigator.userAgent) ? "En iPhone: primero agrega la app a tu pantalla de inicio y ábrela desde ahí." : "Este navegador no permite avisos.", 4500); return; }
  try {
    const msg = await import(FBV + "firebase-messaging.js");
    if (!(await msg.isSupported())) { toast("Este navegador no permite avisos con la app cerrada."); return; }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { toast("No se activaron los avisos."); return; }
    const reg = await navigator.serviceWorker.register("sw.js");
    await navigator.serviceWorker.ready;
    const token = await msg.getToken(msg.getMessaging(FB.app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
    if (!token) { toast("No se pudo registrar este dispositivo."); return; }
    const { doc, setDoc } = FB.fs;
    await setDoc(doc(FB.db, "aleman", store.uid, "avisos", "t-" + M.hashStr(token)), { token, device: (navigator.userAgent || "").slice(0, 140), createdAt: Date.now() });
    const ya = P().plan.avisos;
    Object.assign(P().plan, { avisos: true, tz: zona() });
    store.guardar();
    if (ya) { await reg.showNotification("🔥 ¡Tu racha te espera!", { body: "Así se verán tus avisos. 10 repasos pendientes.", icon: "icon-192.png" }); toast("Te mandé un aviso de prueba"); }
    else toast(`¡Listo! Te aviso a las ${P().plan.hora} si no has estudiado.`, 3500);
    render();
  } catch (e) { console.error(e); toast(e && e.code === "permission-denied" ? "Firebase no dio permiso. Faltan las reglas nuevas." : "No se pudieron activar: " + ((e && (e.code || e.message)) || "error"), 5000); }
}
function exportar() {
  const datos = { app: "Täglich", fecha: new Date().toISOString(), perfil: P(), cards: S.cards };
  const blob = new Blob([JSON.stringify(datos, null, 1)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `taeglich-progreso-${hoyISO()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function confirmarBorrar() {
  openSheet(`<h3>¿Borrar todo tu progreso?</h3><p class="muted">Se borran tus palabras aprendidas, repasos, racha y estadísticas${S.modo === "nube" ? " de tu cuenta" : " de este dispositivo"}. No se puede deshacer.</p>
    <div class="pie-fila"><button class="btn sec" data-close>Cancelar</button><button class="btn peligro" data-borrar>Sí, borrar</button></div>`, (sh) => {
    sh.querySelector("[data-borrar]").onclick = async () => {
      closeSheet();
      await store.borrarTodo();
      S.cards = {}; S.perfil = perfilNuevo(P().nombre); store.guardar();
      location.hash = "#hoy"; toast("Progreso borrado. ¡A empezar de nuevo!"); render();
    };
  });
}

/* ============================ Eventos globales ============================ */
document.addEventListener("click", (e) => {
  if (S.enSesion) return;
  const say = e.target.closest("[data-say]");
  if (say && !e.target.closest(".sheet")) { Voz.hablar(say.dataset.say, { lento: !!say.dataset.lento }); return; }
  const go = e.target.closest("[data-go]");
  if (go && !e.target.closest(".sheet")) { closeSheet(); if (location.hash === go.dataset.go) render(); else location.hash = go.dataset.go; window.scrollTo(0, 0); return; }
  if (!S.perfil || !P().onboarding || e.target.closest(".sheet")) return;
  const nav = e.target.closest("[data-nav]");
  if (nav) { location.hash = "#" + nav.dataset.nav; window.scrollTo(0, 0); return; }
  const nodo = e.target.closest("[data-nodo]"); if (nodo) return abrirNodo(nodo.dataset.nodo);
  const sal = e.target.closest("[data-saltar]");
  if (sal) {
    const u = C.unidades.find((x) => x.id === sal.dataset.saltar);
    openSheet(`<h3>Examen para saltar a «${esc(u.titulo)}»</h3><p class="muted">14 preguntas de las unidades anteriores, sin ayudas. Con 80% o más se desbloquea esta unidad y lo anterior entra a tus repasos.</p>
      <div class="pie-fila"><button class="btn sec" data-close>Ahora no</button><button class="btn primario" data-ex>Hacer el examen</button></div>`, (sh) => { sh.querySelector("[data-ex]").onclick = () => examenHasta(u); });
    return;
  }
  const pal = e.target.closest("[data-palabra]"); if (pal) return abrirPalabra(pal.dataset.palabra);
  const modo = e.target.closest("[data-modo]");
  if (modo) { if (modo.dataset.poco) { toast(MODOS[modo.dataset.modo].vacio || "Aprende algunas palabras más en la Ruta para desbloquear esta práctica."); return; } return empezarPractica(modo.dataset.modo); }
  const pg = e.target.closest("[data-practgram]"); if (pg) return practicarGramatica(pg.dataset.practgram);
  const fil = e.target.closest("[data-filtro]"); if (fil) { S.filtro = fil.dataset.filtro; render(); return; }
  const aj = e.target.closest("[data-aj]"); if (aj) return cambiarAjuste(aj.dataset.aj, aj.dataset.v);
  const mom = e.target.closest("[data-momento]"); if (mom) { P().plan.momento = mom.dataset.momento; store.guardar(); render(); return; }
  const a = e.target.closest("[data-a]");
  if (!a) return;
  switch (a.dataset.a) {
    case "continuar": { const n = nodoActual(); if (n) empezarNodo(n); break; }
    case "repasar": empezarRepaso(); break;
    case "probarVoz": Voz.hablar("Hallo! Ich heiße Täglich. Wie heißt du?"); break;
    case "avisos": activarAvisos(); break;
    case "exportar": exportar(); break;
    case "borrar": confirmarBorrar(); break;
    case "salir": salirCuenta(); break;
    case "crearCuenta": store.guardar(); ls.del("aleman.modo"); S.perfil = null; S.modo = null; cargarFirebase().then((ok) => { S.fbError = !ok; pintarEntrar(); if (ok) escucharAuth(); }); break;
  }
});
document.addEventListener("change", (e) => {
  const t = e.target.closest("[data-tog]");
  if (t && !S.enSesion) cambiarAjuste(t.dataset.tog, t.checked);
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && sheetAbierta()) closeSheet(); });
window.addEventListener("hashchange", () => { if (S.enSesion) return; closeSheet(); Voz.parar(); render(); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && S.perfil) store.guardar(); });
// Si la app se queda abierta y cambia el día, se refresca la pantalla de hoy.
let diaVisto = hoy();
setInterval(() => { if (hoy() !== diaVisto) { diaVisto = hoy(); if (!S.enSesion && !sheetAbierta()) render(); } }, 60000);

/* ============================ Inicio ============================ */
let authEscuchando = false;
function escucharAuth() {
  if (authEscuchando || !FB.ok) return;
  authEscuchando = true;
  FB.a.onAuthStateChanged(FB.auth, (user) => {
    if (user) { if (!S.user || S.user.uid !== user.uid) entrarNube(user); }
    else if (S.modo !== "local") { S.user = null; S.perfil = null; pintarEntrar(); }
  });
}
async function init() {
  Voz.init();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  if (new URLSearchParams(location.search).has("local")) ls.set("aleman.modo", "local");
  if (ls.get("aleman.modo") === "local") { entrarLocal(); cargarFirebase(); return; }
  pintarCargando("");
  const ok = await cargarFirebase();
  if (!ok) { S.fbError = true; return pintarEntrar(); }
  escucharAuth();
}
window.__taeglich = { S, C, GRAM, M };   // para depurar desde la consola
init();
