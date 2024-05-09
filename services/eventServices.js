const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const { findUserById } = require("./authServices");
const Event = require("../models/eventModel");
const { event } = require("jquery");

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
