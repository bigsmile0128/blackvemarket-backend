const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const auctionsSchema = new Schema(
  {
    saleId: Number,
    contractAddr: String,
    tokenId: Number,
    seller: String,
    isAuction: Boolean,
    price: Number,
    startedAt: Number,
    duration: Number,
    isFinished: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("auctions", auctionsSchema);
