const mongoose = require("mongoose");

const TicketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A ticket type must have a specific name"],
  },
  price: {
    type: Number,
    validate: {
      validator: function (value) {
        return value >= 0;
      },
      message: () => `Price must be greater or equal to 0`,
    },
    default: 0,
  },
  quantity: {
    type: Number,
    required: [true, "A ticket type must have a specific quantity"],
    validate: {
      validator: function (value) {
        return value >= 0;
      },
      message: () => `Quantity must be greater or equal to 0`,
    },
  },
  sold: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
  startDate: {
    type: Date,
    required: [true, "A ticket type must have a specific start date"],
  },
  endDate: {
    type: Date,
    required: [true, "A ticket type must have a specific end date"],
  },
  minQuantity: {
    type: Number,
    required: [true, "A ticket type must have a specific minimum quantity"],
    validate: {
      validator: function (value) {
        return value >= 0;
      },
      message: () => `Minimum quantity must be greater or equal to 0`,
    },
  },
  maxQuantity: {
    type: Number,
    required: [true, "A ticket type must have a specific maximum quantity"],
    validate: {
      validator: function (value) {
        return value >= 0;
      },
      message: () => `Maximum quantity must be greater or equal to 0`,
    },
  },
  salesChannel: {
    type: String,
    enum: {
      values: ["online", "offline", "both"],
      message: "Sales channel must be either online or offline",
    },
  },
  ticketType: {
    type: String,
    enum: {
      values: ["free", "paid"],
      message: "Ticket type must be either free or paid",
    },
    default: "free",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TicketTypeModel = mongoose.model("TicketType", TicketTypeSchema);

module.exports = TicketTypeModel;
