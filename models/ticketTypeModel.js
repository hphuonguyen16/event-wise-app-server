const mongoose = require("mongoose");

const TicketTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A ticket type must have a specific name"],
    },
    price: {
      type: Number,
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: () => `Price must be greater or equal to 0`,
      },
      default: 0,
    },
    quantity: {
      type: Number,
      required: [true, "A ticket type must have a specific quantity"],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: () => `Quantity must be greater or equal to 0`,
      },
    },
    sold: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    startDate: {
      type: Date,
      required: [true, "A ticket type must have a specific start date"],
    },
    endDate: {
      type: Date,
      required: [true, "A ticket type must have a specific end date"],
    },
    minQuantity: {
      type: Number,
      required: [true, "A ticket type must have a specific minimum quantity"],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: () => `Minimum quantity must be greater or equal to 0`,
      },
    },
    maxQuantity: {
      type: Number,
      required: [true, "A ticket type must have a specific maximum quantity"],
      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: () => `Maximum quantity must be greater or equal to 0`,
      },
    },
    salesChannel: {
      type: String,
      enum: {
        values: ["online", "offline", "both"],
        message: "Sales channel must be either online or offline",
      },
    },
    ticketType: {
      type: String,
      enum: {
        values: ["free", "paid"],
        message: "Ticket type must be either free or paid",
      },
      default: "free",
    },
    tier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tier",
    },
    promo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Promo",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

TicketTypeSchema.pre(/^find/, function (next) {
  this.populate({
    path: "tier",
  }).populate({
    path: "promo",
    select: "-__v",
  });
  next();
});

TicketTypeSchema.virtual("discountPrice").get(function () {
  // If no promos associated, return original price
  if (!this.promo || this.promo.length === 0) {
    return this.price;
  }

  // Get current date
  const currentDate = new Date();

  // Iterate over promos to find valid one
  for (const promo of this.promo) {
    if (currentDate >= promo.startDate && currentDate <= promo.endDate) {
      // Calculate discounted price based on promo
      let discountedPrice = this.price;
      if (promo.discountType === "percentage") {
        discountedPrice -= (this.price * promo.discount) / 100;
      } else if (promo.discountType === "amount") {
        discountedPrice -= promo.discount;
      }

      // Ensure discounted price is not negative
      discountedPrice = Math.max(discountedPrice, 0);

      // Return discounted price
      return discountedPrice;
    }
  }

  return this.price;
});

const TicketTypeModel = mongoose.model("TicketType", TicketTypeSchema);

module.exports = TicketTypeModel;
