const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FileSchema = new Schema({ filename: String, mimetype: String });

const InterventionSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        token_amount: {
            type: Number,
            required: true,
        },
        wallet_address: {
            type: String,
            required: true,
        },
        file: {
            type: [FileSchema],
        },
        nft_name: {
            type: String,
            required: true,
        },
        nft_description: {
            type: String,
            required: true,
        },
        nft_price: {
            type: Number,
            required: true,
        },
        nft_image: {
            type: String,
            required: true,
        },
        project_name: {
            type: String,
            required: true,
        },
        project_description: {
            type: String,
            required: true,
        },
        project_id: {
            type: String,
            required: true,
        },
        event_type: {
            type: String,
            required: true,
        },
        project_country: {
            type: String,
            required: true,
        },
        credit_type: {
            type: String,
            required: true,
        },
        methodology: {
            type: String,
            required: true,
        },
        value_chain: {
            type: String,
            required: true,
        },
        shed_name: {
            type: String,
            required: true,
        },
        beneficiary: {
            type: String,
            required: true,
        },
        reduction_purpose: {
            type: String,
            required: true,
        },
        country_of_consumption: {
            type: String,
            required: true,
        },
        vintage: {
            type: String,
            required: true,
        },
        verified_by: {
            type: String,
            required: true,
        },
        date_of_verification: {
            type: Date,
            required: true,
        },
        date_of_issue: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = Intervention = mongoose.model(
    "Intervention",
    InterventionSchema
);
