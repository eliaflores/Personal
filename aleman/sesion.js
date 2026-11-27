// Täglich · pantalla de la sesión: presenta palabras, muestra ejercicios, revisa y da retroalimentación.
import { crearEjercicio, revisar, conArticulo, reglaGenero, presente, PRONOMBRES, perfektDe, shuffle, norm, dist, sinUmlaut } from "./motor.js";
import { $, $$, esc, Voz, Oido, Sonido, confeti, I, DECO, circ, pastelGenero, flechaAnillo, onda, iconoItem, nota } from "./servicios.js";

const BIEN = ["¡Bien!", "¡Perfecto!", "¡Genial!", "Sehr gut!", "¡Toll!", "¡Exacto!", "Super!", "Prima!", "Wunderbar!"];
const UMLAUTS = ["ä", "ö", "ü", "ß"];

export function htmlPalabra(it, cls = "") {
  if (!it) return "";
  if (it.t === "n") return `<span class="pal g-${it.g} ${cls}"><span class="art">${esc(it.art)}</span> ${esc(it.de)}</span>`;
  return `<span class="pal ${cls}">${esc(it.de)}</span>`;
}
export function formasVerbo(it) {
  if (!it || it.t !== "v") return "";
  const f = presente(it.v), sep = it.v.sep ? " " + it.v.sep : "", r = it.v.reflexivo;
  const p = [`ich ${f[0]}${r ? " mich" : ""}${sep}`, `du ${f[1]}${r ? " dich" : ""}${sep}`, `er ${f[2]}${r ? " sich" : ""}${sep}`];
  if (it.v.perf !== "—") p.push(perfektDe(it.v));
  return p.join(" · ");
}
export const botonAudio = (texto, cls = "") => `<button class="audio ${cls}" data-say="${esc(texto)}" aria-label="Escuchar">${I("audio")}</button>`;
export const botonLento = (texto) => `<button class="audio lento" data-say="${esc(texto)}" data-lento="1" aria-label="Escuchar lento">${I("tortuga")}</button>`;

function validoPara(kind, it, audio, voz) {
  if (it.t === "g") return false;
  if (kind === "article") return it.t === "n" && it.g !== "pl";
  if (kind === "plural") return it.t === "n" && !!it.pl;
  if (kind === "conj") return it.t === "v";
  if (kind === "perfekt") return it.t === "v" && it.v.perf !== "—";
  if (["listen_mc", "listen_type"].includes(kind)) return audio;
  if (["dictation", "listen_order"].includes(kind)) return audio && !!(it.ex && it.exTarget);
  if (kind === "speak") return voz;
  if (["cloze_mc", "cloze_type", "order"].includes(kind)) return !!(it.ex && it.exTarget);
  return true;
}

// Corre una sesión dentro de `root`. opts: { sesion, ctx, temas, ajustes, onCalificar, onFin, onCerrar }
export function correr(root, opts) {
  const { sesion, ctx, temas, ajustes } = opts;
  const R = { paso: null, ex: null, t0: 0, res: null, pista: false, ultimo: null, sinAudioHasta: 0, sinVoz: false, elegidas: [], match: null, cerrada: false };

  root.innerHTML = `
    <div class="ses" id="ses">
      <div class="ses-top">
        <button class="ses-x" data-a="salir" aria-label="Salir">${I("x")}</button>
        <div class="ses-barra" role="progressbar" aria-label="Progreso"><i id="sesBarra"></i></div>
        <div class="ses-combo" id="sesCombo"></div>
      </div>
      <div class="ses-cuerpo" id="sesCuerpo"></div>
      <div class="ses-pie" id="sesPie"></div>
    </div>`;
  const cuerpo = $("#sesCuerpo"), pie = $("#sesPie");

  const audioOn = () => ctx.audio !== false && Voz.ok && Date.now() > R.sinAudioHasta;
  // Mientras suena el audio, las ondas del ejercicio de escuchar se mueven.
  const decir = (t, lento) => {
    if (!Voz.ok) return;
    const e = $(".escucha:not(.voz)", cuerpo);
    if (e) e.classList.add("hablando");
    Voz.hablar(t, { lento, fin: () => { const x = $(".escucha:not(.voz)", cuerpo); if (x) x.classList.remove("hablando"); } });
  };

  function barra() {
    $("#sesBarra").style.width = Math.round(sesion.progreso * 100) + "%";
    const c = sesion.stats.racha;
    $("#sesCombo").innerHTML = c >= 3 ? `${I("fuego")}<b>${c}</b>` : "";
    $("#sesCombo").classList.toggle("on", c >= 3);
  }

  function siguiente() {
    if (R.cerrada) return;
    Voz.parar(); Oido.parar();
    barra();
    if (sesion.terminado) return fin(false);
    const paso = sesion.actual;
    Object.assign(R, { paso, res: null, pista: false, elegidas: [], ex: null });
    cuerpo.scrollTop = 0;
    if (paso.tipo === "intro") return pintarIntro(paso.item);
    if (paso.tipo === "gintro") return pintarGIntro(paso.item, paso);
    if (paso.tipo === "match") return pintarMatch(paso.items);
    const nivel = sesion.nivel(paso);
    const audio = audioOn(), voz = ctx.voz !== false && Oido.ok && !R.sinVoz;
    let forzar = null;
    if (paso.forzar) {
      const ops = paso.forzar.filter((k) => validoPara(k, paso.item, audio, voz));
      forzar = ops.length ? ops[Math.floor(Math.random() * ops.length)] : null;
    }
    R.ex = crearEjercicio(paso.item, nivel, { ...ctx, audio, voz, ultimo: R.ultimo, forzar });
    R.ultimo = R.ex.kind;
    R.t0 = Date.now();
    pintarEjercicio();
  }

  /* ---------- Presentar una palabra nueva ---------- */
  function pintarIntro(it) {
    const regla = reglaGenero(it);
    const extra = it.t === "n" ? (it.pl ? `Plural: <b class="g-pl">die ${esc(it.pl)}</b>` : it.g === "pl" ? "Solo en plural" : "Sin plural") : "";
    cuerpo.innerHTML = `
      <div class="intro anim">
        <div class="intro-card ${pastelGenero(it)}">
          ${DECO}
          <span class="intro-tag">${I("brillo")} Palabra nueva</span>
          <div class="intro-emoji">${I(iconoItem(it))}</div>
          <div class="intro-de">${htmlPalabra(it)}</div>
          <div class="intro-es">${esc(it.es)}${it.esAlt && it.esAlt.length ? `<small>${esc(it.esAlt.join(" · "))}</small>` : ""}</div>
          <div class="intro-chips">${botonAudio(conArticulo(it), "grande")}${botonLento(conArticulo(it))}${extra ? `<span class="chip-b">${extra}</span>` : ""}</div>
        </div>
        ${it.t === "v" ? `<div class="intro-formas">${formasVerbo(it).split(" · ").map((f) => `<span>${esc(f)}</span>`).join("")}</div>` : ""}
        ${it.ex ? `<button class="intro-ej" data-say="${esc(it.ex)}">${I("audio")}<span><b>${esc(it.ex)}</b><i>${esc(it.exEs)}</i></span></button>` : ""}
        ${it.nota ? nota("bombilla", esc(it.nota)) : ""}
        ${regla ? `<div class="tip genero g-${it.g}">${I("paleta")}<span>${esc(regla)}</span></div>` : ""}
      </div>`;
    pie.innerHTML = `<div class="pie-fila"><button class="btn sec" data-a="sabida">Ya me la sé</button><button class="btn primario" data-a="continuar" autofocus>Continuar</button></div>`;
    if (audioOn() && ajustes.autoAudio) setTimeout(() => decir(conArticulo(it)), 250);
  }

  function pintarGIntro(it, paso = {}) {
    const tema = temas[it.tema];
    cuerpo.innerHTML = `
      <div class="gintro anim">
        <div class="intro-tag">${paso.inductivo ? "Ya viste ejemplos · ahora la regla" : "Gramática · " + esc(tema.nivel)}</div>
        <h2>${esc(tema.titulo)}</h2>
        <div class="gram">${tema.html}</div>
      </div>`;
    pie.innerHTML = `<button class="btn primario ancho" data-a="continuar">¡Entendido, a practicar!</button>`;
  }

  /* ---------- Parejas ---------- */
  function pintarMatch(items) {
    const izq = shuffle(items), der = shuffle(items);
    R.match = { sel: null, hechos: new Set(), errores: 0, total: items.length };
    cuerpo.innerHTML = `
      <div class="ex anim">
        <div class="ex-instr">Une las parejas</div>
        <div class="match">
          <div class="match-col">${izq.map((it) => `<button class="mt de" data-mt="${it.id}" data-lado="de">${htmlPalabra(it)}</button>`).join("")}</div>
          <div class="match-col">${der.map((it) => `<button class="mt" data-mt="${it.id}" data-lado="es">${esc(it.es)}</button>`).join("")}</div>
        </div>
      </div>`;
    pie.innerHTML = `<div class="pie-hint">Toca una palabra y luego su significado</div>`;
  }
  function tocarMatch(btn) {
    const M = R.match;
    if (btn.classList.contains("hecho")) return;
    if (btn.dataset.lado === "de" && audioOn()) decir(btn.textContent.trim());
    if (!M.sel || M.sel.dataset.lado === btn.dataset.lado) {
      $$(".mt.sel", cuerpo).forEach((b) => b.classList.remove("sel"));
      btn.classList.add("sel"); M.sel = btn; return;
    }
    const a = M.sel; M.sel = null; a.classList.remove("sel");
    if (a.dataset.mt === btn.dataset.mt) {
      a.classList.add("hecho"); btn.classList.add("hecho"); Sonido.pop();
      M.hechos.add(a.dataset.mt);
      if (M.hechos.size === M.total) {
        sesion.stats.xp += Math.max(1, 3 - M.errores);
        setTimeout(() => { sesion.avanzar(); siguiente(); }, 450);
      }
    } else {
      M.errores++;
      [a, btn].forEach((b) => { b.classList.add("mal"); setTimeout(() => b.classList.remove("mal"), 450); });
      Sonido.mal();
    }
  }

  /* ---------- Ejercicios ---------- */
  function pintarEjercicio() {
    const ex = R.ex, it = ex.item;
    let h = `<div class="ex anim"><div class="ex-instr">${esc(ex.instr)}</div>`;
    const conEmoji = !["mc_de", "listen_mc", "listen_type", "dictation", "listen_order"].includes(ex.kind) && it.t !== "g";
    const enLinea = ex.entrada === "texto" && ex.hueco;
    if (ex.hueco) {
      const hueco = enLinea
        ? `<input id="resp" class="hueco-in" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" style="width:${Math.max(4, String(ex.respuesta).length + 2)}ch" aria-label="Respuesta">`
        : `<span class="hueco" id="hueco">&nbsp;</span>`;
      h += `<div class="ex-frase">${esc(ex.hueco.antes)}${hueco}${esc(ex.hueco.despues)}</div>`;
      if (ex.sub) h += `<div class="ex-sub">${esc(ex.sub)}</div>`;
      if (ex.pista) h += `<button class="link pista" data-a="pista">Ver pista</button><div class="pista-txt" id="pistaTxt" hidden>${esc(ex.pista)}</div>`;
    } else if (ex.mostrar == null) {
      h += `<div class="escucha"><div class="aura" aria-hidden="true"></div>
        <button class="parlante" data-a="oir" aria-label="Escuchar">${onda()}</button>
        <button class="parlante chico" data-a="oirlento" aria-label="Escuchar lento">${I("tortuga")}</button>
      </div>
      <button class="link" data-a="sinaudio">No puedo escuchar ahora</button>`;
    } else {
      if (conEmoji) h += `<div class="ex-emoji ${pastelGenero(it)}">${I(iconoItem(it))}</div>`;
      if (ex.idioma === "de") {
        const txt = ex.kind === "article" ? `<span class="pal"><span class="art">___</span> ${esc(it.de)}</span>` : ex.kind === "mc_de" ? htmlPalabra(it) : `<span class="pal">${esc(ex.mostrar)}</span>`;
        h += `<div class="ex-prompt de">${txt}${ex.kind !== "article" && ex.tts && !ex.ttsDespues ? botonAudio(ex.tts) : ""}</div>`;
      } else h += `<div class="ex-prompt es">${esc(ex.mostrar)}</div>`;
      if (ex.sub) h += `<div class="ex-sub">${esc(ex.sub)}</div>`;
    }
    if (ex.entrada === "mc") {
      h += `<div class="ops">${ex.opciones.map((o, i) => `<button class="op ${o.genero ? "g-" + o.genero : ""}" data-op="${i}"><span class="op-n">${i + 1}</span><span class="op-t">${esc(o.texto)}</span></button>`).join("")}</div>`;
    } else if (ex.entrada === "articulo") {
      h += `<div class="arts">${ex.opciones.map((o, i) => `<button class="art-b" data-op="${i}">${esc(o.texto)}</button>`).join("")}</div>`;
    } else if (ex.entrada === "texto" && !enLinea) {
      const campo = ex.largo
        ? `<textarea id="resp" rows="3" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${esc(ex.placeholder || "")}"></textarea>`
        : `<input id="resp" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="${esc(ex.placeholder || "")}" aria-label="Respuesta">`;
      h += `<div class="campo">${ex.prefijo ? `<span class="pref">${esc(ex.prefijo)}</span>` : ""}${campo}</div>`;
    } else if (ex.entrada === "fichas") {
      h += `<div class="f-resp" id="fResp"></div><div class="f-banco" id="fBanco"></div>`;
    } else if (ex.entrada === "voz") {
      h += `<div class="escucha voz"><div class="aura" aria-hidden="true"></div>${onda(13)}</div>
        <button class="mic" data-a="mic">${I("mic")}<span>Toca y habla</span></button><div class="oido" id="oido"></div>
        <button class="link" data-a="sinvoz">No puedo hablar ahora</button>`;
    }
    h += `</div>`;
    cuerpo.innerHTML = h;
    // Pie
    if (ex.entrada === "texto") {
      pie.innerHTML = `<div class="teclas">${UMLAUTS.map((k) => `<button class="tecla" data-k="${k}" tabindex="-1">${k}</button>`).join("")}</div>
        <div class="pie-fila"><button class="btn sec" data-a="nose">No lo sé</button><button class="btn primario" data-a="comprobar" disabled>Comprobar</button></div>`;
      const inp = $("#resp");
      inp.addEventListener("input", () => { $("[data-a=comprobar]", pie).disabled = !inp.value.trim(); });
      setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); } }, 60);
    } else if (ex.entrada === "fichas") {
      pie.innerHTML = `<div class="pie-fila"><button class="btn sec" data-a="nose">No lo sé</button><button class="btn primario" data-a="comprobar" disabled>Comprobar</button></div>`;
      pintarFichas();
    } else if (ex.entrada === "voz") {
      pie.innerHTML = `<div class="pie-fila"><button class="btn sec" data-a="nose">Saltar</button></div>`;
    } else {
      pie.innerHTML = `<div class="pie-hint">${ex.entrada === "articulo" ? "Elige el artículo" : "Elige una opción"}</div>`;
    }
    // Audio al empezar
    if (ex.tts && !ex.ttsDespues && audioOn() && (ex.mostrar == null || ajustes.autoAudio)) setTimeout(() => decir(ex.tts), 280);
  }

  function pintarFichas() {
    const ex = R.ex;
    const usadas = new Set(R.elegidas);
    $("#fResp").innerHTML = R.elegidas.map((i, k) => `<button class="ficha en" data-fr="${k}">${esc(ex.fichas[i])}</button>`).join("") || `<span class="f-vacio">Toca las palabras en orden</span>`;
    $("#fBanco").innerHTML = ex.fichas.map((f, i) => `<button class="ficha ${usadas.has(i) ? "usada" : ""}" data-fb="${i}" ${usadas.has(i) ? "disabled" : ""}>${esc(f)}</button>`).join("");
    const b = $("[data-a=comprobar]", pie); if (b) b.disabled = !R.elegidas.length;
  }

  /* ---------- Revisar ---------- */
  function comprobar({ opcion, valor, nose } = {}) {
    if (R.res) return;
    const ex = R.ex;
    let res;
    if (nose) res = { ok: false, objetivo: ex.respuesta, nose: true };
    else if (opcion != null) {
      const o = ex.opciones[opcion];
      res = { ok: !!o.ok, objetivo: ex.respuesta, elegida: opcion };
      if (!o.ok && ctx.lexico && ex.kind === "mc_es") {
        const otra = ctx.lexico.get(norm(o.texto.replace(/^(der|die|das)\s+/i, "")));
        if (otra) res.nota = `«${o.texto}» significa «${otra.es}».`;
      }
    } else {
      if (ex.entrada === "fichas") valor = R.elegidas.map((i) => ex.fichas[i]).join(" ");
      res = revisar(ex, valor || "", { lexico: ctx.lexico });
      res.valor = valor;
    }
    Object.assign(res, { ms: Date.now() - R.t0, kind: ex.kind, nivel: ex.nivel, produccion: ex.produccion, largo: String(ex.respuesta || "").length, pista: R.pista });
    R.res = res;
    mostrarFeedback();
  }

  function mostrarFeedback() {
    const ex = R.ex, it = ex.item, res = R.res;
    // Marcar opciones
    if (ex.entrada === "mc" || ex.entrada === "articulo") {
      $$("[data-op]", cuerpo).forEach((b, i) => {
        b.disabled = true;
        if (ex.opciones[i].ok) b.classList.add("bien");
        else if (i === res.elegida) b.classList.add("mal");
      });
      if (ex.entrada === "articulo") $$("[data-op]", cuerpo).forEach((b, i) => { if (ex.opciones[i].ok) b.classList.add("g-" + it.g); });
      if (ex.hueco && $("#hueco")) { $("#hueco").textContent = ex.respuesta; $("#hueco").classList.add(res.ok ? "bien" : "mal"); }
      if (ex.kind === "article") { const a = $(".ex-prompt .art", cuerpo); if (a) { a.textContent = it.art; a.parentElement.classList.add("g-" + it.g); } }
    }
    const inp = $("#resp"); if (inp) { inp.disabled = true; inp.classList.add(res.ok ? "bien" : "mal"); }
    $$(".ficha", cuerpo).forEach((b) => (b.disabled = true));
    if (res.ok) Sonido.bien(); else Sonido.mal();
    if (navigator.vibrate && !res.ok) try { navigator.vibrate(60); } catch (e) { /* nada */ }

    const respTxt = it.t === "g" ? (ex.respuestas || [ex.respuesta])[0] : res.objetivo || ex.respuesta;
    const decirTxt = ex.ttsTexto || (ex.hueco ? ex.tts : it.t === "g" ? null : ["conj", "perfekt"].includes(ex.kind) ? `${PRONOMBRES[ex.persona].split("/")[0]} ${ex.respuesta}` : ex.kind === "plural" ? `die ${it.pl}` : ["dictation", "speak", "order", "listen_order"].includes(ex.kind) ? ex.respuesta : conArticulo(it));
    const combo = sesion.stats.racha + (res.ok ? 1 : 0);
    let titulo = res.ok ? (res.typo ? "Casi perfecto" : combo >= 5 && combo % 5 === 0 ? `¡${combo} seguidas!` : BIEN[Math.floor(Math.random() * BIEN.length)]) : res.nose ? "La respuesta es:" : "Respuesta correcta:";
    const notas = [];   // [ícono, texto]
    if (res.nota) notas.push(["info", res.nota]);
    if (!res.ok && it.t === "n" && (res.articulo || ex.kind === "article")) { const r = reglaGenero(it); if (r) notas.push(["paleta", r]); }
    if (ex.explicacion && (!res.ok || res.typo || it.t === "g")) notas.push(["bombilla", ex.explicacion]);
    if (!res.ok && it.t === "v" && ["conj", "perfekt", "type_de", "cloze_type"].includes(ex.kind)) notas.push(["repetir", formasVerbo(it)]);
    if (!res.ok && it.nota && it.t !== "g") notas.push(["bombilla", it.nota]);
    if (res.oido && res.oido.length) notas.push(["mic", `Escuché: «${res.oido}»`]);
    const muestraResp = !res.ok || res.typo || ex.mostrar == null || ex.kind === "speak";
    const signif = it.t !== "g" && ex.idioma !== "es" && !["mc_de", "listen_mc"].includes(ex.kind) && ex.mostrar == null ? (ex.kind === "dictation" || ex.kind === "listen_order" ? it.exEs : it.es) : null;
    const ejemplo = it.t !== "g" && ex.ejemplo && !["dictation", "cloze_mc", "cloze_type", "listen_order"].includes(ex.kind) && !(ex.kind === "order" && ex.respuesta === it.ex) ? ex.ejemplo : null;
    pie.innerHTML = `
      <div class="fb ${res.ok ? "ok" : "mal"} anim-up" role="status">
        <div class="fb-cab"><span class="fb-ico">${res.ok ? I("check") : I("x")}</span><b>${esc(titulo)}</b>${decirTxt ? botonAudio(decirTxt) : ""}</div>
        ${muestraResp ? `<div class="fb-resp">${it.t === "n" && !["cloze_type", "cloze_mc", "plural", "dictation", "order", "listen_order", "speak"].includes(ex.kind) ? htmlPalabra(it) : esc(respTxt)}</div>` : ""}
        ${signif ? `<div class="fb-sig">= ${esc(signif)}</div>` : ""}
        ${notas.map(([ico, n]) => `<div class="fb-nota">${I(ico)}<span>${esc(n)}</span></div>`).join("")}
        ${ejemplo ? `<button class="fb-ej" data-say="${esc(ejemplo[0])}">${I("audio")}<span>${esc(ejemplo[0])} <i>${esc(ejemplo[1])}</i></span></button>` : ""}
        <div class="pie-fila">
          ${!res.ok && !res.nose && ex.entrada !== "mc" && ex.entrada !== "articulo" ? `<button class="link" data-a="razon">Lo tenía bien</button>` : ""}
          <button class="btn ${res.ok ? "verde" : "rojo"}" data-a="continuar">Continuar</button>
        </div>
      </div>`;
    if (decirTxt && audioOn() && (ex.ttsDespues || ex.mostrar != null || ex.kind === "speak") && ajustes.autoAudio && ex.kind !== "speak") setTimeout(() => decir(decirTxt), 150);
    setTimeout(() => { const b = $("[data-a=continuar]", pie); if (b) b.focus({ preventScroll: true }); }, 30);
  }

  function continuar() {
    const paso = R.paso;
    if (paso.tipo === "intro" || paso.tipo === "gintro") { sesion.avanzar(); return siguiente(); }
    if (!R.res) return;
    const cals = sesion.responder(paso, R.res);
    if (cals.length) opts.onCalificar(cals);
    sesion.avanzar();
    siguiente();
  }

  /* ---------- Hablar ---------- */
  async function microfono() {
    const ex = R.ex, out = $("#oido"), mic = $(".mic", cuerpo);
    const zona = $(".escucha.voz", cuerpo);
    mic.classList.add("escuchando"); mic.querySelector("span").textContent = "Te escucho…";
    if (zona) zona.classList.add("hablando");
    out.textContent = "";
    try {
      const alts = await Oido.escuchar();
      if (zona) zona.classList.remove("hablando");
      mic.classList.remove("escuchando"); mic.querySelector("span").textContent = "Toca y habla";
      if (!alts.length) { out.textContent = "No te escuché. Intenta otra vez."; return; }
      const obj = sinUmlaut(norm(ex.respuesta));
      const mejor = alts.slice().sort((a, b) => dist(sinUmlaut(norm(a)), obj) - dist(sinUmlaut(norm(b)), obj))[0];
      out.textContent = "«" + mejor + "»";
      comprobar({ valor: mejor });
    } catch (e) {
      if (zona) zona.classList.remove("hablando");
      mic.classList.remove("escuchando"); mic.querySelector("span").textContent = "Toca y habla";
      if (e.message === "not-allowed" || e.message === "service-not-allowed") { out.textContent = "Permite el micrófono para practicar la pronunciación."; }
      else out.textContent = "No se pudo usar el micrófono. Intenta otra vez o salta este ejercicio.";
    }
  }

  /* ---------- Fin ---------- */
  async function fin(parcial) {
    if (R.cerrada) return;
    R.cerrada = true;
    Voz.parar(); Oido.parar();
    document.removeEventListener("keydown", tecla);
    const r = await opts.onFin(sesion.stats, { parcial });
    if (!r) return opts.onCerrar();
    const pct = r.total ? Math.round((100 * r.ok) / r.total) : 100;
    const seg = Math.max(1, Math.round(r.ms / 1000)), mm = Math.floor(seg / 60), ss = seg % 60;
    const metaPct = Math.min(100, Math.round((100 * r.xpHoy) / Math.max(1, r.meta)));
    const sig = r.siguiente;
    root.innerHTML = `
      <div class="fin anim">
        <div class="fin-hero">${DECO}<span class="fin-emoji">${I(parcial ? "pulgar" : r.perfecto ? "trofeo" : pct >= 85 ? "fiesta" : "pesa")}</span></div>
        <h1>${parcial ? "¡Buen avance!" : r.perfecto ? "¡Perfecto! Sesión sin errores" : "¡Excelente! Sesión completada"}</h1>
        <p class="fin-sub">${esc(r.mensaje || "")}</p>
        <div class="fin-lista">
          <div><span>Respuestas correctas</span><b class="c-flame">${r.ok} de ${r.total}</b></div>
          <div><span>Tiempo</span><b class="c-gold">${mm ? mm + " min " : ""}${ss} s</b></div>
          <div><span>XP ganados</span><b class="c-ok">+${r.xp}</b></div>
          ${r.nuevas ? `<div><span>Palabras nuevas</span><b>${r.nuevas}</b></div>` : ""}
          ${r.repasos ? `<div><span>Repasadas</span><b>${r.repasos}</b></div>` : ""}
        </div>
        <div class="fin-racha ${r.rachaSube ? "sube" : ""}">${circ(I("fuego"))}<div><b>${r.racha} ${r.racha === 1 ? "día" : "días"} de racha</b><span>${r.rachaSube ? (r.protectorUsado ? "Usaste un protector de racha" : "¡Sumaste un día más!") : "Ya estudiaste hoy"}</span></div></div>
        <div class="fin-meta"><div class="fin-meta-t"><span>Meta de hoy</span><b>${r.xpHoy} / ${r.meta} XP</b></div><div class="meta-barra"><i style="width:${metaPct}%"></i></div></div>
        ${r.manana ? `<p class="fin-sci">${I("bombilla")}<span>Mañana te tocan <b>${r.manana}</b> repasos. Recuperarlas justo cuando empiezan a olvidarse es lo que las fija.</span></p>` : ""}
        ${sig && !parcial ? `<div class="fin-sig"><small>Sigue con</small><button class="sig-card ${sig.pastel}" data-a="siguiente">${circ(I(sig.icono))}<span><b>${esc(sig.titulo)}</b><small>${esc(sig.sub)}</small></span>${flechaAnillo(sig.prog)}</button></div>` : ""}
        <button class="btn primario ancho" data-a="cerrar">Listo por ahora</button>
      </div>`;
    if (!parcial) Sonido.fin();
    if (!parcial && (r.perfecto || r.metaRecienCumplida)) confeti();
  }

  function salir() {
    if (sesion.stats.total < 3) { R.cerrada = true; document.removeEventListener("keydown", tecla); Voz.parar(); return opts.onCerrar(); }
    const caja = document.createElement("div");
    caja.className = "confirma";
    caja.innerHTML = `<div class="confirma-caja"><h3>¿Terminar por ahora?</h3><p>Lo que ya respondiste se guarda y cuenta para tu racha.</p>
      <div class="pie-fila"><button class="btn sec" data-c="seguir">Seguir</button><button class="btn primario" data-c="salir">Terminar</button></div></div>`;
    root.appendChild(caja);
    caja.addEventListener("click", (e) => {
      const c = e.target.closest("[data-c]");
      if (!c && e.target !== caja) return;
      caja.remove();
      if (c && c.dataset.c === "salir") fin(true);
    });
  }

  /* ---------- Eventos ---------- */
  root.onclick = (e) => {
    const say = e.target.closest("[data-say]");
    if (say) { decir(say.dataset.say, !!say.dataset.lento); return; }
    const k = e.target.closest("[data-k]");
    if (k) { const inp = $("#resp"); if (inp && !inp.disabled) { const s = inp.selectionStart ?? inp.value.length, f = inp.selectionEnd ?? s; inp.value = inp.value.slice(0, s) + k.dataset.k + inp.value.slice(f); inp.focus(); inp.setSelectionRange(s + 1, s + 1); inp.dispatchEvent(new Event("input")); } return; }
    const op = e.target.closest("[data-op]");
    if (op && !op.disabled) { comprobar({ opcion: +op.dataset.op }); return; }
    const mt = e.target.closest("[data-mt]");
    if (mt) { tocarMatch(mt); return; }
    const fb = e.target.closest("[data-fb]");
    if (fb && !fb.disabled && !R.res) { R.elegidas.push(+fb.dataset.fb); Sonido.pop(); pintarFichas(); return; }
    const fr = e.target.closest("[data-fr]");
    if (fr && !R.res) { R.elegidas.splice(+fr.dataset.fr, 1); pintarFichas(); return; }
    const a = e.target.closest("[data-a]");
    if (!a) return;
    const acc = a.dataset.a;
    if (acc === "salir") salir();
    else if (acc === "continuar") continuar();
    else if (acc === "sabida") { const cals = sesion.saltarNueva(R.paso.item.id); opts.onCalificar(cals); sesion.avanzar(); siguiente(); }
    else if (acc === "comprobar") { const inp = $("#resp"); comprobar({ valor: inp ? inp.value : "" }); }
    else if (acc === "nose") {
      if (R.ex && R.ex.entrada === "voz") { R.sinVoz = true; siguiente(); }   // sin micrófono: el mismo paso con otro ejercicio
      else comprobar({ nose: true });
    }
    else if (acc === "razon") { if (R.res) { R.res = { ...R.res, ok: true, typo: true }; continuar(); } }
    else if (acc === "oir") decir(R.ex.tts);
    else if (acc === "oirlento") decir(R.ex.tts, true);
    else if (acc === "sinaudio") { R.sinAudioHasta = Date.now() + 15 * 60000; R.res = null; siguiente(); }
    else if (acc === "sinvoz") { R.sinVoz = true; siguiente(); }
    else if (acc === "mic") microfono();
    else if (acc === "pista") { R.pista = true; $("#pistaTxt").hidden = false; a.remove(); }
    else if (acc === "cerrar") opts.onCerrar();
    else if (acc === "siguiente") opts.onCerrar(true);
  };
  function tecla(e) {
    if (R.cerrada || $(".confirma", root)) return;
    const enCampo = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA");
    if (e.key === "Enter") {
      const cont = $("[data-a=continuar]", root);
      if (cont && (R.res || ["intro", "gintro"].includes(R.paso && R.paso.tipo))) { e.preventDefault(); cont.click(); return; }
      const comp = $("[data-a=comprobar]", root);
      if (comp && !comp.disabled && (!enCampo || e.target.tagName === "INPUT" || !e.shiftKey)) { e.preventDefault(); comp.click(); }
      return;
    }
    if (e.key === "Escape") { salir(); return; }
    if (!enCampo && /^[1-6]$/.test(e.key)) { const b = $$("[data-op]", cuerpo)[+e.key - 1]; if (b && !b.disabled) b.click(); }
  }
  document.addEventListener("keydown", tecla);
  siguiente();
  return { cerrar: () => { R.cerrada = true; document.removeEventListener("keydown", tecla); Voz.parar(); } };
}
