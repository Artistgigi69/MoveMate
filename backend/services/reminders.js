const Transfer = require("../models/Transfer");
const push = require("./push");

const REMINDER_WINDOW_DAYS = 3;

// Scans for moves happening within REMINDER_WINDOW_DAYS that haven't been
// nudged yet, and sends one push per transfer. Runs on an interval from
// server.js — there's no external job scheduler, just setInterval, which is
// enough at this scale and needs no extra infrastructure.
async function checkMoveReminders() {

  if (!push.isConfigured()) return;

  const transfers = await Transfer.find({ reminderSent: false });

  const now = new Date();

  for (const transfer of transfers) {

    const moveDate = new Date(transfer.moveDate);

    if (Number.isNaN(moveDate.getTime())) continue;

    const daysUntil = Math.ceil((moveDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntil >= 0 && daysUntil <= REMINDER_WINDOW_DAYS) {

      await push.sendPushToUser(transfer.userId, {
        title: "Upcoming move",
        body: `Your move to ${transfer.newAddress} is in ${daysUntil} day${daysUntil === 1 ? "" : "s"} — check your checklist!`
      });

      transfer.reminderSent = true;
      await transfer.save();
    }
  }
}

module.exports = { checkMoveReminders, REMINDER_WINDOW_DAYS };
