const mongoose = require("mongoose");

const EventCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A ticket must have a specific name"],
    },

    createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EventCategoryModel = mongoose.model(
  "EventCategory",
  EventCategorySchema
);

module.exports = EventCategoryModel;
