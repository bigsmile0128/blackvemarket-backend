const express = require("express");
const ProductCtrl = require("../controllers/product-controller");
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
    { name: "LogoImage", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]);
  const multiUpload1 = upload.fields([
    { name: "assets", maxCount: 1 },
  ]);
const router = express.Router();

router.post("/create-collection",multiUpload, ProductCtrl.createCollection);
router.post("/create-item/fixed-price",multiUpload1,ProductCtrl.FixedPriceMarket);

module.exports = router;
