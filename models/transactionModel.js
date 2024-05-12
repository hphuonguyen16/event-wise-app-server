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
      ref: "Organizer",
    },
    amount: {
      type: Number,
      required: [true, "Please provide amount"],
    },

    fee: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
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

// PostTransactionSchema.post("findOneAndUpdate", async function (doc, next) {
//   // const updatedFields = this.getUpdate();
//   if (doc) {
//     let status = "pending";
//     status = doc.status === "success" ? "approved" : "deferred";
//     const postId = doc.post;
//     const post = await BusinessPost.findOneAndUpdate(
//       { _id: postId },
//       {
//         status: status,
//       },
//       { new: true }
//     );
//   }

//   next();
// });

const TransactionModel = mongoose.model("Transaction", TransactionSchema);

module.exports = TransactionModel;
