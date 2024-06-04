const handlerFactory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const TierModel = require("../models/tierModel");
const AppError = require("./../utils/appError");
const TierService = require("../services/tierServices");

exports.getAllTiers = handlerFactory.getAll(TierModel);
exports.getTier = handlerFactory.getOne(TierModel);
exports.createTier = handlerFactory.createOne(TierModel);
exports.updateTier = handlerFactory.updateOne(TierModel);
exports.deleteTier = handlerFactory.deleteOne(TierModel);

exports.getTiersByEventId = catchAsync(async (req, res, next) => {
  const tiers = await TierService.getTiersByEventId(req.params.eventId);
  res.status(200).json(tiers);
});
