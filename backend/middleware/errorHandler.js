// Catches anything that reaches here: malformed JSON bodies from
// express.json(), and any error a route forgot to try/catch itself.
// Must be registered last, after all routes — Express recognizes it as an
// error handler purely by its 4-argument signature.
function errorHandler(err, req, res, next) {

  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON body" });
  }

  // Multer: too large / wrong field, or our own file-type filter.
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File is too large (max 10 MB)" });
  }

  if (err.name === "MulterError" || err.status === 400) {
    return res.status(400).json({ message: err.message });
  }

  console.log("UNHANDLED ERROR:", err);

  res.status(err.status || 500).json({
    message: "Something went wrong on our end"
  });
}

module.exports = errorHandler;
