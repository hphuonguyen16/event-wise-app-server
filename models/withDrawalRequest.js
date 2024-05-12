const mongoose = require("mongoose");

const withdrawalRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", index: true },
    transaction: {
      type: mongoose.Schema.ObjectId,
      ref: "Transaction",
      index: true,
    },
    bank_account: {
      type: {
        number: { type: String, required: true },
        owner_name: { type: String, required: true },
        bank_name: { type: String, required: true },
      },
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const WithdrawalRequest = mongoose.model(
  "WithdrawalRequest",
  withdrawalRequestSchema
);

module.exports = WithdrawalRequest;
