const handlerFactory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const CategoryModel = require("../models/eventCategoryModel");
const AppError = require("./../utils/appError");


exports.getAllCategories = handlerFactory.getAll(CategoryModel);
exports.getCategory = handlerFactory.getOne(CategoryModel);
exports.createCategory = handlerFactory.createOne(CategoryModel);
exports.updateCategory = handlerFactory.updateOne(CategoryModel);
exports.deleteCategory = handlerFactory.deleteOne(CategoryModel);

