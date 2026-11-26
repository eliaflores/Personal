// Service worker de Mi Oficina: guarda la app para abrirla sin internet y muestra los avisos (al tocarlos abre la app).
const CACHE = "oficina-v1";
const SHELL = ["./", "index.html", "app.js", "manifest.json", "icon-192.png", "icon-180.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})));
});
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

// Archivos de la app: primero internet (para que siempre esté al día) y, si no hay, lo guardado.
// Firebase y las letras (con versión fija): primero lo guardado.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const pinned = url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/") || url.hostname === "fonts.gstatic.com" || url.hostname === "fonts.googleapis.com";
  if (pinned) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req.mode === "navigate" ? "./" : req, copy)); }
    return res;
  }).catch(() => caches.match(req.mode === "navigate" ? "./" : req, { ignoreSearch: true }).then((hit) => hit || caches.match("./"))));
});

self.addEventListener("push", (e) => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (_) { p = { data: { title: "Mi Oficina", body: e.data ? e.data.text() : "" } }; }
  const d = p.data || {}; const n = p.notification || {};
  e.waitUntil(self.registration.showNotification(d.title || n.title || "Mi Oficina", {
    body: d.body || n.body || "", icon: "icon-192.png", badge: "icon-192.png", tag: d.tag || undefined,
    data: { url: d.url || "./" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
      for (const c of cs) { if ("focus" in c) { if (c.navigate) c.navigate(url).catch(() => {}); return c.focus(); } }
      return self.clients.openWindow(url);
    })
  );
});
