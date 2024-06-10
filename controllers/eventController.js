// using handlerFactoryService to create a factory function for event controllers
const handlerFactory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const EventModel = require("../models/eventModel");
const AppError = require("./../utils/appError");
const EventService = require("./../services/eventServices");
const RegistrationService = require("./../services/registrationServices");
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

exports.getEventsByUser = catchAsync(async (req, res) => {
    const data = await EventService.getEventsByUser(req.params.id, req.query);
    res.status(200).json(data);
})

exports.searchEventsOrOrganizers = catchAsync(async (req, res) => {
    const { q } = req.query;
  const data = await EventService.searchEventsOrOrganizers(q);
  res.status(200).json(data);
});

exports.changeTicketStatusEvent = catchAsync(async (req, res) => {
  const data = await EventService.changeTicketStatusEvent(
    req.body.ticketStatus,
    req.params.id
  );
  res.status(200).json(data);
});

exports.getAttendeesByEvent = catchAsync(async (req, res) => {
  const data = await RegistrationService.getAttendeesByEventId(req.params.id);
  res.status(200).json(data);
});

exports.getEventOverview = catchAsync(async (req, res) => {
  const data = await EventService.getEventOverview(req.params.id);
  res.status(200).json(data);
});


exports.getAllEvents = handlerFactory.getAll(EventModel);
exports.getEvent = handlerFactory.getOne(EventModel);
exports.createEvent = handlerFactory.createOne(EventModel);
exports.updateEvent = handlerFactory.updateOne(EventModel);
exports.deleteEvent = handlerFactory.deleteOne(EventModel);



