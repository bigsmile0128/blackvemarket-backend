const express = require("express");
const auctionsController = require("../controllers/auctionsController");

const router = express.Router();

router.post("/events/test", auctionsController.test);

module.exports = router;
