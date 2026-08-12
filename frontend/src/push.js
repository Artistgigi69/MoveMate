// Browser push notifications. No external push service beyond the browser's
// own (Chrome/Firefox etc. route through their vendor's push infra using our
// self-generated VAPID keys) — nothing to configure on our end.

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export async function isPushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export async function getSubscriptionStatus() {
  if (!(await isPushSupported())) return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return Boolean(subscription);
}

export async function subscribeToPush() {

  if (!(await isPushSupported())) {
    throw new Error("Push notifications aren't supported in this browser");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted");
  }

  const keyRes = await fetch(`${import.meta.env.VITE_API_URL}/push/vapid-public-key`);
  const { key } = await keyRes.json();

  if (!key) {
    throw new Error("Push notifications are not configured on the server yet");
  }

  // main.jsx already registers /sw.js on app load (needed for installability
  // regardless of push) — just wait for it to be active.
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key)
  });

  const token = localStorage.getItem("token");

  await fetch(`${import.meta.env.VITE_API_URL}/push/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify(subscription.toJSON())
  });

  return subscription;
}

export async function unsubscribeFromPush() {

  if (!(await isPushSupported())) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return;

  const token = localStorage.getItem("token");

  await fetch(`${import.meta.env.VITE_API_URL}/push/unsubscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ endpoint: subscription.endpoint })
  });

  await subscription.unsubscribe();
}
