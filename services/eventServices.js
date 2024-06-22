const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const { findUserById } = require("./authServices");
const Event = require("../models/eventModel");
const { event } = require("jquery");
const EventModel = require("../models/eventModel");
const UserModel = require("../models/userModel");
const ProfileModel = require("../models/profileModel");
const TicketTypeModel = require("../models/ticketTypeModel");
const RegistrationModel = require("../models/registrationModel");
const { sendEventStatusEmail } = require("../utils/sendEmail");

exports.getMyEvents = (userId, query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const features = new APIFeatures(Event.find({ user: userId }), query)
        .sort()
        .paginate();

      const events = await features.query;
      resolve({
        status: "success",
        results: events.length,
        data: events,
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.publishEvent = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const event = await Event.findByIdAndUpdate(
        data._id,
        {
          visibility: data.visibility,
          category: data.category,
          isPublished: data.isPublished,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!event) {
        return reject(new AppError("No event found with that ID", 404));
        return;
      }

      resolve({
        status: "success",
        data: event,
      });
    } catch (error) {
      reject(error);
    }
  });
};

// change status to ticketing

exports.changeStatusEvent = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const event = await Event.findByIdAndUpdate(
        data._id,
        {
          status: data.status,
        },
        {
          new: true,
          runValidators: true,
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

//get events by user id

exports.getEventsByUserId = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const events = await Event.find({ user: userId });
      resolve({
        status: "success",
        results: events.length,
        data: events,
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.searchEventsOrOrganizers = (queryString) => {
  return new Promise(async (resolve, reject) => {
    try {
      const eventSearchResult = await EventModel.find({
        title: { $regex: new RegExp(queryString, "i") }, // Case-insensitive and Unicode search
        isPublished: true,
        visibility: "public",
      });

      // Search for organizers by name
      const organizerSearchResult = await ProfileModel.find({
        name: { $regex: new RegExp(queryString, "i") }, // Case-insensitive and Unicode search
      });

      resolve({
        status: "success",
        data: {
          events: eventSearchResult,
          organizers: organizerSearchResult,
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.changeTicketStatusEvent = (ticketStatus, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!ticketStatus) {
        reject(new AppError("Ticket status is required", 400));
        return;
      }
      if (ticketStatus === "Cancelled" || ticketStatus === "Postponed") {
        //update ticket type ends date
        //send email to the organizer

        await TicketTypeModel.updateMany(
          { event: id },
          { endDate: new Date() }
        );
      }
      if (ticketStatus === "On Sale") {
        //update ticket type ends date
        //check ticket type start date and end date
        const ticketTypes = await TicketTypeModel.find({ event: id });
        const event = await Event.findById(id);
        const now = new Date();
        if (event.date < now) {
          reject(new AppError("Event date is passed", 400));
          return;
        }

        //check invalid ticket type
        const invalidTicketTypes = ticketTypes.filter(
          (ticket) =>
            ticket.startDate > event.date ||
            ticket.endDate > event.date ||
            ticket.endDate <= now
        );
        if (invalidTicketTypes.length > 0) {
          reject(
            new AppError(
              "Ticket type date is invalid! Please adjust your ticket type date",
              400
            )
          );
          return;
        }
      }
      const event = await Event.findByIdAndUpdate(
        id,
        {
          ticketStatus: ticketStatus,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      const organizer = await UserModel.findById(event.user);

      const data = {
        date: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
      };
      await sendEventStatusEmail(organizer.email, "Event Cancelled", data);
      resolve({
        status: "success",
        data: event,
      });
    } catch (error) {
      reject(error);
    }
  });
};

exports.getEventOverview = (eventId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        reject(new AppError("Event not found", 404));
        return;
      }
      const user = await UserModel.findById(event.user);
      if (!user) {
        reject(new AppError("User not found", 404));
        return;
      }
      const ticketTypes = await TicketTypeModel.find({
        event: eventId,
      }).populate("tier");
      const totalTickets = ticketTypes.reduce(
        (acc, ticket) => acc + ticket.quantity,
        0
      );
      const soldTickets = ticketTypes.reduce(
        (acc, ticket) => acc + ticket.sold,
        0
      );

      //sales by ticketType

      //recent registration

      const registrations = await RegistrationModel.find({
        event: eventId,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("orders.ticketType")
        .populate("user");

      const recentRegistrations = registrations.map((registration) => {
        return {
          _id: registration._id,
          user: registration.user,
          ticketType: registration.orders.map((order) => {
            return {
              name: order.ticketType.name,
              quantity: order.quantity,
            };
          }),
          totalQuantity: registration.orders.reduce(
            (acc, order) => acc + order.quantity,
            0
          ),
          totalAmount: registration.orders.reduce(
            (acc, order) => acc + order.quantity * order.price,
            0
          ),
          registrationDate: registration.registrationDate,
        };
      });

      const revenue = registrations.reduce(
        (acc, registration) =>
          acc +
          registration.orders.reduce(
            (acc, order) => acc + order.quantity * order.price,
            0
          ),
        0
      );

      // Calculate sales by ticket type
      const salesByTicketType = ticketTypes.map((ticket) => {
        const ticketRevenue = registrations.reduce((acc, registration) => {
          const ticketOrders = registration.orders.filter(
            (order) => order.ticketType._id.toString() === ticket._id.toString()
          );
          return (
            acc +
            ticketOrders.reduce(
              (orderAcc, order) => orderAcc + order.quantity * order.price,
              0
            )
          );
        }, 0);

        return {
          name: ticket.name,
          tier: ticket.tier,
          sold: ticket.sold,
          quantity: ticket.quantity,
          revenue: ticketRevenue,
          discountPrice: ticket.discountPrice,
          price: ticket.price,
        };
      });

      const overview = {
        totalTickets,
        soldTickets,
        revenue,
        salesByTicketType,
        recentRegistrations,
      };
      resolve({
        status: "success",
        data: overview,
      });
    } catch (error) {
      reject(error);
    }
  });
};
