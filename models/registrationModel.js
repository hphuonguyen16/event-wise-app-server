const mongoose = require("mongoose");
const validator = require("validator");
const seatSchema = require("./seatSchema");

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
      price: {
        type: Number,
        default: 0,
      },
      quantity: {
        type: Number,
      },
      seat: {
        type: seatSchema,
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
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
  },
  orderType: {
    type: String,
    enum: ["manual", "online"],
    default: "online",
  },
  checkedIn: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RegistrationModel = mongoose.model("Registration", RegistrationSchema);

module.exports = RegistrationModel;
