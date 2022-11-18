const express = require("express");
const collectionsController = require("../controllers/collectionsController");
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
  { name: "logoImg", maxCount: 1 },
  { name: "bannerImg", maxCount: 1 },
  { name: "featureImg", maxCount: 1 },
]);
const multiUpload1 = upload.fields([{ name: "assets", maxCount: 1 }]);
const router = express.Router();

router.post(
  "/create-collection",
  multiUpload,
  collectionsController.createCollection
);
router.post(
  "/create-item/fixed-price",
  multiUpload1,
  collectionsController.fixedPriceMarket
);
router.get("/get-collections", collectionsController.getCollections);
router.post("/get-collection", collectionsController.getCollection);
router.post("/add-nft", collectionsController.addNFT);
router.post("/get-nfts", collectionsController.getNFTs);
router.post("/get-itdetails", collectionsController.getItemDetails);
router.post("/nft", collectionsController.getNFTInfo);
router.post("/get-allnfts", collectionsController.getAllNfts);
router.post("/update-nft", collectionsController.updateNFT);

module.exports = router;
