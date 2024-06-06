const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      //required: [true, "Please provide amount"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    fee: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["processing", "success", "failed", "canceled"],
      default: "processing",
    },
    transaction_type: {
      type: String,
      enum: ["payment", "withdrawal", "deposit", "refund"],
    },

    ipAddress: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


const TransactionModel = mongoose.model("Transaction", TransactionSchema);

module.exports = TransactionModel;
