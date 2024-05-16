const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const registrationModel = require("../models/registrationModel");
const userModel = require("../models/userModel");
const ticketTypeModel = require("../models/ticketTypeModel");
const eventModel = require("../models/eventModel");
const transactionModel = require("../models/transactionModel");

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
            path: "event",
            select:
              "title images location detailLocation date startTime endTime", // Specify the fields you want to retrieve
          })
          .populate({
            path: "user",
            select: "firstName lastName", // Specify the fields you want to retrieve
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
      let totalPrice = 0;
      const ticketTypeIds = registrationData.orders.map(
        (order) => order.ticketType
      );

      // Retrieve ticket types and calculate available tickets
      const ticketTypes = await ticketTypeModel.find({
        _id: { $in: ticketTypeIds },
      });

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
        totalPrice += ticketType.price * order.quantity;
      }

      if (registrationData.user) {
        const user = await userModel.findById(registrationData.user);
        if (!user) {
          throw new AppError("User not found.", 404);
        }

        if (user.balance < totalPrice || totalPrice <= 0) {
          throw new AppError("Insufficient balance.", 400);
        }

        await userModel.findByIdAndUpdate(
          registrationData.user,
          {
            $inc: { balance: -totalPrice },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }

      //increase balance of organizer
      const event = await eventModel.findById(registrationData.event);
      if (!event) {
        throw new AppError("Event not found.", 404);
      }
      const organizer = await userModel.findById(event.user);

      if (!organizer) {
        throw new AppError("Organizer not found.", 404);
      }

      await userModel.findByIdAndUpdate(
        organizer._id,
        {
          $inc: { balance: totalPrice },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      //create transaction
      // Create the registration
      const registration = await registrationModel.create(registrationData);

      const promises = registrationData.orders.map(async (order) => {
        await ticketTypeModel.updateOne(
          { _id: order.ticketType },
          {
            $inc: { sold: order.quantity },
          }
        );
      });
      await Promise.all(promises);

      await transactionModel.create({
        user: registrationData.user,
        organizer: registrationData.organizer,
        registration: registration._id,
        amount: totalPrice,
        transaction_type: "payment",
        status: "success",
      });

      resolve({
        status: "success",
        data: registration,
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.refundRegistration = ({ registrationId, organizer }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const registration = await registrationModel.findById(registrationId);

      if (!registration) {
        throw new AppError("Registration not found.", 404);
      }

      let totalPrice = 0;

      for (const order of registration.orders) {
        const ticketType = await ticketTypeModel.findById(order.ticketType);
        totalPrice += ticketType.price * order.quantity;
      }

      const user = await userModel.findById(registration.user);
      if (!user) {
        throw new AppError("User not found.", 404);
      }

      await userModel.findByIdAndUpdate(
        user._id,
        {
          $inc: { balance: totalPrice },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      // decrease balance of organizer
      const organizer = await userModel.findById(organizer);
      if (!organizer) {
        throw new AppError("Organizer not found.", 404);
      }

      await userModel.findByIdAndUpdate(
        organizer._id,
        {
          $inc: { balance: -totalPrice },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      const promises = registration.orders.map(async (order) => {
        await ticketTypeModel.updateOne(
          { _id: order.ticketType },
          {
            $inc: { sold: -order.quantity },
          }
        );
      });
      await Promise.all(promises);

      await transactionModel.create({
        user: registration.user,
        organizer: organizer,
        registration: registration._id,
        amount: totalPrice,
        transaction_type: "refund",
        status: "success",
      });

      resolve({
        status: "success",
      });
    } catch (error) {
      reject(error);
    }
  });
};


exports.bulkRefundRegistration = (registrationIds) => {
  return new Promise(async (resolve, reject) => {
    try {
      const registrations = await registrationModel.find({
        _id: { $in: registrationIds },
      });

      for (const registration of registrations) {
        let totalPrice = 0;

        for (const order of registration.orders) {
          const ticketType = await ticketTypeModel.findById(order.ticketType);
          totalPrice += ticketType.price * order.quantity;
        }

        const user = await userModel.findById(registration.user);
        if (!user) {
          throw new AppError("User not found.", 404);
        }

        await userModel.findByIdAndUpdate(
          user._id,
          {
            $inc: { balance: totalPrice },
          },
          {
            new: true,
            runValidators: true,
          }
        );

        const promises = registration.orders.map(async (order) => {
          await ticketTypeModel.updateOne(
            { _id: order.ticketType },
            {
              $inc: { sold: -order.quantity },
            }
          );
        });
        await Promise.all(promises);

        await transactionModel.create({
          user: registration.user,
          registration: registration._id,
          amount: totalPrice,
          transaction_type: "refund",
          status: "success",
        });
      }

      resolve({
        status: "success",
      });
    } catch (error) {
      reject(error);
    }
  });
};
