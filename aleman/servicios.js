// Täglich · servicios del navegador: pantalla, voz alemana, reconocimiento de voz, sonidos y confeti.

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// localStorage con try/catch (modo privado, almacenamiento bloqueado…)
export const ls = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* nada */ } },
};

export function toast(msg, ms = 2800) {
  const root = $("#toastRoot");
  if (!root) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add("in"));
  setTimeout(() => { el.classList.remove("in"); setTimeout(() => el.remove(), 300); }, ms);
}

export function openSheet(inner, mount) {
  const root = $("#sheetRoot");
  root.innerHTML = `<div class="sheet-bg" id="sheetBg"><div class="sheet" role="dialog" aria-modal="true"><div class="grip" aria-hidden="true"></div>${inner}</div></div>`;
  document.body.classList.add("con-hoja");
  const bg = $("#sheetBg");
  requestAnimationFrame(() => bg.classList.add("in"));
  bg.addEventListener("click", (e) => { if (e.target === bg || e.target.closest("[data-close]")) closeSheet(); });
  if (mount) mount(bg.querySelector(".sheet"));
}
export function closeSheet() { const r = $("#sheetRoot"); if (r) r.innerHTML = ""; document.body.classList.remove("con-hoja"); }
export const sheetAbierta = () => !!$("#sheetBg");

/* ---------- Voz en alemán (síntesis) ---------- */
const PREFERIDAS = [/google deutsch/i, /neural|natural|enhanced|premium|online/i, /anna/i, /helena/i, /petra/i, /markus/i, /katja/i, /conrad/i, /yannick/i, /marlene/i];
export const Voz = {
  ok: typeof window !== "undefined" && "speechSynthesis" in window,
  voz: null, vel: 0.9, nombre: "",
  init() {
    if (!this.ok) return;
    const elegir = () => {
      const vs = speechSynthesis.getVoices().filter((v) => /^de(-|_|$)/i.test(v.lang));
      if (!vs.length) return;
      let mejor = null;
      for (const re of PREFERIDAS) { mejor = vs.find((v) => re.test(v.name) && /de-DE/i.test(v.lang)) || vs.find((v) => re.test(v.name)); if (mejor) break; }
      this.voz = mejor || vs.find((v) => /de-DE/i.test(v.lang)) || vs[0];
      this.nombre = this.voz ? this.voz.name : "";
    };
    elegir();
    speechSynthesis.addEventListener ? speechSynthesis.addEventListener("voiceschanged", elegir) : (speechSynthesis.onvoiceschanged = elegir);
  },
  hablar(texto, { lento = false, fin } = {}) {
    if (!this.ok || !texto) { if (fin) fin(); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(texto).replace(/[*_]/g, ""));
      u.lang = "de-DE";
      if (this.voz) u.voice = this.voz;
      u.rate = lento ? Math.max(0.5, this.vel * 0.68) : this.vel;
      if (fin) { u.onend = fin; u.onerror = fin; }
      speechSynthesis.speak(u);
    } catch (e) { if (fin) fin(); }
  },
  parar() { try { if (this.ok) speechSynthesis.cancel(); } catch (e) { /* nada */ } },
};

/* ---------- Reconocimiento de voz ---------- */
const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
export const Oido = {
  ok: !!SR,
  activo: null,
  escuchar() {
    return new Promise((resolve, reject) => {
      if (!SR) return reject(new Error("no-soportado"));
      const r = new SR();
      r.lang = "de-DE"; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
      let listo = false;
      r.onresult = (e) => { listo = true; const alts = []; for (const res of e.results) for (const a of res) alts.push(a.transcript); resolve(alts); };
      r.onerror = (e) => { if (!listo) { listo = true; reject(new Error(e.error || "error")); } };
      r.onend = () => { if (!listo) { listo = true; resolve([]); } this.activo = null; };
      this.activo = r;
      try { r.start(); } catch (e) { reject(e); }
    });
  },
  parar() { try { if (this.activo) this.activo.stop(); } catch (e) { /* nada */ } },
};

/* ---------- Sonidos (Web Audio, sin archivos) ---------- */
let actx = null;
function tono(frecs, { dur = 0.12, tipo = "sine", vol = 0.12, sep = 0.09 } = {}) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === "suspended") actx.resume();
    const t0 = actx.currentTime;
    frecs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = tipo; o.frequency.value = f;
      const s = t0 + i * sep;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(vol, s + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, s + dur + 0.12);
      o.connect(g).connect(actx.destination);
      o.start(s); o.stop(s + dur + 0.15);
    });
  } catch (e) { /* sin audio */ }
}
export const Sonido = {
  on: true,
  bien() { if (this.on) tono([660, 880], { dur: 0.1 }); },
  mal() { if (this.on) tono([220, 185], { dur: 0.14, tipo: "triangle", vol: 0.1, sep: 0.11 }); },
  fin() { if (this.on) tono([523, 659, 784, 1047], { dur: 0.14, sep: 0.1 }); },
  pop() { if (this.on) tono([520], { dur: 0.05, vol: 0.06 }); },
};

/* ---------- Confeti ---------- */
export function confeti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("canvas");
  c.className = "confeti";
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  document.body.appendChild(c);
  const x = c.getContext("2d"); x.scale(dpr, dpr);
  const cols = ["#F4B400", "#2F6FDB", "#D9435E", "#2E9D6B", "#F26B1D", "#1B1A17"];
  const ps = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.35, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 12 - 4,
    r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, w: 6 + Math.random() * 6, h: 4 + Math.random() * 4, c: cols[Math.floor(Math.random() * cols.length)],
  }));
  const t0 = performance.now();
  (function paso(t) {
    const dt = Math.min(2, (t - (paso.u || t)) / 16.7); paso.u = t;
    x.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of ps) {
      p.vy += 0.35 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.vx *= 0.99;
      x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore();
    }
    if (t - t0 < 2200) requestAnimationFrame(paso); else c.remove();
  })(t0);
}

/* ---------- Íconos ---------- */
const P = {
  hoy: '<path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.9l.9-5.4L4.2 8.7l5.4-.8z"/>',
  ruta: '<path d="M6 19c0-3 4-3 4-6s-4-3-4-6"/><circle cx="6" cy="5" r="2"/><path d="M18 5c0 3-4 3-4 6s4 3 4 6"/><circle cx="18" cy="19" r="2"/>',
  practicar: '<path d="M4 15l5-5 4 4 7-7"/><path d="M15 7h5v5"/>',
  palabras: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7M8 11h5"/>',
  yo: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  audio: '<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  tortuga: '<path d="M4 15c0-4 3.5-7 8-7s8 3 8 7z"/><path d="M8 15v3M16 15v3M20 13l2-1"/><circle cx="21.5" cy="11.5" r=".6" fill="currentColor"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  fuego: '<path d="M12 22c4 0 7-2.8 7-7 0-4-3-6.5-4-10-2 2-2.5 4-2.5 5.5C11 9 10 7.5 10 5.5 7 8 5 11 5 15c0 4.2 3 7 7 7z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  libro: '<path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6z"/><path d="M12 6v14.5"/>',
  gramatica: '<path d="M4 20l5-14h2l5 14M6.5 14h7"/><path d="M17 4l3 3-3 3"/>',
  ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  ciencia: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>',
  salir: '<path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/>',
  buscar: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
  rayo: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  oreja: '<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 0"/><path d="M10 9a2 2 0 0 1 4 0"/>',
  diana: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  repetir: '<path d="M20 11.5a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',
  campana: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  escudo: '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/>',
  flecha: '<path d="M9 6l6 6-6 6"/>',
  atras: '<path d="M15 6l-6 6 6 6"/>',
  nube: '<path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.5A3.5 3.5 0 0 0 7 18z"/>',
  descargar: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  basura: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  ojo: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  estrella: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9-4.3-4.1 5.9-.8z"/>',
  lupa: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>',
  flechaR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  diagonal: '<path d="M7 17L17 7M8 7h9v9"/>',
  mas: '<circle cx="12" cy="5.5" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="18.5" r="1.4" fill="currentColor"/>',
  reloj: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 3h6"/>',
  luna: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  grafica: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  brillo: '<path d="M12 3c.7 4.6 2.4 6.3 7 7-4.6.7-6.3 2.4-7 7-.7-4.6-2.4-6.3-7-7 4.6-.7 6.3-2.4 7-7z"/>',
};
export const I = (k, cls = "") => `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k] || ""}</svg>`;

/* ---------- Piezas visuales compartidas ---------- */
// Destellos decorativos (como estrellitas) para las tarjetas.
export const DECO = `<svg class="deco" viewBox="0 0 120 120" aria-hidden="true"><path d="M86 10c1.4 9.6 5 13.2 14.6 14.6C91 26 87.4 29.6 86 39.2 84.6 29.6 81 26 71.4 24.6 81 23.2 84.6 19.6 86 10z"/><path d="M106 50c.8 5.4 2.8 7.4 8.2 8.2-5.4.8-7.4 2.8-8.2 8.2-.8-5.4-2.8-7.4-8.2-8.2 5.4-.8 7.4-2.8 8.2-8.2z"/><path d="M58 30c.6 3.8 2 5.2 5.8 5.8-3.8.6-5.2 2-5.8 5.8-.6-3.8-2-5.2-5.8-5.8 3.8-.6 5.2-2 5.8-5.8z"/></svg>`;
export const circ = (x, cls = "") => `<span class="circ ${cls}">${x}</span>`;
export const pastelNivel = (nv) => ({ A1: "p-menta", A2: "p-cielo", B1: "p-rosa" })[nv] || "p-menta";
export const pastelGenero = (it) => (it && it.t === "n" ? ({ m: "p-cielo", f: "p-rosa", n: "p-menta", pl: "p-mantequilla" })[it.g] : "p-mantequilla");
// Botón redondo con flecha y, si se da p (0–1), un anillo de progreso alrededor.
export function flechaAnillo(p = null, icono = "flechaR") {
  const r = 26, c = 2 * Math.PI * r;
  const anillo = p == null ? "" : `<svg class="fa" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="${r}" class="fa-f"/><circle cx="30" cy="30" r="${r}" class="fa-v" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - Math.max(0, Math.min(1, p)))).toFixed(1)}"/></svg>`;
  return `<span class="flecha-btn">${anillo}${I(icono)}</span>`;
}
export const flechaDiag = () => `<span class="flecha-btn chica">${I("diagonal")}</span>`;
export const onda = (n = 9) => `<span class="onda" aria-hidden="true">${"<i></i>".repeat(n)}</span>`;
