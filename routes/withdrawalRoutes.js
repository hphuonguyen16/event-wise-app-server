const express = require("express");

const router = express.Router();
const authController = require("./../controllers/authController");
const withdrawalRequestController = require("./../controllers/withdrawalRequestController");

router.use(authController.protect);
 router
  .route("/")
  .post(withdrawalRequestController.createWithdrawalRequest);

// router.get('/get-events', eventController.getAllEvents)

module.exports = router;
