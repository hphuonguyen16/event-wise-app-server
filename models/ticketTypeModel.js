const mongoose = require("mongoose");

const TicketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A ticket type must have a specific name"],
  },
  price: {
    type: Number,
    required: [true, "A ticket type must have a specific price"],
    validate: {
      validator: function (value) {
        return value >= 0;
      },
      message: () => `Price must be greater or equal to 0`,
    },
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
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
  startDate: {
    type: String,
    required: [true, "A ticket type must have a specific start date"],
  },
  endDate: {
    type: String,
    required: [true, "A ticket type must have a specific end date"],
  },
  startTime: {
    type: String,
    required: [true, "A ticket type must have a specific start time"],
  },
  endTime: {
    type: String,
    required: [true, "A ticket type must have a specific end time"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TicketTypeModel = mongoose.model(
  "TicketType",
  TicketTypeSchema
);

module.exports = TicketTypeModel;
