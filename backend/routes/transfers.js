const express = require("express");
const crypto = require("crypto");

const Transfer = require("../models/Transfer");
const verifyToken = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();


// ================== CREATE TRANSFER ==================
router.post("/", verifyToken, async (req, res) => {
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


    const transfer = await Transfer.create({
      userId: req.userId,
      oldAddress,
      newAddress,
      moveDate,

      services: services.map(s => ({
        name: s,
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

      await transfer.save();

      res.json(transfer);

    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }

);



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
      serviceName: service.name,
      meterPhoto: service.meterPhoto,
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