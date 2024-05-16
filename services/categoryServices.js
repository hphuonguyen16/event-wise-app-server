const CategoryModel = require("../models/eventCategoryModel");
const EventModel = require("../models/eventModel");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

exports.getPopularCategories = () => {
  return new Promise(async (resolve, reject) => {
    try {
      //count the number of events in each category and get top 8 categories with the most events
      const categories = await EventModel.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 8,
        },
      ]);
        
        //get the category details and if not enough categories are found, get more so that the total is 8
        let categoryDetails = [];
        for (let category of categories) {
            let categoryDetail = await CategoryModel.findById(category._id);
            if (categoryDetail) {
                categoryDetails.push(categoryDetail);
            }
        }
        if (categoryDetails.length < 8) {
            let moreCategories = await CategoryModel.find().limit(8 - categoryDetails.length);
            categoryDetails = categoryDetails.concat(moreCategories);
        }

        
      resolve({
        status: "success",
        results: categoryDetails.length,
        data: categoryDetails,
      });
    } catch (error) {
      reject(error);
    }
  });
};
