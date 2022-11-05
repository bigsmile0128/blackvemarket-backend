const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    price: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    royalties: {
      type: String,
      required: true,
    },
    assets: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = FixedPriceMarket = mongoose.model(
  "FixedPriceMarket",
  UserSchema
);
