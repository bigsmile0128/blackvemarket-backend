const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new Schema(
  {
    name: String,
    email: String,
    address: String,
    url: String,
    bio: String,
    facebook: String,
    twitter: String,
    discord: String,
    avatar: String,
    coverImg: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("users", usersSchema);
