const mongoose = require("mongoose");
const validator = require("validator");

const RegistrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
  orders: [
    {
      ticketType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TicketType",
      },
      quantity: {
        type: Number,
      },
    },
  ],
  totalPrice: {
    type: Number,
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
    enum: ["pending_refund", "refunded", "completed", "cancelled"],
    default: "completed",
  },
  contactInfo: {
   firstName: {
     type: String,
     required: [true, "Please provide your first name"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide your last name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      validate: [validator.isEmail, "Please provide a valid email"],
    },
  },
  orderType: {
    type: String,
    enum: ["manual", "online"],
    default: "online",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RegistrationModel = mongoose.model("Registration", RegistrationSchema);

module.exports = RegistrationModel;
