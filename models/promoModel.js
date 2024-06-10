const mongoose = require("mongoose");
const TicketTypeModel = require("./ticketTypeModel");

const PromoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A promo must have a specific name"],
  },
  discount: {
    type: Number,
    required: [true, "A promo must have a discount value"],
  },
  discountType: {
    type: String,
    enum: ["amount", "percentage"],
    required: [true, "A promo must have a discount type"],
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "A promo must be associated with an event"],
  },
  
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  applyTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketType",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// PromoSchema.pre(/^find/, function (next) {
//    this.populate({
//     path: "applyTo",
//     model: "TicketType", // The model to populate
//   }).execPopulate();

//   next();
// });


// PromoSchema.pre("save", async function (next) {
//   if (!this.isModified("applyTo")) {
//     return next();
//   }
//   try {
//     // Get all ticket types associated with this promo
//     const ticketTypes = await TicketTypeModel.find({
//       _id: { $in: this.applyTo },
//     });

//     // Save promo field to each ticket type
//     for (let ticketType of ticketTypes) {
//       ticketType.promo.push(this._id);
//       await ticketType.save();
//     }

//     next();
//   } catch (err) {
//     next(err);
//   }
// });

const PromoModel = mongoose.model("Promo", PromoSchema);

module.exports = PromoModel;
