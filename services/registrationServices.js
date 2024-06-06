const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const registrationModel = require("../models/registrationModel");
const userModel = require("../models/userModel");
const ticketTypeModel = require("../models/ticketTypeModel");
const eventModel = require("../models/eventModel");
const transactionModel = require("../models/transactionModel");
const mongoose = require("mongoose");
const sendQRCode = require("../utils/createQRCode");
const { sendBussinessAprrovalEmail } = require("../utils/sendEmail");
const canvasServices = require("./canvasServices");

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
      //check if user has registered for the event
      const existingRegistration = await registrationModel.findOne({
        user: registrationData.user,
        event: registrationData.event,
      });

      // if (existingRegistration) {
      //   throw new AppError("User has already registered for this event.", 400);
      // }

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
      const segs = [{ data: `${registration._id}`, mode: "byte" }];
      await sendBussinessAprrovalEmail(
        "hoangthiphuonguyen1602@gmail.com",
        "Business Approval",
        segs
      );
      const qrCode = await sendQRCode(segs);
      registration.QRCode = qrCode;
      await registration.save();
      resolve({
        status: "success",
        data: registration,
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.refundRegistration = (registrationId, organizerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const registration = await registrationModel.findById(registrationId);

      if (!registration) {
        throw new AppError("Registration not found.", 400);
      }

      if (
        registration.status !== "completed" &&
        registration.status !== "pending_refund"
      ) {
        throw new AppError(
          "The registration status must be 'completed' or 'pending_refund' to perform this action.",
          400
        );
      }

      let totalPrice = 0;

      for (const order of registration.orders) {
        const ticketType = await ticketTypeModel.findById(order.ticketType);
        totalPrice += ticketType.price * order.quantity;
      }

      const organizer = await userModel.findById(organizerId);
      if (organizer.balance < totalPrice) {
        throw new AppError("Insufficent balance!", 400);
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

      registration.status = "refunded";

      await registration.save();

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

exports.bulkRefundRegistration = ({ registrationIds, organizerId }) => {
  return new Promise(async (resolve, reject) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const registrations = await registrationModel
        .find({
          _id: { $in: registrationIds },
        })
        .session(session);

      if (registrations.length === 0) {
        throw new AppError("No registrations found.", 400);
      }

      //check the status of registration is completed
      for (const registration of registrations) {
        if (registration.orderType !== "online") {
          throw new AppError(
            "Only online registrations can be refunded in bulk.",
            400
          );
        }
        if (
          registration.status !== "completed" &&
          registration.status !== "pending_refund"
        ) {
          throw new AppError(
            "The status of the registration must be 'completed' or 'pending_refund' to perform this action.",
            400
          );
        }
      }

      let refundAmount = 0;

      // Calculate the total refund amount
      for (const registration of registrations) {
        let totalPrice = 0;

        for (const order of registration.orders) {
          const ticketType = await ticketTypeModel
            .findById(order.ticketType)
            .session(session);
          totalPrice += ticketType.price * order.quantity;
        }

        refundAmount += totalPrice;
      }

      const organizer = await userModel.findById(organizerId).session(session);
      if (organizer.balance < refundAmount) {
        throw new AppError("Insufficient balance!", 400);
      }

      for (const registration of registrations) {
        let totalPrice = 0;

        for (const order of registration.orders) {
          const ticketType = await ticketTypeModel
            .findById(order.ticketType)
            .session(session);
          totalPrice += ticketType.price * order.quantity;
        }

        const user = await userModel
          .findById(registration.user)
          .session(session);
        if (!user) {
          throw new AppError("User not found.", 400);
        }

        // Refund the user's balance
        await userModel.findByIdAndUpdate(
          user._id,
          { $inc: { balance: totalPrice } },
          { new: true, runValidators: true, session }
        );

        // Update the ticket sales and order status
        const promises = registration.orders.map(async (order) => {
          await ticketTypeModel.updateOne(
            { _id: order.ticketType },
            {
              $inc: { sold: -order.quantity },
            },
            { session }
          );
        });

        await Promise.all(promises);

        registration.status = "refunded";

        // Save the updated registration with refunded orders
        await registration.save({ session });

        // Create a transaction record for the refund
        await transactionModel.create(
          [
            {
              user: registration.user,
              registration: registration._id,
              amount: totalPrice,
              transaction_type: "refund",
              status: "success",
            },
          ],
          { session }
        );
      }

      // Update the organizer's balance
      await userModel.findByIdAndUpdate(
        organizerId,
        { $inc: { balance: -refundAmount } },
        { new: true, runValidators: true, session }
      );

      await session.commitTransaction();
      session.endSession();
      resolve({
        status: "success",
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      reject(error);
    }
  });
};

exports.getAttendeesByEventId = (eventId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const registrations = await registrationModel
        .find({ event: eventId })
        .populate("user")
        .populate("orders.ticketType");

      const attendees = registrations.map((registration) => {
        if (registration.user) {
          return {
            name: registration.user?.profile.name,
            email: registration.user?.email,
            registrationDate: registration?.registrationDate,
            avatar: registration.user?.profile.avatar || "",
            orderType: registration.orders.map(
              (order) => order.ticketType.name
            ),
            checkedIn: registration.checkedIn,
          };
        } else {
          return {
            name:
              registration.contactInfo.firstName +
              " " +
              registration.contactInfo.lastName,
            email: registration.contactInfo.email,
            registrationDate: registration.registrationDate,
            avatar: "",
            orderType: registration.orders.map(
              (order) => order.ticketType.name
            ),
            checkedIn: registration.checkedIn,
          };
        }
      });

      resolve({
        status: "success",
        results: attendees.length,
        data: attendees,
      });
    } catch (error) {
      reject(error);
    }
  });
};

// check in attendees

exports.checkInAttendee = (registrationId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const registration = await registrationModel
        .findById(registrationId)
        .populate("orders.ticketType")
        .populate("user");
      if (!registration) {
        throw new AppError("Registration not found.", 404);
      }
      if (registration.checkedIn) {
        throw new AppError(
          `Attendee ${registration.user?.profile.name} has already been checked in.`,
          400
        );
      }
      registration.checkedIn = true;
      await registration.save();
      resolve({
        status: "success",
        data: {
          name: registration.user?.profile.name,
          orderType: registration.orders.map((order) => order.ticketType.name),
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.createSeatingRegistration = (data) => {
  return new Promise(async (resolve, reject) => {

    try {

      let { seats, registration } = data;
      // Change the status of seats to sold
      const newSeats = seats.map((seat) => ({
        ...seat,
        status: "sold",
      }));

      console.log("Creating seating registration...");
      await canvasServices.updateSeats(registration.event, newSeats);
      await this.createRegistration(registration);

      resolve({
        status: "success",
      });
    } catch (error) {
      reject(error);
    }
  });
};