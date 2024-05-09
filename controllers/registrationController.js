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

exports.getAllRegistrations = handlerFactory.getAll(RegistrationModel);
exports.getRegistration = handlerFactory.getOne(RegistrationModel);
exports.createRegistration = handlerFactory.createOne(RegistrationModel);
exports.updateRegistration = handlerFactory.updateOne(RegistrationModel);
exports.deleteRegistration = handlerFactory.deleteOne(RegistrationModel);
