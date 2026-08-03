const express = require("express");
const PDFDocument = require("pdfkit");

const Transfer = require("../models/Transfer");
const Expense = require("../models/Expense");
const verifyToken = require("../middleware/auth");

const router = express.Router();


router.get("/history-pdf", verifyToken, async (req, res) => {
  try {

    const [transfers, expenses] = await Promise.all([
      Transfer.find({ userId: req.userId }).sort({ createdAt: -1 }),
      Expense.find({ userId: req.userId }).sort({ createdAt: -1 })
    ]);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=movemate-history.pdf");

    doc.pipe(res);

    doc.fontSize(20).text("MoveMate — Transfer & Payment History", { align: "left" });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#8A8FB3").text(`Generated ${new Date().toLocaleString()}`);
    doc.fillColor("#16182B");
    doc.moveDown(1.5);

    doc.fontSize(14).text("Transfers");
    doc.moveDown(0.5);

    if (transfers.length === 0) {
      doc.fontSize(11).fillColor("#8A8FB3").text("No transfers yet.");
      doc.fillColor("#16182B");
    }

    transfers.forEach((t) => {

      doc.fontSize(11).fillColor("#16182B")
        .text(`${t.oldAddress}  →  ${t.newAddress}`, { continued: false });

      doc.fontSize(9).fillColor("#8A8FB3")
        .text(`Move date: ${t.moveDate}`);

      const serviceLine = t.services
        .map(s => `${s.name} (${s.status})`)
        .join(", ");

      doc.text(`Services: ${serviceLine}`);

      doc.fillColor("#16182B");
      doc.moveDown(0.8);
    });

    doc.moveDown(0.5);
    doc.fontSize(14).text("Expenses / Payments");
    doc.moveDown(0.5);

    if (expenses.length === 0) {
      doc.fontSize(11).fillColor("#8A8FB3").text("No expenses yet.");
      doc.fillColor("#16182B");
    }

    let total = 0;

    expenses.forEach((e) => {

      total += Number(e.amount) || 0;

      doc.fontSize(11).fillColor("#16182B")
        .text(`${e.title}  —  $${e.amount}`, { continued: false });

      doc.fontSize(9).fillColor("#8A8FB3")
        .text(`${e.category} · ${new Date(e.createdAt).toLocaleDateString()}${e.description ? " · " + e.description : ""}`);

      doc.fillColor("#16182B");
      doc.moveDown(0.6);
    });

    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total: $${total.toFixed(2)}`, { align: "right" });

    doc.end();

  } catch (error) {

    console.log("EXPORT PDF ERROR:", error);

    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    } else {
      res.end();
    }

  }

});


module.exports = router;
