// using handlerFactoryService to create a factory function for event controllers
const handlerFactory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const TicketTypeModel  = require("../models/ticketTypeModel");
const AppError = require("./../utils/appError");
const TicketTypeService = require("./../services/ticketServices");

exports.getTicketTypesByEventId = catchAsync(async (req, res) => {
  const data = await TicketTypeService.getTicketTypesByEventId(req.params.id, req.query);
  res.status(200).json(data);
});

exports.createTicketType = catchAsync(async (req, res) => {
  const data = await TicketTypeService.createTicketType(req.body);
  res.status(201).json(data);
});
exports.getTicketType = handlerFactory.getOne(TicketTypeModel);
exports.updateTicketType = catchAsync(async (req, res) => {
  const data = await TicketTypeService.updateTicketType(req.params.id, req.body);
  res.status(200).json(data);
});
exports.deleteTicketType = handlerFactory.deleteOne(TicketTypeModel);
exports.getAllTicketTypes = handlerFactory.getAll(TicketTypeModel);

exports.updateTicketTypeSoldCount = catchAsync(async (req, res, next) => {
  const data = await TicketTypeService.updateTicketTypeSoldCount(req.params.id);
  next();
})