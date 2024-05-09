const handlerFactory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const EventTypeModel = require("../models/eventTypeModel");
const AppError = require("./../utils/appError");

exports.getAllEventTypes = handlerFactory.getAll(EventTypeModel);
exports.getEventType = handlerFactory.getOne(EventTypeModel);
exports.createEventType = handlerFactory.createOne(EventTypeModel);
exports.updateEventType = handlerFactory.updateOne(EventTypeModel);
exports.deleteEventType = handlerFactory.deleteOne(EventTypeModel);
