// Mirrors frontend-v2/src/validate.js — the client checks for UX, this is
// the check that actually counts.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Israeli ID (teudat zehut) check digit.
function isValidTeudat(value) {
  const id = String(value || "").trim();
  if (!/^\d{5,9}$/.test(id)) return false;

  const padded = id.padStart(9, "0");
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    let n = Number(padded[i]) * ((i % 2) + 1);
    if (n > 9) n -= 9;
    sum += n;
  }

  return sum % 10 === 0;
}

function isValidPhone(value) {
  const digits = String(value || "").replace(/[\s-]/g, "");
  return /^(\+972|0)5\d{8}$/.test(digits) || /^(\+972|0)[2-9]\d{7}$/.test(digits);
}

// Returns an error message, or "" when the person is fine. With
// required=false an entirely empty person passes.
function personError(p, label, required = true) {
  if (!p || typeof p !== "object") return required ? `${label}: details are required` : "";

  const empty = !p.name && !p.idNumber && !p.phone && !p.email;
  if (!required && empty) return "";

  if (!p.name || String(p.name).trim().length < 2) return `${label}: name is required`;
  if (!isValidTeudat(p.idNumber)) return `${label}: invalid ID number`;
  if (!isValidPhone(p.phone)) return `${label}: invalid phone number`;
  if (!EMAIL_RE.test(String(p.email || ""))) return `${label}: invalid email`;

  return "";
}

module.exports = { isValidTeudat, isValidPhone, personError };
