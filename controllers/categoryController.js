const handlerFactory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const CategoryModel = require("../models/eventCategoryModel");
const categoryService = require("./../services/categoryServices");
const AppError = require("./../utils/appError");

exports.getPopularCategories = catchAsync(async (req, res) => {
  const data = await categoryService.getPopularCategories();
  res.status(200).json(data);
});

exports.getAllCategories = handlerFactory.getAll(CategoryModel);
exports.getCategory = handlerFactory.getOne(CategoryModel);
exports.createCategory = handlerFactory.createOne(CategoryModel);
exports.updateCategory = handlerFactory.updateOne(CategoryModel);
exports.deleteCategory = handlerFactory.deleteOne(CategoryModel);
