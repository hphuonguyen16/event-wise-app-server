const RegistrationModel = require("../models/registrationModel");

const handlerFactory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const RegistrationService = require("./../services/registrationServices");

exports.getRegistrationsByEventId = catchAsync(async (req, res) => {
  const data = await RegistrationService.getRegistrationsByEventId(
    req.params.id,
    req.query
  );
  res.status(200).json(data);
});

exports.getRegistration = handlerFactory.getOne(RegistrationModel);

exports.updateRegistration = handlerFactory.updateOne(RegistrationModel);
exports.deleteRegistration = handlerFactory.deleteOne(RegistrationModel);

exports.createRegistration = catchAsync(async (req, res) => {
  if (!req.body.user && !req.body.contactInfo) req.body.user = req.user.id;
  const data = await RegistrationService.createRegistration(req.body);
  res.status(201).json(data);
});

exports.getAllRegistrations = catchAsync(async (req, res) => {
  const data = await RegistrationService.getAllRegistrations(req.query);
  res.status(200).json(data);
});

exports.getMyRegistrations = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const data = await RegistrationService.getMyRegistrations(userId, req.query);
  res.status(200).json(data);
});

exports.refundRegistration = catchAsync(async (req, res) => {
  const data = await RegistrationService.refundRegistration(
    req.params.id,
    req.body.organizer
  );
  res.status(200).json(data);
});

exports.bulkRefundRegistrations = catchAsync(async (req, res) => {
  const data = await RegistrationService.bulkRefundRegistration(req.body);
  res.status(200).json(data);
});

exports.checkIn = catchAsync(async (req, res) => {
  const data = await RegistrationService.checkInAttendee(req.params.id);
  res.status(200).json(data);
});
