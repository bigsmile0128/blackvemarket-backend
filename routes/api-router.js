const express = require("express");
const router = express.Router();

const collectionsRouter = require("./collections-router");
const usersRouter = require("./users-router");

router.use("/collections", collectionsRouter);
router.use("/users", usersRouter);

module.exports = router;
