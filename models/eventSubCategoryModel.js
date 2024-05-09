const mongoose = require("mongoose");

const EventSubCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A ticket must have a specific name"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const EventSubCategoryModel = mongoose.model("EventSubCategory", EventSubCategorySchema);

module.exports = EventSubCategoryModel;
