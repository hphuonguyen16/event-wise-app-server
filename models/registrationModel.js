const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
    },
    ticketType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TicketType",
    },
    registrationDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending",
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RegistrationModel = mongoose.model(
  "TicketType",
  RegistrationSchema
);

module.exports = RegistrationModel;
