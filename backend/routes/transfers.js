const express = require("express");
const crypto = require("crypto");

const Transfer = require("../models/Transfer");
const verifyToken = require("../middleware/auth");
const path = require("path");
const upload = require("../middleware/upload");
const { privateUpload, PRIVATE_DIR } = require("../middleware/upload");
const mailer = require("../services/mailer");
const { buildArnonaEmail } = require("../services/arnonaEmail");
const { findMunicipality } = require("../data/municipalities");
const { personError } = require("../utils/validate");

const router = express.Router();


// ================== CREATE TRANSFER ==================
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      oldAddress,
      newAddress,
      moveDate,
      services,
      newTenant,
      applicant,
      oldCity,
      newCity
    } = req.body;

    if (!oldAddress || !newAddress || !moveDate || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        message: "Old address, new address, move date and at least one service are required"
      });
    }

    // The old frontend sends neither block; when they're present (v2),
    // they go into letters to municipalities, so they must be valid.
    const personProblem =
      (applicant !== undefined && personError(applicant, "Applicant")) ||
      (newTenant !== undefined && personError(newTenant, "New tenant", false));

    if (personProblem) {
      return res.status(400).json({ message: personProblem });
    }

    if (oldCity && !findMunicipality(oldCity) || newCity && !findMunicipality(newCity)) {
      return res.status(400).json({ message: "Unknown city" });
    }


    const transfer = await Transfer.create({
      userId: req.userId,
      oldAddress,
      newAddress,
      moveDate,
      oldCity,
      newCity,
      applicant,

      // Accepts plain names (old frontend) or { name, meterReading, provider }.
      services: services.map(s => ({
        name: typeof s === "string" ? s : s.name,
        meterReading: typeof s === "string" ? "" : (s.meterReading || ""),
        provider: typeof s === "string" ? "" : (s.provider || ""),
        status: "Pending",
        confirmToken: crypto.randomBytes(16).toString("hex")
      })),

      newTenant
    });


    res.json(transfer);

  } catch {
    res.status(500).json({
      message: "Server error"
    });
  }
});



// ================== GET ALL TRANSFERS ==================
router.get("/", verifyToken, async (req, res) => {
  try {

    const transfers = await Transfer.find({
      userId: req.userId
    });


    res.json(transfers);

  } catch {
    res.status(500).json({
      message: "Server error"
    });
  }
});




// ================== GET ONE TRANSFER ==================
router.get("/:id", verifyToken, async (req, res) => {
  try {

    const transfer = await Transfer.findOne({
      _id: req.params.id,
      userId: req.userId
    });


    if (!transfer) {
      return res.status(404).json({
        message: "Not found"
      });
    }


    res.json(transfer);


  } catch {
    res.status(500).json({
      message: "Server error"
    });
  }
});




// ================== UPDATE TRANSFER (full edit) ==================
router.put("/:id", verifyToken, async (req, res) => {
  try {

    const {
      oldAddress,
      newAddress,
      moveDate,
      services,
      newTenant
    } = req.body;

    if (!oldAddress || !newAddress || !moveDate || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        message: "Old address, new address, move date and at least one service are required"
      });
    }


    const transfer = await Transfer.findOne({
      _id: req.params.id,
      userId: req.userId
    });


    if (!transfer) {
      return res.status(404).json({
        message: "Not found"
      });
    }


    // Preserve existing status/meterPhoto/etc per service when the service
    // already existed, default new ones to "Pending" with a fresh token
    const updatedServices = services.map(name => {
      const existing = transfer.services.find(s => s.name === name);
      return {
        name,
        status: existing ? existing.status : "Pending",
        meterPhoto: existing ? existing.meterPhoto : "",
        meterReading: existing ? existing.meterReading : "",
        provider: existing ? existing.provider : "",
        sentVia: existing ? existing.sentVia : "",
        requestSentAt: existing ? existing.requestSentAt : null,
        confirmToken: existing ? existing.confirmToken : crypto.randomBytes(16).toString("hex"),
        confirmedByTenant: existing ? existing.confirmedByTenant : false,
        confirmedAt: existing ? existing.confirmedAt : null
      };
    });


    transfer.oldAddress = oldAddress;
    transfer.newAddress = newAddress;
    transfer.moveDate = moveDate;
    transfer.services = updatedServices;
    transfer.newTenant = newTenant;


    await transfer.save();


    res.json(transfer);


  } catch {
    res.status(500).json({
      message: "Server error"
    });
  }
});




// ================== DELETE ==================
router.delete("/:id", verifyToken, async (req, res) => {
  try {

    const transfer = await Transfer.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });


    if (!transfer) {
      return res.status(404).json({
        message: "Not found"
      });
    }


    res.json({
      message: "Deleted"
    });


  } catch {
    res.status(500).json({
      message: "Server error"
    });
  }
});




// ================== UPLOAD METER PHOTO ==================
router.post(
  "/:id/meter-photo",
  verifyToken,
  upload.single("photo"),

  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded"
        });
      }

      const { serviceIndex } = req.body;

      const transfer = await Transfer.findOne({
        _id: req.params.id,
        userId: req.userId
      });

      if (!transfer) {
        return res.status(404).json({
          message: "Not found"
        });
      }

      if (!transfer.services[serviceIndex]) {
        return res.status(400).json({
          message: "Invalid service"
        });
      }

      transfer.services[serviceIndex].meterPhoto = req.file.filename;

      if (req.body.meterReading) {
        transfer.services[serviceIndex].meterReading = req.body.meterReading;
      }

      await transfer.save();

      res.json(transfer);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }

);



// ================== UPLOAD LEASE ==================
router.post(
  "/:id/lease",
  verifyToken,
  privateUpload.single("lease"),

  async (req, res) => {
    try {

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const transfer = await Transfer.findOne({
        _id: req.params.id,
        userId: req.userId
      });

      if (!transfer) {
        return res.status(404).json({ message: "Not found" });
      }

      transfer.leaseFile = req.file.filename;
      transfer.leaseFileName = req.file.originalname;

      await transfer.save();

      res.json(transfer);

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);



// ================== DOWNLOAD LEASE (owner only) ==================
router.get("/:id/lease", verifyToken, async (req, res) => {
  try {

    const transfer = await Transfer.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transfer || !transfer.leaseFile) {
      return res.status(404).json({ message: "Not found" });
    }

    res.download(
      path.join(PRIVATE_DIR, transfer.leaseFile),
      transfer.leaseFileName || "lease" + path.extname(transfer.leaseFile)
    );

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// ================== SUBMIT ALL REQUESTS ==================
// Sends what we can actually send today (arnona letters by email) and marks
// the rest as manual so the status screen is honest about what happened.
router.post("/:id/submit", verifyToken, async (req, res) => {
  try {

    const transfer = await Transfer.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transfer) {
      return res.status(404).json({ message: "Not found" });
    }

    const results = [];

    for (const service of transfer.services) {

      if (service.requestSentAt) {
        results.push({ name: service.name, sentVia: service.sentVia, skipped: true });
        continue;
      }

      let sentVia = "manual";
      let error = "";

      if (service.name === "arnona") {
        try {
          sentVia = await sendArnona(transfer);
        } catch (err) {
          console.log("ARNONA SEND ERROR:", err.message);
          error = "Email could not be sent";
        }
      }

      service.sentVia = sentVia;

      // Manual ones stay Pending with no requestSentAt, so the next submit
      // retries them (e.g. once SMTP or a city's email gets configured).
      if (sentVia !== "manual") {
        service.requestSentAt = new Date();

        if (service.status === "Pending") {
          service.status = "Processing";
        }
      }

      results.push({ name: service.name, sentVia, error });
    }

    await transfer.save();

    res.json({ transfer, results });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Emails both municipalities (close at old city, open at new city). Returns
// "email" only if every letter that needed sending went out.
async function sendArnona(transfer) {

  if (!mailer.isConfigured()) return "manual";

  const letters = [
    { city: findMunicipality(transfer.oldCity), kind: "close" },
    { city: findMunicipality(transfer.newCity), kind: "open" }
  ];

  let sentAll = true;

  for (const { city, kind } of letters) {

    // "form"-only cities have no adapter yet — the user fills the form.
    if (!city || !city.email) {
      sentAll = false;
      continue;
    }

    const mail = buildArnonaEmail(transfer, kind);

    await mailer.sendMail({
      to: city.email,
      cc: transfer.applicant && transfer.applicant.email,
      ...mail
    });
  }

  return sentAll ? "email" : "manual";
}



// ================== MARK REQUEST SENT ==================
router.put("/:id/services/:index/send", verifyToken, async (req, res) => {
  try {

    const transfer = await Transfer.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transfer) {
      return res.status(404).json({ message: "Not found" });
    }

    const service = transfer.services[req.params.index];

    if (!service) {
      return res.status(400).json({ message: "Invalid service" });
    }

    service.requestSentAt = new Date();

    if (service.status === "Pending") {
      service.status = "Processing";
    }

    await transfer.save();

    res.json(transfer);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// ================== PUBLIC: GET CONFIRMATION INFO ==================
// No auth — the new tenant reaches this via a link, not a login.
router.get("/public/confirm/:token", async (req, res) => {
  try {

    const transfer = await Transfer.findOne({
      "services.confirmToken": req.params.token
    });

    if (!transfer) {
      return res.status(404).json({ message: "Not found" });
    }

    const service = transfer.services.find(s => s.confirmToken === req.params.token);

    res.json({
      address: transfer.oldAddress,
      // First name only: enough for the new tenant to recognise the request.
      applicantName: (transfer.applicant?.name || "").trim().split(/\s+/)[0],
      serviceName: service.name,
      meterPhoto: service.meterPhoto,
      meterReading: service.meterReading,
      confirmedByTenant: service.confirmedByTenant,
      confirmedAt: service.confirmedAt
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// ================== PUBLIC: CONFIRM METER READING ==================
router.post("/public/confirm/:token", async (req, res) => {
  try {

    const transfer = await Transfer.findOne({
      "services.confirmToken": req.params.token
    });

    if (!transfer) {
      return res.status(404).json({ message: "Not found" });
    }

    const service = transfer.services.find(s => s.confirmToken === req.params.token);

    if (service.confirmedByTenant) {
      return res.status(400).json({ message: "Already confirmed" });
    }

    service.confirmedByTenant = true;
    service.confirmedAt = new Date();

    await transfer.save();

    res.json({ message: "Confirmed", confirmedAt: service.confirmedAt });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// ================== UPDATE STATUS ==================
router.put("/:id/status", verifyToken, async (req, res) => {
  try {

    const {
      serviceIndex,
      status
    } = req.body;

    if (!["Pending", "Processing", "Completed"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Pending, Processing or Completed"
      });
    }


    const transfer = await Transfer.findOne({
      _id: req.params.id,
      userId: req.userId
    });


    if (!transfer) {
      return res.status(404).json({
        message: "Not found"
      });
    }


    if (!transfer.services[serviceIndex]) {
      return res.status(400).json({
        message: "Invalid service"
      });
    }


    transfer.services[serviceIndex].status = status;


    await transfer.save();


    res.json(transfer);


  } catch {
    res.status(500).json({
      message: "Server error"
    });
  }
});



module.exports = router;