const mongoose = require("mongoose");

const SeatSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
    },
    seatNumber: {
        type: String,
    },
    rowNumber: {
        type: String,
    },

    status: {
        type: String,
        enum: ["available", "reserved", "occupied"],
    },
    createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SeatModel = mongoose.model(
  "Seat",
  SeatSchema
);

module.exports = SeatModel;
