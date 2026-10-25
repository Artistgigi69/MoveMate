const test = require("node:test");
const assert = require("node:assert/strict");

const { buildArnonaEmail } = require("../services/arnonaEmail");

const transfer = {
  oldAddress: "הרצל 10",
  newAddress: "דיזנגוף 50",
  moveDate: "2026-11-15",
  applicant: { name: "Test", idNumber: "000000018", phone: "0501234567", email: "t@example.test" },
  newTenant: { name: "New", idNumber: "000000026", phone: "0507654321", email: "n@example.test" },
  leaseFile: "abc123.pdf",
  leaseFileName: "lease.pdf",
  services: [
    { name: "electricity", meterReading: "12345", meterPhoto: "def456.jpg" },
    { name: "arnona" }
  ]
};

test("close letter: old address, new tenant, readings, all attachments", () => {
  const m = buildArnonaEmail(transfer, "close");

  assert.match(m.subject, /עזיבת נכס/);
  assert.match(m.subject, /הרצל 10/);
  assert.match(m.text, /פרטי המחזיק\/ה החדש\/ה/);
  assert.match(m.text, /חשמל: 12345/); // service name in Hebrew
  assert.match(m.text, /ותמונות המונים/);

  assert.deepEqual(m.attachments.map(a => a.filename), ["lease.pdf", "מונה-חשמל.jpg"]);
});

test("lease is read from private storage, never the public folder", () => {
  const lease = buildArnonaEmail(transfer, "close").attachments[0];
  assert.equal(lease.bucket, "private");
  assert.equal(lease.file, "abc123.pdf");
});

test("open letter: new address, no tenant block, lease only", () => {
  const m = buildArnonaEmail(transfer, "open");

  assert.match(m.subject, /רישום מחזיק חדש/);
  assert.match(m.subject, /דיזנגוף 50/);
  assert.doesNotMatch(m.text, /פרטי המחזיק\/ה החדש\/ה/);
  assert.doesNotMatch(m.text, /ותמונות המונים/);
  assert.deepEqual(m.attachments.map(a => a.filename), ["lease.pdf"]);
});
