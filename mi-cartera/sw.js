// Service worker de Mi Cartera: recibe las notificaciones push y abre la app al tocarlas (no guarda nada en caché).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; } catch (_) { p = { data: { title: "Mi Cartera", body: e.data ? e.data.text() : "" } }; }
  const d = p.data || {}; const n = p.notification || {};
  const title = d.title || n.title || "Mi Cartera";
  const body = d.body || n.body || "";
  e.waitUntil(self.registration.showNotification(title, {
    body, icon: "icon-192.png", badge: "icon-192.png", tag: d.tag || undefined,
    data: { url: d.url || (p.fcmOptions && p.fcmOptions.link) || "./" },
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
