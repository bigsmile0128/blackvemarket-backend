const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noffersSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        buyer: String,
        col_name: String,
        token_id: Number,
        price: Number,
        finished: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("noffers", noffersSchema);
