const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  name: String,
  status: {
    type: String,
    enum: ["available", "reserved", "sold"],
    default: "available",
  },
  tier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tier",
  },
  type: String,
  sectionId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

seatSchema.pre(/^find/, function (next) {
  this.populate({
    path: "tier"
  });

  next();
});

const SeatModel = mongoose.model("Seat", seatSchema);

module.exports = SeatModel;
