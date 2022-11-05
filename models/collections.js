const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const collectionsSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    address: String,
    logoImg: {
      type: String,
      required: true,
    },
    bannerImg: String,
    name: {
      type: String,
      required: true,
    },
    symbol: String,
    description: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("collections", collectionsSchema);
