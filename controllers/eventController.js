// using handlerFactoryService to create a factory function for event controllers
const handlerFactory = require("./handlerFactory");

const EventModel = require("../models/eventModel");

exports.getAllEvents = handlerFactory.getAll(EventModel);
exports.getEvent = handlerFactory.getOne(EventModel);
exports.createEvent = handlerFactory.createOne(EventModel);
exports.updateEvent = handlerFactory.updateOne(EventModel);
exports.deleteEvent = handlerFactory.deleteOne(EventModel);


