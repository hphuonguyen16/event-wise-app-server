const PromoModel = require("../models/promoModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const TicketTypeModel = require("../models/ticketTypeModel");

exports.getPromosByEvent = async (eventId) => {
  console.log("eventId", eventId);
  try {
    if (!eventId) {
      throw new AppError("Please provide an event ID", 400);
    } else {
      const promos = await PromoModel.find({ event: eventId }).populate(
        "applyTo"
      );
      return {
        status: "Success",
        data: promos,
      };
    }
  } catch (error) {
    throw new AppError(error.message, 400);
  }
};

exports.createPromo = async (promoData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { applyTo } = promoData;
      const ticketTypes = await TicketTypeModel.find({
        _id: { $in: applyTo },
      });

      // Create the promo
      const promo = await PromoModel.create(promoData);

      // Update the promo field of associated ticket types
      const ticketTypeUpdates = ticketTypes.map((ticketType) => {
        ticketType.promo.push(promo._id); // Add promo ID to the promo array
        return ticketType.save(); // Save the updated ticket type
      });

      // Wait for all ticket types to be updated
      await Promise.all(ticketTypeUpdates);

      resolve({
        status: "success",
        data: promo,
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.updatePromo = async (promoData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { applyTo } = promoData;
      const ticketTypes = await TicketTypeModel.find({
        _id: { $in: applyTo },
      });

      // Create the promo
      const promo = await PromoModel.findByIdAndUpdate(
       promoData._id,
        { $set: promoData },
        { new: true }
      );

      // Update the promo field of associated ticket types
      const ticketTypeUpdates = ticketTypes.map((ticketType) => {
        ticketType.promo.push(promo._id); // Add promo ID to the promo array
        return ticketType.save(); // Save the updated ticket type
      });

      // Wait for all ticket types to be updated
      await Promise.all(ticketTypeUpdates);

      resolve({
        status: "success",
        data: promo,
      });
    } catch (error) {
      reject(error);
    }
  });
};
