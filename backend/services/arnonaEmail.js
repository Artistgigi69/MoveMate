const path = require("path");

const SERVICE_NAMES_HE = {
  electricity: "חשמל",
  water: "מים",
  gas: "גז"
};

// Universal arnona letter, in Hebrew since that's what municipalities process.
// `kind` is "close" (old city: stop billing me) or "open" (new city: start
// billing me). Returns { subject, text, attachments }, where each attachment
// is { filename, bucket, file } — a fileStore reference the caller loads.
function buildArnonaEmail(transfer, kind) {

  const a = transfer.applicant || {};
  const t = transfer.newTenant || {};

  const isClose = kind === "close";
  const address = isClose ? transfer.oldAddress : transfer.newAddress;

  const subject = isClose
    ? `הודעה על עזיבת נכס – ${address} – ת.ז. ${a.idNumber || ""}`
    : `בקשה לרישום מחזיק חדש בנכס – ${address} – ת.ז. ${a.idNumber || ""}`;

  const lines = [
    "שלום רב,",
    "",
    isClose
      ? `הריני להודיעכם כי אני עוזב/ת את הנכס בכתובת ${address} בתאריך ${transfer.moveDate}, ומבקש/ת להפסיק את חיובי הארנונה על שמי מתאריך זה.`
      : `הריני להודיעכם כי החל מתאריך ${transfer.moveDate} אני המחזיק/ה בנכס בכתובת ${address}, ומבקש/ת לרשום את חשבון הארנונה על שמי.`,
    "",
    "פרטי המבקש/ת:",
    `שם: ${a.name || ""}`,
    `ת.ז.: ${a.idNumber || ""}`,
    `טלפון: ${a.phone || ""}`,
    `דוא"ל: ${a.email || ""}`
  ];

  if (isClose && t.name) {
    lines.push(
      "",
      "פרטי המחזיק/ה החדש/ה בנכס:",
      `שם: ${t.name}`,
      `ת.ז.: ${t.idNumber || ""}`,
      `טלפון: ${t.phone || ""}`,
      `דוא"ל: ${t.email || ""}`
    );
  }

  const readings = (transfer.services || []).filter(s => s.meterReading);

  if (isClose && readings.length) {
    lines.push("", "קריאות מונים ביום העזיבה:");
    readings.forEach(s => lines.push(`${SERVICE_NAMES_HE[s.name] || s.name}: ${s.meterReading}`));
  }

  const hasPhotos = isClose && (transfer.services || []).some(s => s.meterPhoto);

  lines.push(
    "",
    "מצורף חוזה השכירות" + (hasPhotos ? " ותמונות המונים." : "."),
    "",
    "בברכה,",
    a.name || ""
  );

  const attachments = [];

  if (transfer.leaseFile) {
    attachments.push({
      filename: transfer.leaseFileName || "חוזה-שכירות" + path.extname(transfer.leaseFile),
      bucket: "private",
      file: transfer.leaseFile
    });
  }

  if (isClose) {
    (transfer.services || []).forEach(s => {
      if (s.meterPhoto) {
        attachments.push({
          filename: `מונה-${SERVICE_NAMES_HE[s.name] || s.name}${path.extname(s.meterPhoto)}`,
          bucket: "public",
          file: s.meterPhoto
        });
      }
    });
  }

  return { subject, text: lines.join("\n"), attachments };
}

module.exports = { buildArnonaEmail };
