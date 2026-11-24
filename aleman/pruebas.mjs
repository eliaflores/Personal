// Pruebas de Täglich (motor y contenido). Se corren con:  node aleman/pruebas.mjs
import * as M from "./motor.js";
import { A1 } from "./vocab-a1.js";
import { A2 } from "./vocab-a2.js";
import { B1 } from "./vocab-b1.js";
import { TEMAS } from "./gramatica.js";
import { LECTURAS } from "./lecturas.js";
import { SERIES } from "./series.js";

let fallas = 0, pasadas = 0;
const ok = (cond, msg) => { if (cond) pasadas++; else { fallas++; console.log("✗", msg); } };
const igual = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg}: esperaba ${JSON.stringify(b)}, salió ${JSON.stringify(a)}`);

/* ---------- Contenido ---------- */
const G = M.prepararGramatica(TEMAS);
const C = M.prepararContenido([...A1, ...A2, ...B1], G);
const LEX = M.indiceFormas(C.vocab);
const lect = new Set(LECTURAS.map((l) => l.id));
ok(C.vocab.length > 700, "hay más de 700 palabras");
for (const u of C.unidades) {
  for (const g of u.gramatica || []) ok(!!G[g], `${u.id}: existe el tema de gramática ${g}`);
  if (u.lectura) ok(lect.has(u.lectura), `${u.id}: existe la lectura ${u.lectura}`);
  for (const l of u.lecciones) ok(l.items.length >= 2 && l.items.length <= 7, `${l.id}: lección de 2 a 7 palabras (${l.items.length})`);
}
for (const it of C.vocab) {
  ok(!!it.es && !!it.emoji, `${it.id}: tiene español y emoji`);
  if (it.ex) ok(!!it.exTarget && it.ex.includes(it.exTarget), `${it.id}: la palabra marcada está en el ejemplo`);
  if (it.t === "n") ok(["der", "die", "das"].includes(it.art), `${it.id}: sustantivo con artículo`);
}
for (const g of Object.values(G)) {
  ok(g.items.length >= 8, `${g.id}: al menos 8 ejercicios`);
  for (const d of g.items) {
    if (d.modo === "hueco") ok(!d.dis.some((x) => d.a.includes(x)), `${d.id}: distractor distinto de la respuesta`);
    ok(!!d.es, `${d.id}: tiene traducción`);
  }
}
for (const l of LECTURAS) for (const p of l.preguntas) ok(p.a >= 0 && p.a < p.opts.length, `${l.id}: respuesta válida`);

/* ---------- Aprende viendo ---------- */
const unidadesIds = new Set(C.unidades.map((u) => u.id));
const idsCap = new Set();
for (const sr of SERIES) {
  ok(["A1", "A2", "B1", "B2"].includes(sr.nivel), `${sr.id}: nivel válido`);
  ok(sr.donde.length > 0 && sr.donde.every((d) => d.tipo !== "web" || /^https:\/\//.test(d.url)), `${sr.id}: dónde verla con enlaces válidos`);
  ok(sr.capitulos.length > 0, `${sr.id}: tiene capítulos`);
  for (const c of sr.capitulos) {
    ok(!idsCap.has(c.id), `${c.id}: id único`); idsCap.add(c.id);
    ok(c.foco && c.antes && c.durante && c.despues && c.min > 0, `${c.id}: objetivo, pasos y duración`);
    if (c.unidad) ok(unidadesIds.has(c.unidad), `${c.id}: la unidad ${c.unidad} existe`);
    if (c.nivel) ok(["A1", "A2", "B1", "B2"].includes(c.nivel), `${c.id}: nivel válido`);
    if (sr.donde.some((d) => d.tipo === "youtube")) ok(!!c.busca, `${c.id}: búsqueda de YouTube`);
  }
}

/* ---------- Conjugación ---------- */
const v = (s) => M.parseLinea(s);
igual(M.presente(v("V fahren (fährt; ist gefahren) | ir").v), ["fahre", "fährst", "fährt", "fahren", "fahrt", "fahren"], "fahren");
igual(M.presente(v("V arbeiten | trabajar").v), ["arbeite", "arbeitest", "arbeitet", "arbeiten", "arbeitet", "arbeiten"], "arbeiten");
igual(M.presente(v("V heißen | llamarse").v)[1], "heißt", "du heißt");
igual(M.presente(v("V sammeln | coleccionar").v)[0], "sammle", "ich sammle");
igual(M.conjugar(v("V auf·stehen (; ist aufgestanden) | levantarse").v, 0), "stehe auf", "ich stehe auf");
igual(M.conjugar(v("V sich freuen | alegrarse").v, 1), "freust dich", "du freust dich");
igual(M.perfektDe(v("V ein·kaufen | comprar").v), "hat eingekauft", "eingekauft");
igual(M.perfektDe(v("V besuchen | visitar").v), "hat besucht", "besucht");
igual(M.perfektDe(v("V studieren | estudiar").v), "hat studiert", "studiert");
igual(M.perfektPersona(v("V gehen (; ist gegangen) | ir").v, 3), "sind gegangen", "wir sind gegangen");

/* ---------- Revisar respuestas ---------- */
const hund = v("N der Hund, Hunde | perro");
ok(M.compararSustantivo("der Hund", hund).exacto, "der Hund exacto");
ok(M.compararSustantivo("Hund", hund).typo, "sin artículo = casi");
ok(!M.compararSustantivo("die Hund", hund).ok, "artículo equivocado = mal");
ok(M.compararSustantivo("die strasse", v("N die Straße, Straßen | calle")).ok, "ss por ß");
ok(M.compararAleman("schoen", ["schön"]).ok, "oe por ö");
ok(!M.compararAleman("Bruder", ["Brüder"], { estrictoUmlaut: true }).ok, "Bruder ≠ Brüder en plural");
ok(!M.compararAleman("Butter", ["Mutter"], { lexico: LEX }).ok, "Butter no es typo de Mutter");
ok(!M.revisar({ kind: "plural", item: v("N der Tag, Tage | día") }, "Tag").ok, "el singular no vale como plural");

/* ---------- FSRS ---------- */
ok(Math.abs(M.retrievability(10, 10) - 0.9) < 1e-9, "R(S, S) = 90%");
ok(Math.abs(M.intervalo(10, 0.9) - 10) < 1e-6, "intervalo con 90% = S");
const t0 = Date.UTC(2026, 0, 1, 12);
let c = M.programar(null, 3, t0, { rng: () => 0.5 });
const s1 = c.s;
c = M.programar(c, 3, t0 + 3 * M.DAY, { rng: () => 0.5 });
ok(c.s > s1, "acertar después de días aumenta la estabilidad");
const c2 = M.programar(c, 1, t0 + 20 * M.DAY, { rng: () => 0.5 });
ok(c2.s < c.s && c2.lapses === 1 && c2.due === M.dayNum(t0 + 20 * M.DAY) + 1, "olvidar baja la estabilidad y repasa mañana");
ok(M.programar(null, 3, t0, { primeraLeccion: true }).due - M.dayNum(t0) <= 2, "primera revisión en ≤ 2 días");

/* ---------- Cada ejercicio acepta su propia respuesta correcta ---------- */
const rng = M.mulberry32(7);
const tipos = new Set();
for (const it of [...C.vocab, ...Object.values(G).flatMap((g) => g.items)]) {
  for (let nivel = 1; nivel <= 4; nivel++) {
    for (let k = 0; k < 4; k++) {
      let ex;
      try { ex = M.crearEjercicio(it, nivel, { pool: C.vocab, rng, audio: true, voz: true, ultimo: null }); }
      catch (e) { ok(false, `${it.id} nivel ${nivel}: ${e.message}`); continue; }
      tipos.add(ex.kind);
      if (ex.entrada === "mc" || ex.entrada === "articulo") {
        ok(ex.opciones.filter((o) => o.ok).length === 1, `${it.id} ${ex.kind}: una sola opción correcta`);
        ok(new Set(ex.opciones.map((o) => (it.t === "g" ? o.texto : M.norm(o.texto)))).size === ex.opciones.length, `${it.id} ${ex.kind}: opciones distintas (${ex.opciones.map((o) => o.texto).join(" / ")})`);
      } else if (ex.entrada === "texto" || ex.entrada === "voz") {
        let resp = ex.respuesta;
        const r = M.revisar(ex, resp, { lexico: LEX });
        ok(r.ok && !r.typo, `${it.id} ${ex.kind}: acepta «${resp}» (${r.nota || ""})`);
      } else if (ex.entrada === "fichas") {
        const tk = M.tokens(ex.respuesta);
        const bolsa = ex.fichas.slice();
        ok(tk.every((w) => { const i = bolsa.indexOf(w); if (i < 0) return false; bolsa.splice(i, 1); return true; }), `${it.id} ${ex.kind}: las fichas alcanzan para «${ex.respuesta}»`);
        ok(M.revisar(ex, tk.join(" ")).ok, `${it.id} ${ex.kind}: acepta el orden correcto`);
      }
    }
  }
}
ok(tipos.size >= 18, `se generan muchos tipos de ejercicio (${tipos.size}: ${[...tipos].join(", ")})`);

/* ---------- Sesión ---------- */
const nuevos = C.unidades[0].lecciones[0].items;
const ses = new M.Sesion({ nuevos, repasos: [], rng: M.mulberry32(3) });
const cal = new Map();
let pasos = 0, fallo = false;
while (!ses.terminado && pasos++ < 200) {
  const p = ses.actual;
  if (p.tipo !== "intro" && p.tipo !== "match") {
    const malo = !fallo && p.tipo === "rec"; if (malo) fallo = true;
    for (const x of ses.responder(p, { ok: !malo, kind: "mc_de", nivel: 1 })) cal.set(x.id, x.g);
  }
  ses.avanzar();
}
ok(ses.terminado, "la sesión termina");
igual(cal.size, nuevos.length, "todas las palabras nuevas quedan calificadas");
ok([...cal.values()].filter((g) => g < 3).length === 1, "la palabra fallada queda como difícil");

console.log(`\n${pasadas} pruebas pasaron, ${fallas} fallaron.`);
process.exit(fallas ? 1 : 0);
