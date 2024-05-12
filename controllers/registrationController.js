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
