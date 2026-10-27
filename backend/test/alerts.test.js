const test = require("node:test");
const assert = require("node:assert/strict");

const { createAlerter } = require("../services/alerts");

function setup(opts = {}) {
  let t = Date.parse("2026-10-27T10:00:00Z");
  const sent = [];
  const notify = createAlerter({ send: title => sent.push(title), now: () => t, ...opts });
  return { notify, sent, advance: ms => { t += ms; } };
}

test("the same problem is mailed once per hour", async () => {
  const { notify, sent, advance } = setup();
  assert.equal(notify("500 GET /transfers"), true);
  assert.equal(notify("500 GET /transfers"), false);
  assert.equal(notify("500 POST /auth/login"), true);
  advance(61 * 60 * 1000);
  assert.equal(notify("500 GET /transfers"), true);
  await new Promise(r => setImmediate(r));
  assert.deepEqual(sent, ["500 GET /transfers", "500 POST /auth/login", "500 GET /transfers"]);
});

test("daily cap stops a flood and resets the next day", () => {
  const { notify, advance } = setup({ dailyCap: 2 });
  assert.equal(notify("a"), true);
  assert.equal(notify("b"), true);
  assert.equal(notify("c"), false);
  advance(24 * 60 * 60 * 1000);
  assert.equal(notify("c"), true);
});

test("a failing mail server doesn't throw into the caller", async () => {
  const notify = createAlerter({ send: () => { throw new Error("smtp down"); } });
  assert.equal(notify("x"), true);
  await new Promise(r => setImmediate(r));
});
