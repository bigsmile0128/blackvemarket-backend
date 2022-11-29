const express = require("express");
const auctionsController = require("../controllers/auctionsController");

const router = express.Router();

router.post("/events/onCreatedAuction", auctionsController.onCreatedAuction);
router.post("/events/onCanceledAuction", auctionsController.onCanceledAuction);
router.post("/events/onChangedAuctionPrice", auctionsController.onChangedAuctionPrice);
router.post("/events/onNewHighestOffer", auctionsController.onNewHighestOffer);
router.post("/events/onFixedBought", auctionsController.onFixedBought);
router.post("/events/onClaimed", auctionsController.onClaimed);
router.post("/events/onNewSaleIdCreated", auctionsController.onNewSaleIdCreated);
router.post("/events/onSaleCXL", auctionsController.onSaleCXL);
router.post("/events/onRefunded", auctionsController.onRefunded);

// router.post("/get-auction", auctionsController.getAuction);


module.exports = router;
