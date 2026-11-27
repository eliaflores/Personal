// Service worker de Täglich: la app funciona sin internet (guarda sus archivos) y recibe el recordatorio diario.
// Archivos de la app: primero internet (siempre la versión nueva) y si no hay, la copia guardada.
// Librerías de Firebase y letras: primero la copia guardada (no cambian).
const CACHE = "taeglich-v7";
const APP = ["./", "index.html", "estilos.css", "app.js", "motor.js", "sesion.js", "servicios.js", "vocab-a1.js", "vocab-a2.js", "vocab-b1.js", "gramatica.js", "lecturas.js", "ciencia.js", "series.js", "manifest.json", "icon-192.png", "icon-512.png", "icon-180.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("taeglich-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const mismo = url.origin === self.location.origin && url.pathname.startsWith(new URL(self.registration.scope).pathname);
  const libreria = url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/");
  const fuente = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (mismo) {
    e.respondWith(fetch(req, { cache: "no-cache" }).then((res) => {
      if (res && res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))));
  } else if (libreria || fuente) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => {
      if (res && (res.ok || res.type === "opaque")) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
      return res;
    })));
  }
});

self.addEventListener("push", (e) => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (_) { p = { data: { title: "Täglich", body: e.data ? e.data.text() : "" } }; }
  const d = p.data || {}, n = p.notification || {};
  e.waitUntil(self.registration.showNotification(d.title || n.title || "Täglich", {
    body: d.body || n.body || "", icon: "icon-192.png", badge: "icon-192.png", tag: d.tag || "taeglich", data: { url: d.url || "./" },
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    for (const c of cs) { if ("focus" in c) { if (c.navigate) c.navigate(url).catch(() => {}); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
