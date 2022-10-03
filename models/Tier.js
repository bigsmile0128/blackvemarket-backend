const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TierSchema = new Schema(
    {
        intervention_id: {
            type: Schema.Types.ObjectId,
            ref: "Intervention",
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        tier_name: {
            type: String,
            required: true,
        },
        tier_description: {
            type: String,
            required: true,
        },
        tier_wallet_address: {
            type: String,
            required: true,
        },
        tier_token_amount: {
            type: Number,
            required: true,
        },
        tier_is_claim: {
            type: Boolean,
            required: true,
        },
        tier_image: {
            type: String,
            required: true,
        },
        tier_private_key: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = Tier = mongoose.model("Tier", TierSchema);
