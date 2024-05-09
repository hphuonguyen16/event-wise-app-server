const mongoose = require("mongoose");

const EventTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A ticket must have a specific name"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EventTypeModel = mongoose.model("EventType", EventTypeSchema);

module.exports = EventTypeModel;
