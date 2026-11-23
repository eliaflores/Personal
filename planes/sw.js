// Service worker de Nuestros Planes: recibe los avisos del calendario y abre la app al tocarlos (no guarda nada en caché).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (_) { p = { data: { title: "Nuestros Planes", body: e.data ? e.data.text() : "" } }; }
  const d = p.data || {}; const n = p.notification || {};
  e.waitUntil(self.registration.showNotification(d.title || n.title || "Nuestros Planes", {
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
