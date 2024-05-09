// using handlerFactoryService to create a factory function for event controllers
const handlerFactory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const EventModel = require("../models/eventModel");
const AppError = require("./../utils/appError");
const EventService = require("./../services/eventServices");
const TicketTypeService = require("./../services/ticketServices");



exports.getMyEvents = catchAsync(async (req, res) => {
    const data = await EventService.getMyEvents(req.user.id, req.query);
    res.status(200).json(data);
})

exports.publishEvent = catchAsync(async (req, res) => {
    const data = await EventService.publishEvent(req.body);
    res.status(200).json(data);
})

exports.changeStatusEvent = catchAsync(async (req, res) => {
    const data = await EventService.changeStatusEvent(req.body);
    res.status(200).json(data);
})


exports.getAllEvents = handlerFactory.getAll(EventModel);
exports.getEvent = handlerFactory.getOne(EventModel);
exports.createEvent = handlerFactory.createOne(EventModel);
exports.updateEvent = handlerFactory.updateOne(EventModel);
exports.deleteEvent = handlerFactory.deleteOne(EventModel);



