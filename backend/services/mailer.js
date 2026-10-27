const nodemailer = require("nodemailer");

// Same pattern as push/cardcom: leave SMTP_* blank and everything else keeps
// working — arnona requests are just marked "manual" instead of emailed.
function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      // Fail in seconds, not the default two minutes, when the mail server
      // can't be reached — the user is waiting on the button meanwhile.
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}

async function sendMail({ to, cc, subject, text, attachments }) {
  return getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    cc,
    subject,
    text,
    attachments
  });
}

module.exports = { isConfigured, sendMail };
