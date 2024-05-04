const mongoose = require("mongoose");

const RegistrationSeatSchema = new mongoose.Schema({
    registration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
    },
    seat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seat",
    },
    createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RegistrationSeatModel = mongoose.model(
  "RegistrationSeat",
  RegistrationSeatSchema
);

module.exports = RegistrationSeatModel;
