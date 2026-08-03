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
      icon: "/favicon.svg"
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
