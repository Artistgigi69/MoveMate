const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const MAX_SIZE = 10 * 1024 * 1024;

// STORAGE_DIR points at a persistent disk in production (Render wipes the
// app's own folder on every deploy). Locally it defaults to backend/.
const STORAGE_ROOT = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.join(__dirname, "..");

const PUBLIC_DIR = path.join(STORAGE_ROOT, "uploads");
// Leases and other ID-bearing documents — deliberately NOT under /uploads.
const PRIVATE_DIR = path.join(STORAGE_ROOT, "private_uploads");

for (const dir of [PUBLIC_DIR, PRIVATE_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const DOCUMENT_TYPES = [...IMAGE_TYPES, "application/pdf"];


// Random names: the original name can carry personal data, and a timestamp
// prefix made files guessable.
function storageIn(dir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "");
      cb(null, crypto.randomBytes(16).toString("hex") + ext);
    }
  });
}

function onlyTypes(types) {
  return (req, file, cb) => {
    if (types.includes(file.mimetype)) return cb(null, true);
    const err = new Error("Unsupported file type");
    err.status = 400;
    cb(err);
  };
}


// Public: served from /uploads (avatars, meter photos shown to the new
// tenant on the confirmation link).
const upload = multer({
  storage: storageIn(PUBLIC_DIR),
  limits: { fileSize: MAX_SIZE },
  defParamCharset: "utf8", // keep Hebrew/Russian file names intact
  fileFilter: onlyTypes(IMAGE_TYPES)
});

// Private: never served statically — leases carry ID numbers. Read them
// back only through an authenticated route.
const privateUpload = multer({
  storage: storageIn(PRIVATE_DIR),
  limits: { fileSize: MAX_SIZE },
  defParamCharset: "utf8", // keep Hebrew/Russian file names intact
  fileFilter: onlyTypes(DOCUMENT_TYPES)
});


module.exports = upload;
module.exports.privateUpload = privateUpload;
module.exports.PUBLIC_DIR = PUBLIC_DIR;
module.exports.PRIVATE_DIR = PRIVATE_DIR;
