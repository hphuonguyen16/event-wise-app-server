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

  QRCode: {
    type: String,
  },
  status: {
    type: String,
    enum: ["valid", "cancelled"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RegistrationModel = mongoose.model("Registration", RegistrationSchema);

module.exports = RegistrationModel;
