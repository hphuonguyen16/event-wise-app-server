const TierModel = require("../models/tierModel");
const catchAsync = require("../utils/catchAsync");

exports.getTiersByEventId = (eventId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const tiers = await TierModel.find({ event: eventId });
      resolve({
        status: "success",
        results: tiers.length,
        data: tiers,
      });
    } catch (error) {
      reject(error);
    }
  });
};
