// Täglich · motor de aprendizaje. Lógica pura (sin pantalla ni Firebase) para poder probarla sola con Node.
// - FSRS-5: calcula cuándo repasar cada palabra para recordarla con 90% de probabilidad.
// - Revisión de respuestas: diéresis (ä/ae), faltas de ortografía, artículos, mayúsculas y palabras confundidas.
// - Conjugación, reglas de género y formas de cada palabra.
// - Sesión adaptativa: intercala palabras nuevas y repasos, repite lo fallado y ajusta la dificultad para acertar ~85%.

/* ============================ Utilidades ============================ */
export const DAY = 86400000;
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const pick = (arr, rng = Math.random) => arr[Math.floor(rng() * arr.length)];
export function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function slug(s) {
  return String(s).toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
const chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; };

/* ============================ Días (hora local) ============================ */
// Número de día local (días desde 1970 en la zona horaria del cel). Las fechas de repaso se guardan así.
export function dayNum(ms = Date.now()) { return Math.floor((ms - new Date(ms).getTimezoneOffset() * 60000) / DAY); }
export const dayISO = (n) => new Date(n * DAY).toISOString().slice(0, 10);
export function isoDay(iso) { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d) / DAY; }

/* ============================ FSRS-5 ============================ */
// Parámetros por defecto de FSRS-5 (Ye et al., open-spaced-repetition). Calificaciones: 1 Otra vez, 2 Difícil, 3 Bien, 4 Fácil.
export const W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621];
const DECAY = -0.5, FACTOR = 19 / 81;

// Probabilidad de recordar después de t días con estabilidad S (curva del olvido).
export const retrievability = (t, S) => Math.pow(1 + FACTOR * Math.max(0, t) / Math.max(S, 0.01), DECAY);
export const intervalo = (S, retencion = 0.9) => (S / FACTOR) * (Math.pow(retencion, 1 / DECAY) - 1);
const clampD = (d) => clamp(d, 1, 10);
const initS = (g) => Math.max(W[g - 1], 0.1);
const initD = (g) => clampD(W[4] - Math.exp(W[5] * (g - 1)) + 1);
function nextD(D, g) {
  const delta = -W[6] * (g - 3);
  const dp = D + delta * (10 - D) / 9;               // amortiguación lineal (FSRS-5)
  return clampD(W[7] * initD(4) + (1 - W[7]) * dp);  // regreso a la media
}
function sRecall(D, S, R, g) {
  const hard = g === 2 ? W[15] : 1, easy = g === 4 ? W[16] : 1;
  return S * (1 + Math.exp(W[8]) * (11 - D) * Math.pow(S, -W[9]) * (Math.exp(W[10] * (1 - R)) - 1) * hard * easy);
}
const sForget = (D, S, R) => Math.min(S, W[11] * Math.pow(D, -W[12]) * (Math.pow(S + 1, W[13]) - 1) * Math.exp(W[14] * (1 - R)));
const sShort = (S, g) => S * Math.exp(W[17] * (g - 3 + W[18]));

function fuzz(ivl, rng) {
  if (ivl < 2.5) return ivl;
  const f = ivl < 7 ? 1 : ivl < 30 ? Math.max(2, ivl * 0.1) : Math.max(4, ivl * 0.06);
  return Math.max(2, ivl + (rng() * 2 - 1) * f);
}

// Estado de una tarjeta: { st: 1 aprendiendo · 2 repaso · 3 reaprendiendo, s, d, due (día local), last (ms), reps, lapses, t (primera vez), lw (último error) }
export function programar(card, g, now = Date.now(), o = {}) {
  const ret = o.retencion || 0.9, rng = o.rng || Math.random, maxIvl = o.maxIvl || 3650;
  g = clamp(Math.round(g), 1, 4);
  let s, d, st, lapses = (card && card.lapses) || 0;
  const reps = ((card && card.reps) || 0) + 1;
  const nueva = !card || !card.last;
  if (nueva) {
    s = initS(g); d = initD(g); st = g === 1 ? 1 : 2;
  } else {
    const mismoDia = dayNum(now) === dayNum(card.last);
    d = nextD(card.d, g);
    if (mismoDia) s = sShort(card.s, g);
    else {
      const R = retrievability((now - card.last) / DAY, card.s);
      s = g === 1 ? sForget(card.d, card.s, R) : sRecall(card.d, card.s, R, g);
    }
    if (g === 1) { if (card.st === 2) lapses++; st = card.st === 1 ? 1 : 3; } else st = 2;
  }
  s = clamp(s, 0.1, 36500);
  let ivl;
  if (g === 1) ivl = 1;
  else {
    ivl = Math.max(1, intervalo(s, ret));
    // La primera vez que aprendes una palabra en una lección la vuelves a ver pronto (máx. 2 días), salvo que digas que ya te la sabes.
    if (nueva && o.primeraLeccion && g < 4) ivl = Math.min(ivl, 2);
    ivl = fuzz(ivl, rng);
  }
  ivl = clamp(Math.round(ivl), 1, maxIvl);
  return {
    st, s: +s.toFixed(3), d: +d.toFixed(3), due: dayNum(now) + ivl, last: now, reps, lapses,
    t: (card && card.t) || now, ...(g === 1 ? { lw: now } : card && card.lw ? { lw: card.lw } : {}),
  };
}
export const retencionActual = (card, now = Date.now()) => card && card.last ? retrievability((now - card.last) / DAY, card.s) : 0;

// Calificación automática a partir de cómo respondiste (no hace falta autoevaluarse).
export function calificar({ ok, typo, pista, ms, produccion, largo = 6 }, card) {
  if (!ok) return 1;
  if (typo || pista) return 2;
  if (produccion && card && card.reps >= 2 && ms && ms < 2200 + 110 * largo) return 4;
  return 3;
}

/* ============================ Comparar respuestas ============================ */
const QUITAR = /[-'’‘`´]/g;
const SEPARAR = /[.,!?¿¡;:"„“”‚«»()[\]…–—/]/g;
export const norm = (s) => String(s || "").normalize("NFC").toLowerCase().replace(QUITAR, "").replace(SEPARAR, " ").replace(/\s+/g, " ").trim();
export const sinUmlaut = (s) => s.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
export const sinAcentos = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");

// Distancia de edición (Damerau, transposiciones contiguas).
export function dist(a, b) {
  const n = a.length, m = b.length;
  if (!n) return m; if (!m) return n;
  const d = Array.from({ length: n + 1 }, (_, i) => { const r = new Array(m + 1).fill(0); r[0] = i; return r; });
  for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const c = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[n][m];
}
export const tolerancia = (len) => (len <= 4 ? 0 : len <= 8 ? 1 : len <= 16 ? 2 : Math.floor(len / 7));

// Compara una respuesta en alemán con las correctas.
// Devuelve { ok, exacto, typo, nota, objetivo, confundida }.
export function compararAleman(input, objetivos, o = {}) {
  const u = norm(input);
  if (!u) return { ok: false, vacio: true, objetivo: objetivos[0] };
  const usoAe = /(ae|oe|ue|ss)/.test(u);
  let typo = null;
  for (const t of objetivos) {
    const n = norm(t);
    if (u === n) return { ok: true, exacto: true, objetivo: t };
    if (sinUmlaut(u) === sinUmlaut(n)) return { ok: true, exacto: true, objetivo: t, nota: usoAe ? "Tip: puedes escribir ä ö ü ß con los botones de abajo." : null };
    if (sinAcentos(sinUmlaut(u)) === sinAcentos(sinUmlaut(n)) || sinAcentos(u) === sinAcentos(n)) {
      // Solo faltó la diéresis: en plurales y conjugaciones eso cambia la palabra (Bruder ≠ Brüder).
      if (o.estrictoUmlaut) return { ok: false, objetivo: t, nota: `Fíjate en la diéresis: ${t}.` };
      if (!typo) typo = { ok: true, typo: true, objetivo: t, nota: `Ojo con la diéresis: ${t}.` };
      continue;
    }
    const tol = o.tolerancia != null ? o.tolerancia : tolerancia(n.length);
    if (tol > 0 && dist(sinUmlaut(u), sinUmlaut(n)) <= tol && !typo) typo = { ok: true, typo: true, objetivo: t, nota: `Casi: se escribe ${t}.` };
  }
  if (typo && o.lexico) {
    // Si escribiste otra palabra que existe (Butter en vez de Mutter), no es falta de ortografía: es otra palabra.
    const otra = o.lexico.get(u);
    if (otra && !objetivos.some((t) => norm(t) === norm(otra.de))) return { ok: false, confundida: otra, objetivo: objetivos[0], nota: `«${input.trim()}» es otra palabra: ${otra.es}.` };
  }
  if (typo) return typo;
  if (o.lexico) {
    const otra = o.lexico.get(u);
    const misma = otra && objetivos.some((t) => norm(t) === norm(otra.de) || norm(t).endsWith(" " + norm(otra.de)));
    if (otra && misma) return { ok: false, objetivo: objetivos[0], nota: `Esa es otra forma de la palabra; aquí va: ${objetivos[0]}.` };
    if (otra) return { ok: false, confundida: otra, objetivo: objetivos[0], nota: `«${input.trim()}» significa «${otra.es}».` };
  }
  return { ok: false, objetivo: objetivos[0] };
}

// Sustantivos: el artículo es parte de la palabra.
export function compararSustantivo(input, item, o = {}) {
  const raw = String(input || "").trim();
  const partes = norm(raw).split(" ");
  let art = null, resto = partes.join(" ");
  if (["der", "die", "das"].includes(partes[0]) && partes.length > 1) { art = partes[0]; resto = partes.slice(1).join(" "); }
  const r = compararAleman(resto, [item.de, ...(item.deAlt || [])], o);
  const completo = `${item.art} ${item.de}`;
  if (!r.ok) return { ...r, objetivo: completo };
  if (!art) return { ok: true, typo: true, objetivo: completo, nota: `Falta el artículo: ${completo}. Apréndete cada sustantivo con su artículo.` };
  if (art !== item.art) return { ok: false, articulo: true, objetivo: completo, nota: `Es ${completo}, no ${art}.` };
  const ult = raw.split(/\s+/).pop() || "";
  const may = ult && ult[0] === ult[0].toLowerCase() && ult[0] !== ult[0].toUpperCase();
  const nota = [r.nota, may ? "Recuerda: en alemán todos los sustantivos van con mayúscula." : null].filter(Boolean).join(" ");
  return { ...r, objetivo: completo, nota: nota || null };
}

/* ============================ Conjugación ============================ */
export const PRONOMBRES = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"];
export const PRON_CORTO = ["ich", "du", "er", "wir", "ihr", "sie"];
const REFLEX = ["mich", "dich", "sich", "uns", "euch", "sich"];
export const IRREGULARES = {
  sein: ["bin", "bist", "ist", "sind", "seid", "sind"],
  haben: ["habe", "hast", "hat", "haben", "habt", "haben"],
  werden: ["werde", "wirst", "wird", "werden", "werdet", "werden"],
  wissen: ["weiß", "weißt", "weiß", "wissen", "wisst", "wissen"],
  können: ["kann", "kannst", "kann", "können", "könnt", "können"],
  müssen: ["muss", "musst", "muss", "müssen", "müsst", "müssen"],
  wollen: ["will", "willst", "will", "wollen", "wollt", "wollen"],
  dürfen: ["darf", "darfst", "darf", "dürfen", "dürft", "dürfen"],
  sollen: ["soll", "sollst", "soll", "sollen", "sollt", "sollen"],
  mögen: ["mag", "magst", "mag", "mögen", "mögt", "mögen"],
  möchten: ["möchte", "möchtest", "möchte", "möchten", "möchtet", "möchten"],
  tun: ["tue", "tust", "tut", "tun", "tut", "tun"],
};
const necesitaE = (stem) => /(chn|[td]|[^aeiouäöülrhmn][mn])$/.test(stem);
const sibilante = (stem) => /(s|ß|z|x)$/.test(stem);

// Formas del presente (sin el prefijo separable). v = { inf, base, sep, du, er }
export function presente(v) {
  const base = v.base || v.inf;
  if (IRREGULARES[base]) return IRREGULARES[base].slice();
  let f;
  if (/[^e]e[lr]n$/.test(base)) {
    const stem = base.slice(0, -1);   // sammel / wander
    const ich = base.endsWith("eln") ? stem.slice(0, -2) + "le" : stem + "e";
    f = [ich, stem + "st", stem + "t", base, stem + "t", base];
  } else {
    const stem = base.endsWith("en") ? base.slice(0, -2) : base.slice(0, -1);
    const e = necesitaE(stem) ? "e" : "";
    f = [stem + "e", stem + (sibilante(stem) ? "t" : e + "st"), stem + e + "t", base, stem + e + "t", base];
  }
  if (v.er) {
    f[2] = v.er;
    if (v.du) f[1] = v.du;
    else if (v.er.endsWith("t")) { const b = v.er.slice(0, -1); f[1] = sibilante(b) ? b + "t" : b + "st"; }
    else f[1] = v.er + "st";
  }
  return f;
}
// "ich stehe auf", "du freust dich"
export function conjugar(v, persona) {
  const f = presente(v)[persona];
  return [f, v.reflexivo ? REFLEX[persona] : null, v.sep || null].filter(Boolean).join(" ");
}
export function perfektDe(v) {
  if (v.perf) return v.perf;
  const base = v.base || v.inf;
  const stem = /e[lr]n$/.test(base) ? base.slice(0, -1) : base.slice(0, -2);
  const t = necesitaE(stem) ? "et" : "t";
  let pp;
  if (base.endsWith("ieren")) pp = stem + "t";
  else if (/^(be|ge|er|ver|zer|ent|emp|miss)/.test(base)) pp = stem + t;
  else pp = "ge" + stem + t;
  return `hat ${v.reflexivo ? "sich " : ""}${v.sep || ""}${pp}`;
}
// "ich bin gefahren", "du hast gemacht"
export function perfektPersona(v, persona) {
  const p = perfektDe(v).split(" ");
  const aux = p[0] === "ist" ? "sein" : "haben";
  const resto = p.slice(1).filter((w) => w !== "sich");
  return [IRREGULARES[aux][persona], v.reflexivo ? REFLEX[persona] : null, ...resto].filter(Boolean).join(" ");
}

/* ============================ Género ============================ */
// Reglas de terminación que sí sirven (con sus excepciones avisadas).
const REGLAS = [
  { re: /ung$/, g: "f", fija: true, t: "Todas las palabras que terminan en -ung son femeninas: die." },
  { re: /(heit|keit)$/, g: "f", fija: true, t: "-heit y -keit siempre son femeninas: die." },
  { re: /schaft$/, g: "f", fija: true, t: "-schaft siempre es femenino: die." },
  { re: /(tion|sion)$/, g: "f", fija: true, t: "-tion/-sion es femenino (die), igual que «la nación»." },
  { re: /tät$/, g: "f", fija: true, t: "-tät es femenino (die), como «la universidad»." },
  { re: /(chen|lein)$/, g: "n", fija: true, t: "Los diminutivos en -chen y -lein siempre son neutros: das (¡hasta das Mädchen!)." },
  { re: /(ling)$/, g: "m", fija: true, t: "-ling es masculino: der." },
  { re: /(ismus)$/, g: "m", fija: true, t: "-ismus es masculino: der." },
  { re: /(ik)$/, g: "f", t: "-ik casi siempre es femenino: die Musik, die Politik." },
  { re: /(ei)$/, g: "f", t: "-ei casi siempre es femenino: die Bäckerei, die Polizei." },
  { re: /(ie)$/, g: "f", t: "-ie suele ser femenino: die Familie, die Energie." },
  { re: /(enz|anz)$/, g: "f", t: "-enz/-anz es femenino: die Distanz." },
  { re: /(ur)$/, g: "f", t: "-ur suele ser femenino: die Natur, die Kultur." },
  { re: /e$/, g: "f", t: "Muchísimas palabras en -e son femeninas (die Lampe, die Straße)." },
  { re: /in$/, g: "f", persona: true, t: "-in forma el femenino de personas: die Lehrerin." },
  { re: /(ment|um)$/, g: "n", t: "-ment y -um suelen ser neutros: das Dokument, das Zentrum." },
  { re: /^ge/i, g: "n", t: "Muchas palabras que empiezan con Ge- son neutras: das Gemüse, das Geschenk." },
  { re: /(er)$/, g: "m", t: "Muchas palabras en -er (personas y aparatos) son masculinas: der Lehrer, der Computer." },
  { re: /(ig|or|ist|ent|ant)$/, g: "m", t: "-ig, -or, -ist, -ent y -ant suelen ser masculinos." },
];
export function reglaGenero(item) {
  if (!item || item.t !== "n" || item.g === "pl") return null;
  if (item.regla) return item.regla;
  const w = item.de.split(/\s+/).pop().toLowerCase();
  for (const r of REGLAS) {
    if (!r.re.test(w)) continue;
    if (r.persona && item.g !== "f") continue;
    if (r.g === item.g) return r.t;
    if (r.fija) return `¡Excepción! ${r.t.replace(/:.*$/, "")}… pero esta es ${item.art}.`;
  }
  return null;
}
export const COLOR_GENERO = { m: "der", f: "die", n: "das", pl: "pl" };

/* ============================ Contenido (formato compacto) ============================ */
// Una línea por palabra:  N der Hund, Hunde | perro | 🐕 | Der *Hund* schläft. | El perro duerme. | nota
// N sustantivo · V verbo · A adjetivo · W otra palabra · P frase hecha
const ARTS = { der: "m", die: "f", das: "n" };
export function parseLinea(line) {
  const m = line.match(/^([NVAWP])\s+(.+)$/);
  if (!m) throw new Error("Línea inválida: " + line);
  const f = m[2].split("|").map((s) => s.trim());
  const [deRaw, esRaw = "", emoji = "", exRaw = "", exEs = "", nota = ""] = f;
  const t = { N: "n", V: "v", A: "a", W: "w", P: "p" }[m[1]];
  const es = esRaw.split("/").map((s) => s.trim()).filter(Boolean);
  const it = { t, es: es[0], esAlt: es.slice(1), emoji, nota: nota || null };
  const mm = exRaw.match(/\*([^*]+)\*/);
  it.ex = exRaw.replace(/\*/g, "");
  it.exTarget = mm ? mm[1] : null;
  it.exEs = exEs;
  if (t === "n") {
    const n = deRaw.match(/^(der|die|das)\s+([^,]+?)(?:,\s*(.+))?$/);
    if (!n) throw new Error("Sustantivo sin artículo: " + line);
    it.art = n[1];
    let lema = n[2].trim();
    if (/\(Pl\.\)$/.test(lema)) { it.g = "pl"; lema = lema.replace(/\s*\(Pl\.\)$/, ""); it.pl = null; }
    else { it.g = ARTS[n[1]]; it.pl = n[3] && !/^[—–-]$/.test(n[3].trim()) ? n[3].trim() : null; }
    const alts = lema.split("/").map((s) => s.trim());
    it.de = alts[0]; it.deAlt = alts.slice(1);
  } else if (t === "v") {
    const v = deRaw.match(/^(sich\s+)?([^\s(]+)\s*(?:\((.*)\))?$/);
    if (!v) throw new Error("Verbo inválido: " + line);
    const reflexivo = !!v[1];
    const [sep, base] = v[2].includes("·") ? v[2].split("·") : [null, v[2]];
    const inf = (sep || "") + base;
    const verbo = { inf, base, sep, reflexivo };
    if (v[3] != null) {
      const [pres = "", perf = ""] = v[3].split(";").map((s) => s.trim());
      const formas = pres.split(",").map((s) => s.trim()).filter(Boolean);
      if (formas.length === 2) { verbo.du = formas[0]; verbo.er = formas[1]; } else if (formas.length === 1) verbo.er = formas[0];
      if (perf) verbo.perf = perf;
    }
    it.v = verbo;
    it.de = (reflexivo ? "sich " : "") + inf;
    it.deAlt = reflexivo ? [inf] : [];
  } else {
    const alts = deRaw.split("/").map((s) => s.trim()).filter(Boolean);
    it.de = alts[0]; it.deAlt = alts.slice(1);
  }
  return it;
}

// Convierte las unidades (texto) en unidades con lecciones e índice de palabras.
export function prepararContenido(unidadesRaw, gramatica = {}) {
  const vocab = [], porId = new Map();
  const unidades = unidadesRaw.map((u, ui) => {
    const lecciones = [];
    let cur = null;
    const nueva = (titulo) => { cur = { id: `${u.id}-${lecciones.length + 1}`, titulo, items: [] }; lecciones.push(cur); };
    for (const linea of u.lecciones.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//"))) {
      if (linea.startsWith("#")) { nueva(linea.replace(/^#+\s*/, "")); continue; }
      if (!cur) nueva(u.titulo);
      const it = parseLinea(linea);
      let id = slug(it.t === "n" ? it.de : it.de.replace(/^sich\s+/, ""));
      if (porId.has(id)) id = `${id}_${it.t}`;
      if (porId.has(id)) throw new Error("Palabra repetida: " + linea);
      Object.assign(it, { id, u: ui, unidad: u.id, nivel: u.nivel, leccion: cur.id });
      vocab.push(it); porId.set(id, it); cur.items.push(it);
    }
    // Las lecciones largas se parten en pedazos de máx. 7 palabras (sesiones cortas: mejor varias dosis que una grande).
    const partidas = [];
    for (const l of lecciones) {
      const n = Math.ceil(l.items.length / 7);
      if (n <= 1) { partidas.push(l); continue; }
      const tam = Math.ceil(l.items.length / n);
      for (let k = 0; k < n; k++) partidas.push({ ...l, id: `${l.id}${"abcdef"[k]}`, titulo: `${l.titulo} ${k + 1}/${n}`, items: l.items.slice(k * tam, (k + 1) * tam) });
    }
    for (const l of partidas) for (const it of l.items) it.leccion = l.id;
    lecciones.splice(0, lecciones.length, ...partidas);
    // Ruta de la unidad: lecciones, gramática a la mitad y lectura al final.
    const nodos = lecciones.map((l) => ({ tipo: "leccion", id: l.id, titulo: l.titulo, items: l.items }));
    const mitad = Math.ceil(nodos.length / 2);
    const gnodos = (u.gramatica || []).filter((g) => gramatica[g]).map((g) => ({ tipo: "gramatica", id: "g-" + g, tema: g, titulo: gramatica[g].titulo, items: gramatica[g].items || [] }));
    nodos.splice(mitad, 0, ...gnodos);
    if (u.lectura) nodos.push({ tipo: "lectura", id: "l-" + u.lectura, lectura: u.lectura, titulo: "Lectura" });
    return { ...u, i: ui, lecciones, nodos };
  });
  for (const g of Object.values(gramatica)) for (const d of g.items || []) porId.set(d.id, d);
  return { unidades, vocab, porId };
}

// Ejercicios de gramática:  ? Ich ___ müde. | bin | bist, ist | Estoy cansado. | explicación
//                           O Heute gehe ich ins Kino. / Ich gehe heute ins Kino. | Hoy voy al cine. | explicación
export function prepararGramatica(temas) {
  const out = {};
  for (const [k, g] of Object.entries(temas)) {
    const items = g.ejercicios.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("//")).map((l, i) => {
      const tipo = l[0];
      const f = l.slice(1).split("|").map((s) => s.trim());
      const base = { id: `g_${k}_${i + 1}`, t: "g", tema: k, nivel: g.nivel };
      if (tipo === "?") {
        const [q, a, dis = "", es = "", por = ""] = f;
        if (!q.includes("___")) throw new Error(`Falta ___ en ${k}: ${l}`);
        return { ...base, modo: "hueco", q, a: a.split("/").map((s) => s.trim()), dis: dis ? dis.split(",").map((s) => s.trim()).filter(Boolean) : [], es, por };
      }
      if (tipo === "O") {
        const [frases, es = "", por = ""] = f;
        return { ...base, modo: "orden", a: frases.split(" / ").map((s) => s.trim()), es, por };
      }
      throw new Error(`Ejercicio inválido en ${k}: ${l}`);
    });
    out[k] = { ...g, id: k, items };
  }
  return out;
}

// Todas las formas de una palabra (para buscar en las lecturas y detectar palabras confundidas).
export function formasDe(it) {
  const f = new Set([it.de, ...(it.deAlt || [])]);
  if (it.t === "n" && it.pl) f.add(it.pl);
  if (it.t === "n") { f.add(it.de + "s"); f.add(it.de + "n"); f.add(it.de + "es"); }
  if (it.t === "v") {
    const v = it.v;
    f.add(v.inf); f.add(v.base);
    presente(v).forEach((x) => f.add(x));
    if (v.perf !== "—") f.add(perfektDe(v).split(" ").pop());
    if (v.sep) presente(v).forEach((x) => f.add(v.sep + x));
  }
  if (it.t === "a") ["e", "en", "er", "es", "em"].forEach((e) => f.add(it.de + e));
  if (it.exTarget) f.add(it.exTarget);
  return [...f].filter(Boolean);
}
export function indiceFormas(vocab) {
  const m = new Map();
  for (const it of vocab) for (const f of formasDe(it)) { const k = norm(f); if (k && !m.has(k)) m.set(k, it); }
  // Las palabras exactas tienen prioridad sobre las formas derivadas.
  for (const it of vocab) { const k = norm(it.de); m.set(k, it); }
  return m;
}

/* ============================ Ejercicios ============================ */
export const NOMBRES_TIPO = {
  mc_de: "Reconocer", mc_es: "Elegir en alemán", listen_mc: "Escuchar", article: "der · die · das", type_de: "Escribir",
  listen_type: "Dictado", cloze_mc: "Completar", cloze_type: "Completar escribiendo", order: "Ordenar frase",
  listen_order: "Escuchar y ordenar", dictation: "Dictado de frase", speak: "Hablar", plural: "Plural", conj: "Conjugar",
  perfekt: "Perfekt", match: "Parejas", g_mc: "Gramática", g_type: "Gramática escrita", g_order: "Orden de palabras",
};
const PRODUCCION = new Set(["type_de", "listen_type", "cloze_type", "dictation", "plural", "conj", "perfekt", "g_type", "order", "listen_order", "g_order", "speak"]);
export const esProduccion = (k) => PRODUCCION.has(k);

export const conArticulo = (it) => (it.t === "n" ? `${it.art} ${it.de}` : it.de);
export const tokens = (frase) => frase.replace(/[.,!?;:„“"]/g, "").split(/\s+/).filter(Boolean);

function tiposPara(it, nivel, ctx) {
  const audio = ctx.audio !== false, voz = !!ctx.voz;
  const tieneFrase = !!(it.ex && it.exTarget);
  const multi = it.de.split(/\s+/).length >= 2;
  const T = [];
  const add = (k, w = 1, cond = true) => { if (cond) T.push([k, w]); };
  if (nivel <= 1) {
    add("mc_de", 3);
  } else if (nivel === 2) {
    add("mc_es", 3); add("listen_mc", 2, audio); add("article", 3, it.t === "n" && it.g !== "pl"); add("cloze_mc", 2, tieneFrase);
  } else if (nivel === 3) {
    add("type_de", 4); add("listen_type", 2, audio && !multi); add("cloze_mc", 1, tieneFrase); add("cloze_type", 2, tieneFrase);
    add("article", 1, it.t === "n" && it.g !== "pl"); add("order", 2, it.t === "p" && multi); add("listen_order", 1, audio && tieneFrase);
  } else {
    add("type_de", 2); add("cloze_type", 3, tieneFrase); add("order", 2, tieneFrase && tokens(it.ex).length >= 3);
    add("dictation", 2, audio && tieneFrase); add("speak", 2, voz); add("plural", 3, it.t === "n" && !!it.pl);
    add("conj", 3, it.t === "v"); add("perfekt", 2, it.t === "v" && it.v.perf !== "—"); add("listen_type", 1, audio && !multi);
  }
  return T;
}
function elegirTipo(T, ultimo, rng) {
  const f = T.filter(([k]) => k !== ultimo);
  const L = f.length ? f : T;
  const tot = L.reduce((s, [, w]) => s + w, 0);
  let r = rng() * tot;
  for (const [k, w] of L) { if ((r -= w) <= 0) return k; }
  return L[L.length - 1][0];
}
// Distractores plausibles (mismo tipo de palabra, unidades cercanas) y sin repetir lo que se muestra (clave).
function distractores(it, pool, n, rng, cond = () => true, clave = (x) => norm(x.es)) {
  const kIt = clave(it);
  const valido = (x) => x.id !== it.id && norm(x.es) !== norm(it.es) && norm(x.de) !== norm(it.de) && clave(x) && clave(x) !== kIt && cond(x);
  const mismos = pool.filter((x) => x.t === it.t && valido(x));
  const cerca = mismos.filter((x) => Math.abs((x.u || 0) - (it.u || 0)) <= 2);
  const orden = [...shuffle(cerca, rng), ...shuffle(mismos, rng), ...shuffle(pool.filter(valido), rng)];
  const out = [], vistas = new Set([kIt]);
  for (const x of orden) { const k = clave(x); if (vistas.has(k)) continue; vistas.add(k); out.push(x); if (out.length >= n) break; }
  return out;
}
function huecoEnFrase(frase, objetivo) {
  const i = frase.indexOf(objetivo);
  if (i < 0) return null;
  return { antes: frase.slice(0, i), despues: frase.slice(i + objetivo.length) };
}

// Crea un ejercicio concreto para una palabra y un nivel (1 reconocer … 4 producir en contexto).
export function crearEjercicio(it, nivel, ctx = {}) {
  const rng = ctx.rng || Math.random, pool = ctx.pool || [];
  if (it.t === "g") return ejercicioGramatica(it, nivel, ctx);
  const kind = ctx.forzar || elegirTipo(tiposPara(it, nivel, ctx), ctx.ultimo, rng);
  const de = conArticulo(it);
  const base = { kind, item: it, id: it.id, nivel, produccion: esProduccion(kind) };
  const extra = { ejemplo: it.ex ? [it.ex, it.exEs] : null };
  switch (kind) {
    case "mc_de": {
      const ops = shuffle([it, ...distractores(it, pool, 3, rng)], rng);
      return { ...base, ...extra, instr: "¿Qué significa?", mostrar: de, idioma: "de", tts: de, entrada: "mc", opciones: ops.map((x) => ({ texto: x.es, ok: x.id === it.id })), respuesta: it.es };
    }
    case "listen_mc": {
      const ops = shuffle([it, ...distractores(it, pool, 3, rng)], rng);
      return { ...base, ...extra, instr: "Escucha y elige qué significa", mostrar: null, idioma: "de", tts: de, entrada: "mc", oculto: de, opciones: ops.map((x) => ({ texto: x.es, ok: x.id === it.id })), respuesta: it.es };
    }
    case "mc_es": {
      const ops = shuffle([it, ...distractores(it, pool, 3, rng, undefined, (x) => norm(conArticulo(x)))], rng);
      return { ...base, ...extra, instr: "¿Cómo se dice en alemán?", mostrar: it.es, idioma: "es", entrada: "mc", opciones: ops.map((x) => ({ texto: conArticulo(x), genero: x.t === "n" ? x.g : null, ok: x.id === it.id, tts: conArticulo(x) })), respuesta: de };
    }
    case "article":
      return { ...base, ...extra, instr: "¿der, die o das?", mostrar: it.de, sub: it.es, idioma: "de", entrada: "articulo", opciones: ["der", "die", "das"].map((a) => ({ texto: a, ok: a === it.art })), respuesta: de, tts: de, ttsDespues: true };
    case "type_de":
      return { ...base, ...extra, instr: it.t === "n" ? "Escribe en alemán (con artículo)" : "Escribe en alemán", mostrar: it.es, idioma: "es", entrada: "texto", respuesta: de, placeholder: it.t === "n" ? "der / die / das …" : "En alemán…" };
    case "listen_type":
      return { ...base, ...extra, instr: "Escucha y escribe lo que oyes", mostrar: null, idioma: "de", tts: de, entrada: "texto", respuesta: de, oculto: de, placeholder: "Escribe en alemán…" };
    case "cloze_mc": {
      const h = huecoEnFrase(it.ex, it.exTarget);
      const ops = distractores(it, pool, 3, rng, (x) => !!x.exTarget, (x) => norm(x.exTarget || "")).map((x) => x.exTarget);
      return { ...base, ...extra, instr: "Completa la frase", hueco: h, sub: it.exEs, idioma: "de", entrada: "mc", tts: it.ex, ttsDespues: true,
        opciones: shuffle([{ texto: it.exTarget, ok: true }, ...ops.filter((o) => norm(o) !== norm(it.exTarget)).map((o) => ({ texto: o, ok: false }))], rng), respuesta: it.exTarget };
    }
    case "cloze_type": {
      const h = huecoEnFrase(it.ex, it.exTarget);
      return { ...base, ...extra, instr: "Completa la frase", hueco: h, sub: it.exEs, pista: `${de} · ${it.es}`, idioma: "de", entrada: "texto", tts: it.ex, ttsDespues: true, respuesta: it.exTarget, placeholder: "…" };
    }
    case "order":
    case "listen_order": {
      let frase = it.ex;
      if (it.t === "p" && kind === "order" && (!it.ex || rng() < 0.5)) frase = it.de;
      const trad = frase === it.de ? it.es : it.exEs;
      const tk = tokens(frase);
      const otros = shuffle(pool.filter((x) => x.ex && x.id !== it.id), rng).flatMap((x) => tokens(x.ex)).filter((w) => !tk.some((t) => norm(t) === norm(w)));
      const extraT = [...new Set(otros)].slice(0, Math.min(3, Math.max(1, Math.round(tk.length / 3))));
      const fichas = shuffle([...tk, ...extraT], rng);
      return { ...base, ...extra, instr: kind === "order" ? "Traduce ordenando las palabras" : "Escucha y ordena lo que oyes", mostrar: kind === "order" ? trad : null,
        idioma: kind === "order" ? "es" : "de", entrada: "fichas", fichas, respuesta: frase, tts: kind === "listen_order" ? frase : null, ttsDespues: kind === "order", ttsTexto: frase };
    }
    case "dictation":
      return { ...base, ...extra, instr: "Escucha y escribe la frase", mostrar: null, idioma: "de", tts: it.ex, entrada: "texto", respuesta: it.ex, oculto: it.ex, placeholder: "Escribe la frase completa…", largo: true };
    case "speak": {
      const frase = it.ex && rng() < 0.5 ? it.ex : de;
      return { ...base, ...extra, instr: "Dilo en voz alta", mostrar: frase, sub: frase === it.ex ? it.exEs : it.es, idioma: "de", tts: frase, entrada: "voz", respuesta: frase };
    }
    case "plural":
      return { ...base, ...extra, instr: "Escribe el plural", mostrar: de, sub: it.es, prefijo: "die", idioma: "de", entrada: "texto", respuesta: it.pl, tts: de, placeholder: "Plural…" };
    case "conj": {
      const p = Math.floor(rng() * 6);
      const resp = conjugar(it.v, p);
      return { ...base, ...extra, instr: `Conjuga «${it.de}» (${it.es})`, mostrar: PRONOMBRES[p] + " …", prefijo: PRONOMBRES[p].split("/")[0], idioma: "de", entrada: "texto", respuesta: resp, persona: p, placeholder: "…" };
    }
    case "perfekt": {
      const p = Math.floor(rng() * 6);
      const resp = perfektPersona(it.v, p);
      return { ...base, ...extra, instr: `Pasado (Perfekt) de «${it.de}»`, mostrar: `${PRONOMBRES[p]} …`, sub: `ej.: ich habe gemacht · ich bin gegangen`, prefijo: PRONOMBRES[p].split("/")[0], idioma: "de", entrada: "texto", respuesta: resp, persona: p, placeholder: "haben/sein + participio" };
    }
  }
  return crearEjercicio(it, nivel, { ...ctx, forzar: "mc_de" });
}

function ejercicioGramatica(it, nivel, ctx) {
  const rng = ctx.rng || Math.random;
  const base = { item: it, id: it.id, nivel, sub: it.es, explicacion: it.por, idioma: "de" };
  if (it.modo === "orden") {
    const frase = it.a[0];
    return { ...base, kind: "g_order", produccion: true, instr: "Ordena la frase", mostrar: it.es, sub: null, idioma: "es", entrada: "fichas", fichas: shuffle(tokens(frase), rng), respuesta: frase, respuestas: it.a, ttsDespues: true, ttsTexto: frase };
  }
  const [antes, despues] = it.q.split("___");
  const frase = antes + it.a[0] + despues;
  const escribir = (nivel >= 3 && (ctx.ultimo !== "g_type" || !it.dis.length)) || !it.dis.length;
  if (escribir) return { ...base, kind: "g_type", produccion: true, instr: "Completa la frase", hueco: { antes, despues }, entrada: "texto", respuesta: it.a[0], respuestas: it.a, tts: frase, ttsDespues: true, placeholder: "…" };
  return { ...base, kind: "g_mc", produccion: false, instr: "Elige la opción correcta", hueco: { antes, despues }, entrada: "mc", tts: frase, ttsDespues: true,
    opciones: shuffle([{ texto: it.a[0], ok: true }, ...it.dis.map((d) => ({ texto: d, ok: false }))], rng), respuesta: it.a[0] };
}

// Revisa la respuesta escrita/hablada/ordenada de un ejercicio.
export function revisar(ex, valor, o = {}) {
  const it = ex.item;
  switch (ex.kind) {
    case "type_de":
    case "listen_type":
      if (it.t === "n") return compararSustantivo(valor, it, o);
      return compararAleman(valor, [it.de, ...(it.deAlt || [])], o);
    case "plural": {
      // En el plural, la terminación ES la respuesta: no se perdonan letras de más o de menos.
      const v = valor.replace(/^\s*die\s+/i, "");
      if (norm(v) === norm(it.de) && norm(it.de) !== norm(it.pl)) return { ok: false, objetivo: it.pl, nota: `Esa es la forma en singular. El plural es: die ${it.pl}.` };
      return compararAleman(v, [it.pl], { ...o, estrictoUmlaut: true, tolerancia: 0, lexico: null });
    }
    case "conj":
    case "perfekt": {
      const pref = new RegExp("^\\s*(" + PRONOMBRES[ex.persona].split("/").join("|") + ")\\s+", "i");
      return compararAleman(valor.replace(pref, ""), [ex.respuesta], { ...o, estrictoUmlaut: true, tolerancia: 0, lexico: null });
    }
    case "cloze_type":
      return compararAleman(valor, [ex.respuesta], { ...o, estrictoUmlaut: true, tolerancia: ex.respuesta.length > 7 ? 1 : 0 });
    case "g_type":
      return compararAleman(valor, ex.respuestas, { ...o, estrictoUmlaut: true, tolerancia: 0, lexico: null });
    case "dictation":
      return compararAleman(valor, [ex.respuesta], { ...o, lexico: null });
    case "order":
    case "listen_order":
    case "g_order": {
      const ok = (ex.respuestas || [ex.respuesta]).some((r) => norm(r) === norm(valor));
      return { ok, objetivo: ex.respuesta };
    }
    case "speak": {
      const objetivo = norm(ex.respuesta);
      const oido = norm(valor);
      const d = dist(sinUmlaut(oido), sinUmlaut(objetivo));
      const ok = d <= Math.max(1, Math.round(objetivo.length * 0.25));
      return { ok, typo: ok && d > 0, objetivo: ex.respuesta, oido: valor };
    }
  }
  return { ok: false, objetivo: ex.respuesta };
}

/* ============================ Sesión adaptativa ============================ */
// Pasos: intro (presentar palabra) · gintro (explicar tema de gramática) · rec (reconocer) · prod (producir) · rev (repaso) · retry · match (parejas)
export class Sesion {
  constructor({ nuevos = [], repasos = [], rng = Math.random, conMatch = true, perf = 0.85, sinReintentos = false } = {}) {
    this.rng = rng; this.perf = perf; this.i = 0; this.sinReintentos = sinReintentos;
    this.stats = { ok: 0, total: 0, xp: 0, racha: 0, maxRacha: 0, porTipo: {}, inicio: Date.now() };
    this.nuevos = new Map(nuevos.map((it) => [it.id, { err: 0, typo: 0, intentos: 0, sabida: false }]));
    this.calificadas = new Map();
    this.pasos = construirPasos(nuevos, repasos, rng, conMatch);
  }
  get actual() { return this.pasos[this.i]; }
  get terminado() { return this.i >= this.pasos.length; }
  get progreso() {
    const cuenta = (p) => !["intro", "gintro"].includes(p.tipo);
    const total = this.pasos.filter(cuenta).length || 1;
    return this.pasos.slice(0, this.i).filter(cuenta).length / total;
  }
  nivel(paso) {
    const adj = this.perf > 0.93 ? 1 : this.perf < 0.72 ? -1 : 0;
    if (paso.tipo === "rec") return paso.item.t === "g" ? clamp(2 + adj, 1, 4) : clamp(1 + Math.max(0, adj), 1, 2);
    if (paso.tipo === "prod") return clamp(3 + adj, 2, 4);
    if (paso.tipo === "retry") return clamp((paso.nivelPrevio || 2) - 1, 1, 3);
    if (paso.tipo === "rev") {
      const c = paso.card || {};
      let b = c.s < 2 ? 2 : c.s < 8 ? 3 : 4;
      if (c.st === 3 || c.st === 1) b = Math.min(b, 2);
      return clamp(b + adj, 1, 4);
    }
    return 1;
  }
  saltarNueva(id) {
    // "Ya me la sé": se quita de la sesión y se califica como Fácil.
    this.pasos = this.pasos.filter((p, k) => k <= this.i || p.item.id !== id || p.tipo === "match");
    const info = this.nuevos.get(id); if (info) info.sabida = true;
    this.calificadas.set(id, 4);
    return [{ id, g: 4, nueva: true }];
  }
  // res: { ok, typo, pista, ms, kind, nivel }
  responder(paso, res) {
    const out = [];
    if (["intro", "gintro", "match"].includes(paso.tipo)) return out;
    const it = paso.item;
    const kind = res.kind || "?";
    this.stats.total++;
    const pt = this.stats.porTipo[kind] || (this.stats.porTipo[kind] = [0, 0]);
    pt[1]++;
    if (res.ok) {
      this.stats.ok++; pt[0]++; this.stats.racha++; this.stats.maxRacha = Math.max(this.stats.maxRacha, this.stats.racha);
      this.stats.xp += Math.max(1, (res.nivel >= 3 ? 3 : 2) - (res.typo ? 1 : 0));
    } else this.stats.racha = 0;
    this.perf = this.perf * 0.75 + (res.ok ? (res.typo ? 0.7 : 1) : 0) * 0.25;
    const info = this.nuevos.get(it.id);
    if (info) {
      info.intentos++;
      if (!res.ok) info.err++; else if (res.typo || res.pista) info.typo++;
      if (!res.ok && info.err <= 2) this._reinsertar(paso, res.nivel);
      const quedan = this.pasos.slice(this.i + 1).some((p) => p.item.id === it.id && p.tipo !== "match");
      if (!quedan && !this.calificadas.has(it.id)) {
        const puntos = info.err + 0.5 * info.typo;
        const g = puntos === 0 ? 3 : puntos <= 1 ? 2 : 1;
        this.calificadas.set(it.id, g);
        out.push({ id: it.id, g, nueva: true });
      }
      return out;
    }
    if (paso.tipo === "rev") {
      const g = calificar(res, paso.card);
      out.push({ id: it.id, g, nueva: false });
      this.calificadas.set(it.id, g);
      if (!res.ok) this._reinsertar(paso, res.nivel);
    } else if (paso.tipo === "retry") {
      out.push({ id: it.id, g: res.ok ? (res.typo ? 2 : 3) : 1, nueva: false, mismoDia: true });
      if (!res.ok && (paso.reintentos || 1) < 2) this._reinsertar(paso, res.nivel, (paso.reintentos || 1) + 1);
    }
    return out;
  }
  _reinsertar(paso, nivelPrevio, reintentos = 1) {
    if (this.sinReintentos) return;
    const pos = Math.min(this.pasos.length, this.i + 3 + Math.floor(this.rng() * 3));
    this.pasos.splice(pos, 0, { tipo: "retry", item: paso.item, card: paso.card, nivelPrevio, reintentos });
  }
  avanzar() { this.i++; }
}

function construirPasos(nuevos, repasos, rng, conMatch) {
  const revs = shuffle(repasos, rng);
  const pasos = [];
  const tomar = (n) => { for (let k = 0; k < n && revs.length; k++) { const r = revs.shift(); pasos.push({ tipo: "rev", item: r.item, card: r.card }); } };
  // Calentamiento: recuperar algo de memoria antes de aprender (efecto del examen).
  tomar(nuevos.length ? Math.min(2, Math.ceil(revs.length / 4)) : revs.length);
  const vocab = nuevos.filter((x) => x.t !== "g"), gram = nuevos.filter((x) => x.t === "g");
  // Gramática: explicación una vez por tema y luego cada ejercicio intercalado con repasos.
  const temas = new Set();
  for (const g of chunk(gram, 2)) {
    for (const it of g) {
      if (!temas.has(it.tema)) { temas.add(it.tema); pasos.push({ tipo: "gintro", item: it }); }
      pasos.push({ tipo: "rec", item: it });
    }
    tomar(1);
  }
  // Vocabulario: de dos en dos (presentar → reconocer → repaso → producir las del grupo anterior).
  let pendientes = [], presentadas = [], ultimoMatch = 0;
  for (const g of chunk(vocab, 2)) {
    for (const it of g) pasos.push({ tipo: "intro", item: it });
    for (const it of g) pasos.push({ tipo: "rec", item: it });
    tomar(1);
    pasos.push(...pendientes);
    pendientes = shuffle(g, rng).map((it) => ({ tipo: "prod", item: it }));
    presentadas.push(...g);
    if (conMatch && presentadas.length - ultimoMatch >= 4) {
      pasos.push({ tipo: "match", item: g[0], items: presentadas.slice(-5) });
      ultimoMatch = presentadas.length;
    }
    tomar(1);
  }
  pasos.push(...pendientes);
  // El resto de los repasos se reparten al final, mezclados.
  while (revs.length) tomar(1);
  return pasos;
}

/* ============================ Estadísticas ============================ */
export function resumen(cards, hoy = dayNum()) {
  const r = { total: 0, aprendiendo: 0, jovenes: 0, maduras: 0, pendientes: 0, pronostico: new Array(14).fill(0) };
  for (const c of Object.values(cards || {})) {
    if (!c || !c.last) continue;
    r.total++;
    if (c.st !== 2) r.aprendiendo++; else if (c.s >= 21) r.maduras++; else r.jovenes++;
    if (c.due <= hoy) r.pendientes++;
    const k = Math.max(0, c.due - hoy);
    if (k < 14) r.pronostico[k]++;
  }
  return r;
}
// Palabras ordenadas de la más olvidada a la menos (para repasar lo que está por olvidarse).
export function vencidas(cards, hoy = dayNum(), now = Date.now()) {
  return Object.entries(cards || {}).filter(([, c]) => c && c.last && c.due <= hoy)
    .map(([id, c]) => ({ id, c, R: retencionActual(c, now) })).sort((a, b) => a.R - b.R);
}
