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

  console.log("UNHANDLED ERROR:", err);

  res.status(err.status || 500).json({
    message: "Something went wrong on our end"
  });
}

module.exports = errorHandler;
