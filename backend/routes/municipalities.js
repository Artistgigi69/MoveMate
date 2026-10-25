const express = require("express");

const { municipalities } = require("../data/municipalities");

const router = express.Router();


// ================== LIST (public) ==================
// The wizard needs the city list before the user has an account.
// Contact details stay server-side.
router.get("/", (req, res) => {
  res.json(
    municipalities.map(({ key, he, ru, method }) => ({ key, he, ru, method }))
  );
});


module.exports = router;
