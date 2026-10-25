import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// i18n.jsx is JSX, so read the dictionaries as text instead of importing.
const SRC = join(import.meta.dirname, "..", "src");
const source = readFileSync(join(SRC, "i18n.jsx"), "utf8");

function dictionaries() {
  const dicts = {};
  let current = null;
  for (const line of source.split(/\r?\n/)) {
    const open = line.match(/^ {2}(\w{2}): \{$/);
    if (open) {
      current = open[1];
      dicts[current] = {};
      continue;
    }
    if (/^ {2}\}/.test(line)) current = null;
    const entry = current && line.match(/^\s+"([\w.]+)": "(.*)",?$/);
    if (entry) dicts[current][entry[1]] = entry[2];
  }
  return dicts;
}

const dicts = dictionaries();
const LANGS = ["ru", "he", "ar", "en"];

test("all four languages exist", () => {
  assert.deepEqual(Object.keys(dicts).sort(), [...LANGS].sort());
});

test("every language has exactly the same keys", () => {
  const all = new Set(LANGS.flatMap(l => Object.keys(dicts[l])));
  for (const lang of LANGS) {
    const missing = [...all].filter(k => !(k in dicts[lang]));
    assert.deepEqual(missing, [], `${lang} is missing keys`);
  }
});

test("placeholders match across languages", () => {
  const vars = s => (s.match(/\{\w+\}/g) || []).sort().join(",");
  for (const key of Object.keys(dicts.en)) {
    for (const lang of LANGS) {
      assert.equal(vars(dicts[lang][key]), vars(dicts.en[key]), `${lang}.${key} placeholders differ`);
    }
  }
});

// Every literal t("…") key used in the screens must exist in the dictionary.
test("every key used in the code is defined", () => {
  const files = ["ui.jsx", ...readdirSync(join(SRC, "screens")).map(f => join("screens", f))];
  const used = new Set();
  for (const f of files) {
    const code = readFileSync(join(SRC, f), "utf8");
    for (const m of code.matchAll(/\bt[x]?\("([\w.]+)"/g)) used.add(m[1]);
  }
  assert.ok(used.size > 50, `found only ${used.size} keys — the scan is broken`);
  const undefinedKeys = [...used].filter(k => !(k in dicts.en));
  assert.deepEqual(undefinedKeys, []);
});
