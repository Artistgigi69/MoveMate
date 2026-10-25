import test from "node:test";
import assert from "node:assert/strict";

import { isValidTeudat, isValidPhone, isValidEmail, validatePerson } from "../src/validate.js";

test("teudat zehut check digit", () => {
  assert.equal(isValidTeudat("000000018"), true);
  assert.equal(isValidTeudat("123456789"), false);
});

test("phone and email", () => {
  assert.equal(isValidPhone("050-1234567"), true);
  assert.equal(isValidPhone("abc"), false);
  assert.equal(isValidEmail("t@example.test"), true);
  assert.equal(isValidEmail("nope"), false);
});

test("validatePerson returns i18n keys", () => {
  assert.deepEqual(validatePerson({ name: "", idNumber: "1", phone: "1", email: "x" }), {
    name: "err.name",
    idNumber: "err.id",
    phone: "err.phone",
    email: "err.email"
  });
  assert.deepEqual(validatePerson({ name: "", idNumber: "", phone: "", email: "" }, false), {});
});
