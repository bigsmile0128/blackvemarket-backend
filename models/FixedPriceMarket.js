const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        item_price: {
            type: String,
            required: true
        },
        item_title: {
            type: String,
            required: true
        },
        item_description: {
            type: String,
            required: true
        },
        item_royalties: {
            type: String,
            required: true
        },
        item_size: {
            type: String,
            required: true
        },
        item_abstract: {
            type: String,
            required: true
        },
        item_assets: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
);

module.exports = FixedPriceMarket = mongoose.model("FixedPriceMarket", UserSchema);
