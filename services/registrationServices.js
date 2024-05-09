const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const registrationModel = require("../models/registrationModel");
const userModel = require("../models/userModel");

exports.getRegistrationsByEventId = (eventId, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const features = new APIFeatures(
        registrationModel
          .find({ event: eventId })
          .populate("orders.ticketType")
          .populate("user"),
        query
      )
        .sort()
        .paginate();

      //calculate total price

      let registrations = await features.query;
      registrations = await registrations.map((registration) => {
        registration.totalPrice = registration.orders.reduce((acc, order) => {
          return acc + order.ticketType.price * order.quantity;
        }, 0);
        return registration;
      });

      resolve({
        status: "success",
        results: registrations.length,
        data: registrations,
      });
    } catch (error) {
      reject(error);
    }
  });
};


    
