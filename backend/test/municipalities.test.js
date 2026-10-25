const test = require("node:test");
const assert = require("node:assert/strict");

const { municipalities, findMunicipality } = require("../data/municipalities");

test("keys are unique and findable", () => {
  const keys = municipalities.map(m => m.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const k of keys) assert.equal(findMunicipality(k).key, k);
  assert.equal(findMunicipality("nowhere"), null);
});

test("every city has a name in all four languages", () => {
  for (const m of municipalities) {
    for (const lang of ["he", "ru", "en", "ar"]) {
      assert.ok(m.names?.[lang], `${m.key} is missing names.${lang}`);
    }
  }
});

// The method decides what submit does, so it must match the data:
// "email" sends ID numbers and a lease to that address.
test("method matches the contact data", () => {
  for (const m of municipalities) {
    assert.ok(["email", "form", ""].includes(m.method), `${m.key}: unknown method ${m.method}`);
    if (m.method === "email") assert.match(m.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, `${m.key}: bad email`);
    if (m.method === "form") assert.match(m.formUrl, /^https?:\/\//, `${m.key}: form without formUrl`);
    if (m.method !== "email") assert.equal(m.email, "", `${m.key}: email set but method is ${m.method}`);
  }
});

test("every entry cites an official source page", () => {
  for (const m of municipalities) {
    assert.match(m.source, /^https?:\/\//, `${m.key}: missing source`);
  }
});

test("water companies, where set, have names in all four languages", () => {
  for (const m of municipalities.filter(m => m.water)) {
    for (const lang of ["he", "ru", "en", "ar"]) {
      assert.ok(m.water.names?.[lang], `${m.key}: water.names.${lang} missing`);
    }
  }
});
