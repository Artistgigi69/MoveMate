const mailer = require("./mailer");

// Emails the owner when the server fails (500s, crashes, background jobs),
// so problems are noticed before users write in. Needs ALERT_EMAIL and SMTP_*;
// without them alerts only go to the log.
//
// The same problem is mailed at most once per hour, and at most DAILY_CAP
// alerts a day, so a broken route can't burn the mail quota (Brevo free:
// 300/day). Emails carry the route and error, never request bodies — those
// hold ID numbers and phone numbers.

const HOUR = 60 * 60 * 1000;
const DAILY_CAP = 20;

function createAlerter({ send, now = Date.now, windowMs = HOUR, dailyCap = DAILY_CAP }) {
  const lastSent = new Map();
  let day = "";
  let sentToday = 0;

  return function notify(title, details = "") {
    const t = now();

    const today = new Date(t).toISOString().slice(0, 10);
    if (today !== day) {
      day = today;
      sentToday = 0;
    }

    if (t - (lastSent.get(title) ?? -Infinity) < windowMs) return false;
    if (sentToday >= dailyCap) return false;

    lastSent.set(title, t);
    sentToday += 1;

    Promise.resolve()
      .then(() => send(title, details))
      .catch(err => console.log("ALERT EMAIL FAILED:", err.message));
    return true;
  };
}

const notify = createAlerter({
  send: (title, details) => {
    if (!process.env.ALERT_EMAIL || !mailer.isConfigured()) return;
    return mailer.sendMail({
      to: process.env.ALERT_EMAIL,
      subject: `[MoveMate] ${title}`,
      text: `${title}\n\n${details}\n\n${new Date().toISOString()}\nFull log: Render → movemate-api → Logs`
    });
  }
});

// Route pattern, not the real URL: "/transfers/:id", so one broken route is
// one alert, and tokens from links (/reset/<token>) don't end up in email.
function routeOf(req) {
  return req.route ? req.baseUrl + req.route.path : req.baseUrl || "(no route)";
}

// Watches every response; routes mostly answer 500 themselves instead of
// calling next(err), so the error handler alone would miss them.
function middleware(req, res, next) {
  const json = res.json.bind(res);
  res.json = body => {
    if (res.statusCode >= 500 && body && body.message) res.locals.alertMessage = body.message;
    return json(body);
  };

  res.on("finish", () => {
    if (res.statusCode < 500) return;
    const err = res.locals.error;
    notify(
      `${res.statusCode} ${req.method} ${routeOf(req)}`,
      (err && (err.stack || err.message)) || res.locals.alertMessage || ""
    );
  });

  next();
}

module.exports = { createAlerter, notify, middleware };
