const test = require("node:test");
const assert = require("node:assert/strict");

const { buildConciergeUpdate, buildConciergeRequest } = require("../services/conciergeEmail");

test("done email is in the user's language and carries the note", () => {
  const m = buildConciergeUpdate({ lang: "ru", service: "electricity", status: "Completed", note: "Заявка IEC 123", url: "https://x/status/1" });
  assert.match(m.subject, /Электричество — переоформлено/);
  assert.match(m.text, /Комментарий: Заявка IEC 123/);
  assert.ok(m.text.includes("https://x/status/1"));
});

test("failed email without a note has no empty comment line", () => {
  const m = buildConciergeUpdate({ lang: "he", service: "water", status: "Failed", note: "", url: "u" });
  assert.match(m.subject, /מים — לא הצלחנו/);
  assert.doesNotMatch(m.text, /הערה/);
});

test("unknown language falls back to English", () => {
  const m = buildConciergeUpdate({ lang: "xx", service: "gas", status: "Completed", note: "", url: "u" });
  assert.match(m.subject, /Gas — transferred/);
});

test("staff email names the service but no personal data", () => {
  const m = buildConciergeRequest({ service: "internet", oldCity: "haifa", newCity: "tel-aviv", moveDate: "2026-11-30", url: "https://x/admin" });
  assert.match(m.subject, /Интернет/);
  assert.match(m.text, /haifa → tel-aviv/);
});
