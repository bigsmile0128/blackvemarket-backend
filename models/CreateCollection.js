const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        user_name: {
            type: String,
        },
        user_email: {
            type: String,
        },
        user_wallet_address: {
            type: String,
            required: true,
        },
        user_customeURL: {
            type: String,
        },
        user_bio: {
            type: String,
        },
        user_facebook: {
            type: String,
        },
        user_twitter: {
            type: String,
        },
        user_discord: {
            type: String,
        },
        user_avatar: {
            type: String,
        },
        user_coverImg: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = User = mongoose.model("User", UserSchema);
