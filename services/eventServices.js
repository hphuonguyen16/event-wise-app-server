const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const { findUserById } = require("./authServices");
const Event = require("../models/eventModel");
const { event } = require("jquery");
const EventModel = require("../models/eventModel");
const UserModel = require("../models/userModel");
const ProfileModel = require("../models/profileModel");
const TicketTypeModel = require("../models/ticketTypeModel");

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
        title: { $regex: new RegExp(queryString, "i") }, // Case-insensitive search
      });

      // Search for organizers by name
      const organizerSearchResult = await ProfileModel.find({
        name: { $regex: new RegExp(queryString, "i") }, // Case-insensitive search
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
            ticket.startDate > event.date || ticket.endDate > event.date || ticket.endDate <= now
        );
        if (invalidTicketTypes.length > 0) {
          reject(new AppError("Ticket type date is invalid! Please adjust your ticket type date", 400));
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
      resolve({
        status: "success",
        data: event,
      });
      
    } catch (error) {
      reject(error);
    }
  });
};


