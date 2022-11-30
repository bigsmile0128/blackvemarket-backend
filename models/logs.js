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
logsSchema.index({ txID: 1 }, { unique: true });

module.exports = mongoose.model("logs", logsSchema);
