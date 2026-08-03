const webpush = require("web-push");

const PushSubscription = require("../models/PushSubscription");

function isConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

if (isConfigured()) {
  webpush.setVapidDetails(
    "mailto:support@movemate.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function sendPushToUser(userId, payload) {

  if (!isConfigured()) return;

  const subscriptions = await PushSubscription.find({ userId });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys
          },
          JSON.stringify(payload)
        );
      } catch (error) {
        // 410/404 means the browser dropped the subscription — clean it up.
        if (error.statusCode === 410 || error.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          console.log("PUSH SEND ERROR:", error.message);
        }
      }
    })
  );
}

module.exports = { isConfigured, sendPushToUser };
