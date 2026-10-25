const multer = require("multer");
const { multerStorage } = require("../services/fileStore");

const MAX_SIZE = 10 * 1024 * 1024;

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const DOCUMENT_TYPES = [...IMAGE_TYPES, "application/pdf"];


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
  storage: multerStorage("public"),
  limits: { fileSize: MAX_SIZE },
  defParamCharset: "utf8", // keep Hebrew/Russian file names intact
  fileFilter: onlyTypes(IMAGE_TYPES)
});

// Private: never served from /uploads — leases carry ID numbers. Read them
// back only through an authenticated route.
const privateUpload = multer({
  storage: multerStorage("private"),
  limits: { fileSize: MAX_SIZE },
  defParamCharset: "utf8", // keep Hebrew/Russian file names intact
  fileFilter: onlyTypes(DOCUMENT_TYPES)
});


module.exports = upload;
module.exports.privateUpload = privateUpload;
