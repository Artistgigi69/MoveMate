const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");

// Uploads live in MongoDB (GridFS), not on disk: free hosting (Render free)
// wipes the app's disk on every deploy and every wake-up from sleep.
//
// "public"  — avatars, meter photos: served openly from /uploads/<name>
//             (the new tenant sees the photo on the confirmation link).
// "private" — leases carry ID numbers: read back only through an
//             authenticated route, never from /uploads.
const BUCKETS = {
  public: "uploads",
  private: "private_uploads"
};

function bucket(kind) {
  if (!BUCKETS[kind]) throw new Error("Unknown file bucket: " + kind);
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKETS[kind] });
}


// Random names: the original name can carry personal data, and a timestamp
// prefix made files guessable.
function randomName(originalName) {
  const ext = path.extname(originalName || "").toLowerCase().replace(/[^.a-z0-9]/g, "");
  return crypto.randomBytes(16).toString("hex") + ext;
}


// Multer storage engine: streams the upload straight into GridFS. Sets
// req.file.filename like disk storage did, so routes don't change.
function multerStorage(kind) {
  return {
    _handleFile(req, file, cb) {
      const filename = randomName(file.originalname);
      const out = bucket(kind).openUploadStream(filename, {
        metadata: { contentType: file.mimetype }
      });

      let done = false;
      const finish = (err, info) => {
        if (done) return;
        done = true;
        cb(err, info);
      };

      // Over the size limit: drop the partial file instead of leaving
      // orphan chunks behind. Multer waits for this callback before it
      // answers with LIMIT_FILE_SIZE.
      file.stream.on("limit", () => {
        file.stream.unpipe(out);
        file.stream.resume();
        out.abort()
          .catch(() => {})
          .then(() => finish(null, { filename, aborted: true }));
      });

      file.stream.pipe(out)
        .on("error", finish)
        .on("finish", () => finish(null, { filename, id: out.id, size: out.length }));
    },

    _removeFile(req, file, cb) {
      if (file.aborted) return cb(null);
      bucket(kind).delete(file.id).then(() => cb(null), cb);
    }
  };
}


async function findFile(kind, filename) {
  const [file] = await bucket(kind).find({ filename }).limit(1).toArray();
  return file || null;
}

// Whole file as a Buffer (for email attachments), or null if missing.
async function readFile(kind, filename) {
  const file = await findFile(kind, filename);
  if (!file) return null;

  const chunks = [];
  for await (const chunk of bucket(kind).openDownloadStream(file._id)) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Streams a file into the response. With downloadName it's sent as an
// attachment under that name.
async function sendFile(res, kind, filename, downloadName) {
  const file = await findFile(kind, filename);

  if (!file) {
    return res.status(404).json({ message: "Not found" });
  }

  res.type((file.metadata && file.metadata.contentType) || path.extname(filename));
  res.set("Content-Length", String(file.length));

  if (downloadName) {
    res.attachment(downloadName);
  } else {
    // Names are random and files never change.
    res.set("Cache-Control", "public, max-age=31536000, immutable");
  }

  bucket(kind).openDownloadStream(file._id)
    .on("error", () => res.destroy())
    .pipe(res);
}


// Deletes every stored copy of the file; missing files are fine.
async function removeFile(kind, filename) {
  if (!filename) return;
  const files = await bucket(kind).find({ filename }).toArray();
  for (const file of files) {
    await bucket(kind).delete(file._id);
  }
}


module.exports = { multerStorage, readFile, sendFile, removeFile };
