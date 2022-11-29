const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const offersSchema = new Schema(
  {
    auction_id: {
        type: Schema.Types.ObjectId,
        ref: "Auction",
    },
    saleId: Number,
    buyer: String,
    price: Number,
    bidAt: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("offers", offersSchema);
