// Activate immediately instead of waiting for old tabs to close — this is
// a small app, there's no risk in swapping the worker right away.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// No offline cache yet — this app is data-driven (auth'd API calls) and a
// stale cache would be more confusing than a network error. This handler
// exists mainly so the browser recognizes the app as installable; it just
// passes every request straight through.
self.addEventListener("fetch", () => {});

self.addEventListener("push", (event) => {

  let data = { title: "MoveMate", body: "" };

  try {
    data = event.data.json();
  } catch {
    data.body = event.data?.text() || "";
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "MoveMate", {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png"
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
