const express = require("express");
const path = require("path");

const Transfer = require("../models/Transfer");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const fileStore = require("../services/fileStore");
const mailer = require("../services/mailer");
const { buildConciergeUpdate } = require("../services/conciergeEmail");

// Staff queue for "do it for me" requests (see transfers.js). Everything here
// shows ID numbers and phones, so every route is admin-only.

const router = express.Router();
router.use(verifyToken, requireAdmin);

const STATUSES = ["Processing", "Completed", "Failed"];


// ================== AM I STAFF? ==================
router.get("/me", (req, res) => res.json({ admin: true }));


// ================== QUEUE ==================
// ?done=1 lists finished requests (last 100), otherwise the open ones,
// oldest first.
router.get("/requests", async (req, res) => {
  try {

    const done = req.query.done === "1";

    const transfers = await Transfer.find({ "services.sentVia": "concierge" })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    const owners = await User.find({ _id: { $in: transfers.map(t => t.userId) } })
      .select("email username")
      .lean();
    const ownerById = new Map(owners.map(u => [String(u._id), u]));

    const items = [];

    for (const t of transfers) {
      t.services.forEach((s, index) => {
        if (s.sentVia !== "concierge") return;
        const finished = s.status === "Completed" || s.status === "Failed";
        if (finished !== done) return;

        const owner = ownerById.get(String(t.userId));
        items.push({
          transferId: t._id,
          index,
          service: {
            name: s.name,
            status: s.status,
            provider: s.provider,
            meterReading: s.meterReading,
            meterPhoto: s.meterPhoto,
            confirmedByTenant: s.confirmedByTenant,
            conciergeRequestedAt: s.conciergeRequestedAt,
            conciergeNote: s.conciergeNote
          },
          oldAddress: t.oldAddress,
          newAddress: t.newAddress,
          oldCity: t.oldCity,
          newCity: t.newCity,
          moveDate: t.moveDate,
          applicant: t.applicant,
          newTenant: t.newTenant,
          leaseFileName: t.leaseFile ? t.leaseFileName || "lease" : "",
          account: owner ? { email: owner.email, name: owner.username } : null
        });
      });
    }

    items.sort((a, b) => done
      ? new Date(b.service.conciergeRequestedAt) - new Date(a.service.conciergeRequestedAt)
      : new Date(a.service.conciergeRequestedAt) - new Date(b.service.conciergeRequestedAt));

    res.json(done ? items.slice(0, 100) : items);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================== UPDATE ONE REQUEST ==================
// Completed/Failed email the user (in their site language) with the note.
router.put("/transfers/:id/services/:index", async (req, res) => {
  try {

    const { status, note } = req.body || {};

    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Status must be Processing, Completed or Failed" });
    }

    const transfer = await Transfer.findById(req.params.id);
    const service = transfer && transfer.services[req.params.index];

    if (!service || service.sentVia !== "concierge") {
      return res.status(404).json({ message: "Not found" });
    }

    const wasFinished = service.status === "Completed" || service.status === "Failed";

    service.status = status;
    service.conciergeNote = String(note || "").slice(0, 1000);

    await transfer.save();

    let emailed = false;
    const to = transfer.applicant && transfer.applicant.email;

    if (status !== "Processing" && !wasFinished && to && mailer.isConfigured()) {
      const frontend = (process.env.FRONTEND_URL || "http://localhost:5174").replace(/\/+$/, "");
      try {
        await mailer.sendMail({
          to,
          ...buildConciergeUpdate({
            lang: transfer.lang,
            service: service.name,
            status,
            note: service.conciergeNote,
            url: `${frontend}/status/${transfer._id}`
          })
        });
        emailed = true;
      } catch (err) {
        console.log("CONCIERGE USER EMAIL ERROR:", err.message);
      }
    }

    res.json({ ok: true, emailed });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ================== LEASE (staff copy) ==================
router.get("/transfers/:id/lease", async (req, res) => {
  try {

    const transfer = await Transfer.findById(req.params.id);

    if (!transfer || !transfer.leaseFile) {
      return res.status(404).json({ message: "Not found" });
    }

    await fileStore.sendFile(
      res,
      "private",
      transfer.leaseFile,
      transfer.leaseFileName || "lease" + path.extname(transfer.leaseFile)
    );

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
