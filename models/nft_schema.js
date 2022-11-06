const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const nftSchema = new Schema({
    name: String,
    description: String,
    image: String,
    token_id: Number,
    attributes: [{ type: Map }],
    meta_uri: String,
});

module.exports = nftSchema;
