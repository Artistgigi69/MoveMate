// Israeli ID (teudat zehut) check digit: 9 digits, Luhn-like weights 1,2,1,2…
export function isValidTeudat(value) {
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

export function isValidPhone(value) {
  const digits = String(value || "").replace(/[\s-]/g, "");
  return /^(\+972|0)5\d{8}$/.test(digits) || /^(\+972|0)[2-9]\d{7}$/.test(digits);
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

// Returns { field: message } for a person block; `required` false means an
// empty block is fine but a partly filled one still has to be valid.
export function validatePerson(p, required = true) {
  const errors = {};
  const empty = !p.name && !p.idNumber && !p.phone && !p.email;
  if (!required && empty) return errors;

  if (!p.name || p.name.trim().length < 2) errors.name = "Введите имя и фамилию";
  if (!isValidTeudat(p.idNumber)) errors.idNumber = "Неверный номер теудат зеут";
  if (!isValidPhone(p.phone)) errors.phone = "Неверный номер телефона";
  if (!isValidEmail(p.email)) errors.email = "Неверный email";

  return errors;
}
