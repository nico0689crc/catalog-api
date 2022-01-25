const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
    },
    creators: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // this is the expiry time in seconds
    },
  },
  {
    autoIndex: false,
    autoCreate: false,
    optimisticConcurrency: true,
    timestamps: true,
  }
);
module.exports = mongoose.model("Token", tokenSchema);
