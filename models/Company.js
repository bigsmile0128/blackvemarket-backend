const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CompanySchema = new Schema(
    {
        tier_id: {
            type: Schema.Types.ObjectId,
            ref: "Tier",
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        company_name: {
            type: String,
            required: true,
        },
        company_image: {
            type: String,
            required: true,
        },
        company_description: {
            type: String,
            required: true,
        },
        company_wallet_address: {
            type: String,
            required: true,
        },
        company_token_amount: {
            type: Number,
            required: true,
        },
        company_is_claim: {
            type: Boolean,
            required: true,
        },
        company_private_key: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = Company = mongoose.model("Company", CompanySchema);
