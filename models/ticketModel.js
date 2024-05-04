const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
    registration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
    },
    ticketType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TicketType",
    },  
    registration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
    },
    QRCode: {
        type: String,
    },
    status: {
        type: String,
        enum: ["valid", "used"],
    },
    createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TicketModel = mongoose.model(
  "Ticket",
  TicketSchema
);

module.exports = TicketModel;
