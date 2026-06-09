/* LN COS — Service worker admin (push notifications uniquement, pas de cache) */

self.addEventListener("push", (event) => {
  let data = { title: "LN COS", body: "Nouvelle activité", url: "/admin/orders" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* ignore */
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/assets/icon-192.png",
      badge: "/assets/favicon-32.png",
      tag: data.tag || "lncos-admin",
      data: { url: data.url || "/admin/orders" },
      requireInteraction: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin/orders";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes("/admin") && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
