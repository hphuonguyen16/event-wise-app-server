const express = require("express");
const canvasController = require("../controllers/canvasController");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.protect);
router
  .route("/")
  .get(canvasController.getAllCanvas)
  .post(canvasController.createCanvas);

router
  .route("/:id")
  .get(canvasController.getCanvas)
  .put(canvasController.updateCanvas)
  .delete(canvasController.deleteCanvas);

module.exports = router;
