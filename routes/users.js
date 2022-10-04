const express = require("express");
const UserCtrl = require("../controllers/user-controller");
const multer = require("multer");
var path = require("path");
var fs = require("fs");
const __basedir = path.resolve("./");

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

router.post("/edit-profile",multiUpload, UserCtrl.editProfile);
router.post("/user-register",UserCtrl.Register);

module.exports = router;
