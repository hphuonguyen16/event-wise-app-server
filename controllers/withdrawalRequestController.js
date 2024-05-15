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
const withdrawalRequest = require("../models/withDrawalRequest");

exports.createWithdrawalRequest = catchAsync(async (req, res, next) => {
  req.body.user_id = req.user.id;
  const data = await withdrawalServices.createWithdrawalRequest(req.body);
  res.status(200).json(data);
});

exports.getAllWithdrawalRequests = catchAsync(async (req, res, next) => {
  const data = await withdrawalServices.getAllWithdrawalRequests(req.query);
  res.status(200).json(data);
});

exports.fulfillWithdrawalRequest = catchAsync(async (req, res, next) => {
  const data = await withdrawalServices.fulfillWithdrawalRequest(req.params.id);
  res.status(200).json(data);
});

exports.cancelWithdrawalRequest = catchAsync(async (req, res, next) => {
  const data = await withdrawalServices.cancelWithdrawalRequest(req.params.id);
  res.status(200).json(data);
})