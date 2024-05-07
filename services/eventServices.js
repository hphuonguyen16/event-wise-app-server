const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const { findUserById } = require("./authServices");
const Event = require("../models/eventModel");

exports.getMyEvents = (userId, query) => {
    return new Promise(async (resolve, reject) => {
        try {
        const features = new APIFeatures(
          Event.find({ user: userId }),
          query
        )
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