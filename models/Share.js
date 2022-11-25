const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shareSchema = new Schema(
  {
    companyName: {
      type: String,

      required: true,
    },
    noOfShare: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const Share = mongoose.model("share", shareSchema);
module.exports = Share;
