const test = require("node:test");
const assert = require("node:assert/strict");

const { buildResetEmail } = require("../services/resetEmail");

test("reset email carries the link in the user's language", () => {
  const url = "https://example.test/reset/abc";

  const he = buildResetEmail({ name: "דנה", url, lang: "he" });
  assert.match(he.subject, /איפוס סיסמה/);
  assert.match(he.text, /דנה/);
  assert.ok(he.text.includes(url));

  const ru = buildResetEmail({ name: "", url, lang: "ru" });
  assert.match(ru.text, /^Здравствуйте!/);
});

test("unknown language falls back to English", () => {
  const m = buildResetEmail({ name: "Sam", url: "u", lang: "xx" });
  assert.match(m.subject, /reset your password/);
});
