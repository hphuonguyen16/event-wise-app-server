const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const { findUserById } = require("./authServices");
const TicketTypeModel = require("../models/ticketTypeModel");
const RegistrationModel = require("../models/registrationModel");

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
