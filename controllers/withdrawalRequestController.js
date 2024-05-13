let $ = require("jquery");
// const request = require("request");
const moment = require("moment");
const crypto = require("crypto");
const config = require("config");

const catchAsync = require("./../utils/catchAsync");
const withdrawalServices = require("./../services/withdrawalServices");
const AppError = require("../utils/appError");
const factory = require("./../controllers/handlerFactory");
const bankAccount = require("../models/bankAccountModel");

exports.createWithdrawalRequest = catchAsync(async (req, res, next) => {
  req.body.user_id = req.user.id;
  const data = await withdrawalServices.createWithdrawalRequest(req.body);
  res.status(200).json(data);
});

exports.createBankAccount = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  const data = await bankAccount.create(req.body);
  res.status(200).json(data);
});
