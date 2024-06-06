const mongoose = require("mongoose");
const TicketType = require("./ticketTypeModel");

const EventSchema = new mongoose.Schema(
  {
    images: [String],
    title: {
      type: String,
      required: [true, "An event must have a specific title"],
    },
    summary: {
      type: String,
      required: [true, "An event must have a specific summary"],
    },
    location: {
      formatted: String,
      lat: Number,
      lon: Number,
    },
    detailLocation: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventCategory",
    },
    date: {
      type: Date,
      required: [true, "An event must have a specific date"],
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    about: [
      {
        type: {
          type: String,
          required: [true, "A description must have a type"],
        },
        description: {
          type: String,
          required: [true, "A description must have a value"],
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["building", "ticketing", "published", "unpublished"],
      default: "building",
    },
    ticketStatus: {
      type: String,
      enum: ["On Sale", "Upcoming", "Cancelled", "Postponed", "Completed"],
    },
    revenue: {
      type: Number,
      default: 0,
    },
    reservedSeating: {
      type: Boolean,
      default: false,
    },
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

async function calculateTicketStatus(event) {
  const now = new Date();
  const tickets = await TicketType.find({ event: event._id });

  if (tickets.length === 0) {
    return null;
  }

  if (
    tickets.some((ticket) => ticket.endDate >= now && ticket.startDate <= now)
  ) {
    return "On Sale";
  } else if (tickets.every((ticket) => ticket.startDate > now)) {
    return "Upcoming";
  } else if (event.date < now) {
    return "Completed";
  } else {
    return null;
  }
}

EventSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.populate("user", "profile");
  next();
});

EventSchema.post("findOne", async function (doc) {
  if (doc) {
    const ticketStatus = await calculateTicketStatus(doc);
    if (ticketStatus) {
      doc.ticketStatus = ticketStatus;
    }
  }
});

EventSchema.post("find", async function (docs) {
  for (const doc of docs) {
    const ticketStatus = await calculateTicketStatus(doc);
    if (ticketStatus) {
      doc.ticketStatus = ticketStatus;
    }
  }
});

const EventModel = mongoose.model("Event", EventSchema);

module.exports = EventModel;
