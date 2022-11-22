const express = require("express");
const multer = require("multer");
var path = require("path");
var fs = require("fs");
const __basedir = path.resolve("./");
const usersController = require("../controllers/usersController");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/upload");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); //Appending extension
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 50 },
});
const multiUpload = upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImg", maxCount: 1 },
]);
const router = express.Router();

router.post("/edit-profile", multiUpload, usersController.editProfile);
router.post("/user-register", usersController.register);
router.post("/get-profile", usersController.getProfile);
router.get("/get-collected/:walletaddr", usersController.getCollected);

module.exports = router;
