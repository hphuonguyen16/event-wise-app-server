const express = require("express");
const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(authController.protect, categoryController.createCategory);

router
  .route("/:id")
  .get(categoryController.getCategory)
  .put(categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
