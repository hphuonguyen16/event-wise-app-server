const handlerFactory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const PromoModel = require("../models/promoModel");
const promoService = require("./../services/promoServices");
const AppError = require("./../utils/appError");
const TicketTypeModel = require("../models/ticketTypeModel");

exports.getAllPromos = handlerFactory.getAll(PromoModel);
exports.getPromo = handlerFactory.getOne(PromoModel);
exports.updatePromo = handlerFactory.updateOne(PromoModel);
exports.deletePromo = handlerFactory.deleteOne(PromoModel);

exports.getPromosByEvent = catchAsync(async (req, res) => {
  const promos = await promoService.getPromosByEvent(req.params.id);
  res.status(200).json(promos);
});

exports.createPromo = catchAsync(async (req, res) => {
  const promo = await promoService.createPromo(req.body);
  res.status(201).json(promo);
});
