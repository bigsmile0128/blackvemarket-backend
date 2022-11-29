const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const logsSchema = new Schema(
  {
    body: String,
    txID: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("logs", logsSchema);
