const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const registrationModel = require("../models/registrationModel");
const userModel = require("../models/userModel");
const ticketTypeModel = require("../models/ticketTypeModel");
const eventModel = require("../models/eventModel");

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

exports.getMyRegistrations = (userId, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const features = new APIFeatures(
        registrationModel
          .find({ user: userId })
          .populate("orders.ticketType")
          .populate({
            path: 'event',
            select: 'title images location detailLocation date startTime endTime' // Specify the fields you want to retrieve
          })
          .populate({
            path: 'user',
            select: 'firstName lastName' // Specify the fields you want to retrieve
        }),
        query
      )
        .sort()
        .paginate();

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

exports.getAllRegistrations = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const features = new APIFeatures(
        registrationModel.find().populate("orders.ticketType").populate("user"),
        query
      )
        .sort()
        .paginate();

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

exports.createRegistration = (registrationData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const ticketTypeIds = registrationData.orders.map(
        (order) => order.ticketType
      );

      // Retrieve ticket types and calculate available tickets
      const ticketTypes = await ticketTypeModel.find({
        _id: { $in: ticketTypeIds },
      });

      console.log("ticketTypes", ticketTypes);

      for (const order of registrationData.orders) {
        //check order is in minimum and maximum quantity

        const ticketType = ticketTypes.find(
          (type) => type._id.toString() === order.ticketType
        );
        // if (!ticketType) {
        //   throw new AppError(`Ticket type ${order.ticketType} not found.`);
        // }
        if (order.quantity > ticketType.maxQuantity) {
          throw new AppError(
            `Order quantity exceeds maximum quantity for ticket type ${ticketType.name}.`
          );
        }
        if (order.quantity < ticketType.minQuantity) {
          throw new AppError(
            `Order quantity is less than minimum quantity for ticket type ${ticketType._id}.`
          );
        }
        // Check if available tickets are sufficient for this order
        const availableTickets = ticketType.quantity - ticketType.sold;
        if (availableTickets < order.quantity) {
          throw new AppError(
            `Not enough available tickets for ticket type ${ticketType._id}.`
          );
        }
      }
      // Create the registration
      const registration = await registrationModel.create(registrationData);

      //update revenue for event

      const promises = registrationData.orders.map(async (order) => {
        await ticketTypeModel.updateOne(
          { _id: order.ticketType },
          {
            $inc: { sold: order.quantity },
          }
        );
      });
      await Promise.all(promises);

      // // const totalPrice = registrationData.orders.reduce((acc, order) => {
      // //   return acc + order.ticketType.price * order.quantity;
      // // }, 0);

      // // await eventModel.findByIdAndUpdate(
      // //   registrationData.event,
      // //   {
      // //     $inc: { revenue: totalPrice },
      // //   },
      // //   {
      // //     new: true,
      // //     runValidators: true,
      // //   }
      // // );
      // console.log(totalPrice);

      resolve({
        status: "success",
        data: registration,
      });
    } catch (error) {
      reject(error);
    }
  });
};
