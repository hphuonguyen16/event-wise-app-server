const express = require("express");

const router = express.Router();
const authController = require("./../controllers/authController");
const withdrawalRequestController = require("./../controllers/withdrawalRequestController");

router.use(authController.protect);
router
  .route("/")
  .post(withdrawalRequestController.createWithdrawalRequest)
  .get(withdrawalRequestController.getAllWithdrawalRequests);

router
  .route("/:id/fulfill")
  .post(withdrawalRequestController.fulfillWithdrawalRequest);

router
  .route("/:id/cancel")
  .post(withdrawalRequestController.cancelWithdrawalRequest);

// router.get('/get-events', eventController.getAllEvents)

module.exports = router;
