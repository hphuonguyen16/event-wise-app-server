const handlerFactory = require("./handlerFactory");
const catchAsync = require("./../utils/catchAsync");
const SubCategoryModel = require("../models/eventSubCategoryModel");
const AppError = require("./../utils/appError");

exports.getAllSubCategories = handlerFactory.getAll(SubCategoryModel);
exports.getSubCategory = handlerFactory.getOne(SubCategoryModel);
exports.createSubCategory = handlerFactory.createOne(SubCategoryModel);
exports.updateSubCategory = handlerFactory.updateOne(SubCategoryModel);
exports.deleteSubCategory = handlerFactory.deleteOne(SubCategoryModel);