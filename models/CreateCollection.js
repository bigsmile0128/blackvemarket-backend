const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        collection_logoImage: {
            type: String,
            required: true
        },
        collection_bannerImage: {
            type: String,
            required: true
        },
        collection_name: {
            type: String,
            required: true
        },
        collection_url: {
            type: String,
            required: true
        },
        collection_description: {
            type: String,
            required: true
        },
        collection_category: {
            type: String,
            required: true
        },
        collection_payment: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
);

module.exports = CreateCollection = mongoose.model("CreateCollection", UserSchema);
