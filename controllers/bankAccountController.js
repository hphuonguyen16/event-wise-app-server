let $ = require("jquery");
// const request = require("request");
const moment = require("moment");
const crypto = require("crypto");
const config = require("config");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./../controllers/handlerFactory");
const bankAccountServices = require("./../services/bankAccountServices");
const bankAccount = require("../models/bankAccountModel");

exports.createOrUpdateBankAccount = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  const data = await bankAccountServices.createOrUpdateBankAccount(req.body);
  res.status(200).json(data);
});

exports.updateBankAccount = factory.updateOne(bankAccount);
exports.getMyBankAccount = catchAsync(async (req, res, next) => {
  const data = await bankAccountServices.getBankAccountByUserId(req.user.id);
  res.status(200).json(data);
});
