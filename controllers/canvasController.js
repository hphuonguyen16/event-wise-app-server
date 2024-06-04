const handlerFactory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const CanvasModel = require("../models/canvasModel");
const CanvasService = require("../services/canvasServices");

const AppError = require("./../utils/appError");

// exports.createCanvas = catchAsync(async (req, res, next) => {
//   const canvasData = req.body;
//   const canvas = await CanvasService.createCanvas(canvasData);

//   res.status(201).json({
//     status: "success",
//     data: canvas,
//   });
// });

exports.getCanvasByEventId = catchAsync(async (req, res, next) => {
  const canvas = await CanvasService.getCanvasByEventId(req.params.id);

  res.status(200).json(canvas);
});

exports.updateCanvasByEventId = catchAsync(async (req, res, next) => {
  const canvas = await CanvasService.createOrUpdateCanvas(
    req.params.id,
    req.body
  );
  res.status(200).json(canvas);
});

exports.createCanvas = handlerFactory.createOne(CanvasModel);

exports.getAllCanvas = handlerFactory.getAll(CanvasModel);

exports.getCanvas = handlerFactory.getOne(CanvasModel);

exports.updateCanvas = handlerFactory.updateOne(CanvasModel);

exports.deleteCanvas = handlerFactory.deleteOne(CanvasModel);
