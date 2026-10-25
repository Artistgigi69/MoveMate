const test = require("node:test");
const assert = require("node:assert/strict");

const { isValidTeudat, isValidPhone, personError } = require("../utils/validate");

const valid = { name: "Test Person", idNumber: "000000018", phone: "050-1234567", email: "t@example.test" };

test("teudat zehut check digit", () => {
  assert.equal(isValidTeudat("000000018"), true);
  assert.equal(isValidTeudat("18"), false); // too short
  assert.equal(isValidTeudat("123456789"), false); // wrong check digit
  assert.equal(isValidTeudat("12345678a"), false);
  assert.equal(isValidTeudat(""), false);
});

test("israeli phone numbers", () => {
  assert.equal(isValidPhone("050-1234567"), true);
  assert.equal(isValidPhone("+972501234567"), true);
  assert.equal(isValidPhone("02-6296333"), true); // landline
  assert.equal(isValidPhone("12345"), false);
});

test("personError: required applicant", () => {
  assert.equal(personError(valid, "Applicant"), "");
  assert.match(personError({ ...valid, idNumber: "123456789" }, "Applicant"), /invalid ID/);
  assert.match(personError(undefined, "Applicant"), /required/);
});

test("personError: optional new tenant", () => {
  assert.equal(personError({ name: "", idNumber: "", phone: "", email: "" }, "New tenant", false), "");
  assert.match(personError({ name: "X" }, "New tenant", false), /name is required/);
});
