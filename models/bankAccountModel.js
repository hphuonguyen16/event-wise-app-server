const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      index: true,
      unique: true,
    },
    number: { type: String, default: "" },
    owner_name: { type: String, default: "" },
    bank_name: { type: String, default: "" },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const BankAccountModel = mongoose.model("BankAccount", bankAccountSchema);

module.exports = BankAccountModel;
