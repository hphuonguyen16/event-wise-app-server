const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const { findUserById } = require("./authServices");
const TicketTypeModel = require("../models/ticketTypeModel");
const RegistrationModel = require("../models/registrationModel");
const EventModel = require("../models/eventModel");
const moment = require("moment");

exports.getTicketTypesByEventId = (eventId, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const features = new APIFeatures(
        TicketTypeModel.find({ event: eventId }),
        query
      )
        .sort()
        .paginate();

      const ticketTypes = await features.query;

      //count the number of registrations for each ticket type

      // const ticketTypeIds = ticketTypes.map((ticketType) => ticketType._id);

      // const registrationCount = await RegistrationModel.aggregate([
      //   {
      //     $match: { ticketType: { $in: ticketTypeIds } },
      //   },
      //   {
      //     $group: {
      //       _id: "$ticketType",
      //       count: { $sum: 1 },
      //     },
      //   },
      // ]);

      // ticketTypes.forEach((ticketType) => {
      //   const registration = registrationCount.find(
      //     (reg) => reg._id.toString() === ticketType._id.toString()
      //   );
      //   ticketType.sold = registration ? registration.count : 0;
      // });

      resolve({
        status: "success",
        results: ticketTypes.length,
        data: ticketTypes,
      });
    } catch (error) {
      reject(error);
    }
  });
};

//update the ticket type sold count

exports.updateTicketTypeSoldCount = (ticketTypeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const ticketType = await TicketTypeModel.findById(ticketTypeId);
      if (!ticketType) {
        reject(new AppError("Ticket Type not found", 404));
        return;
      }

      ticketType.sold = ticketType.sold + 1;
      await ticketType.save();

      resolve({
        status: "success",
        data: ticketType,
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.createTicketType = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const event = await EventModel.findById(data.event);
      if (!event) {
        reject(new AppError("Event not found", 404));
        return;
      }

      if (
        moment(data.startDate).isAfter(event.date) ||
        moment(data.endDate).isAfter(event.date)
      ) {
        reject(
          new AppError(
            "Ticket Type start date or end date cannot be after the event date",
            400
          )

        );
        return;
      }

      const ticketType = await TicketTypeModel.create(data);
      // event.status = "ticketing";
      // await event.save();
      resolve({
        status: "success",
        data: ticketType,
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.updateTicketType = (ticketTypeId, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const event = await EventModel.findById(data.event);
      if (!event) {
        reject(new AppError("Event not found", 404));
        return;
      }

      if (
        moment(data.startDate).isAfter(event.date) ||
        moment(data.endDate).isAfter(event.date)
      ) {
        reject(
          new AppError(
            "Ticket Type start date or end date cannot be after the event date",
            400
          )
        );
        return;
      }
      const ticketType = await TicketTypeModel.findByIdAndUpdate(
        ticketTypeId,
        data,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!ticketType) {
        reject(new AppError("Ticket Type not found", 404));
        return;
      }
      resolve({
        status: "success",
        data: ticketType,
      });
    } catch (error) {
      reject(error);
    }
  });
};
