const crypto = require("crypto");
const path = require("path");
const multer = require("multer");

const MAX_SIZE = 10 * 1024 * 1024;

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
  storage: storageIn("uploads/"),
  limits: { fileSize: MAX_SIZE },
  defParamCharset: "utf8", // keep Hebrew/Russian file names intact
  fileFilter: onlyTypes(IMAGE_TYPES)
});

// Private: never served statically — leases carry ID numbers. Read them
// back only through an authenticated route.
const privateUpload = multer({
  storage: storageIn("private_uploads/"),
  limits: { fileSize: MAX_SIZE },
  defParamCharset: "utf8", // keep Hebrew/Russian file names intact
  fileFilter: onlyTypes(DOCUMENT_TYPES)
});


module.exports = upload;
module.exports.privateUpload = privateUpload;
module.exports.PRIVATE_DIR = "private_uploads";
