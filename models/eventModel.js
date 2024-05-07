const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  images: [String],
  title: {
    type: String,
    required: [true, "An event must have a specific title"],
  },
  summary: {
    type: String,
    required: [true, "An event must have a specific summary"],
  },
  location: {
    formatted: String,
    lat: Number,
    lon: Number,
  },
  detailLocation: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EventCategory",
  },
  date: {
    type: String,
    required: [true, "An event must have a specific date"],
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  about: [
    {
      type: {
        type: String,
        required: [true, "A description must have a type"],
      },
      description: {
        type: String,
        required: [true, "A description must have a value"],
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EventModel = mongoose.model(
  "Event",
  EventSchema
);

module.exports = EventModel;
