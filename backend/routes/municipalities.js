const express = require("express");

const { municipalities } = require("../data/municipalities");

const router = express.Router();


// ================== LIST (public) ==================
// The wizard needs the city list before the user has an account.
// The form link is public (the user may need to fill it in themselves);
// the email stays server-side.
router.get("/", (req, res) => {
  res.json(
    municipalities.map(({ key, he, ru, method, formUrl, water }) => ({ key, he, ru, method, formUrl, water }))
  );
});


module.exports = router;
