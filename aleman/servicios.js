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
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  mano: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  usuarios: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  numeral: '<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/>',
  cubiertos: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
  casa: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .7-1.53l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  ciudad: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"/>',
  actividad: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  camisa: '<path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
  musica: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  estetoscopio: '<path d="M11 2v2M5 2v2M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
  nubeSol: '<path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M15.95 12.65a4 4 0 0 0-5.93-4.13"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z"/>',
  maletin: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  avion: '<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  bolsa: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>',
  corazon: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>',
  hoja: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  sofa: '<path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0zM4 18v2M20 18v2M12 4v9"/>',
  celular: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  globo: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
  birrete: '<path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z"/><path d="M22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  regalo: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  burbuja: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
  cafe: '<path d="M10 2v2M14 2v2M6 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
  tren: '<path d="M8 3.1V7a4 4 0 0 0 8 0V3.1M9 15l-1-1M15 15l1-1"/><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5zM8 19l-2 3M16 19l2 3"/>',
  brote: '<path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8zM14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  sonrisa: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  cohete: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  huellas: '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0zM16 17h4M4 13h4"/>',
  audifonos: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  lapiz: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="M15 5l4 4"/>',
  capas: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M22 17.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65M22 12.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  etiqueta: '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1" fill="currentColor"/>',
  curita: '<rect x="2" y="6" width="20" height="12" rx="6"/><path d="M8 6v12M16 6v12M11 10.5h.01M13 13.5h.01M11 13.5h.01M13 10.5h.01"/>',
  bombilla: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
  trofeo: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0z"/>',
  pulgar: '<path d="M7 10v12"/><path d="M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88z"/>',
  fiesta: '<path d="M5.8 11.3L2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01"/><path d="M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10M22 13l-.82-.33c-.86-.34-1.82.2-1.98 1.11-.11.7-.72 1.22-1.43 1.22H17M11 2l.33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2z"/>',
  pesa: '<path d="M14.4 14.4L9.6 9.6M21.5 21.5l-1.4-1.4M3.9 3.9L2.5 2.5"/><path d="M18.66 21.49a2 2 0 1 1-2.83-2.83l-1.77 1.77a2 2 0 1 1-2.83-2.83l6.37-6.37a2 2 0 1 1 2.83 2.83l-1.77 1.77a2 2 0 1 1 2.83 2.83zM6.4 12.77a2 2 0 1 1-2.83-2.83l1.77-1.77a2 2 0 1 1-2.83-2.83l2.83-2.83a2 2 0 1 1 2.83 2.83l1.77-1.77a2 2 0 1 1 2.83 2.83z"/>',
  mezclar: '<path d="M18 14l4 4-4 4M18 2l4 4-4 4M2 18h1.97a4 4 0 0 0 3.3-1.7l5.45-7.6a4 4 0 0 1 3.3-1.7H22M2 6h1.97a4 4 0 0 1 3.6 2.2M22 18h-6.04a4 4 0 0 1-3.3-1.8l-.36-.45"/>',
  imagen: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-3.09-3.09a2 2 0 0 0-2.83 0L6 21"/>',
  calendario: '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  paleta: '<circle cx="13.5" cy="6.5" r="1" fill="currentColor"/><circle cx="17.5" cy="10.5" r="1" fill="currentColor"/><circle cx="8.5" cy="7.5" r="1" fill="currentColor"/><circle cx="6.5" cy="12.5" r="1" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/>',
  alerta: '<path d="M21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
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

// Cada unidad tiene su ícono; las palabras usan el de su unidad, teñido según el género.
export const ICONO_UNIDAD = { u01: "mano", u02: "usuarios", u03: "numeral", u04: "cubiertos", u05: "casa", u06: "ciudad", u07: "actividad", u08: "camisa", u09: "musica", u10: "sol", u11: "estetoscopio", u12: "nubeSol", u13: "maletin", u14: "avion", u15: "bolsa", u16: "corazon", u17: "hoja", u18: "sofa", u19: "celular", u20: "globo", u21: "birrete", u22: "regalo", u23: "burbuja" };
export const iconoUnidad = (id) => ICONO_UNIDAD[id] || "libro";
export const iconoItem = (it) => (!it ? "libro" : it.t === "g" ? "gramatica" : iconoUnidad(it.unidad));
export const nota = (ico, html) => `<div class="tip">${I(ico)}<span>${html}</span></div>`;
