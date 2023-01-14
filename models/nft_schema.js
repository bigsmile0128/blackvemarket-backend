const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const nftSchema = new Schema({
    name: String,
    description: String,
    image: String,
    token_id: Number,
    attributes: [{ type: Map }],
    meta_uri: String,
    valid: Boolean,
    rank: Number,
    rarity: Number,
    edition: String,
    seller_fee_basis_points: Number,
    col: Object,
    properties: Object,
    category: String,
    creators: [{ type: Map }],
    symbol: String,
    owner: String,
});
nftSchema.index({ token_id: 1 }, { unique: true });

module.exports = nftSchema;
