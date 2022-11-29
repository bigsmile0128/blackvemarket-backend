const express = require("express");
const router = express.Router();

const collectionsRouter = require("./collections-router");
const usersRouter = require("./users-router");
const auctionsRouter = require("./auctions-router");

router.use("/collections", collectionsRouter);
router.use("/users", usersRouter);
router.use("/auctions", auctionsRouter);

module.exports = router;
