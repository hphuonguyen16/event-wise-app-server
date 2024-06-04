const mongoose = require("mongoose");

// Define the schema for the membership tier
const tierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
});

// Create the model from the schema
const Tier = mongoose.model("Tier", tierSchema);

// Export the model
module.exports = Tier;
